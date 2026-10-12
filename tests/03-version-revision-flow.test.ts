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
}
