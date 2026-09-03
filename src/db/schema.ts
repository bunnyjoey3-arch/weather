import { pgTable, serial, text, doublePrecision, timestamp, integer } from "drizzle-orm/pg-core";

// Stores every successful city search so users can revisit past lookups.
export const searchHistory = pgTable("search_history", {
  id: serial("id").primaryKey(),
  city: text("city").notNull(),
  country: text("country"),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  temperature: doublePrecision("temperature").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  humidity: integer("humidity").notNull(),
  windSpeed: doublePrecision("wind_speed").notNull(),
  pressure: doublePrecision("pressure").notNull(),
  searchedAt: timestamp("searched_at").defaultNow().notNull(),
});

export type SearchHistoryRow = typeof searchHistory.$inferSelect;
export type NewSearchHistory = typeof searchHistory.$inferInsert;
