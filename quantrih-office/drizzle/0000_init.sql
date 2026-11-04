CREATE TYPE "public"."asset_category" AS ENUM('liquidites', 'titres', 'assurance_vie', 'immobilier', 'participations', 'private_equity', 'actifs_passion', 'autres');--> statement-breakpoint
CREATE TYPE "public"."lead_status" AS ENUM('nouveau', 'rdv_planifie', 'rdv_fait', 'proposition', 'converti', 'sans_suite');--> statement-breakpoint
CREATE TYPE "public"."member_role" AS ENUM('titulaire', 'membre', 'mandataire');--> statement-breakpoint
CREATE TYPE "public"."relationship_kind" AS ENUM('personne', 'foyer', 'famille');--> statement-breakpoint
CREATE TYPE "public"."relationship_status" AS ENUM('onboarding', 'actif', 'suspendu', 'clos');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('client', 'collaborateur', 'admin');--> statement-breakpoint
CREATE TYPE "public"."step_status" AS ENUM('a_faire', 'en_cours', 'en_revue', 'termine');--> statement-breakpoint
CREATE TYPE "public"."value_source" AS ENUM('releve', 'agregation', 'declaratif', 'expertise');--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid,
	"action" text NOT NULL,
	"target" text,
	"relationship_id" uuid,
	"details" jsonb,
	"ip" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "holdings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"relationship_id" uuid NOT NULL,
	"label" text NOT NULL,
	"category" "asset_category" NOT NULL,
	"institution" text,
	"owner" text,
	"value" numeric(16, 2) NOT NULL,
	"currency" text DEFAULT 'EUR' NOT NULL,
	"valued_at" date NOT NULL,
	"source" "value_source" DEFAULT 'declaratif' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invitations_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"profile" text NOT NULL,
	"wealth_range" text NOT NULL,
	"needs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"message" text,
	"source" text,
	"status" "lead_status" DEFAULT 'nouveau' NOT NULL,
	"consent_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "login_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"email" text NOT NULL,
	"success" boolean NOT NULL,
	"reason" text,
	"ip" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "memberships" (
	"user_id" uuid NOT NULL,
	"relationship_id" uuid NOT NULL,
	"role" "member_role" DEFAULT 'titulaire' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "memberships_user_id_relationship_id_pk" PRIMARY KEY("user_id","relationship_id")
);
--> statement-breakpoint
CREATE TABLE "onboarding_steps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"relationship_id" uuid NOT NULL,
	"key" text NOT NULL,
	"status" "step_status" DEFAULT 'a_faire' NOT NULL,
	"data" jsonb,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "relationships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"kind" "relationship_kind" DEFAULT 'personne' NOT NULL,
	"status" "relationship_status" DEFAULT 'onboarding' NOT NULL,
	"advisor_id" uuid,
	"lead_id" uuid,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"password_hash" text,
	"role" "role" DEFAULT 'client' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"failed_attempts" integer DEFAULT 0 NOT NULL,
	"locked_at" timestamp with time zone,
	"last_login_at" timestamp with time zone,
	"totp_secret" text,
	"totp_enabled_at" timestamp with time zone,
	"recovery_codes" jsonb,
	"session_version" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "holdings" ADD CONSTRAINT "holdings_relationship_id_relationships_id_fk" FOREIGN KEY ("relationship_id") REFERENCES "public"."relationships"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "login_events" ADD CONSTRAINT "login_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_relationship_id_relationships_id_fk" FOREIGN KEY ("relationship_id") REFERENCES "public"."relationships"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onboarding_steps" ADD CONSTRAINT "onboarding_steps_relationship_id_relationships_id_fk" FOREIGN KEY ("relationship_id") REFERENCES "public"."relationships"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relationships" ADD CONSTRAINT "relationships_advisor_id_users_id_fk" FOREIGN KEY ("advisor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_rel_idx" ON "audit_log" USING btree ("relationship_id","created_at");--> statement-breakpoint
CREATE INDEX "holdings_rel_idx" ON "holdings" USING btree ("relationship_id");--> statement-breakpoint
CREATE INDEX "login_events_ip_idx" ON "login_events" USING btree ("ip","created_at");--> statement-breakpoint
CREATE INDEX "login_events_user_idx" ON "login_events" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "onboarding_steps_rel_key" ON "onboarding_steps" USING btree ("relationship_id","key");