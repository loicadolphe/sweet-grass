import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core"

export const wateringMethods = ["top", "bottom", "shower"] as const
export type WateringMethod = (typeof wateringMethods)[number]

export const readingActions = [
  "none",
  "water",
  "soak",
  "shower",
  "feed",
] as const
export type ReadingAction = (typeof readingActions)[number]

export const speciesCache = pgTable("species_cache", {
  id: serial("id").primaryKey(),
  query: text("query").notNull().unique(),
  commonName: text("common_name"),
  scientificName: text("scientific_name"),
  wateringMethod: text("watering_method").$type<WateringMethod>(),
  feedFrequencyDays: integer("feed_frequency_days"),
  sunlightNeeds: text("sunlight_needs"),
  raw: jsonb("raw"),
  cachedAt: timestamp("cached_at").notNull().defaultNow(),
})

export const plants = pgTable("plants", {
  id: serial("id").primaryKey(),
  nickname: text("nickname").notNull(),
  species: text("species").notNull(),
  scientificName: text("scientific_name"),
  location: text("location"),
  wateringMethod: text("watering_method").$type<WateringMethod>().notNull().default("top"),
  moistureMin: integer("moisture_min").notNull().default(3),
  moistureMax: integer("moisture_max").notNull().default(7),
  feedFrequencyDays: integer("feed_frequency_days").default(30),
  lastFedAt: timestamp("last_fed_at"),
  addedAt: timestamp("added_at").notNull().defaultNow(),
})

export const readings = pgTable("readings", {
  id: serial("id").primaryKey(),
  plantId: integer("plant_id")
    .notNull()
    .references(() => plants.id, { onDelete: "cascade" }),
  moistureValue: integer("moisture_value").notNull(),
  recommendedAction: text("recommended_action").$type<ReadingAction>().notNull(),
  actionTaken: text("action_taken").$type<ReadingAction>(),
  takenAt: timestamp("taken_at").notNull().defaultNow(),
})
