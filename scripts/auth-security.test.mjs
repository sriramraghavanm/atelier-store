import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import test from "node:test";

// Better Auth captures NODE_ENV on import. Exercise its production defaults with
// synthetic configuration; database operations below use recording fixtures.
process.env.NODE_ENV = "production";
process.env.TEST = "false";
process.env.DATABASE_URL = "postgresql://test:test@database.invalid/auth_test";
process.env.BETTER_AUTH_SECRET = randomBytes(32).toString("hex");
process.env.BETTER_AUTH_URL = "http://localhost:3000";
process.env.BETTER_AUTH_TELEMETRY = "false";

const { auth } = await import("../src/lib/auth.ts");
const { GET, POST } = await import("../src/app/api/auth/[...all]/route.ts");

test("production auth throttling cannot be reset with client IP headers", async (t) => {
  const context = await auth.$context;
  assert.equal(context.rateLimit.enabled, true);
  const password = "synthetic-test-password";
  const user = {
    id: "auth-test-user", name: "Test User", email: "test@example.com",
    emailVerified: true, createdAt: new Date(), updatedAt: new Date(),
  };
  const account = {
    id: "auth-test-account", userId: user.id, accountId: user.id,
    providerId: "credential", password: await context.password.hash(password),
    createdAt: new Date(), updatedAt: new Date(),
  };
  const sessions = [];
  const reads = t.mock.method(context.adapter, "findOne", async ({ model, where }) => {
    assert.equal(model, "user");
    assert.deepEqual(where, [{ field: "email", value: user.email }]);
    return { ...user, account: [account] };
  });
  t.mock.method(context.adapter, "create", async ({ model, data }) => {
    assert.equal(model, "session");
    const session = { id: "auth-test-session", ...data };
    sessions.push(session);
    return session;
  });
  t.mock.timers.enable({ apis: ["Date"], now: Date.now() });

  const signIn = (headers = {}, suppliedPassword = "wrong-password") => POST(new Request(
    "http://localhost:3000/api/auth/sign-in/email",
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: "http://localhost:3000", ...headers },
      body: JSON.stringify({ email: user.email, password: suppliedPassword }),
    },
  ));

  await t.test("rotating valid addresses cannot extend the three-attempt limit", async () => {
    for (let attempt = 1; attempt <= 3; attempt++) {
      const response = await signIn({ "X-Forwarded-For": `192.0.2.${attempt}` });
      assert.equal(response.status, 401);
      assert.equal((await response.json()).code, "INVALID_EMAIL_OR_PASSWORD");
    }
    assert.equal(reads.mock.callCount(), 3);
    for (const headers of [
      { "X-Forwarded-For": "192.0.2.4" },
      { "X-Forwarded-For": "2001:db8:1234::1" },
      { "X-Forwarded-For": "192.0.2.5, 192.0.2.6" },
      { "X-Forwarded-For": "invalid" },
      { "X-Real-IP": "198.51.100.1", "CF-Connecting-IP": "198.51.100.2" },
      {},
    ]) {
      const response = await signIn(headers);
      assert.equal(response.status, 429, JSON.stringify(headers));
      assert.equal(response.headers.get("X-Retry-After"), "10");
    }
    assert.equal(reads.mock.callCount(), 3, "throttled requests must not look up credentials");
    assert.equal(sessions.length, 0);
  });

  await t.test("other auth endpoints keep their own buckets", async () => {
    const response = await GET(new Request("http://localhost:3000/api/auth/ok"));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true });
  });

  await t.test("sign-in recovers after the window and does not store a claimed IP", async () => {
    t.mock.timers.tick(10_001);
    const response = await signIn({ "X-Forwarded-For": "203.0.113.1" }, password);
    assert.equal(response.status, 200);
    assert.equal((await response.json()).user.id, user.id);
    assert.match(response.headers.get("set-cookie"), /session_token=/);
    assert.equal(sessions.length, 1);
    assert.equal(sessions[0].ipAddress, "");
  });

  await t.test("concurrent requests with different claimed IPs share the limit", async () => {
    t.mock.timers.tick(10_001);
    const readsBefore = reads.mock.callCount();
    const responses = await Promise.all(Array.from({ length: 8 }, (_, i) => signIn({
      "X-Forwarded-For": `198.51.100.${i + 1}`,
    })));
    assert.equal(responses.filter((response) => response.status === 401).length, 3);
    assert.equal(responses.filter((response) => response.status === 429).length, 5);
    assert.equal(reads.mock.callCount() - readsBefore, 3);
  });
});
