ALTER TABLE "integrations" DROP CONSTRAINT "integrations_user_provider_unique";--> statement-breakpoint
ALTER TABLE "integrations" ADD COLUMN "email_address" text;--> statement-breakpoint
ALTER TABLE "integrations" ADD COLUMN "label" text;--> statement-breakpoint
ALTER TABLE "integrations" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_user_connected_account_unique" UNIQUE("user_id","connected_account_id");