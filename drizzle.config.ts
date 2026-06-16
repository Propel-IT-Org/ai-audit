import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: ["./src/lib/auth-schema.ts", "./src/lib/db/schema/restaurant.ts"],
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ||
      "postgresql://user:password@localhost:5432/dbname",
  },
});
