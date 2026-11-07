import "server-only";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { db?: PostgresJsDatabase<typeof schema> };

/** Vrai si une base de données est configurée (le site public fonctionne sans, le temps de la brancher). */
export const dbConfigured = () => !!(process.env.DATABASE_URL ?? process.env.POSTGRES_URL);

/** Connexion paresseuse : le build ne nécessite pas de base de données. */
export function getDb() {
  if (!globalForDb.db) {
    const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
    if (!url) throw new Error("DATABASE_URL n'est pas défini.");
    const client = postgres(url, { prepare: false, fetch_types: false, max: 3, idle_timeout: 60, connect_timeout: 10 });
    globalForDb.db = drizzle({ client, schema });
  }
  return globalForDb.db;
}
