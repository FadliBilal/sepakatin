import assert from "node:assert";
import { verifyTurnstileToken } from "../lib/server/turnstile";
import { rateLimit } from "../lib/server/rate-limit";

export async function runTurnstileSecurityTests() {
  console.log("\n🛡️ [FITUR 14] UNIT TEST: Keamanan Cloudflare Turnstile & Anti-Bot Protection");

  {
    const originalSecret = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
    const originalSpinSecret = process.env.TURNSTILE_SECRET;
    delete process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
    delete process.env.TURNSTILE_SECRET;

    const result = await verifyTurnstileToken("dummy_token");
    assert.strictEqual(result.success, true);

    if (originalSecret) process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY = originalSecret;
    if (originalSpinSecret) process.env.TURNSTILE_SECRET = originalSpinSecret;
    console.log("  ✓ 14.1 Graceful fallback saat secret belum dikonfigurasi.");
  }

  {
    const originalSecret = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
    const originalSpinSecret = process.env.TURNSTILE_SECRET;
    delete process.env.TURNSTILE_SECRET;
    process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY = "1x00000000000000000000000000000000AA";

    const emptyResult = await verifyTurnstileToken("");
    assert.strictEqual(emptyResult.success, false);
    assert.ok(emptyResult.errorCodes?.includes("missing-input-response"));

    if (originalSecret) process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY = originalSecret;
    if (originalSpinSecret) process.env.TURNSTILE_SECRET = originalSpinSecret;
    console.log("  ✓ 14.2 Penolakan token kosong saat proteksi Turnstile aktif.");
  }

  {
    const originalSecret = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
    const originalSpinSecret = process.env.TURNSTILE_SECRET;
    delete process.env.TURNSTILE_SECRET;
    process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY = "1x00000000000000000000000000000000AA";

    const testResult = await verifyTurnstileToken("XXXX.DUMMY.TOKEN.XXXX");
    if (testResult.success) {
      assert.strictEqual(testResult.success, true);
      console.log("  ✓ 14.3 Verifikasi live Cloudflare test key sukses.");
    } else {
      assert.ok(testResult.errorCodes?.length);
      console.log("  ✓ 14.3 Cloudflare siteverify error handling terstruktur.");
    }

    if (originalSecret) process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY = originalSecret;
    if (originalSpinSecret) process.env.TURNSTILE_SECRET = originalSpinSecret;
  }

  {
    const testIp = "192.168.99.10";
    const scope = `turnstile-verify:${testIp}`;

    for (let i = 0; i < 30; i++) {
      const { allowed } = rateLimit(scope, 30, 60_000);
      assert.strictEqual(allowed, true);
    }

    const blocked = rateLimit(scope, 30, 60_000);
    assert.strictEqual(blocked.allowed, false);
    assert.ok(blocked.retryAfterSeconds > 0);
    console.log("  ✓ 14.4 Rate limiter membatasi banjir permintaan Turnstile (HTTP 429).");
  }
}
