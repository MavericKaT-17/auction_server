import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL environment variable is not set');
  console.error('Please set it with:');
  console.error('export DATABASE_URL="postgresql://postgres:auctionwebserver2026@auction-db.c1ese8wc6fc4.ap-northeast-3.rds.amazonaws.com:5432/acution_db"');
  process.exit(1);
}

// Log connection attempt (hide password)
const sanitizedUrl = connectionString.replace(/:[^:]*@/, ':***@');
console.log('🔄 Connecting to database:', sanitizedUrl);

export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,  // This matches your working test script
  },
  // Add connection timeout
  connectionTimeoutMillis: 10000,
  // Maximum number of clients in the pool
  max: 20,
  // Idle timeout
  idleTimeoutMillis: 30000,
});

// Test the connection immediately
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Failed to connect to database:');
    console.error('   Error:', err.message);
    console.error('   Please check:');
    console.error('   1. Database credentials');
    console.error('   2. Network connectivity (security groups)');
    console.error('   3. SSL configuration');
    return;
  }
  console.log('✅ Database connected successfully');
  
  // Optional: Test a simple query
  client.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('❌ Test query failed:', err.message);
    } else {
      console.log('📅 Database time:', res.rows[0].now);
    }
    release();
  });
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('❌ Unexpected database pool error:', err.message);
});

export const db = drizzle(pool, { schema });