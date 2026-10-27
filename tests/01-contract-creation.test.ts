import assert from "node:assert/strict";
import { buildNewAgreement, sanitizeContent, AgreementError } from "../lib/agreement-logic";
import type { ContractContentJSON } from "../lib/types";

export async function runContractCreationTests() {
  console.log("\n📦 [FITUR 1] UNIT TEST: Pembuatan Kesepakatan & Validasi Input");

  const validContent: ContractContentJSON = {
    contractId: "SPK-2026-TEST01",
    projectName: "Pembuatan Website E-Commerce",
    freelancer: {
      name: "Budi Santoso",
      email: "budi@freelance.id",
      phone: "081234567890",
      role: "Fullstack Web Developer",
    },
    client: {
      name: "PT Maju Bersama",
      email: "klien@majubersama.com",
      company: "PT Maju Bersama Jaya",
      phone: "081987654321",
    },
    scope: {
      description: "Membuat platform toko online berbasis Next.js dan PostgreSQL",
      deliverables: ["Halaman Beranda & Katalog", "Sistem Keranjang & Checkout", "Integrasi Payment Gateway"],
      exclusions: ["Migrasi data manual dari sistem lama", "Penyediaan materi foto produk"],
      acceptanceCriteria: ["Fitur berjalan lancar di web dan mobile"],
    },
    payment: {
      totalValue: 15000000,
      currency: "IDR",
      paymentMethod: "Transfer Bank BCA",
      dpPercent: 30,
      finalPaymentDueDays: 7,
      milestones: [
        { title: "Uang Muka (DP)", amount: 4500000 },
        { title: "Pelunasan Akhir", amount: 10500000 },
      ],
    },
    revision: {
      count: 3,
      terms: "Revisi mencakup perubahan minor tata letak dan perbaikan bug",
      extraRevisionRate: 500000,
    },
    timeline: {
      startDate: "2026-10-01",
      deadline: "2026-11-15",
    },
    ip: {
      ownershipClause: "Hak cipta beralih ke klien setelah pelunasan 100%",
    },
    termination: {
      cancellationCondition: "Pembatalan sepihak dikenakan denda sesuai tahap pengerjaan",
      noticePeriodDays: 7,
      outstandingPaymentTerms: "Pekerjaan yang telah diselesaikan wajib dibayar pro-rata",
    },
    validFrom: "2026-10-01",
    validUntil: "2026-11-30",
  };

  // Test 1.1: Sanitasi Konten Valid Berhasil
  const sanitized = sanitizeContent(validContent, "SPK-2026-TEST01");
  assert.equal(sanitized.projectName, "Pembuatan Website E-Commerce");
  assert.equal(sanitized.scope.deliverables.length, 3);
  assert.equal(sanitized.payment.totalValue, 15000000);
  console.log("  ✓ 1.1 Berhasil validasi & sanitasi konten kesepakatan yang sah.");

  // Test 1.2: Tolak Deliverables Kosong
  assert.throws(
    () => {
      sanitizeContent({ ...validContent, scope: { ...validContent.scope, deliverables: [] } }, "SPK-TEST");
    },
    (err: unknown) => err instanceof AgreementError && err.message.includes("Hasil kerja yang diserahkan minimal 1 baris"),
    "Harus menolak jika deliverables kosong"
  );
  console.log("  ✓ 1.2 Berhasil menolak pembuatan kesepakatan tanpa lingkup deliverables.");

  // Test 1.3: Tolak Tanggal Selesai Lebih Awal dari Tanggal Mulai
  assert.throws(
    () => {
      sanitizeContent({ ...validContent, validFrom: "2026-10-15", validUntil: "2026-10-01" }, "SPK-TEST");
    },
    (err: unknown) => err instanceof AgreementError && err.message.includes("Tanggal berlaku"),
    "Harus menolak jika validUntil sebelum validFrom"
  );
  console.log("  ✓ 1.3 Berhasil menolak rentang tanggal kontrak yang tidak logis (validUntil < validFrom).");

  // Test 1.4: Tolak DP di Luar Rentang 0 - 100%
  assert.throws(
    () => {
      sanitizeContent({ ...validContent, payment: { ...validContent.payment, dpPercent: 120 } }, "SPK-TEST");
    },
    (err: unknown) =>
      err instanceof AgreementError &&
      (err.message.includes("Persentase DP") || err.message.includes("Uang muka (DP)")),
    "Harus menolak DP > 100%"
  );
  console.log("  ✓ 1.4 Berhasil menolak nominal DP tidak wajar (> 100%).");

  // Test 1.5: Inisiasi Dokumen Draf Baru dengan buildNewAgreement
  const agreement = await buildNewAgreement({
    content: validContent,
    contractId: "SPK-2026-00001",
    ownerId: "user_freelancer_001",
    plan: "gratis",
    sendDirectly: false,
  });

  assert.equal(agreement.status, "DRAFT");
  assert.equal(agreement.currentVersionNumber, 1);
  assert.equal(agreement.contractId, "SPK-2026-00001");
  assert.equal(typeof agreement.reviewToken, "string");
  assert.ok(agreement.reviewToken.length >= 16);
  assert.equal(agreement.approvals.length, 0);
  assert.equal(agreement.signatures?.length, 0);
  console.log(`  ✓ 1.5 Berhasil membuat draf resmi (ID: ${agreement.contractId}) dengan status 'DRAFT' & Review Token aman.`);

  // Test 1.6: Inisiasi Langsung Kirim (sendDirectly: true)
  const sentAgreement = await buildNewAgreement({
    content: validContent,
    contractId: "SPK-2026-00002",
    ownerId: "user_freelancer_001",
    plan: "pro",
    sendDirectly: true,
  });
  assert.equal(sentAgreement.status, "PENDING_CLIENT");
  console.log("  ✓ 1.6 Berhasil inisiasi kesepakatan dengan mode kirim langsung (Status otomatis 'PENDING_CLIENT').");
}
