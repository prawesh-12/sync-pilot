ALTER TABLE "processed_emails" ADD COLUMN "status" text DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "processed_emails" ADD COLUMN "snoozed_until" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "processed_emails" ADD COLUMN "gmail_draft_id" text;