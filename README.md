# atelier-store

Next.js eCommerce application skeleton. This is scaffolding only — no storefront,
cart, checkout, payments or auth UI yet.

## Stack

| Concern  | Choice |
| -------- | ------ |
| Framework | Next.js 16 (App Router, Turbopack) + React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Auth | Better Auth |
| ORM | Drizzle ORM + drizzle-kit |
| Database | Postgres on Neon (`@neondatabase/serverless`, HTTP driver) |

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a Neon project and copy the **pooled** connection string.

3. Copy the env template and fill it in:

   ```bash
   cp .env.example .env.local
   ```

   - `DATABASE_URL` — Neon pooled connection string.
   - `BETTER_AUTH_SECRET` — `openssl rand -base64 32`.
   - `BETTER_AUTH_URL` / `NEXT_PUBLIC_APP_URL` — the app's origin.

4. Create the Better Auth tables:

   ```bash
   npm run db:generate   # write migration SQL to ./drizzle
   npm run db:migrate    # apply it to Neon
   ```

5. Run the app:

   ```bash
   npm run dev
   ```

   `GET /api/auth/ok` should return `{"ok":true}`.

## Scripts

| Script | Purpose |
| ------ | ------- |
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:generate` | Generate migration SQL from the Drizzle schema |
| `npm run db:migrate` | Apply migrations |
| `npm run db:push` | Push schema directly (dev only, no migration files) |
| `npm run db:studio` | Drizzle Studio |
| `npm run test:studio-security` | Studio origin security regression tests |

Studio is pinned to `drizzle-kit@0.31.11` with a local security patch applied on
install and before `db:studio` starts. Its SQL server accepts only the exact
`https://local.drizzle.studio` browser origin; missing, opaque, and other origins
receive HTTP 403 before any database operation. Keep the default loopback binding.
The patch covers the CLI and both API bundles, and fails on unexpected versions
or code so upgrades require a security recheck. After installing with
`--ignore-scripts`, run `node scripts/patch-drizzle-studio.mjs` before invoking
Studio directly through `npx` or the API.

## Layout

```
src/
  app/
    api/auth/[...all]/route.ts   Better Auth request handler
    layout.tsx, page.tsx         default create-next-app pages
  db/
    index.ts                     Drizzle client over the Neon HTTP driver
    schema/
      index.ts                   schema barrel — add new tables here
      auth.ts                    generated Better Auth tables
  lib/
    auth.ts                      Better Auth server instance
    auth-client.ts               Better Auth browser client
    env.ts                       required-env accessor
drizzle.config.ts                drizzle-kit config
```

## Notes

- **Auth tables are generated.** `src/db/schema/auth.ts` comes from the Better
  Auth CLI. After changing options or plugins in `src/lib/auth.ts`, re-run:

  ```bash
  npx @better-auth/cli generate --config src/lib/auth.ts --output src/db/schema/auth.ts
  ```

  then `npm run db:generate && npm run db:migrate`.

- **Transactions are off.** The Neon HTTP driver doesn't support them, so the
  Drizzle adapter runs operations sequentially (`transaction: false`). Switch to
  the WebSocket driver (`drizzle-orm/neon-serverless` + `Pool`) if you need them.

- **Email/password is enabled but has no UI or email sending.** Sign-up and
  sign-in endpoints exist under `/api/auth/*`; no pages, forms, verification
  emails or social providers are wired up.

- **`npm audit` reports 5 high-severity issues.** All are dev-only, via
  `eslint-config-next` → `fast-glob` → `braces`. Fixing them means downgrading
  `eslint-config-next` to v14, so they're left as-is.
