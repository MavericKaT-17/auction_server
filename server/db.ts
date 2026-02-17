import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";
import * as fs from 'fs';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
ca: fs.readFileSync('/home/ec2-user/auction_server/global-bundle.pem').toString(),
}
});

export const db = drizzle(pool, { schema });
