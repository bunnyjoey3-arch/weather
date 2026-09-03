import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

const globalForDb = globalThis as typeof globalThis & {
  __weatherDbPool?: Pool | null;
};

const pool = databaseUrl
  ? globalForDb.__weatherDbPool ?? new Pool({ connectionString: databaseUrl })
  : null;

if (process.env.NODE_ENV !== "production" && pool) {
  globalForDb.__weatherDbPool = pool;
}

export const db = pool ? drizzle(pool) : null;

export function isDatabaseConfigured() {
  return Boolean(databaseUrl);
}
