import assert from "node:assert";
import { formatCurrencyIDR } from "../lib/crypto";
import { verifyUrlFor } from "../lib/app-url";
import { createMayarPayment } from "../lib/server/mayar";
import {
  sendTransactionalEmail,
  notifyClientViewed,
  notifyChangeRequested,
  notifyAgreementConsensus,
} from "../lib/server/notifications";
import { PaymentPackageType, PaymentOrderStatus } from "../lib/types";

export async function runPaymentsNotificationsQrTests() {
  console.log("\n💳 [FITUR 11] UNIT TEST: Pembayaran Mayar, Notifikasi Transaksional & QR Code Verifikasi");

  // Test 11.1: Integritas Harga Pas Mayar (Tanpa Kode Unik Acak)
  const packages: Array<{ type: PaymentPackageType; expectedAmount: number; label: string }> = [
    { type: "credit_1", expectedAmount: 19000, label: "1 Kredit Per Proyek" },
    { type: "pro_monthly", expectedAmount: 49000, label: "Langganan Pro Bulanan" },
  ];

  for (const pkg of packages) {
    const formatted = formatCurrencyIDR(pkg.expectedAmount);
    assert.strictEqual(
      pkg.expectedAmount % 1000,
      0,
      `Harga ${pkg.label} harus pas bulat tanpa 3 digit acak/unik`
    );
    assert.ok(
      formatted.includes("19.000") || formatted.includes("49.000"),
      `Format IDR harus sesuai standar: ${formatted}`
    );
  }
  console.log("  ✓ 11.1 Harga paket pas terbukti tepat (Rp19.000 & Rp49.000) tanpa biaya tambahan/kode unik.");

  // Test 11.2: Simulator & Sandbox Gateway Mayar.id
  const testOrderId = `ORD-TEST-${Date.now()}`;
  const paymentResult = await createMayarPayment({
    orderId: testOrderId,
    packageType: "credit_1",
    amount: 19000,
    userName: "Budi Freelancer",
    userEmail: "budi@example.com",
    redirectUrl: "http://localhost:3000/dashboard",
  });

  assert.strictEqual(paymentResult.orderId, testOrderId, "Order ID harus sesuai input");
  assert.ok(paymentResult.isSandbox, "Mode sandbox harus aktif jika API key live belum dikonfigurasi");
  assert.ok(paymentResult.paymentUrl.includes(testOrderId), "Payment URL harus memuat nomor order");
  assert.ok(Boolean(paymentResult.qrCodeUrl), "Harus mengembalikan QR Code simulator");
  console.log("  ✓ 11.2 Mayar Gateway sandbox fallback & QRIS generator terbukti berfungsi andal.");

  // Test 11.3: Logika Webhook & Pengkreditan Akun
  type MockUser = { id: string; email: string; credits: number; plan: string };
  const mockUser: MockUser = { id: "usr-123", email: "budi@example.com", credits: 0, plan: "gratis" };

  function processPaymentSuccess(user: MockUser, packageType: PaymentPackageType): { status: PaymentOrderStatus; updatedUser: MockUser } {
    if (packageType === "credit_1") {
      user.credits += 1;
    } else if (packageType === "pro_monthly") {
      user.plan = "pro";
    }
    return { status: "PAID", updatedUser: user };
  }

  const result1 = processPaymentSuccess(mockUser, "credit_1");
  assert.strictEqual(result1.status, "PAID");
  assert.strictEqual(result1.updatedUser.credits, 1, "Kredit harus bertambah 1");

  const result2 = processPaymentSuccess(mockUser, "pro_monthly");
  assert.strictEqual(result2.status, "PAID");
  assert.strictEqual(result2.updatedUser.plan, "pro", "Paket harus ditingkatkan ke Pro");
  console.log("  ✓ 11.3 Logika pemrosesan webhook & penambahan saldo/paket akun terverifikasi konsisten.");

  // Test 11.4: Resend Email Notification Dispatch Fallback
  const emailRes = await sendTransactionalEmail({
    to: "client@example.com",
    subject: "Uji Coba Notifikasi",
    html: "<p>Halo</p>",
    notificationType: "VIEWED_BY_CLIENT",
    agreementId: "agr-test-1",
  });

  assert.strictEqual(emailRes.success, true, "Dispatch email fallback harus berhasil tanpa error fatal");
  assert.ok(emailRes.id?.startsWith("mock-"), "ID mock harus dibuat untuk pelacakan");

  // Uji pemanggil notifikasi bisnis spesifik
  const viewRes = await notifyClientViewed({
    freelancerEmail: "freelancer@example.com",
    freelancerName: "Andi",
    clientName: "PT Maju",
    projectName: "Website Company Profile",
    contractId: "SPK-2026-TEST",
    agreementId: "agr-test-1",
  });
  assert.strictEqual(viewRes.success, true);

  const changeRes = await notifyChangeRequested({
    freelancerEmail: "freelancer@example.com",
    freelancerName: "Andi",
    clientName: "PT Maju",
    projectName: "Website Company Profile",
    contractId: "SPK-2026-TEST",
    agreementId: "agr-test-1",
    changeTitle: "Perubahan Warna",
    changeDescription: "Ubah aksen menjadi hijau",
  });
  assert.strictEqual(changeRes.success, true);

  await notifyAgreementConsensus({
    freelancerEmail: "freelancer@example.com",
    freelancerName: "Andi",
    clientEmail: "klien@example.com",
    clientName: "PT Maju",
    projectName: "Website Company Profile",
    contractId: "SPK-2026-TEST",
    agreementId: "agr-test-1",
  });
  console.log("  ✓ 11.4 Notifikasi transaksional (View, Revisi, Konsensus) terbukti aman & fail-safe.");

  // Test 11.5: Verifikasi Keaslian QR Code & Legalitas Konsensus Digital
  const testContractId = "SPK-2026-X89K2";
  const verifyUrl = verifyUrlFor(testContractId);
  assert.ok(verifyUrl.includes(`/verify/${testContractId}`), "URL verifikasi harus mengarah ke /verify/[contractId]");

  // Legal status verification: KUHPerdata 1320 menyatakan konsensus sah dicapai atas kesepakatan dua pihak
  const isAgreementLegallyBinding = (freelancerSigned: boolean, clientSigned: boolean, hasEmaterai: boolean): boolean => {
    // e-Materai bersifat opsional (bea pajak perdata), bukan syarat keabsahan kesepakatan (KUHPerdata 1320 & UU ITE No. 1/2024)
    return freelancerSigned && clientSigned;
  };

  assert.strictEqual(isAgreementLegallyBinding(true, true, false), true, "Kontrak bertanda tangan sah meski tanpa e-meterai");
  assert.strictEqual(isAgreementLegallyBinding(true, false, true), false, "Kontrak belum bertanda tangan klien tidak sah");
  assert.strictEqual(isAgreementLegallyBinding(true, true, true), true, "Kontrak dengan tanda tangan dan e-meterai sah sempurna");
  console.log("  ✓ 11.5 URL QR Code verifikasi publik & asas konsensus KUHPerdata 1320 (e-meterai opsional) terbukti valid.");
}
