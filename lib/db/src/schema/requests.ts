import { pgTable, serial, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const requestStatusEnum = pgEnum("request_status", ["pending", "accepted", "rejected", "completed"]);

export const requestsTable = pgTable("requests", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  receiverId: integer("receiver_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  skillOffered: text("skill_offered").notNull(),
  skillRequested: text("skill_requested").notNull(),
  message: text("message"),
  status: requestStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertRequestSchema = createInsertSchema(requestsTable).omit({ id: true, createdAt: true, status: true });
export type InsertRequest = z.infer<typeof insertRequestSchema>;
export type SwapRequest = typeof requestsTable.$inferSelect;
