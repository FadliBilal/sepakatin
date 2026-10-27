import assert from "node:assert/strict";
import { applyOwnerAction, applyClientAction, buildNewAgreement, type RequestContext } from "../lib/agreement-logic";
import type { ContractContentJSON } from "../lib/types";

export async function runDigitalSignatureTests() {
  console.log("\n✍️ [FITUR 4] UNIT TEST: Tanda Tangan Digital & Jejak Forensik Audit UU ITE");

  const content: ContractContentJSON = {
    contractId: "SPK-2026-SIG01",
    projectName: "Pembuatan Video Animasi 3D",
    freelancer: { name: "Farhan Maulana", email: "farhan@anim.id" },
    client: { name: "Studio Kreatif", email: "director@studiokreatif.id" },
    scope: { description: "Animasi iklan 30 detik", deliverables: ["Video MP4 4K", "Project Files"], exclusions: [], acceptanceCriteria: [] },
    payment: { totalValue: 20000000, dpPercent: 50, currency: "IDR", paymentMethod: "Transfer Bank", finalPaymentDueDays: 7 },
    revision: { count: 2, terms: "2x revisi minor" },
    timeline: { startDate: "2026-10-01", deadline: "2026-10-25" },
    ip: { ownershipClause: "Hak cipta beralih setelah pelunasan." },
    termination: { cancellationCondition: "Pembatalan wajib kompensasi.", noticePeriodDays: 7, outstandingPaymentTerms: "Pro-rata." },
    validFrom: "2026-10-01",
    validUntil: "2026-10-25",
  };

  let agreement = await buildNewAgreement({
    content,
    contractId: "SPK-2026-SIG01",
    ownerId: "user_freelancer_004",
    plan: "pro",
    sendDirectly: true,
  });

  const sampleSigDataUrl =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

  // Mock Context Forensik Freelancer
  const freelancerCtx: RequestContext = {
    ipAddress: "103.144.18.22",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0 Safari/537.36",
  };

  // Test 4.1: Freelancer Menandatangani dengan Jejak IP & User-Agent
  agreement = await applyOwnerAction(
    agreement,
    {
      type: "signature",
      dataUrl: sampleSigDataUrl,
    },
    freelancerCtx
  );

  const freelancerSig = agreement.signatures?.find((s) => s.signerRole === "freelancer");
  assert.ok(freelancerSig, "Tanda tangan freelancer harus tersimpan");
  assert.equal(freelancerSig.signerName, "Farhan Maulana");
  assert.equal(freelancerSig.ipAddress, "103.144.18.22");
  assert.equal(freelancerSig.userAgent, freelancerCtx.userAgent);
  assert.ok(freelancerSig.signedAt.length > 10);
  console.log("  ✓ 4.1 Berhasil menyimpan tanda tangan digital Freelancer lengkap dengan IP & User-Agent forensik.");

  // Mock Context Forensik Klien (misal membuka dari HP di Bandung)
  const clientCtx: RequestContext = {
    ipAddress: "182.253.120.45",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15",
  };

  // Test 4.2: Klien Menandatangani dengan Jejak Forensik
  agreement = await applyClientAction(
    agreement,
    {
      type: "signature",
      name: "Siti Rahma (Direktur)",
      dataUrl: sampleSigDataUrl,
    },
    clientCtx
  );

  const clientSig = agreement.signatures?.find((s) => s.signerRole === "client");
  assert.ok(clientSig, "Tanda tangan klien harus tersimpan");
  assert.equal(clientSig.signerName, "Siti Rahma (Direktur)");
  assert.equal(clientSig.ipAddress, "182.253.120.45");
  assert.equal(clientSig.userAgent, clientCtx.userAgent);
  console.log("  ✓ 4.2 Berhasil menyimpan tanda tangan digital Klien lengkap dengan IP & User-Agent forensik.");

  // Test 4.3: Kedua Tanda Tangan Tersimpan Rapi & Mandiri
  assert.equal(agreement.signatures?.length, 2);
  console.log("  ✓ 4.3 Kedua tanda tangan resmi para pihak tersimpan aman dalam dokumen.");
}
