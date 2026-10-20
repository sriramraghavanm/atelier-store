/**
 * Minimal runtime env access. Throws on first use if a required variable is
 * missing, so misconfiguration surfaces at startup rather than mid-request.
 */
function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  get databaseUrl() {
    return required("DATABASE_URL");
  },
  get betterAuthSecret() {
    return required("BETTER_AUTH_SECRET");
  },
  get appUrl() {
    return process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
  },
};
