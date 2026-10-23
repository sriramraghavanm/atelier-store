import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

import { db, schema } from "@/db";
import { env } from "@/lib/env";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
    // neon-http does not support transactions; operations run sequentially.
    transaction: false,
  }),
  secret: env.betterAuthSecret,
  baseURL: env.appUrl,
  advanced: {
    ipAddress: {
      // No trusted ingress is configured. Ignore client-supplied IP headers so
      // Better Auth uses its shared per-path rate-limit bucket in production.
      ipAddressHeaders: [],
    },
  },
  // Providers, email verification and plugins are intentionally left unset.
  emailAndPassword: {
    enabled: true,
  },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
