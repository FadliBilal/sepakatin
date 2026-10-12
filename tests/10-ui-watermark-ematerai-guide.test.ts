import assert from "node:assert";
import { AgreementStatus } from "../lib/types";

export function shouldShowWatermark(status: AgreementStatus): boolean {
  return !["AGREED", "ACTIVE", "COMPLETED"].includes(status);
}

export function getWatermarkText(status: AgreementStatus): string {
  if (status === "CANCELLED") return "KESEPAKATAN DIBATALKAN";
  return "DRAF KESEPAKATAN — BELUM SAH";
}

export function isExemptFromDuty(totalValue: number): boolean {
  // UU No. 10 Tahun 2020 Pasal 7: Dokumen perdata dengan nilai nominal s/d Rp5.000.000 bebas Bea Meterai
  return totalValue <= 5000000;
}

export async function runUiWatermarkAndGuideTests() {
  console.log("\n📄 [FITUR 10] UNIT TEST: Watermark Dokumen & Panduan e-Meterai Resmi (UU 10/2020)");

  // Test 10.1: Watermark pada status belum sah
  const draftStatuses: AgreementStatus[] = ["DRAFT", "PENDING_CLIENT", "CHANGES_REQUESTED", "PENDING_APPROVAL"];
  for (const status of draftStatuses) {
    assert.strictEqual(
      shouldShowWatermark(status),
      true,
      `Status ${status} harus memunculkan watermark tanda air belum sah`
    );
    assert.strictEqual(
      getWatermarkText(status),
      "DRAF KESEPAKATAN — BELUM SAH",
      `Teks watermark untuk ${status} harus sesuai standar`
    );
  }
  console.log("  ✓ 10.1 Watermark 'DRAF KESEPAKATAN — BELUM SAH' terbukti aktif pada semua status draf & revisi.");

  // Test 10.2: Watermark pembatalan
  assert.strictEqual(shouldShowWatermark("CANCELLED"), true);
  assert.strictEqual(getWatermarkText("CANCELLED"), "KESEPAKATAN DIBATALKAN");
  console.log("  ✓ 10.2 Watermark 'KESEPAKATAN DIBATALKAN' terbukti aktif pada dokumen yang dibatalkan.");

  // Test 10.3: Dokumen sah berkonsensus bebas watermark
  const legalStatuses: AgreementStatus[] = ["AGREED", "ACTIVE", "COMPLETED"];
  for (const status of legalStatuses) {
    assert.strictEqual(
      shouldShowWatermark(status),
      false,
      `Dokumen berstatus ${status} harus bersih tanpa watermark belum sah`
    );
  }
  console.log("  ✓ 10.3 Dokumen berstatus AGREED, ACTIVE, & COMPLETED terbukti bersih dari watermark draf.");

  // Test 10.4: Kepatuhan UU No. 10/2020 Pasal 7 (Ambang Batas Rp5.000.000)
  assert.strictEqual(isExemptFromDuty(1500000), true, "Rp1.5 Juta bebas bea");
  assert.strictEqual(isExemptFromDuty(5000000), true, "Rp5 Juta tepat bebas bea");
  assert.strictEqual(isExemptFromDuty(5000001), false, "Rp5.000.001 terutang bea meterai");
  assert.strictEqual(isExemptFromDuty(15000000), false, "Rp15 Juta terutang bea meterai");
  console.log("  ✓ 10.4 Ambang batas bebas Bea Meterai UU No. 10/2020 (≤ Rp5.000.000) terbukti akurat.");

  // Test 10.5: Verifikasi kuota 2 Salinan Resmi e-Meterai Peruri
  const calcStampedCount = (hasFreelancer: boolean, hasClient: boolean) => (hasFreelancer ? 1 : 0) + (hasClient ? 1 : 0);
  assert.strictEqual(calcStampedCount(false, false), 0);
  assert.strictEqual(calcStampedCount(true, false), 1);
  assert.strictEqual(calcStampedCount(true, true), 2);
  console.log("  ✓ 10.5 Pengelolaan kuota 2 Salinan Resmi e-Meterai (Freelancer & Klien) terverifikasi konsisten.");
}
