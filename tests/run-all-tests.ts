import { runContractCreationTests } from "./01-contract-creation.test";
import { runEmateraiTests } from "./02-ematerai-pdf-validation.test";
import { runRevisionFlowTests } from "./03-version-revision-flow.test";
import { runDigitalSignatureTests } from "./04-digital-signatures-audit.test";
import { runConsensusAutoLockTests } from "./05-consensus-autolock.test";
import { runHashVerificationTests } from "./06-document-hash-verification.test";
import { runAdminSecurityTests } from "./07-admin-security.test";
import { runHealthMonitoringTests } from "./08-health-monitoring.test";
import { runSecurityAndAuditTests } from "./09-security-tokens-audit.test";
import { runUiWatermarkAndGuideTests } from "./10-ui-watermark-ematerai-guide.test";
import { runPaymentsNotificationsQrTests } from "./11-payments-notifications-qrcode.test";
import { runProductionReliabilityAndSecurityTests } from "./12-production-reliability-and-security.test";
import { runTest13 } from "./13-audit-flow-lifecycle-and-addendum.test";
import { runTurnstileSecurityTests } from "./14-cloudflare-turnstile-security.test";

async function main() {
  const startTime = Date.now();

  console.log("================================================================================");
  console.log("     SEPAKATIN PLATFORM - SUITE PENGUJIAN UNIT FITUR & PEMBUKTIAN ALUR         ");
  console.log("================================================================================");
  console.log(`Waktu Pengujian : ${new Date().toLocaleString("id-ID")}`);
  console.log(`Lingkungan Node : ${process.version}`);

  const suites = [
    { name: "Fitur 1: Pembuatan Kesepakatan & Validasi Input", fn: runContractCreationTests },
    { name: "Fitur 2: Pembubuhan e-Meterai & Validasi Berkas PDF", fn: runEmateraiTests },
    { name: "Fitur 3: Siklus Hidup Revisi & Batasan Versi Paket", fn: runRevisionFlowTests },
    { name: "Fitur 4: Tanda Tangan Digital & Jejak Forensik Audit UU ITE", fn: runDigitalSignatureTests },
    { name: "Fitur 5: Konsensus Persetujuan & Penguncian Otomatis (AGREED)", fn: runConsensusAutoLockTests },
    { name: "Fitur 6: Integritas Dokumen SHA-256 & Cek Keaslian Publik", fn: runHashVerificationTests },
    { name: "Fitur 7: Keamanan Hak Akses Administrator & Fail-Closed", fn: runAdminSecurityTests },
    { name: "Fitur 8: Pemantau Kesehatan Server & Konektivitas Database", fn: runHealthMonitoringTests },
    { name: "Fitur 9: Keamanan Token Review, Rate Limiting & Audit Trail", fn: runSecurityAndAuditTests },
    { name: "Fitur 10: Watermark Dokumen & Panduan e-Meterai Resmi (UU 10/2020)", fn: runUiWatermarkAndGuideTests },
    { name: "Fitur 11: Pembayaran Mayar, Notifikasi Transaksional & QR Code Verifikasi", fn: runPaymentsNotificationsQrTests },
    { name: "Fitur 12: Keandalan Mutasi, Idempotensi, Verifikasi Webhook & Keamanan Berkas", fn: runProductionReliabilityAndSecurityTests },
    { name: "Fitur 13: Siklus Hidup Alur Kerja, Mulai Pengerjaan, Penolakan & Addendum", fn: runTest13 },
    { name: "Fitur 14: Keamanan Cloudflare Turnstile & Anti-Bot Protection", fn: runTurnstileSecurityTests },
  ];

  let passedSuites = 0;
  let failedSuites = 0;

  for (const suite of suites) {
    try {
      await suite.fn();
      passedSuites++;
    } catch (err: unknown) {
      failedSuites++;
      console.error(`\n❌ GAGAL PADA: ${suite.name}`);
      console.error(err);
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log("\n================================================================================");
  console.log("                           RANGKUMAN HASIL PENGUJIAN                            ");
  console.log("================================================================================");
  const passPercent = Math.round((passedSuites / suites.length) * 100);
  console.log(`Status Pengujian Lulus     : ${passedSuites} / ${suites.length} (${passPercent}% PASSED)`);
  console.log(`Status Pengujian Gagal     : ${failedSuites}`);
  console.log(`Waktu Eksekusi Total       : ${duration} detik`);
  console.log("================================================================================");

  if (failedSuites > 0) {
    console.error("⚠️ Ada pengujian yang gagal. Periksa log di atas.");
    process.exit(1);
  } else {
    console.log("🎉 SEMUA FITUR & ALUR END-TO-END TERBUKTI 100% AMAN, VALID, DAN SIAP LAUNCH!");
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
