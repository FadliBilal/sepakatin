"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  QrCode,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Zap,
  Loader2,
  MessageCircle,
  Building2,
  Copy,
  Check,
  Clock,
} from "lucide-react";
import { PaymentPackageType } from "@/lib/types";
import { formatCurrencyIDR } from "@/lib/crypto";
import { getAccessToken, isAdmin, useSession } from "@/lib/auth";
import { addLocalPaymentOrder } from "@/lib/store";
import {
  OFFICIAL_PAYMENT_ACCOUNTS,
  OFFICIAL_QRIS_INFO,
  whatsappLink,
} from "@/lib/contact";

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageType: PaymentPackageType;
  onSuccess?: () => void;
}

interface CheckoutData {
  orderId: string;
  packageType: PaymentPackageType;
  amount: number;
  uniqueCode?: number;
  totalAmount?: number;
  paymentUrl: string;
  qrCodeUrl?: string;
  isSandbox: boolean;
}

export function PaymentModal({ isOpen, onClose, packageType, onSuccess }: PaymentModalProps) {
  const { user } = useSession();
  const [step, setStep] = useState<"loading" | "ready" | "submitted" | "simulating" | "success" | "error">("loading");
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [paymentMethodTab, setPaymentMethodTab] = useState<"qris" | "bank">("qris");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const packageName =
    packageType === "credit_1"
      ? "1 Kredit Per Proyek"
      : "Langganan Paket Pro (30 Hari)";
  const packagePrice = packageType === "credit_1" ? 19000 : 49000;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && step !== "simulating") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, step, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setStep("loading");
      setCheckoutData(null);
      setErrorMessage("");
      setCopiedField(null);
      return;
    }

    let active = true;
    (async () => {
      setStep("loading");
      try {
        const token = await getAccessToken();
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch("/api/payments/checkout", {
          method: "POST",
          headers,
          body: JSON.stringify({ packageType }),
        });

        if (res.ok) {
          const data = await res.json();
          if (active) {
            setCheckoutData(data);
            setStep("ready");
          }
        } else {
          // Fallback lokal jika belum terhubung database cloud / mode uji coba
          const randomCode = Math.floor(100 + Math.random() * 899);
          const orderId = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
          addLocalPaymentOrder({
            id: orderId,
            orderId,
            userId: user?.id || "local-user",
            userEmail: user?.email || "user@example.com",
            userName: user?.fullName || "Pengguna Sepakatin",
            userPhone: user?.phone || "",
            packageType,
            amount: packagePrice + randomCode,
            paymentMethod: "QRIS / Transfer Bank",
            paymentGateway: "MANUAL_QRIS",
            status: "PENDING",
            metadata: {
              profile_name: user?.fullName || "Pengguna Sepakatin",
              user_phone: user?.phone || "",
              base_amount: packagePrice,
              unique_code: randomCode,
              total_amount: packagePrice + randomCode,
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          if (active) {
            setCheckoutData({
              orderId,
              packageType,
              amount: packagePrice,
              uniqueCode: randomCode,
              totalAmount: packagePrice + randomCode,
              paymentUrl: `/dashboard?demo_pay=${orderId}`,
              qrCodeUrl: OFFICIAL_QRIS_INFO.imageUrl,
              isSandbox: true,
            });
            setStep("ready");
          }
        }
      } catch {
        // Fallback anggun agar pengguna tetap bisa bertransaksi
        const randomCode = Math.floor(100 + Math.random() * 899);
        const orderId = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
        addLocalPaymentOrder({
          id: orderId,
          orderId,
          userId: user?.id || "local-user",
          userEmail: user?.email || "user@example.com",
          userName: user?.fullName || "Pengguna Sepakatin",
          userPhone: user?.phone || "",
          packageType,
          amount: packagePrice + randomCode,
          paymentMethod: "QRIS / Transfer Bank",
          paymentGateway: "MANUAL_QRIS",
          status: "PENDING",
          metadata: {
            profile_name: user?.fullName || "Pengguna Sepakatin",
            user_phone: user?.phone || "",
            base_amount: packagePrice,
            unique_code: randomCode,
            total_amount: packagePrice + randomCode,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        if (active) {
          setCheckoutData({
            orderId,
            packageType,
            amount: packagePrice,
            uniqueCode: randomCode,
            totalAmount: packagePrice + randomCode,
            paymentUrl: `/dashboard?demo_pay=${orderId}`,
            qrCodeUrl: OFFICIAL_QRIS_INFO.imageUrl,
            isSandbox: true,
          });
          setStep("ready");
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [isOpen, packageType, packagePrice, user]);

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const handleSimulatePayment = async () => {
    if (!checkoutData) return;
    setStep("simulating");
    try {
      const res = await fetch("/api/payments/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: checkoutData.orderId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal simulasi pembayaran");

      setStep("success");
      if (onSuccess) {
        setTimeout(onSuccess, 1500);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Simulasi gagal");
      setStep("error");
    }
  };

  if (!isOpen) return null;

  const payableAmount = checkoutData?.totalAmount || packagePrice;

  const waConfirmationText = [
    `Halo Admin Sepakatin, saya telah melakukan transfer pembayaran:`,
    ``,
    `*RINCIAN PESANAN:*`,
    `• Paket: ${packageName}`,
    `• Total Transfer: ${formatCurrencyIDR(payableAmount)}`,
    `• Order ID: ${checkoutData?.orderId || "-"}`,
    `• Metode: ${paymentMethodTab === "qris" ? "QRIS Instan" : "Transfer Bank"}`,
    `• Nama Akun: ${user?.fullName || "Pengguna Sepakatin"}`,
    `• Email Akun: ${user?.email || "-"}`,
    user?.phone ? `• No. WhatsApp: ${user.phone}` : ``,
    ``,
    `*BUKTI TRANSFER:*`,
    `(Foto/Screenshot bukti transfer saya lampirkan di chat ini)`,
    ``,
    `Mohon bantuannya untuk verifikasi dan aktivasi kuota secepatnya ya. Terima kasih!`
  ].filter(Boolean).join("\n");

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="my-6 p-6 sm:p-7 max-w-lg w-full rounded-2xl border border-[#E8E8EC] bg-white shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150 relative text-[#0A0A0A]">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-[#8E8E93] hover:text-[#0A0A0A] hover:bg-[#F4F4F6] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1]"
          aria-label="Tutup dialog pembayaran"
        >
          <X className="w-5 h-5" />
        </button>

        {step === "loading" && (
          <div className="py-14 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#6366F1] animate-spin mx-auto" />
            <p className="text-sm font-semibold text-[#0A0A0A]">Menyiapkan Rincian Tagihan...</p>
            <p className="text-xs text-[#6B6B6B]">Membuat nomor pesanan resmi dan nominal kode verifikasi</p>
          </div>
        )}

        {step === "error" && (
          <div className="py-6 text-center space-y-4">
            <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-[#0A0A0A]">Gagal Memproses Pesanan</h3>
              <p className="text-xs text-rose-600 mt-1">{errorMessage}</p>
            </div>
            <button onClick={onClose} className="btn btn-secondary btn-sm w-full">
              Tutup
            </button>
          </div>
        )}

        {step === "ready" && checkoutData && (
          <div className="space-y-4.5">
            {/* Header Ringkasan Tagihan */}
            <div className="text-center pb-3 border-b border-[#E8E8EC]">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#6366F1] bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                <Zap className="w-3 h-3 text-[#6366F1]" />
                Aktivasi Cepat &middot; Order #{checkoutData.orderId}
              </span>
              <h3 className="text-lg font-bold font-display text-[#0A0A0A] mt-2">{packageName}</h3>
              
              <div className="mt-2.5 flex items-center justify-center gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-[#0A0A0A]">
                  {formatCurrencyIDR(payableAmount)}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(String(payableAmount), "amount")}
                  className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-[#6366F1] bg-indigo-50 hover:bg-indigo-100 rounded border border-indigo-200 transition"
                  title="Salin nominal pas"
                >
                  {copiedField === "amount" ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700">Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Salin Pas</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-[#6B6B6B] mt-1">
                {checkoutData.uniqueCode ? (
                  <>Termasuk kode unik <strong className="text-[#0A0A0A]">+{checkoutData.uniqueCode}</strong> agar verifikasi pembayaran terbaca instan</>
                ) : (
                  <>Harga pas tanpa biaya tersembunyi</>
                )}
              </p>
            </div>

            {/* Pilihan Tab Metode Pembayaran */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#F4F4F6] rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setPaymentMethodTab("qris")}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition ${
                  paymentMethodTab === "qris"
                    ? "bg-white text-[#0A0A0A] shadow-xs"
                    : "text-[#6B6B6B] hover:text-[#0A0A0A]"
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                QRIS (Semua E-Wallet)
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethodTab("bank")}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition ${
                  paymentMethodTab === "bank"
                    ? "bg-white text-[#0A0A0A] shadow-xs"
                    : "text-[#6B6B6B] hover:text-[#0A0A0A]"
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                Transfer Rekening Bank
              </button>
            </div>

            {/* Konten Tab 1: QRIS */}
            {paymentMethodTab === "qris" && (
              <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E8E8EC] text-center space-y-3">
                <div className="bg-white p-3 rounded-xl inline-block shadow-xs border border-[#E8E8EC]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={checkoutData.qrCodeUrl || OFFICIAL_QRIS_INFO.imageUrl}
                    alt="QRIS Sepakatin"
                    className="w-40 h-40 sm:w-44 sm:h-44 object-contain mx-auto"
                  />
                </div>
                <div className="space-y-1 text-xs">
                  <p className="font-semibold text-[#0A0A0A]">
                    BCA Mobile &middot; Mandiri Livin &middot; BRImo &middot; GoPay &middot; OVO &middot; Dana &middot; ShopeePay
                  </p>
                  <p className="text-[11px] text-[#6B6B6B]">
                    Scan QRIS di atas melalui aplikasi perbankan atau e-wallet di smartphone Anda.
                  </p>
                </div>
              </div>
            )}

            {/* Konten Tab 2: Transfer Bank */}
            {paymentMethodTab === "bank" && (
              <div className="space-y-2">
                {OFFICIAL_PAYMENT_ACCOUNTS.map((acc, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E8E8EC] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <strong className="font-semibold text-[#0A0A0A]">{acc.bankName}</strong>
                        <span className="text-[10px] text-[#8E8E93] bg-white px-1.5 py-0.5 rounded border border-[#E8E8EC]">
                          {acc.badge}
                        </span>
                      </div>
                      <div className="font-mono text-sm font-bold text-[#0A0A0A] mt-1 tracking-wide">
                        {acc.accountNumber}
                      </div>
                      <p className="text-[11px] text-[#6B6B6B] mt-0.5">a/n {acc.accountHolder}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(acc.accountNumber.replace(/-/g, ""), `acc_${idx}`)}
                      className="btn btn-secondary btn-sm text-xs inline-flex items-center gap-1 shrink-0 px-2.5 py-1.5"
                    >
                      {copiedField === `acc_${idx}` ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin No</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Kotak Panduan Konfirmasi Cepat & Tombol WhatsApp */}
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-bold text-[#0A0A0A]">
                    Estimasi Aktivasi Cepat: 3 - 10 Menit
                  </h4>
                  <p className="text-[#4B4B4B] text-[11px] mt-0.5 leading-relaxed">
                    Setelah melakukan transfer, klik tombol di bawah untuk mengirim bukti transfer ke WhatsApp resmi kami. Tim kami akan langsung mengonfirmasi dan menambahkan kuota ke akun Anda.
                  </p>
                </div>
              </div>

              <a
                href={whatsappLink(waConfirmationText)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp w-full py-2.5 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                Kirim Bukti &amp; Konfirmasi via WhatsApp
              </a>

              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={() => setStep("submitted")}
                  className="text-[11px] text-[#6B6B6B] hover:text-[#0A0A0A] font-medium underline underline-offset-2"
                >
                  Saya sudah mentransfer dan mengirim bukti via WhatsApp
                </button>
              </div>
            </div>

            {/* Admin Simulation Tool */}
            {user && isAdmin(user) && (
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs space-y-1.5">
                <span className="font-semibold text-amber-900 block">[Khusus Administrator] Uji Coba Langsung</span>
                <button
                  type="button"
                  onClick={handleSimulatePayment}
                  className="btn btn-secondary btn-sm w-full text-xs text-amber-900 border-amber-300 hover:bg-amber-100"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
                  Simulasi Verifikasi Pesanan #{checkoutData.orderId}
                </button>
              </div>
            )}

            {/* Footer Trust Bar */}
            <div className="flex items-center justify-between text-[11px] text-[#8E8E93] pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Verifikasi Transaksi Aman Sepakatin
              </span>
              <span>ID: {checkoutData.orderId}</span>
            </div>
          </div>
        )}

        {/* Layar 2: Setelah user klik "Saya sudah mengirim bukti" */}
        {step === "submitted" && checkoutData && (
          <div className="py-6 text-center space-y-5 animate-in fade-in duration-200">
            <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
              <Clock className="w-7 h-7 animate-pulse" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Menunggu Verifikasi Admin
              </span>
              <h3 className="text-xl font-bold font-display text-[#0A0A0A]">
                Pesanan Sedang Diproses
              </h3>
              <p className="text-xs sm:text-sm text-[#6B6B6B] max-w-sm mx-auto leading-relaxed">
                Terima kasih! Bukti transfer Anda untuk pesanan{" "}
                <strong className="text-[#0A0A0A]">{checkoutData.orderId}</strong> sedang diverifikasi oleh admin.
              </p>
            </div>

            <div className="p-4 bg-[#FAFAFA] border border-[#E8E8EC] rounded-xl text-left text-xs space-y-2 max-w-sm mx-auto">
              <div className="flex justify-between py-1 border-b border-[#E8E8EC]">
                <span className="text-[#6B6B6B]">Paket Layanan:</span>
                <span className="font-semibold text-[#0A0A0A]">{packageName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E8E8EC]">
                <span className="text-[#6B6B6B]">Total Pembayaran:</span>
                <span className="font-bold text-[#6366F1]">{formatCurrencyIDR(payableAmount)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#6B6B6B]">Estimasi Waktu:</span>
                <span className="font-semibold text-emerald-700">3 - 10 Menit</span>
              </div>
            </div>

            <p className="text-[11px] text-[#6B6B6B] leading-relaxed max-w-xs mx-auto">
              Kredit / fitur Pro akan otomatis aktif di akun Anda begitu verifikasi selesai. Anda dapat langsung melanjutkan pekerjaan di dashboard sekarang.
            </p>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onSuccess) onSuccess();
                }}
                className="btn btn-primary w-full py-2.5 text-xs sm:text-sm font-semibold"
              >
                Lanjutkan ke Dashboard
              </button>
              <a
                href={whatsappLink(waConfirmationText)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm w-full text-xs inline-flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                Buka WhatsApp Lagi
              </a>
            </div>
          </div>
        )}

        {step === "simulating" && (
          <div className="py-12 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#6366F1] animate-spin mx-auto" />
            <p className="text-sm font-semibold text-[#0A0A0A]">Memverifikasi Pembayaran...</p>
            <p className="text-xs text-[#6B6B6B]">Menambahkan kredit/paket Pro ke akun</p>
          </div>
        )}

        {step === "success" && (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-200 animate-in zoom-in-75">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#0A0A0A]">Pembayaran Berhasil Diverifikasi!</h3>
              <p className="text-xs text-[#6B6B6B] mt-1 leading-relaxed">
                {packageType === "credit_1"
                  ? "1 Kredit Proyek berhasil ditambahkan ke akun Anda!"
                  : "Akun Anda telah di-upgrade ke Paket Pro!"}
              </p>
            </div>
            <button
              onClick={() => {
                onClose();
                window.location.reload();
              }}
              className="btn btn-primary btn-sm w-full"
            >
              Lanjutkan ke Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
