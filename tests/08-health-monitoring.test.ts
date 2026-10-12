import assert from "node:assert/strict";
import { GET as healthHandler } from "../app/api/health/route";

export async function runHealthMonitoringTests() {
  console.log("\n💓 [FITUR 8] UNIT TEST: Pemantau Kesehatan Server & Konektivitas Database");

  // Test 8.1: Endpoint /api/health Merespon dengan Status 200 (Online) atau 503 (Offline/Unconfigured)
  const response = await healthHandler();
  assert.ok(
    response.status === 200 || response.status === 503,
    `Healthcheck harus mengembalikan HTTP 200 (healthy) atau 503 (offline/unconfigured), didapat: ${response.status}`
  );
  console.log(`  ✓ 8.1 Endpoint /api/health merespons dengan status HTTP ${response.status} sesuai kontrak operasional.`);

  // Test 8.2: Memeriksa Payload JSON & Struktur Kontrak Pemantauan
  const data = await response.json();
  assert.ok(data.status === "healthy" || data.status === "unhealthy");
  assert.equal(typeof data.database.connected, "boolean");
  assert.equal(typeof data.database.latencyMs, "number");
  assert.ok(data.database.latencyMs >= 0);
  assert.equal(typeof data.uptimeSeconds, "number");
  if (data.database.connected) {
    console.log(`  ✓ 8.2 Koneksi Supabase PostgreSQL aktif dengan latensi kueri: ${data.database.latencyMs} ms.`);
  } else {
    console.log(`  ✓ 8.2 Endpoint berhasil menangani deteksi database offline secara graceful (${data.database.error || "Offline"}).`);
  }

  // Test 8.3: Cache-Control Header
  const cacheControl = response.headers.get("Cache-Control");
  assert.ok(cacheControl?.includes("no-store"), "Healthcheck tidak boleh di-cache oleh browser/CDN");
  console.log("  ✓ 8.3 Header 'Cache-Control: no-store' terpasang agar monitoring selalu real-time.");
}
