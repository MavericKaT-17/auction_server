import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

export const pool = new Pool({
  connectionString: "postgresql://postgres:auctionwebserber2026@auction-db.c1ese8wc6fc4.ap-northeast-3.rds.amazonaws.com:5432/acution_db?ssl=require",
});

export const db = drizzle(pool, { schema });
