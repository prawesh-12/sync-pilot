CREATE TABLE "processed_webhook_events" (
	"event_id" text PRIMARY KEY NOT NULL,
	"provider" text NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL
);
