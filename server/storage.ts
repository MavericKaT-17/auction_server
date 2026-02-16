import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  auctionItems,
  bids,
  eventSettings,
  type InsertUser,
  type User,
  type InsertAuctionItem,
  type AuctionItem,
  type InsertBid,
  type Bid,
  type EventSettings,
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByAccountId(accountId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getAllItems(): Promise<AuctionItem[]>;
  getItem(id: number): Promise<AuctionItem | undefined>;
  createItem(item: InsertAuctionItem): Promise<AuctionItem>;

  getBidByUserAndItem(userId: number, itemId: number): Promise<Bid | undefined>;
  getBidsByUser(userId: number): Promise<(Bid & { itemName: string })[]>;
  createBid(bid: InsertBid): Promise<Bid>;
  getBidsForItem(
    itemId: number,
  ): Promise<(Bid & { userName: string; accountId: string })[]>;
  getAllBids(): Promise<
    (Bid & { userName: string; accountId: string; itemName: string })[]
  >;

  getEventSettings(): Promise<EventSettings | undefined>;
  setEventSettings(endTime: Date, eventName: string): Promise<EventSettings>;

  getItemsWithStats(): Promise<
    { item: AuctionItem; bidCount: number; highestBid: number }[]
  >;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByAccountId(accountId: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.accountId, accountId));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async getAllItems(): Promise<AuctionItem[]> {
    return db.select().from(auctionItems);
  }

  async getItem(id: number): Promise<AuctionItem | undefined> {
    const [item] = await db
      .select()
      .from(auctionItems)
      .where(eq(auctionItems.id, id));
    return item;
  }

  async createItem(item: InsertAuctionItem): Promise<AuctionItem> {
    const [created] = await db.insert(auctionItems).values(item).returning();
    return created;
  }

  async getBidByUserAndItem(
    userId: number,
    itemId: number,
  ): Promise<Bid | undefined> {
    const [bid] = await db
      .select()
      .from(bids)
      .where(and(eq(bids.userId, userId), eq(bids.itemId, itemId)));
    return bid;
  }

  async getBidsByUser(userId: number): Promise<(Bid & { itemName: string })[]> {
    const result = await db
      .select({
        id: bids.id,
        confirmationId: bids.confirmationId,
        userId: bids.userId,
        itemId: bids.itemId,
        amount: bids.amount,
        bidTime: bids.bidTime,
        itemName: auctionItems.name,
      })
      .from(bids)
      .innerJoin(auctionItems, eq(bids.itemId, auctionItems.id))
      .where(eq(bids.userId, userId))
      .orderBy(desc(bids.bidTime));
    return result;
  }

  private generateConfirmationId(): string {
    const chars = "123456789";
    let result = "BID-";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async createBid(bid: InsertBid): Promise<Bid> {
    const confirmationId = this.generateConfirmationId();
    const [created] = await db
      .insert(bids)
      .values({ ...bid, confirmationId })
      .returning();
    return created;
  }

  async getBidsForItem(
    itemId: number,
  ): Promise<(Bid & { userName: string; accountId: string })[]> {
    const result = await db
      .select({
        id: bids.id,
        confirmationId: bids.confirmationId,
        userId: bids.userId,
        itemId: bids.itemId,
        amount: bids.amount,
        bidTime: bids.bidTime,
        userName: users.name,
        accountId: users.accountId,
      })
      .from(bids)
      .innerJoin(users, eq(bids.userId, users.id))
      .where(eq(bids.itemId, itemId))
      .orderBy(desc(bids.amount), bids.bidTime);
    return result;
  }

  async getAllBids(): Promise<
    (Bid & { userName: string; accountId: string; itemName: string })[]
  > {
    const result = await db
      .select({
        id: bids.id,
        confirmationId: bids.confirmationId,
        userId: bids.userId,
        itemId: bids.itemId,
        amount: bids.amount,
        bidTime: bids.bidTime,
        userName: users.name,
        accountId: users.accountId,
        itemName: auctionItems.name,
      })
      .from(bids)
      .innerJoin(users, eq(bids.userId, users.id))
      .innerJoin(auctionItems, eq(bids.itemId, auctionItems.id))
      .orderBy(auctionItems.name, desc(bids.amount));
    return result;
  }

  async getEventSettings(): Promise<EventSettings | undefined> {
    const [settings] = await db.select().from(eventSettings);
    return settings;
  }

  async setEventSettings(
    endTime: Date,
    eventName: string,
  ): Promise<EventSettings> {
    const existing = await this.getEventSettings();
    if (existing) {
      const [updated] = await db
        .update(eventSettings)
        .set({ endTime, eventName })
        .where(eq(eventSettings.id, existing.id))
        .returning();
      return updated;
    }
    const [created] = await db
      .insert(eventSettings)
      .values({ endTime, eventName })
      .returning();
    return created;
  }

  async getItemsWithStats(): Promise<
    { item: AuctionItem; bidCount: number; highestBid: number }[]
  > {
    const items = await this.getAllItems();
    const stats = await Promise.all(
      items.map(async (item) => {
        const itemBids = await this.getBidsForItem(item.id);
        return {
          item,
          bidCount: itemBids.length,
          highestBid:
            itemBids.length > 0
              ? Math.max(...itemBids.map((b) => b.amount))
              : 0,
        };
      }),
    );
    return stats;
  }
}

export const storage = new DatabaseStorage();
