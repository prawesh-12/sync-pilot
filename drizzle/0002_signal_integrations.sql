CREATE TABLE "signal_integrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"device_name" text NOT NULL,
	"sender_number" text NOT NULL,
	"recipient_number" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "signal_integrations_user_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "signal_integrations" ADD CONSTRAINT "signal_integrations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;