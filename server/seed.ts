import { db } from "./db";
import { auctionItems, eventSettings, users } from "@shared/schema";

export async function seedDatabase() {
  const existingItems = await db.select().from(auctionItems);
  if (existingItems.length > 0) return;

  await db.insert(auctionItems).values([
    {
      name: "Patek Philippe Grand Complications",
      description: "A rare Patek Philippe 5208R-001 Grand Complications timepiece in rose gold, featuring a minute repeater, monopusher chronograph, and instantaneous perpetual calendar.",
      background: "This exceptional timepiece was personally commissioned and has been part of a private collection since 2015. Only 2 pieces of this reference were ever produced, making it one of the most sought-after watches in horological history. The watch comes with original box, papers, and a certificate of authenticity from Patek Philippe Geneva.",
      imageUrl: "/images/item-watch.png",
      startingPrice: 500000,
      category: "Timepieces",
    },
    {
      name: "Monet's 'Seaside at Dusk'",
      description: "An impressionist oil painting attributed to Claude Monet's later period, depicting the Normandy coastline at sunset with his signature vibrant brushwork.",
      background: "Acquired from a European estate sale in 1987, this painting has been authenticated by three independent art historians. It was exhibited at the Musée d'Orsay in Paris as part of a special retrospective in 2003. The painting comes with full provenance documentation and UV analysis report.",
      imageUrl: "/images/item-painting.png",
      startingPrice: 2000000,
      category: "Fine Art",
    },
    {
      name: "1962 Ferrari 250 GTO",
      description: "A numbers-matching 1962 Ferrari 250 GTO in Rosso Corsa, one of only 36 ever built. Complete with matching-numbers V12 engine and original interior.",
      background: "Chassis #3851GT, this 250 GTO competed in the 1962 Tour de France Automobile and the 1963 24 Hours of Le Mans. It has been meticulously restored by Ferrari Classiche and carries their Red Book certification. The car has been featured in multiple concours d'elegance events worldwide.",
      imageUrl: "/images/item-car.png",
      startingPrice: 25000000,
      category: "Automobiles",
    },
    {
      name: "The Emerald Crown Necklace",
      description: "A magnificent necklace featuring a 42-carat Colombian emerald centerpiece surrounded by 28 carats of D-flawless diamonds, set in platinum.",
      background: "Originally crafted by Cartier in 1925 for European royalty, this necklace has graced some of the most prestigious galas and state events of the 20th century. The emerald is certified by the Gübelin Gem Lab as natural Colombian origin with minor oil treatment. Each diamond carries a GIA certificate.",
      imageUrl: "/images/item-necklace.png",
      startingPrice: 8000000,
      category: "Jewelry",
    },
    {
      name: "Shakespeare First Folio (1623)",
      description: "An exceptionally well-preserved copy of Mr. William Shakespeares Comedies, Histories, & Tragedies, the First Folio, printed by Isaac Jaggard and Ed. Blount.",
      background: "This copy is one of approximately 235 known surviving copies of the 750 originally printed. It was discovered in a French library in 1950 and has remained in private hands since 1972. The binding is original 17th-century calf leather with gilt tooling. Contains all 36 plays in remarkable condition.",
      imageUrl: "/images/item-book.png",
      startingPrice: 5000000,
      category: "Rare Books",
    },
  ]);

  const existingSettings = await db.select().from(eventSettings);
  if (existingSettings.length === 0) {
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + 72);
    await db.insert(eventSettings).values({
      eventName: "Elite Charity Auction 2026",
      endTime,
    });
  }

  const existingUsers = await db.select().from(users);
  if (existingUsers.length === 0) {
    await db.insert(users).values([
      { accountId: "91234567", password: "1234", name: "Test User" },
      { accountId: "98765432", password: "5678", name: "Demo Bidder" },
    ]);
  }
}
