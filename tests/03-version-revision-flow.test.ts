import assert from "node:assert/strict";
import {
  applyOwnerAction,
  applyClientAction,
  buildNewAgreement,
  AgreementError,
} from "../lib/agreement-logic";
import type { ContractContentJSON } from "../lib/types";

export async function runRevisionFlowTests() {
  console.log("\n🔄 [FITUR 3] UNIT TEST: Siklus Hidup Revisi & Batasan Versi Paket");

  const baseContent: ContractContentJSON = {
    contractId: "SPK-2026-REV01",
    projectName: "Pengembangan Aplikasi Kasir POS",
    freelancer: { name: "Ahmad Dani", email: "ahmad@pos.id" },
    client: { name: "Resto Enak", email: "owner@restoenak.com" },
    scope: { description: "Sistem POS Tablet", deliverables: ["Modul Kasir", "Laporan Penjualan"] },
    payment: { totalValue: 12000000, dpPercent: 40 },
    revision: { count: 2 },
    timeline: { startDate: "2026-10-01", deadline: "2026-10-31" },
  };

  let agreement = await buildNewAgreement({
    content: baseContent,
    contractId: "SPK-2026-REV01",
    ownerId: "user_freelancer_003",
    plan: "gratis",
    sendDirectly: false,
  });

  // Test 3.1: Edit Draf In-Place (Nomor Versi Tetap 1)
  agreement = await applyOwnerAction(agreement, {
    type: "newVersion",
    content: { ...baseContent, projectName: "Pengembangan Aplikasi Kasir POS Resto (Updated)" },
  });
  assert.equal(agreement.currentVersionNumber, 1);
  assert.equal(agreement.versions.length, 1);
  assert.equal(agreement.currentVersion.contentJson.projectName, "Pengembangan Aplikasi Kasir POS Resto (Updated)");
  console.log("  ✓ 3.1 Berhasil edit draf langsung (in-place) tanpa menaikkan nomor versi saat status masih 'DRAFT'.");

  // Test 3.2: Kirim Draf ke Klien
  agreement = await applyOwnerAction(agreement, { type: "send" });
  assert.equal(agreement.status, "PENDING_CLIENT");
  console.log("  ✓ 3.2 Berhasil mengirimkan draf resmi ke klien (Status berubah ke 'PENDING_CLIENT').");

  // Test 3.3: Klien Mengajukan Permintaan Perubahan (Change Request)
  agreement = await applyClientAction(agreement, {
    type: "requestChange",
    name: "Owner Resto Enak",
    email: "owner@restoenak.com",
    title: "Tambah fitur cetak struk Bluetooth",
    description: "Tolong tambahkan modul integrasi printer thermal Bluetooth di kasir.",
  });
  assert.equal(agreement.status, "CHANGES_REQUESTED");
  assert.equal(agreement.changeRequests.length, 1);
  assert.equal(agreement.changeRequests[0].title, "Tambah fitur cetak struk Bluetooth");
  console.log("  ✓ 3.3 Berhasil mencatat permintaan perubahan dari klien (Status berubah ke 'CHANGES_REQUESTED').");

  // Test 3.4: Freelancer Merilis Versi 2
  agreement = await applyOwnerAction(agreement, {
    type: "newVersion",
    content: {
      ...baseContent,
      scope: {
        description: "Sistem POS Tablet + Bluetooth Thermal Printer",
        deliverables: ["Modul Kasir", "Laporan Penjualan", "Integrasi Printer Bluetooth"],
      },
    },
  });
  assert.equal(agreement.currentVersionNumber, 2);
  assert.equal(agreement.versions.length, 2);
  assert.equal(agreement.status, "PENDING_APPROVAL");
  console.log("  ✓ 3.4 Berhasil menaikkan nomor versi ke Versi 2 setelah revisi selesai diterapkan (Status: 'PENDING_APPROVAL').");

  // Test 3.5: Penegakan Batas Versi Paket Gratis (Max 2 Versi)
  await assert.rejects(
    async () => {
      await applyClientAction(agreement, {
        type: "requestChange",
        name: "Owner Resto Enak",
        title: "Tambah fitur diskon member",
        description: "Ingin revisi lagi untuk fitur member.",
      });
    },
    (err: unknown) => err instanceof AgreementError && err.code === "VERSION_LIMIT",
    "Paket Gratis harus menolak revisi melebihi batas 2 versi"
  );
  console.log("  ✓ 3.5 Berhasil menegakkan aturan bisnis: Paket Gratis dibatasi maksimal 2 versi kesepakatan.");

  // Test 3.6: Amandemen Kontrak Pada Paket Pro Setelah Sepakat (AGREED -> newVersion -> PENDING_APPROVAL)
  let proAgreement = await buildNewAgreement({
    content: baseContent,
    contractId: "SPK-2026-AMD01",
    ownerId: "user_freelancer_pro",
    plan: "pro",
    sendDirectly: true,
  });
  // Keduanya setuju hingga status AGREED
  proAgreement = await applyOwnerAction(proAgreement, { type: "approve" });
  proAgreement = await applyClientAction(proAgreement, {
    type: "approve",
    name: "Owner Resto",
    email: "owner@restoenak.com",
  });
  assert.equal(proAgreement.status, "AGREED");
  assert.equal(proAgreement.currentVersionNumber, 1);

  // Freelancer menerbitkan amandemen Versi 2
  proAgreement = await applyOwnerAction(proAgreement, {
    type: "newVersion",
    content: {
      ...baseContent,
      scope: {
        description: "Amandemen: Penambahan Modul Integrasi Katering",
        deliverables: [...baseContent.scope.deliverables, "Modul Katering"],
      },
      payment: { totalValue: 15000000, dpPercent: 30 },
    },
  });
  assert.equal(proAgreement.currentVersionNumber, 2);
  assert.equal(proAgreement.versions.length, 2);
  assert.equal(proAgreement.status, "PENDING_APPROVAL");
  assert.equal(proAgreement.signatures?.length ?? 0, 0); // Tanda tangan di-reset untuk Versi 2
  console.log("  ✓ 3.6 Berhasil menerbitkan amandemen (Versi 2) pada dokumen yang telah disepakati (AGREED -> PENDING_APPROVAL).");
}
