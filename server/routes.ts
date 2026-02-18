import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { placeBidSchema, loginSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post("/api/login", async (req, res) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }
      const { accountId, password, name } = parsed.data;
      let user = await storage.getUserByAccountId(accountId);
      if (user) {
        if (user.password !== password) {
          return res.status(401).json({ message: "Invalid credentials" });
        }
      } else {
        if (!name || name.trim().length === 0) {
          return res.status(400).json({ message: "NEW_USER", needsName: true });
        }
        user = await storage.createUser({ accountId, password, name: name.trim(), role: "user" });
      }
      (req.session as any).userId = user.id;
      (req.session as any).role = user.role;
      res.json({ id: user.id, name: user.name, role: user.role });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Login failed" });
    }
  });

  app.get("/api/me", (req, res) => {
    const userId = (req.session as any)?.userId;
    const role = (req.session as any)?.role;
    if (!userId) return res.json(null);
    res.json({ userId, role });
  });

  app.post("/api/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ ok: true });
    });
  });

  app.get("/api/items", async (_req, res) => {
    const items = await storage.getAllItems();
    res.json(items);
  });

  app.get("/api/items/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid item ID" });
    const item = await storage.getItem(id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  });

  app.get("/api/event-settings", async (_req, res) => {
    const settings = await storage.getEventSettings();
    if (!settings) return res.status(404).json({ message: "Event settings not found" });
    res.json(settings);
  });

  app.post("/api/bids", async (req, res) => {
    try {
      const parsed = placeBidSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }

      const { itemId, amount } = parsed.data;

      const settings = await storage.getEventSettings();
      if (settings && new Date(settings.endTime) < new Date()) {
        return res.status(400).json({ message: "Auction has ended. Bids are no longer accepted." });
      }

      const item = await storage.getItem(itemId);
      if (!item) return res.status(404).json({ message: "Item not found" });

      if (item.startingPrice > 0 && amount < item.startingPrice) {
        return res.status(400).json({ message: `Bid must be at least $${item.startingPrice.toLocaleString()} (the starting price).` });
      }

      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: "You must be logged in to place a bid." });
      }

      const existingBid = await storage.getBidByUserAndItem(userId, itemId);
      if (existingBid) {
        return res.status(400).json({ message: "You have already placed a bid on this item. Bids cannot be changed." });
      }

      const bid = await storage.createBid({ userId, itemId, amount });
      res.status(201).json(bid);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to place bid" });
    }
  });

  app.get("/api/bids/my", async (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) return res.status(401).json({ message: "Not logged in" });
    const userBids = await storage.getBidsByUser(userId);
    res.json(userBids);
  });

  app.get("/api/bids/my/:itemId", async (req, res) => {
    const itemId = parseInt(req.params.itemId);
    if (isNaN(itemId)) return res.status(400).json({ message: "Invalid item ID" });

    const userId = (req.session as any)?.userId;
    if (!userId) return res.json(null);
    const bid = await storage.getBidByUserAndItem(userId, itemId);
    res.json(bid || null);
  });

  app.get("/api/admin/items", async (_req, res) => {
    const stats = await storage.getItemsWithStats();
    res.json(stats);
  });

  app.get("/api/admin/items/:id/bids", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid item ID" });

    const itemBids = await storage.getBidsForItem(id);
    const ranked = itemBids.map((bid, index) => ({
      ...bid,
      rank: index + 1,
    }));
    res.json(ranked);
  });

  app.get("/api/admin/export-csv", async (_req, res) => {
    const allBids = await storage.getAllBids();

    const headers = ["Rank", "Item", "Bidder Name", "Account ID", "Confirmation ID", "Bid Amount ($)", "Bid Time"];
    const rows: string[][] = [];

    const grouped = new Map<string, typeof allBids>();
    for (const bid of allBids) {
      const key = bid.itemName;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(bid);
    }

    const entries = Array.from(grouped.entries());
    for (const [itemName, itemBids] of entries) {
      const sorted = itemBids.sort((a: any, b: any) => b.amount - a.amount || new Date(a.bidTime).getTime() - new Date(b.bidTime).getTime());
      sorted.forEach((bid: any, index: number) => {
        rows.push([
          String(index + 1),
          itemName,
          bid.userName,
          bid.accountId,
          bid.confirmationId,
          String(bid.amount),
          new Date(bid.bidTime).toISOString(),
        ]);
      });
    }

    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=auction-results.csv");
    res.send(csv);
  });

  app.get("/api/admin/items/:id/export-csv", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid item ID" });

    const item = await storage.getItem(id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    const itemBids = await storage.getBidsForItem(id);

    const headers = ["Rank", "Bidder Name", "Account ID", "Confirmation ID", "Bid Amount ($)", "Bid Time"];
    const rows = itemBids.map((bid, index) => [
      String(index + 1),
      bid.userName,
      bid.accountId,
      bid.confirmationId,
      String(bid.amount),
      new Date(bid.bidTime).toISOString(),
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=${item.name.replace(/[^a-zA-Z0-9]/g, "-")}-bids.csv`);
    res.send(csv);
  });

  return httpServer;
}
