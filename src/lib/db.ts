import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as authSchema from "./auth-schema";
import * as restaurantSchema from "./db/schema/restaurant";

const globalForDb = globalThis as unknown as {
  conn: Pool | undefined;
};

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn(
    "[db] DATABASE_URL is not configured. Database operations will fail.",
  );
}

const pool =
  globalForDb.conn ??
  new Pool({
    connectionString: databaseUrl,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.conn = pool;
}

const schema = { ...authSchema, ...restaurantSchema };

export const db = drizzle(pool, { schema });
export type DbClient = typeof db;
