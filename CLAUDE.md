# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Next.js eCommerce app — Next 16 (App Router) + React 19, TypeScript, Tailwind v4,
Better Auth, Drizzle ORM, Postgres on Neon.

What exists: the design system, a marketing homepage (`/`), and product detail pages at
`/products/[slug]`. What does not: collection/category listing routes, cart, checkout,
payments, search, account, and any auth UI — the nav, footer, breadcrumb and category
links all point at routes that are not built yet, so they 404.

Both pages read the catalogue out of Postgres — see **Database conventions** below. Page copy
that is not catalogue data (the campaign block, the editorial block, the services row and
the navigation) is still a static module, `src/data/site.ts`. "Add to bag" and
"Add to wishlist" are inert buttons; no cart exists.

## Commands

```bash
npm run dev          # dev server (Turbopack)
npm run build        # production build — also typechecks
npm run typecheck    # tsc --noEmit
npm run lint         # eslint (flat config, eslint.config.mjs)

npm run db:generate  # schema -> SQL migration in ./drizzle
npm run db:migrate   # apply migrations to Neon
npm run db:push      # push schema directly, no migration files (dev only)
npm run db:studio    # Drizzle Studio
npm run db:seed      # upsert the sample catalogue (tsx, loads .env itself)
```

No test framework is installed — there is no test command to run. Pick one and
wire it up before writing the first test.

Quick smoke check that auth is mounted: `curl localhost:3000/api/auth/ok` → `{"ok":true}`.
It needs no database, so it isolates handler/config problems from connection problems.

## Next.js 16 specifics

`AGENTS.md` applies: this Next version differs from training data, and the authoritative
docs ship in `node_modules/next/dist/docs/`. Read the relevant guide there before writing
framework code. Three things that will bite immediately:

- **`cacheComponents: true`** is set in `next.config.ts`. A request-time read (`cookies()`,
  `headers()`) cannot be prerendered into the static shell, so anything reading the session
  must sit behind `<Suspense>`, use the `use cache: private` directive, or opt the route out
  with `export const instant = false`. This directly shapes how auth-aware pages get built —
  read `01-app/02-guides/authentication-with-cache-components.md` first.
- **Request APIs are async.** `cookies()`, `headers()`, `params`, `searchParams` must be awaited.
- **Reading the clock during render fails the build.** `new Date()` / `Date.now()` are
  "unstable values" under `cacheComponents`. `SiteFooter` hit this with a copyright year and
  is now an `async` component with `"use cache"` + `cacheLife("days")`. Import `cacheLife`
  from `next/cache` — the `unstable_` prefix is gone and warns.
- **`notFound()` on a dynamic route needs `ensureStatic = "navigation"`.** With Partial
  Prefetching on, Next flushes a prerendered shell for an unlisted param before the render
  reaches `notFound()`, so the first request for a bad slug answered **200** and only
  repeat requests 404'd. `/products/[slug]` exports `ensureStatic = "navigation"` to make
  that first request wait. Do the same on any new dynamic route that can 404.
- **`dynamicParams` is not supported** under `cacheComponents`, and `generateStaticParams`
  must return at least one param.
- **`middleware.ts` is now `proxy.ts`**, with the function named `proxy` and `nodejs` runtime
  only (no `edge`). Relevant as soon as route protection is added.

Tailwind v4 has no config file — theme tokens live in `@theme` blocks in `src/app/globals.css`.
It runs through the Turbopack loader rule in `next.config.ts`, not PostCSS.

## Design system

All tokens and primitives live in `src/app/globals.css`; React wrappers are in
`src/components/ui`. Import primitives from `@/components/ui`, and prefer them (or the
`@utility` classes they wrap) over ad-hoc utility strings so the rules stay in one place.

**Tailwind defaults are deliberately overridden — read before styling anything:**

- **The `text-*` scale is replaced.** `text-lg` is 20px (not 18px) and `text-xl` is 24px
  (not 20px), each with a tighter absolute line height. Interface type stops at 24px;
  anything larger uses the separate `text-display-sm|display|display-lg` editorial sizes.
- **Body default is 14px**, set on `body`, with 0.2px tracking (`--tracking-micro`).
- **Two font weights exist**, 400 and 500. There is no bold; hierarchy comes from case,
  size and space. `font-bold` would render a synthetic face.
- **`2xl` is 1440px** (not 1536px) and `3xl: 1600px` was added.
- **Default transition duration is 200ms** (not 150ms). `ease-brand` is the signature curve.

Standing rules: square corners (`rounded-pill`/`rounded-full` only for chips, swatches,
dots and circular icon buttons); 1px hairline borders rather than shadows; links carry an
underline and are never coloured; the palette is achromatic apart from `critical`, so
chroma comes from product imagery; product media is 4:5 via `<Frame>`.

There is **no dark mode** — the canvas is pure white by design. Invert per section with
`bg-ink text-canvas` instead of adding a global theme.

Composed components live in `src/components` (`site-header`, `site-footer`, `product-card`,
`collection-card`, `product-gallery`, `stock-indicator`, `disclosure`); the primitives they
build on are in `src/components/ui`.

Anything that shows or hides without needing state uses a native `<details>` element
(`Disclosure`, the mobile menu), and the product gallery is CSS scroll-snap. Both pages are
therefore entirely server components — keep it that way unless a feature genuinely needs
client state.

Remote imagery is restricted to `images.unsplash.com` by `images.remotePatterns` in
`next.config.ts`. That entry is for sample data only — tighten or drop it when imagery moves
to our own bucket.

## Architecture

Four layers, each with one entry point:

- `src/lib/env.ts` — the only place env vars are read. Getters throw on missing values, so
  misconfiguration fails at startup rather than mid-request. Add new required vars here and
  to `.env.example` together.
- `src/db/index.ts` — the Drizzle client, exporting `db` and `schema`. Import `db` from
  `@/db`; never construct a second client.
- `src/lib/auth.ts` — the Better Auth server instance, consumed by
  `src/app/api/auth/[...all]/route.ts` (catch-all `GET`/`POST`) and mirrored client-side by
  `src/lib/auth-client.ts`.
- `src/lib/catalog-queries.ts` — every catalogue read. Pages import from here, never from
  `@/db` directly.

Two constraints worth knowing before writing data code:

- **`src/db/schema/auth.ts` is generated — do not hand-edit.** It holds Better Auth's core
  tables (`user`, `session`, `account`, `verification`). After changing options or plugins in
  `src/lib/auth.ts`, regenerate, then migrate:

  ```bash
  npx @better-auth/cli generate --config src/lib/auth.ts --output src/db/schema/auth.ts
  npm run db:generate && npm run db:migrate
  ```

  Known snag: npm 10.9.3's resolver crashes on that CLI's peer set
  (`Cannot read properties of null (reading 'edgesOut')`), both as a devDependency and via
  `npx`. Workaround is installing it in a scratch directory with `--legacy-peer-deps` and
  running its binary against this project.

- **No transactions.** The Neon HTTP driver (`drizzle-orm/neon-http`) doesn't support them, so
  the Drizzle adapter is configured `transaction: false` and runs operations sequentially.
  Multi-step writes that must be atomic — order + line items + inventory decrement — need a
  switch to `drizzle-orm/neon-serverless` with a `Pool` (WebSocket driver).

New application tables go in their own file under `src/db/schema/` and get re-exported from
`src/db/schema/index.ts`, which is both the drizzle-kit entry point and what `db` is typed against.

## Database conventions

Established while building the catalogue (`src/db/schema/catalog.ts`). Apply them to new
tables rather than re-deciding.

- **Naming follows `auth.ts`:** singular lowercase table names and exports (`product`, not
  `products`), camelCase TS properties with the snake_case column name passed explicitly.
  No `casing` option is configured, so that string is load-bearing.
- **Ids are `uuid("id").primaryKey().defaultRandom()`** so the database owns them. The
  `text` ids in `auth.ts` are the exception — Better Auth generates those itself. A
  human-readable `slug` is a separate unique column, never the primary key, because slugs
  get edited.
- **Money is integer minor units** (`price_cents`). No floats, no `numeric`.
- **Never store what can be derived.** Stock is `stock_quantity` + `low_stock_threshold`
  only; `stockStateFor` in `src/lib/catalog.ts` derives the in/low/out state, so the two
  cannot contradict each other. Same for URLs — `href` is built in the query layer, not
  held in a column.
- **`jsonb` for ordered free text nothing queries into** (`product.composition`). A child
  table only when its rows need columns of their own, as `product_image` does for alt text
  and position.
- **`on delete set null` where the child outlives the parent** — deleting a category must
  not take its products with it. Cascade only for rows that are meaningless alone.

**Reads go through one query module per domain**, `src/lib/catalog-queries.ts` for the
catalogue; pages never import `@/db`. View types and pure helpers sit apart in
`src/lib/catalog.ts`, which imports nothing from `@/db` — `ProductCard` imports
`formatPrice`, and a database import there would reach every component that touches it.

**Every read is a `use cache` scope with an explicit `cacheLife`.** Not a preference:
`ensureStatic = "navigation"` fails the build on an uncached database call even inside
`<Suspense>`, and on any cache life whose `expire` is under five minutes. `hours` suits
catalogue data. Tag reads with `cacheTag` so a later mutation can `updateTag` them.

Scripts that run outside Next cannot invalidate those caches, so **restart the dev server
after `npm run db:seed`** or pages may serve the previous rows for up to an hour.

An unreachable database is an error everywhere, including during `next build`:
`generateStaticParams` on `/products/[slug]` queries the catalogue and
`ensureStatic = "navigation"` needs at least one param, so a build without a reachable,
non-empty catalogue fails rather than shipping an empty storefront.

## Env

`.env.local` is gitignored and holds the working dev `BETTER_AUTH_SECRET` and a real Neon
**pooled** `DATABASE_URL`. Both are required: `npm run dev` and `npm run build` fail without
a reachable database, as do the `db:*` commands. `.env.local` overrides `.env`, so a stale
placeholder there shadows a real value in `.env` — check it first when a connection fails for
no obvious reason. `.env.example` documents all four keys. `drizzle.config.ts` and
`src/db/seed.ts` both load `.env`/`.env.local` via dotenv, since they run outside Next.

## Known noise

`npm audit` reports 5 high-severity issues, all dev-only via
`eslint-config-next` → `fast-glob` → `braces`. Fixing requires downgrading
`eslint-config-next` to v14; left as-is intentionally.
