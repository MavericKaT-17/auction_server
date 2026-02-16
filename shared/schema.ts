import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, serial, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  accountId: varchar("account_id", { length: 8 }).notNull().unique(),
  password: varchar("password", { length: 4 }).notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("user"),
});

export const auctionItems = pgTable("auction_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  background: text("background").notNull(),
  imageUrl: text("image_url").notNull(),
  startingPrice: integer("starting_price").notNull().default(0),
  category: text("category").notNull().default("General"),
});

export const bids = pgTable("bids", {
  id: serial("id").primaryKey(),
  confirmationId: varchar("confirmation_id", { length: 12 }).notNull().unique(),
  userId: integer("user_id").notNull(),
  itemId: integer("item_id").notNull(),
  amount: integer("amount").notNull(),
  bidTime: timestamp("bid_time").notNull().defaultNow(),
});

export const eventSettings = pgTable("event_settings", {
  id: serial("id").primaryKey(),
  eventName: text("event_name").notNull(),
  endTime: timestamp("end_time").notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertAuctionItemSchema = createInsertSchema(auctionItems).omit({ id: true });
export const insertBidSchema = createInsertSchema(bids).omit({ id: true, confirmationId: true, bidTime: true });
export const insertEventSettingsSchema = createInsertSchema(eventSettings).omit({ id: true });

export const loginSchema = z.object({
  accountId: z.string().length(8, "Account ID must be 8 digits").regex(/^\d{8}$/, "Account ID must be 8 digits"),
  password: z.string().length(4, "Password must be 4 digits").regex(/^\d{4}$/, "Password must be 4 digits"),
  name: z.string().min(1, "Name is required").max(100).optional(),
});

export const placeBidSchema = z.object({
  itemId: z.number().int().positive(),
  amount: z.number().int().positive("Bid must be a positive number"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertAuctionItem = z.infer<typeof insertAuctionItemSchema>;
export type AuctionItem = typeof auctionItems.$inferSelect;
export type InsertBid = z.infer<typeof insertBidSchema>;
export type Bid = typeof bids.$inferSelect;
export type EventSettings = typeof eventSettings.$inferSelect;
