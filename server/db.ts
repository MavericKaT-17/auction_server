import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

console.log("Connecting to database...");

export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,  // This enables SSL without needing it in the URL
  },
  // Add connection timeout
  connectionTimeoutMillis: 10000,
});

// Test the connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
    console.error('Connection string (hidden):', connectionString.replace(/:[^:]*@/, ':***@'));
    return;
  }
  console.log('✅ Database connected successfully');
  release();
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

export const db = drizzle(pool, { schema });