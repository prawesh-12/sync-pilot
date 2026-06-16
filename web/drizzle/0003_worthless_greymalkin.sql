ALTER TABLE "integrations" ALTER COLUMN "provider" SET DEFAULT 'composio';--> statement-breakpoint
ALTER TABLE "integrations" ALTER COLUMN "access_token_encrypted" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "integrations" ALTER COLUMN "refresh_token_encrypted" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "integrations" ADD COLUMN "connected_account_id" text;