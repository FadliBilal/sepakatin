import assert from "node:assert/strict";
import { applyOwnerAction, applyClientAction, buildNewAgreement, AgreementError } from "../lib/agreement-logic";
import type { ContractContentJSON, RequestContext } from "../lib/types";

export async function runConsensusAutoLockTests() {
  console.log("\n🔒 [FITUR 5] UNIT TEST: Konsensus Persetujuan & Penguncian Dokumen Otomatis");

  const content: ContractContentJSON = {
    contractId: "SPK-2026-LCK01",
    projectName: "Pengembangan Modul AI Chatbot",
    freelancer: { name: "Dimas Aditya", email: "dimas@ai.id" },
    client: { name: "PT Solusi Cerdas", email: "tech@solusicerdas.id" },
    scope: { description: "Integrasi LLM Assistant", deliverables: ["API Endpoint Chatbot", "Dokumentasi API"] },
    payment: { totalValue: 25000000, dpPercent: 30 },
    revision: { count: 2 },
    timeline: { startDate: "2026-10-01", deadline: "2026-11-01" },
  };

  let agreement = await buildNewAgreement({
    content,
    contractId: "SPK-2026-LCK01",
    ownerId: "user_freelancer_005",
    plan: "pro",
    sendDirectly: true,
  });

  const ctx: RequestContext = { ipAddress: "36.88.90.12", userAgent: "NodeUnitTest/1.0" };

  // Test 5.1: Freelancer Memberikan Persetujuan (Approve)
  agreement = await applyOwnerAction(agreement, { type: "approve" }, ctx);
  assert.equal(agreement.approvals.length, 1);
  assert.equal(agreement.approvals[0].role, "freelancer");
  assert.equal(agreement.approvals[0].signerName, "Dimas Aditya");
  // Dokumen belum AGREED karena klien belum approve
  assert.equal(agreement.status, "PENDING_CLIENT");
  console.log("  ✓ 5.1 Freelancer menyetujui versi 1 (Status tetap 'PENDING_CLIENT' menunggu pihak klien).");

  // Test 5.2: Freelancer Tidak Bisa Menyetujui Dua Kali pada Versi yang Sama
  await assert.rejects(
    async () => {
      await applyOwnerAction(agreement, { type: "approve" }, ctx);
    },
    (err: unknown) => err instanceof AgreementError && err.message.includes("sudah menyetujui"),
    "Harus menolak approval ganda dari pihak yang sama"
  );
  console.log("  ✓ 5.2 Berhasil menolak duplikasi persetujuan dari pihak yang sama.");

  // Test 5.3: Klien Memberikan Persetujuan (Kedua Pihak Lengkap -> Auto Lock ke AGREED)
  agreement = await applyClientAction(
    agreement,
    {
      type: "approve",
      name: "Hendro Wibowo (CTO)",
      email: "tech@solusicerdas.id",
    },
    ctx
  );

  assert.equal(agreement.approvals.length, 2);
  // Status otomatis berubah ke AGREED
  assert.equal(agreement.status, "AGREED");
  console.log("  ✓ 5.3 Klien menyetujui dokumen -> Konsensus tercapai -> Status otomatis terkunci ke 'AGREED'.");

  // Test 5.4: Upaya Merusak/Mengubah Dokumen Setelah Terkunci Harus Ditolak (HTTP 409)
  await assert.rejects(
    async () => {
      await applyClientAction(agreement, {
        type: "requestChange",
        name: "Hendro Wibowo",
        title: "Perubahan susulan",
        description: "Ingin ubah deadline",
      });
    },
    (err: unknown) => err instanceof AgreementError && (err.status === 409 || err.statusCode === 409),
    "Harus menolak permintaan revisi pada dokumen berstatus AGREED"
  );
  console.log("  ✓ 5.4 Berhasil menolak permintaan perubahan susulan pada dokumen yang sudah terkunci (HTTP 409).");

  // Test 5.5: Upaya Mengubah Tanda Tangan Setelah Terkunci Harus Ditolak (HTTP 409)
  await assert.rejects(
    async () => {
      await applyClientAction(agreement, {
        type: "signature",
        name: "Hendro Wibowo",
        dataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      });
    },
    (err: unknown) => err instanceof AgreementError && (err.status === 409 || err.statusCode === 409),
    "Harus menolak penggantian tanda tangan pada dokumen berstatus AGREED"
  );
  console.log("  ✓ 5.5 Berhasil mengamankan tanda tangan: dilarang diubah setelah kedua pihak sepakat.");
}
