import { pgTable, serial, text, boolean, timestamp, real, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const roleEnum = pgEnum("role", ["admin", "user"]);

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  role: roleEnum("role").notNull().default("user"),
  skillsOffered: text("skills_offered").array().notNull().default([]),
  skillsWanted: text("skills_wanted").array().notNull().default([]),
  bio: text("bio"),
  location: text("location"),
  profileImage: text("profile_image"),
  isBlocked: boolean("is_blocked").notNull().default(false),
  availability: text("availability").array().notNull().default([]),
  isPublic: boolean("is_public").notNull().default(true),
  rating: real("rating"),
  ratingCount: integer("rating_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
