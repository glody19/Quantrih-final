import bcrypt from "bcryptjs";
import { and, count, eq, gte, sql } from "drizzle-orm";
import NextAuth, { CredentialsSignin, type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { loginEvents, users, type Role } from "@/lib/db/schema";
import { LOCK_MINUTES, lockActive } from "@/lib/lock";
import { consumeRecoveryCode, decryptText, readChallenge, signChallenge, verifyTotp } from "@/lib/totp";

export { LOCK_MINUTES, lockActive };

declare module "next-auth" {
  interface Session {
    user: { id: string; role: Role; sv: number } & DefaultSession["user"];
  }
  interface User {
    role?: Role;
    sessionVersion?: number;
  }
}

/** Nombre de tentatives échouées consécutives avant blocage temporaire du compte. */
export const MAX_ATTEMPTS = 5;
/** Au-delà de ce nombre d'échecs depuis une même adresse IP en 15 minutes, toute connexion est refusée. */
const IP_LIMIT = 20;
/** Empreinte factice : un email inconnu prend autant de temps qu'un mauvais mot de passe. */
const DUMMY_HASH = "$2b$12$4QeICVnsAWDrf0YawJW6puGeUr8JehpMPy/fuRQADob9/27N2gwI6";


const credentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});
const codeSchema = z.object({
  challenge: z.string().min(10).max(300),
  code: z.string().trim().min(6).max(12),
});

/** Les codes remontent jusqu'au formulaire de connexion, qui affiche le message adapté. */
class LoginError extends CredentialsSignin {
  constructor(code: string) {
    super();
    this.code = code;
  }
}

const audience = (role: Role) => (role === "client" ? "client" : "equipe");

const clientIp = (request: Request | undefined) => request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

async function logAttempt(
  request: Request | undefined,
  email: string,
  userId: string | null,
  success: boolean,
  reason?: string,
) {
  const ip = clientIp(request);
  const userAgent = request?.headers.get("user-agent")?.slice(0, 300) ?? null;
  await getDb().insert(loginEvents).values({ userId, email, success, reason, ip, userAgent });
}

async function registerFailure(userId: string) {
  const [updated] = await getDb()
    .update(users)
    .set({
      failedAttempts: sql`${users.failedAttempts} + 1`,
      lockedAt: sql`case when ${users.failedAttempts} + 1 >= ${MAX_ATTEMPTS} then now() else null end`,
    })
    .where(eq(users.id, userId))
    .returning({ failedAttempts: users.failedAttempts });
  return (updated?.failedAttempts ?? MAX_ATTEMPTS) >= MAX_ATTEMPTS;
}

async function verifySecondFactor(raw: Partial<Record<string, unknown>>, request: Request | undefined) {
  const parsed = codeSchema.safeParse(raw);
  if (!parsed.success) throw new LoginError("code");
  const id = readChallenge(parsed.data.challenge);
  if (!id) throw new LoginError("code_expire");
  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!user || !user.totpSecret || !user.totpEnabledAt) throw new LoginError("code_expire");
  if (!user.active) throw new LoginError(`desactive_${audience(user.role)}`);
  if (lockActive(user.lockedAt)) throw new LoginError(`bloque_${audience(user.role)}`);

  const code = parsed.data.code;
  let remaining: string[] | null = null;
  let ok = /^\d{6}$/.test(code.replace(/\s/g, "")) && verifyTotp(decryptText(user.totpSecret), code);
  if (!ok) {
    remaining = consumeRecoveryCode(user.recoveryCodes, code);
    ok = remaining !== null;
  }
  if (!ok) {
    const locked = await registerFailure(user.id);
    await logAttempt(request, user.email, user.id, false, locked ? "code erroné, compte bloqué" : "code de vérification erroné");
    throw new LoginError(locked ? `bloque_${audience(user.role)}` : "code");
  }
  await db
    .update(users)
    .set({ failedAttempts: 0, lockedAt: null, lastLoginAt: new Date(), ...(remaining ? { recoveryCodes: remaining } : {}) })
    .where(eq(users.id, user.id));
  await logAttempt(request, user.email, user.id, true, remaining ? "code de secours utilisé" : "double authentification");
  return { id: user.id, email: user.email, name: user.name, role: user.role, sessionVersion: user.sessionVersion };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt", maxAge: 60 * 60 * 4 },
  pages: { signIn: "/connexion" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {}, challenge: {}, code: {} },
      async authorize(raw, request) {
        // Seconde étape : mot de passe déjà validé, code de l'application d'authentification (ou code de secours).
        if (raw?.challenge) return verifySecondFactor(raw, request);
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) throw new LoginError("identifiants");
        const email = parsed.data.email.toLowerCase();
        const db = getDb();

        // Trop d'échecs depuis cette adresse : on refuse avant même de regarder le compte.
        const ip = clientIp(request);
        if (ip) {
          const since = new Date(Date.now() - LOCK_MINUTES * 60_000);
          const [row] = await db
            .select({ n: count() })
            .from(loginEvents)
            .where(and(eq(loginEvents.ip, ip), eq(loginEvents.success, false), gte(loginEvents.createdAt, since)));
          if ((row?.n ?? 0) >= IP_LIMIT) {
            await logAttempt(request, email, null, false, "trop de tentatives depuis cette adresse");
            throw new LoginError("trop_tentatives");
          }
        }

        const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

        if (!user) {
          await bcrypt.compare(parsed.data.password, DUMMY_HASH);
          await logAttempt(request, email, null, false, "compte inconnu");
          throw new LoginError("identifiants");
        }
        if (!user.active) {
          await logAttempt(request, email, user.id, false, "accès désactivé");
          throw new LoginError(`desactive_${audience(user.role)}`);
        }
        if (lockActive(user.lockedAt)) {
          await logAttempt(request, email, user.id, false, "compte bloqué");
          throw new LoginError(`bloque_${audience(user.role)}`);
        }
        if (user.lockedAt) {
          // Blocage expiré : le compteur repart de zéro.
          await db.update(users).set({ lockedAt: null, failedAttempts: 0 }).where(eq(users.id, user.id));
          user.failedAttempts = 0;
        }

        if (!user.passwordHash || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
          const [updated] = await db
            .update(users)
            .set({
              failedAttempts: sql`${users.failedAttempts} + 1`,
              lockedAt: sql`case when ${users.failedAttempts} + 1 >= ${MAX_ATTEMPTS} then now() else null end`,
            })
            .where(eq(users.id, user.id))
            .returning({ failedAttempts: users.failedAttempts });
          const attempts = updated?.failedAttempts ?? MAX_ATTEMPTS;
          const locked = attempts >= MAX_ATTEMPTS;
          await logAttempt(request, email, user.id, false, locked ? "mot de passe erroné, compte bloqué" : "mot de passe erroné");
          throw new LoginError(locked ? `bloque_${audience(user.role)}` : "identifiants");
        }

        if (user.totpEnabledAt && user.totpSecret) {
          // Mot de passe correct : on demande maintenant le code, sans ouvrir de session.
          throw new LoginError(`code_requis:${signChallenge(user.id)}`);
        }

        await db.update(users).set({ failedAttempts: 0, lastLoginAt: new Date() }).where(eq(users.id, user.id));
        await logAttempt(request, email, user.id, true);
        return { id: user.id, email: user.email, name: user.name, role: user.role, sessionVersion: user.sessionVersion };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
        token.sv = user.sessionVersion ?? 0;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.sub!;
      session.user.role = (token.role as Role) ?? "client";
      session.user.sv = (token.sv as number | undefined) ?? 0;
      return session;
    },
  },
});
