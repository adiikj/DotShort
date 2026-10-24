CREATE TABLE "clicks" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"link_id" uuid NOT NULL,
	"clicked_at" timestamp with time zone DEFAULT now() NOT NULL,
	"referrer" text,
	"browser" text,
	"os" text,
	"device" text,
	"ip_hash" text
);
--> statement-breakpoint
CREATE TABLE "links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"long_url" text NOT NULL,
	"short_code" text NOT NULL,
	"password_hash" text,
	"expires_at" timestamp with time zone,
	"delete_at" timestamp with time zone,
	"click_count" integer DEFAULT 0 NOT NULL,
	"user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "links_short_code_unique" UNIQUE("short_code")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"refresh_token" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "clicks" ADD CONSTRAINT "clicks_link_id_links_id_fk" FOREIGN KEY ("link_id") REFERENCES "public"."links"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "links" ADD CONSTRAINT "links_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "clicks_link_clicked_idx" ON "clicks" USING btree ("link_id","clicked_at");--> statement-breakpoint
CREATE INDEX "clicks_clicked_at_idx" ON "clicks" USING btree ("clicked_at");--> statement-breakpoint
CREATE INDEX "links_user_id_idx" ON "links" USING btree ("user_id");