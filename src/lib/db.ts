import { drizzle } from "drizzle-orm/bun-sql";
// import { Pool } from "pg";
import { SQL } from "bun";
import * as authSchema from "./auth-schema";
import * as restaurantSchema from "./db/schema/restaurant";

const globalForDb = globalThis as unknown as {
  conn: SQL | undefined;
};

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn(
    "[db] DATABASE_URL is not configured. Database operations will fail.",
  );
}

const pool =
  globalForDb.conn ??
  new SQL(databaseUrl!, {
    max: 20,
    idleTimeout: 30,
    connectionTimeout: 2,
    adapter: "postgres",
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.conn = pool;
}

const schema = { ...authSchema, ...restaurantSchema };

export const db = drizzle(pool, { schema });
export type DbClient = typeof db;
