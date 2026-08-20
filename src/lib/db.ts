import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as authSchema from "./auth-schema";
import * as restaurantSchema from "./db/schema/restaurant";
import * as auditSchema from "./db/schema/audit";
import * as leadSchema from "./db/schema/lead";

const globalForDb = globalThis as unknown as {
  pool: Pool | undefined;
};

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn(
    "[db] DATABASE_URL is not configured. Database operations will fail.",
  );
}

const pool =
  globalForDb.pool ??
  new Pool({
    connectionString: databaseUrl,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    ssl: databaseUrl?.includes("neon.tech") ? { rejectUnauthorized: false } : undefined,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}

const schema = { ...authSchema, ...restaurantSchema, ...auditSchema, ...leadSchema };

export const db = drizzle(pool, { schema });
export type DbClient = typeof db;

