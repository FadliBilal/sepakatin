import assert from "node:assert/strict";
import { applyOwnerAction, buildNewAgreement, AgreementError } from "../lib/agreement-logic";
import type { ContractContentJSON } from "../lib/types";

export async function runEmateraiTests() {
  console.log("\n📜 [FITUR 2] UNIT TEST: Pembubuhan e-Meterai & Validasi Berkas PDF");

  const sampleContent: ContractContentJSON = {
    contractId: "SPK-2026-EMT01",
    projectName: "Desain UI/UX Mobile App",
    freelancer: { name: "Rian Pratama", email: "rian@ui.id" },
    client: { name: "PT Kreasi Digital", email: "klien@kreasidigital.id" },
    scope: { description: "Desain 20 screens", deliverables: ["Figma Design File", "Design System Kit"], exclusions: [], acceptanceCriteria: [] },
    payment: { totalValue: 8000000, dpPercent: 50, currency: "IDR", paymentMethod: "Transfer Bank", finalPaymentDueDays: 7 },
    revision: { count: 2, terms: "2x revisi minor" },
    timeline: { startDate: "2026-10-01", deadline: "2026-10-31" },
    ip: { ownershipClause: "Hak cipta beralih setelah pelunasan." },
    termination: { cancellationCondition: "Pembatalan wajib kompensasi.", noticePeriodDays: 7, outstandingPaymentTerms: "Pro-rata." },
    validFrom: "2026-10-01",
    validUntil: "2026-10-31",
  };

  const agreement = await buildNewAgreement({
    content: sampleContent,
    contractId: "SPK-2026-EMT01",
    ownerId: "user_freelancer_002",
    plan: "gratis",
    sendDirectly: false,
  });

  // Contoh data Base64 PDF asli (%PDF- -> JVBERi0)
  const validPdfBase64 = "data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrp/OgCjQgMCBvYmoKPDwKL0tpZHMgWzUgMCBSXQovQ291bnQgMQovVHlwZSAvUGFnZXMKL01lZGlhQm94IFswIDAgNTk1IDg0Ml0KPj4KZW5kb2Jq";

  // Contoh data palsu (HTML/JS disamarkan jadi data url)
  const fakeHtmlBase64 = "data:text/html;base64,PHNjcmlwdD5hbGVydCgiaGFjayIpPC9zY3JpcHQ+";
  // Contoh data base64 dengan header PDF tapi isinya teks biasa
  const corruptedPdfBase64 = "data:application/pdf;base64,SGVsbG8gd29ybGQgbm90IGEgcmVhbCBwZGY=";

  // Test 2.1: Tolak File Palsu (Bukan MIME PDF)
  await assert.rejects(
    async () => {
      await applyOwnerAction(agreement, {
        type: "uploadStampedDocument",
        copyType: "freelancer_copy",
        fileName: "malware.pdf",
        fileUrl: fakeHtmlBase64,
      });
    },
    (err: unknown) => err instanceof AgreementError && err.message.includes("application/pdf"),
    "Harus menolak file dengan tipe MIME non-PDF"
  );
  console.log("  ✓ 2.1 Berhasil menolak berkas dengan MIME non-PDF.");

  // Test 2.2: Tolak File Palsu yang Magic Bytes-nya Bukan %PDF-
  await assert.rejects(
    async () => {
      await applyOwnerAction(agreement, {
        type: "uploadStampedDocument",
        copyType: "freelancer_copy",
        fileName: "fake.pdf",
        fileUrl: corruptedPdfBase64,
      });
    },
    (err: unknown) => err instanceof AgreementError && err.message.includes("bukan dokumen PDF asli"),
    "Harus menolak file tanpa magic bytes JVBERi0"
  );
  console.log("  ✓ 2.2 Berhasil menolak berkas palsu yang tidak memiliki Magic Bytes %PDF- (JVBERi0).");

  // Test 2.3: Terima Berkas PDF Asli Ber-meterai
  const updated = await applyOwnerAction(agreement, {
    type: "uploadStampedDocument",
    copyType: "freelancer_copy",
    fileName: "Kontrak_Bermeterai_SalinanFreelancer.pdf",
    fileUrl: validPdfBase64,
    notes: "Sudah dibubuhi e-Meterai resmi Peruri SN: 981273918237",
  });

  assert.equal(updated.stampedDocuments?.length, 1);
  assert.equal(updated.stampedDocuments[0].copyType, "freelancer_copy");
  assert.equal(updated.stampedDocuments[0].fileName, "Kontrak_Bermeterai_SalinanFreelancer.pdf");
  console.log("  ✓ 2.3 Berhasil memverifikasi dan menyimpan berkas PDF bermeterai resmi (Salinan Freelancer).");

  // Test 2.4: Upload Salinan Kedua (Salinan Klien)
  const updatedBoth = await applyOwnerAction(updated, {
    type: "uploadStampedDocument",
    copyType: "client_copy",
    fileName: "Kontrak_Bermeterai_SalinanKlien.pdf",
    fileUrl: validPdfBase64,
  });

  assert.equal(updatedBoth.stampedDocuments?.length, 2);
  console.log("  ✓ 2.4 Berhasil mengelola dua salinan resmi sekaligus (Salinan Freelancer & Salinan Klien).");

  // Test 2.5: Pembubuhan e-Meterai Visual & Pelepasan
  const withEmaterai = await applyOwnerAction(updatedBoth, {
    type: "ematerai",
    imageUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    serialNumber: "SN-PERURI-2026-999",
    targetCopy: "both",
  });
  assert.equal(withEmaterai.ematerai?.serialNumber, "SN-PERURI-2026-999");
  console.log("  ✓ 2.5 Berhasil mencatat nomor seri e-Meterai resmi (SN-PERURI-2026-999) pada kedua salinan.");

  // Test 2.6: Pelepasan e-Meterai
  const removed = await applyOwnerAction(withEmaterai, { type: "removeEmaterai" });
  assert.equal(removed.ematerai, undefined);
  assert.equal(removed.emateraiList?.length, 0);
  console.log("  ✓ 2.6 Berhasil melepas e-meterai dari dokumen jika terjadi pembatalan penempelan.");

  // Test 2.7: Penyimpanan Berkas Berbasis Storage Path (Eliminasi Base64 dari Database)
  const freshStorageAgreement = await buildNewAgreement({
    content: sampleContent,
    contractId: "SPK-2026-STORAGE-TEST",
    ownerId: "user_freelancer_002",
    plan: "gratis",
    sendDirectly: false,
  });

  const withStoragePath = await applyOwnerAction(freshStorageAgreement, {
    type: "uploadStampedDocument",
    copyType: "freelancer_copy",
    fileName: "Kontrak_Resmi_Supabase_Storage.pdf",
    storagePath: "agreements/SPK-2026-EMT01/freelancer_copy.pdf",
    fileSize: 2048576,
    notes: "Tersimpan aman di Supabase Storage bucket 'agreement-documents'",
  });
  assert.equal(withStoragePath.stampedDocuments?.length, 1);
  assert.equal(withStoragePath.stampedDocuments[0].storagePath, "agreements/SPK-2026-EMT01/freelancer_copy.pdf");
  assert.equal(withStoragePath.stampedDocuments[0].fileUrl, "");
  console.log("  ✓ 2.7 Berhasil memverifikasi penyimpanan berbasis Storage Path (Base64 dieliminasi dari database).");

  // Test 2.8: Pelepasan/Penghapusan Berkas Dokumen Bermeterai
  const docRemoved = await applyOwnerAction(withStoragePath, {
    type: "removeStampedDocument",
    copyType: "freelancer_copy",
  });
  assert.equal(docRemoved.stampedDocuments?.length, 0);
  console.log("  ✓ 2.8 Berhasil menghapus berkas dokumen bermeterai resmi (removeStampedDocument).");

  // Test 2.9: Validasi Biner Magic Bytes (%PDF-)
  const { verifyPdfMagicBytes } = await import("../lib/server/storage");
  const validHeaderBuffer = Buffer.from("%PDF-1.7 standard header");
  const invalidHeaderBuffer = Buffer.from("NOT-A-PDF-FILE");
  assert.equal(verifyPdfMagicBytes(validHeaderBuffer), true);
  assert.equal(verifyPdfMagicBytes(invalidHeaderBuffer), false);
  console.log("  ✓ 2.9 Berhasil memvalidasi biner Magic Bytes %PDF- pada layer storage.");
}
