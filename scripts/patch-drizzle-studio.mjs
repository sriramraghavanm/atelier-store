import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

// Temporary security patch for the pinned release; recheck on every upgrade.
// Studio's browser client uses this exact origin and has no token handshake.
const original = `      app.use(compress());
      app.use(async (ctx, next) => {
        await next();
        ctx.header("Access-Control-Allow-Private-Network", "true");
      });
      app.use(cors());`;
const patched = `      app.use(async (ctx, next) => {
        if (ctx.req.header("origin") !== "https://local.drizzle.studio") {
          return ctx.text("Forbidden", 403);
        }
        await next();
      });
      app.use(compress());
      app.use(async (ctx, next) => {
        await next();
        ctx.header("Access-Control-Allow-Private-Network", "true");
      });
      app.use(cors({ origin: "https://local.drizzle.studio" }));`;

const require = createRequire(import.meta.url);
let directory;
try {
  directory = dirname(require.resolve("drizzle-kit"));
} catch (error) {
  // Production installs can omit this development dependency.
  if (error.code !== "MODULE_NOT_FOUND") throw error;
}

if (directory) {
  const { version } = JSON.parse(readFileSync(join(directory, "package.json"), "utf8"));
  if (version !== "0.31.11") {
    throw new Error(`Recheck the Studio security patch for drizzle-kit ${version}`);
  }

  // Validate every bundle before changing any of them. Unexpected code must
  // stop installation/startup rather than silently leave Studio unprotected.
  const updates = ["bin.cjs", "api.js", "api.mjs"].map((name) => {
    const path = join(directory, name);
    const source = readFileSync(path, "utf8");
    if (source.includes(patched) && !source.includes(original)) return null;
    if (source.split(original).length !== 2 || source.includes(patched)) {
      throw new Error(`Cannot safely patch drizzle-kit/${name}`);
    }
    return { path, source: source.replace(original, patched) };
  });
  for (const update of updates) {
    if (update) writeFileSync(update.path, update.source);
  }
}
