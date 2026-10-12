import assert from "node:assert/strict";
import { isAdminEmail } from "../lib/server/repo";

export async function runAdminSecurityTests() {
  console.log("\n🔑 [FITUR 7] UNIT TEST: Keamanan Hak Akses Administrator & Whitelist");

  // Simulasikan process.env.ADMIN_EMAILS
  const originalEnv = process.env.ADMIN_EMAILS;
  process.env.ADMIN_EMAILS = "admin@sepakatin.id";

  try {
    // Test 7.1: Email Admin Terdaftar Mendapatkan Hak Akses
    assert.equal(isAdminEmail("admin@sepakatin.id"), true);
    console.log("  ✓ 7.1 Email 'admin@sepakatin.id' terverifikasi valid sebagai Administrator.");

    // Test 7.2: Case Insensitivity (Huruf besar/kecil tidak berpengaruh)
    assert.equal(isAdminEmail("ADMIN@SEPAKATIN.ID"), true);
    assert.equal(isAdminEmail("Admin@Sepakatin.Id "), true);
    console.log("  ✓ 7.2 Case-insensitivity & whitespace trimming terverifikasi aman.");

    // Test 7.3: Email Luar Ditolak
    assert.equal(isAdminEmail("hacker@malicious.com"), false);
    assert.equal(isAdminEmail("user@gmail.com"), false);
    assert.equal(isAdminEmail("admin@othercompany.com"), false);
    console.log("  ✓ 7.3 Akun di luar whitelist berhasil ditolak hak akses admin-nya.");

    // Test 7.4: Fail-Closed Behavior (Input Kosong / Null / Undefined)
    assert.equal(isAdminEmail(""), false);
    assert.equal(isAdminEmail(null), false);
    assert.equal(isAdminEmail(undefined), false);
    console.log("  ✓ 7.4 Fail-Closed Security terbukti: Input kosong/null/undefined otomatis ditolak.");
  } finally {
    process.env.ADMIN_EMAILS = originalEnv;
  }
}
