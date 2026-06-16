import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins/admin";
import { db } from "./db";
import * as schema from "./auth-schema";

const authUrl = new URL(
  process.env.BETTER_AUTH_URL || "http://localhost:3000/api/auth",
);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "placeholder_client_id",
      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET || "placeholder_client_secret",
    },
  },
  trustedOrigins: [authUrl.origin, `${authUrl.protocol}//www.${authUrl.host}`],
  plugins: [admin()],
});

export async function requireAdmin(request: Request): Promise<boolean> {
  const session = await auth.api.getSession({ headers: request.headers });
  return session?.user?.role === "admin";
}
