"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  QrCode,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Zap,
  Loader2,
  MessageCircle,
} from "lucide-react";
import { PaymentPackageType } from "@/lib/types";
import { formatCurrencyIDR } from "@/lib/crypto";
import { isAdmin, useSession } from "@/lib/auth";
import { whatsappLink } from "@/lib/contact";

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
  paymentUrl: string;
  qrCodeUrl?: string;
  isSandbox: boolean;
}

export function PaymentModal({ isOpen, onClose, packageType, onSuccess }: PaymentModalProps) {
  const { user } = useSession();
  const [step, setStep] = useState<"loading" | "ready" | "simulating" | "success" | "error">("loading");
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const packageName =
    packageType === "credit_1"
      ? "1 Kredit Per Proyek"
      : "Langganan Paket Pro (30 Hari)";
  const packagePrice = packageType === "credit_1" ? 19000 : 49000;

  useEffect(() => {
    if (!isOpen) {
      setStep("loading");
      setCheckoutData(null);
      setErrorMessage("");
      return;
    }

    let active = true;
    (async () => {
      setStep("loading");
      try {
        const res = await fetch("/api/payments/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ packageType }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Gagal membuat tagihan pembayaran.");
        }
        if (active) {
          setCheckoutData(data);
          setStep("ready");
        }
      } catch (err) {
        if (active) {
          setErrorMessage(err instanceof Error ? err.message : "Gagal memproses pembayaran");
          setStep("error");
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [isOpen, packageType]);

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

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="card p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {step === "loading" && (
          <div className="py-12 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-brand-600 animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-700">Menyiapkan QRIS Mayar.id...</p>
            <p className="text-xs text-slate-400">Menghubungkan gateway pembayaran resmi</p>
          </div>
        )}

        {step === "error" && (
          <div className="py-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Gagal Menyiapkan Pembayaran</h3>
              <p className="text-xs text-rose-600 mt-1">{errorMessage}</p>
            </div>
            <button onClick={onClose} className="btn btn-secondary btn-sm w-full">
              Tutup
            </button>
          </div>
        )}

        {step === "ready" && checkoutData && (
          <div className="space-y-4">
            <div className="text-center pb-2 border-b border-slate-100">
              <span className="text-[11px] font-bold text-brand-700 bg-brand-50 border border-brand-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Pembayaran Instan (QRIS / GoPay)
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-2">{packageName}</h3>
              <p className="text-2xl font-black text-brand-700 mt-1">
                {formatCurrencyIDR(packagePrice)}
              </p>
              <p className="text-[11px] text-slate-400">Harga pas tanpa biaya tambahan</p>
            </div>

            {/* QRIS Display Container */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
              <div className="bg-white p-3 rounded-xl inline-block shadow-sm border border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    checkoutData.qrCodeUrl ||
                    "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=SEPAKATIN-MAYAR-QRIS"
                  }
                  alt="QRIS Mayar.id"
                  className="w-44 h-44 object-contain mx-auto"
                />
              </div>

              <div className="text-xs text-slate-600 space-y-1">
                <p className="font-semibold text-slate-800 flex items-center justify-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-brand-600" />
                  Scan QRIS dengan GoPay / OVO / Dana / BCA
                </p>
                <p className="text-[11px] text-slate-500">
                  Pembayaran diverifikasi otomatis 24/7 dalam 1–2 detik setelah berhasil transfer.
                </p>
              </div>

              {checkoutData.paymentUrl && !checkoutData.isSandbox && (
                <div className="pt-1">
                  <a
                    href={checkoutData.paymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-sm w-full text-xs inline-flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Buka Halaman Checkout Mayar
                  </a>
                </div>
              )}
            </div>

            {/* Mode Sandbox Tester / WhatsApp Activation */}
            {checkoutData.isSandbox && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs text-left">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <Zap className="w-4 h-4 text-brand-600" />
                  Aktivasi Instan via WhatsApp
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Gerbang pembayaran QRIS otomatis sedang dalam proses aktivasi KYC merchant. Anda dapat melakukan aktivasi instan untuk <strong>{packageName}</strong> ({formatCurrencyIDR(packagePrice)}) langsung melalui WhatsApp resmi kami:
                </p>
                <a
                  href={whatsappLink(
                    `Halo Admin Sepakatin, saya ingin aktivasi ${packageName} (${formatCurrencyIDR(packagePrice)}) dengan Order ID: ${checkoutData.orderId}. Mohon info transfer rekening / QRIS manual.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp btn-sm w-full text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Konfirmasi &amp; Aktivasi via WhatsApp
                </a>

                {user && isAdmin(user) && (
                  <div className="pt-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={handleSimulatePayment}
                      className="btn btn-secondary btn-sm w-full text-xs text-amber-800 border-amber-300 hover:bg-amber-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      [Khusus Admin] Uji Aktivasi Simulasi
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Keamanan Berstandar Bank Indonesia
              </span>
              <span>Order: {checkoutData.orderId}</span>
            </div>
          </div>
        )}

        {step === "simulating" && (
          <div className="py-12 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-brand-600 animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-700">Mengkreditkan paket ke akun...</p>
          </div>
        )}

        {step === "success" && (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-200 animate-in zoom-in-75">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Pembayaran Berhasil!</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
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
