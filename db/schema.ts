import { integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const decks = pgTable("decks", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  clerkUserId: varchar({ length: 255 }).notNull(),
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});

export const cards = pgTable("cards", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  deckId: integer()
    .notNull()
    .references(() => decks.id, { onDelete: "cascade" }),
  front: text().notNull(),
  back: text().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});

export const aiGenerationUsage = pgTable("ai_generation_usage", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  clerkUserId: varchar({ length: 255 }).notNull(),
  deckId: integer().references(() => decks.id, { onDelete: "set null" }),
  createdAt: timestamp().notNull().defaultNow(),
});

export const waitlist = pgTable("waitlist", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  clerkUserId: varchar({ length: 255 }).unique(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  interestCategory: varchar({ length: 100 }),
  priceExpectation: varchar({ length: 50 }),
  source: varchar({ length: 100 }).notNull(),
  createdAt: timestamp().notNull().defaultNow(),
});
