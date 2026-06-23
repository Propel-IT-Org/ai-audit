import { db } from "./src/lib/db";
import { migrate } from "drizzle-orm/bun-sql/migrator";
import drizzleConf from "./drizzle.config";

await migrate(db, {
  migrationsFolder: drizzleConf.out || "./drizzle",
  migrationsSchema: drizzleConf.migrations?.schema,
  migrationsTable: drizzleConf.migrations?.table,
});
