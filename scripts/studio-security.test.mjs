import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { createRequire, Module } from "node:module";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";

const require = createRequire(import.meta.url);
const directory = dirname(require.resolve("drizzle-kit"));
const studioOrigin = "https://local.drizzle.studio";

// Exercise the installed Hono handlers and validation with recording database
// callbacks. Expose bundle internals only in memory (or a temporary ESM file),
// without running the CLI, opening a listener, or connecting to a real database.
async function loadServer(bundle) {
  const filename = join(directory, bundle);
  let source = readFileSync(filename, "utf8");
  if (bundle === "bin.cjs") {
    const cliStart = source.indexOf("\nrun([generate, migrate,");
    assert.ok(cliStart > 0, "expected pinned CLI entry point");
    source = source.slice(0, cliStart);
  }
  if (bundle.endsWith(".mjs")) {
    const temporary = join(directory, `.studio-security-${randomUUID()}.mjs`);
    try {
      writeFileSync(temporary, `${source}\ninit_studio2(); export { prepareServer, Hono2 };`);
      return await import(pathToFileURL(temporary).href);
    } finally {
      unlinkSync(temporary);
    }
  }
  const loaded = new Module(filename);
  loaded.filename = filename;
  loaded.paths = require.resolve.paths("drizzle-kit");
  loaded._compile(`${source}\ninit_studio2(); module.exports = { prepareServer, Hono2 };`, filename);
  return loaded.exports;
}

for (const bundle of ["bin.cjs", "api.js", "api.mjs"]) {
  test(bundle, async (t) => {
    const { prepareServer, Hono2 } = await loadServer(bundle);
    const app = new Hono2();
    const calls = [];
    await prepareServer({
      dialect: "postgresql",
      schema: {},
      relations: {},
      customDefaults: [{
        schema: "public", table: "example", column: "id",
        func: () => { calls.push("default"); return "synthetic-id"; },
      }],
      proxy: async (data) => { calls.push(data); return [{ value: 1 }]; },
      transactionProxy: async (data) => { calls.push(data); return [[{ value: 1 }]]; },
    }, app);

    const operations = [
      { type: "proxy", data: { sql: "select 1", method: "all" } },
      { type: "tproxy", data: [{ sql: "select 1", method: "all" }] },
      { type: "init" },
      { type: "defaults", data: [{ schema: "public", table: "example", column: "id" }] },
    ];
    const request = (origin, body, method = "POST", contentType = "application/json") => {
      const headers = { "Content-Type": contentType };
      if (origin !== undefined) headers.Origin = origin;
      if (method === "OPTIONS") {
        headers["Access-Control-Request-Method"] = "POST";
        headers["Access-Control-Request-Headers"] = "content-type";
        headers["Access-Control-Request-Private-Network"] = "true";
      }
      return app.request("http://127.0.0.1:4983/", {
        method, headers, ...(method === "POST" && { body: JSON.stringify(body) }),
      });
    };

    await t.test("rejects untrusted, missing, opaque, and lookalike origins before dispatch", async () => {
      for (const origin of [
        "https://attacker.example", undefined, "null", "http://local.drizzle.studio",
        "https://local.drizzle.studio.attacker.example", "https://local.drizzle.studio:444",
        "https://attacker.example, https://local.drizzle.studio",
      ]) {
        for (const operation of operations) {
          for (const contentType of ["application/json", "text/plain"]) {
            const response = await request(origin, operation, "POST", contentType);
            assert.equal(response.status, 403, `${origin}: ${operation.type} (${contentType})`);
            assert.equal(response.headers.get("Access-Control-Allow-Origin"), null);
            assert.equal(response.headers.get("Access-Control-Allow-Private-Network"), null);
            assert.deepEqual(calls, [], "rejected request must never reach database/default callbacks");
          }
        }
        const preflight = await request(origin, undefined, "OPTIONS");
        assert.equal(preflight.status, 403);
        assert.equal(preflight.headers.get("Access-Control-Allow-Origin"), null);
      }
    });

    calls.length = 0;
    await t.test("preserves trusted Studio preflight, initialization, queries and defaults", async () => {
      const preflight = await request(studioOrigin, undefined, "OPTIONS");
      assert.equal(preflight.status, 204);
      assert.equal(preflight.headers.get("Access-Control-Allow-Origin"), studioOrigin);
      assert.equal(preflight.headers.get("Access-Control-Allow-Private-Network"), "true");
      assert.match(preflight.headers.get("Access-Control-Allow-Headers"), /content-type/i);
      assert.match(preflight.headers.get("Access-Control-Allow-Methods"), /POST/);
      for (const operation of operations) {
        const response = await request(studioOrigin, operation);
        assert.equal(response.status, 200);
        assert.equal(response.headers.get("Access-Control-Allow-Origin"), studioOrigin);
        const result = await response.json();
        if (operation.type === "proxy") assert.deepEqual(result, [{ value: 1 }]);
        if (operation.type === "tproxy") assert.deepEqual(result, [[{ value: 1 }]]);
        if (operation.type === "init") assert.equal(result.dialect, "postgresql");
        if (operation.type === "defaults") assert.equal(result[0].value, "synthetic-id");
      }
      assert.deepEqual(calls, [
        { ...operations[0].data, mode: "object", params: [] },
        operations[1].data,
        "default",
      ]);
    });
  });
}
