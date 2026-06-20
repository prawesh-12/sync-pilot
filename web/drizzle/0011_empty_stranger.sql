CREATE TABLE "inbound_signal_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"source_number" text NOT NULL,
	"text" text NOT NULL,
	"signal_timestamp" bigint NOT NULL,
	"status" text DEFAULT 'received' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone,
	CONSTRAINT "inbound_signal_source_ts_unique" UNIQUE("source_number","signal_timestamp")
);
--> statement-breakpoint
ALTER TABLE "inbound_signal_messages" ADD CONSTRAINT "inbound_signal_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;