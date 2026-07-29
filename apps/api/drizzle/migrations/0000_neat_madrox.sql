CREATE TABLE IF NOT EXISTS "plants" (
	"id" serial PRIMARY KEY NOT NULL,
	"nickname" text NOT NULL,
	"species" text NOT NULL,
	"scientific_name" text,
	"location" text,
	"watering_method" text DEFAULT 'top' NOT NULL,
	"moisture_min" integer DEFAULT 3 NOT NULL,
	"moisture_max" integer DEFAULT 7 NOT NULL,
	"feed_frequency_days" integer DEFAULT 30,
	"last_fed_at" timestamp,
	"added_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "readings" (
	"id" serial PRIMARY KEY NOT NULL,
	"plant_id" integer NOT NULL,
	"moisture_value" integer NOT NULL,
	"recommended_action" text NOT NULL,
	"action_taken" text,
	"taken_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "species_cache" (
	"id" serial PRIMARY KEY NOT NULL,
	"query" text NOT NULL,
	"common_name" text,
	"scientific_name" text,
	"watering_method" text,
	"feed_frequency_days" integer,
	"sunlight_needs" text,
	"raw" jsonb,
	"cached_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "species_cache_query_unique" UNIQUE("query")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "readings" ADD CONSTRAINT "readings_plant_id_plants_id_fk" FOREIGN KEY ("plant_id") REFERENCES "public"."plants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
