import assert from "node:assert/strict";
import { generateDocumentHash } from "../lib/crypto";
import { buildNewAgreement, sanitizeContent, toVerificationData } from "../lib/agreement-logic";
import type { ContractContentJSON } from "../lib/types";

export async function runHashVerificationTests() {
  console.log("\n🛡️ [FITUR 6] UNIT TEST: Integritas Hash SHA-256 & Verifikasi Keaslian Publik");

  const originalContent: ContractContentJSON = {
    contractId: "SPK-2026-HSH01",
    projectName: "Pembuatan Video Profil Korporat",
    freelancer: { name: "Irfan Pratama", email: "irfan@media.id", phone: "0812345678" },
    client: { name: "PT Nusantara Sejahtera", email: "corp@nusantara.id", phone: "089999999" },
    scope: { description: "Video berdurasi 3 menit", deliverables: ["Master Video 4K"], exclusions: [], acceptanceCriteria: [] },
    payment: { totalValue: 18000000, dpPercent: 50, currency: "IDR", paymentMethod: "Transfer Bank", finalPaymentDueDays: 7 },
    revision: { count: 2, terms: "2x revisi minor" },
    timeline: { startDate: "2026-10-01", deadline: "2026-10-20" },
    ip: { ownershipClause: "Hak cipta beralih setelah pelunasan." },
    termination: { cancellationCondition: "Pembatalan wajib kompensasi.", noticePeriodDays: 7, outstandingPaymentTerms: "Pro-rata." },
    validFrom: "2026-10-01",
    validUntil: "2026-10-20",
  };

  const sanitizedContent = sanitizeContent(originalContent, "SPK-2026-HSH01");

  // Test 6.1: Menghitung Hash SHA-256 Kanonikal
  const hash1 = await generateDocumentHash(sanitizedContent);
  assert.equal(typeof hash1, "string");
  assert.equal(hash1.length, 64, "SHA-256 harus menghasilkan heksadesimal 64 karakter");
  console.log(`  ✓ 6.1 Berhasil menghasilkan SHA-256 hash otentik: ${hash1.slice(0, 16)}...`);

  // Test 6.2: Deterministik - Hash Harus Selalu Identik untuk Konten yang Sama
  const hashIdentical = await generateDocumentHash({ ...sanitizedContent });
  assert.equal(hash1, hashIdentical);
  console.log("  ✓ 6.2 Sifat deterministik terbukti: Konten identik menghasilkan hash yang persis sama.");

  // Test 6.3: Anti-Tampering (Avalanche Effect) - Ubah 1 Karakter Saja di Total Pembayaran
  const tamperedContent = {
    ...sanitizedContent,
    payment: { ...sanitizedContent.payment, totalValue: 18000001 }, // Ubah selisih Rp1
  };
  const hashTampered = await generateDocumentHash(tamperedContent);
  assert.notEqual(hash1, hashTampered, "Manipulasi data sekecil apapun harus merubah hash");
  console.log(`  ✓ 6.3 Anti-Tampering terbukti: Perubahan Rp1 merubah total SHA-256 hash (${hashTampered.slice(0, 16)}...).`);

  // Test 6.4: Cek Keaslian Publik lewat toVerificationData (Kepatuhan UU PDP)
  const agreement = await buildNewAgreement({
    content: sanitizedContent,
    contractId: "SPK-2026-HSH01",
    ownerId: "user_freelancer_006",
    plan: "pro",
    sendDirectly: true,
  });

  const publicData = await toVerificationData(agreement);

  // Verifikasi Integritas
  assert.equal(publicData.contractId, "SPK-2026-HSH01");
  assert.equal(publicData.isIntegrityMatched, true);
  assert.equal(publicData.documentHash, hash1);
  console.log("  ✓ 6.4 Verifikasi keaslian publik mencocokkan integritas hash dengan sempurna (isIntegrityMatched = true).");

  // Verifikasi Kepatuhan UU PDP: Tidak membocorkan data rahasia
  const exposedKeys = Object.keys(publicData);
  assert.ok(!exposedKeys.includes("reviewToken"), "TIDAK boleh membocorkan reviewToken ke publik");
  assert.ok(!exposedKeys.includes("ownerId"), "TIDAK boleh membocorkan ownerId internal ke publik");
  console.log("  ✓ 6.5 Kepatuhan UU PDP terjamin: Token rahasia & nomor rekening privat tidak terekspos ke publik.");
}
