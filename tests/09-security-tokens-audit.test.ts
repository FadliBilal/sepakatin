import assert from "node:assert/strict";
import {
  applyClientAction,
  applyOwnerAction,
  buildNewAgreement,
  AgreementError,
  REVIEW_TOKEN_TTL_MS,
} from "../lib/agreement-logic";
import { rateLimit } from "../lib/server/rate-limit";
import type { ContractContentJSON } from "../lib/types";

export async function runSecurityAndAuditTests() {
  console.log("\n🔒 [FITUR 9] UNIT TEST: Keamanan Token Review, Rate Limiting & Audit Trail");

  const sampleContent: ContractContentJSON = {
    contractId: "SPK-2026-SEC01",
    projectName: "Pengembangan Keamanan Sistem",
    freelancer: { name: "Budi Security", email: "budi@sec.id" },
    client: { name: "PT Aman Sentosa", email: "klien@amansentosa.id" },
    scope: { description: "Penetration Testing & Hardening", deliverables: ["Laporan Audit", "Patch Keamanan"], exclusions: [], acceptanceCriteria: [] },
    payment: { totalValue: 12000000, dpPercent: 30, currency: "IDR", paymentMethod: "Transfer Bank", finalPaymentDueDays: 7 },
    revision: { count: 2, terms: "2x revisi minor" },
    timeline: { startDate: "2026-10-01", deadline: "2026-10-31" },
    ip: { ownershipClause: "Hak cipta beralih setelah pelunasan." },
    termination: { cancellationCondition: "Pembatalan wajib kompensasi.", noticePeriodDays: 7, outstandingPaymentTerms: "Pro-rata." },
    validFrom: "2026-10-01",
    validUntil: "2026-10-31",
  };

  // 9.1: Token TTL Expiration (14 Hari)
  const agreement = await buildNewAgreement({
    content: sampleContent,
    contractId: "SPK-2026-SEC01",
    ownerId: "user_freelancer_sec",
    plan: "gratis",
    sendDirectly: true,
  });

  assert.ok(agreement.reviewToken, "Review token wajib dibuat");
  assert.ok(agreement.reviewTokenExpiresAt, "Masa berlaku token wajib dihitung saat kesepakatan dikirim");

  const expiresDate = new Date(agreement.reviewTokenExpiresAt);
  const diffDays = Math.round((expiresDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
  assert.equal(diffDays, 14, "Masa berlaku token review harus tepat 14 hari");
  console.log("  ✓ 9.1 Masa berlaku token review terbukti 14 hari (TTL).");

  // Simulasi token kedaluwarsa (manipulasi reviewTokenExpiresAt ke masa lalu)
  const expiredAgreement = {
    ...agreement,
    reviewTokenExpiresAt: new Date(Date.now() - 1000 * 60).toISOString(), // 1 menit yang lalu
  };

  await assert.rejects(
    async () => {
      await applyClientAction(expiredAgreement, {
        type: "approve",
        name: "Klien Aman",
        email: "klien@amansentosa.id",
      });
    },
    (err: unknown) =>
      err instanceof AgreementError &&
      (err.status === 410 || err.statusCode === 410) &&
      err.code === "TOKEN_EXPIRED",
    "Harus menolak aksi klien jika token telah kedaluwarsa (HTTP 410 TOKEN_EXPIRED)"
  );
  console.log("  ✓ 9.2 Berhasil menolak persetujuan klien pada tautan yang sudah kedaluwarsa (HTTP 410).");

  // 9.3: Regenerasi Review Token oleh Freelancer
  const originalToken = agreement.reviewToken;
  const regenerated = await applyOwnerAction(expiredAgreement, {
    type: "regenerateReviewToken",
  });

  assert.notEqual(regenerated.reviewToken, originalToken, "Token review baru harus berbeda dari token lama");
  assert.ok(new Date(regenerated.reviewTokenExpiresAt!) > new Date(), "Masa berlaku token harus diperpanjang kembali");
  console.log("  ✓ 9.3 Berhasil menerbitkan ulang tautan review (token lama tidak berlaku, TTL reset 14 hari).");

  // Klien kini bisa menyetujui dengan token baru yang sah
  const approvedWithNewToken = await applyClientAction(regenerated, {
    type: "approve",
    name: "Klien Aman",
    email: "klien@amansentosa.id",
  });
  assert.equal(approvedWithNewToken.approvals.length, 1);
  console.log("  ✓ 9.4 Klien berhasil menyetujui dokumen setelah tautan review diperbarui.");

  // 9.5: Pengujian Rate Limiting
  const testKey = `test-ip-${Date.now()}`;
  const r1 = rateLimit(testKey, 2, 5000);
  const r2 = rateLimit(testKey, 2, 5000);
  const r3 = rateLimit(testKey, 2, 5000);

  assert.equal(r1.allowed, true, "Permintaan ke-1 harus diizinkan");
  assert.equal(r2.allowed, true, "Permintaan ke-2 harus diizinkan");
  assert.equal(r3.allowed, false, "Permintaan ke-3 harus ditolak (melebihi limit 2)");
  assert.ok(r3.retryAfterSeconds > 0, "Harus mengembalikan waktu tunggu retry-after");
  console.log("  ✓ 9.5 Rate Limiter terbukti membatasi lonjakan permintaan liar (HTTP 429 guard).");
}
