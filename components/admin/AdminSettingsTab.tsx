"use client";

import React, { useState } from "react";
import {
  Database,
  Cloud,
  ShieldCheck,
  Mail,
  CreditCard,
  Copy,
  Check,
  MessageCircle,
  BookOpen,
  Layers,
} from "lucide-react";
import { AdminPlatformStats } from "@/lib/store";
import {
  OFFICIAL_PAYMENT_ACCOUNTS,
  OFFICIAL_QRIS_INFO,
  WHATSAPP_NUMBER_DISPLAY,
  whatsappLink,
} from "@/lib/contact";

export function AdminSettingsTab({ stats }: { stats: AdminPlatformStats | null }) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* 1. Status Sistem Pembayaran Platform */}
      <div className="card p-5 sm:p-6 space-y-4 border-amber-200 bg-amber-50/30">
        <div className="flex items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Status Sistem Pembayaran Platform
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Konfigurasi metode penerimaan dana paket Pro dan kredit proyek
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
            ✓ Mode Manual Aktif
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-white border border-amber-200/80 space-y-1.5 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <p className="font-bold text-slate-900 text-sm">Metode Aktif: Transfer Manual &amp; QRIS</p>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Pengguna mentransfer langsung ke rekening BCA, Bank Mandiri, atau memindai QRIS Statis dengan 3-digit kode unik mutasi. Admin memverifikasi dana masuk di tab <strong>Transaksi Pembayaran</strong> dan sistem otomatis mengaktifkan paket tanpa potongan komisi gateway.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/70 border border-slate-200 space-y-1.5 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <p className="font-bold text-slate-700 text-sm">Payment Gateway Mayar: Belum Diaktifkan</p>
            </div>
            <p className="text-slate-500 leading-relaxed text-[11px]">
              Integrasi gateway otomatis Mayar saat ini belum berjalan / dinonaktifkan. Seluruh transaksi menggunakan alur manual transfer agar lebih hemat biaya operasional dan terkontrol penuh oleh admin.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Rekening Resmi Penerima Dana (Tujuan Transfer Pengguna) */}
      <div>
        <div className="mb-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            Rekening Bank &amp; QRIS Penerimaan Resmi
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Data rekening resmi platform yang ditampilkan pada popup pembayaran pengguna.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {OFFICIAL_PAYMENT_ACCOUNTS.map((acc) => (
            <div key={acc.bankName} className="card p-5 space-y-3 border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{acc.bankName}</span>
                {acc.badge && (
                  <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium">
                    {acc.badge}
                  </span>
                )}
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <p className="text-[11px] text-slate-500">Nomor Rekening:</p>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-extrabold text-base text-slate-900">
                    {acc.accountNumber}
                  </span>
                  <button
                    onClick={() => handleCopy(acc.accountNumber.replace(/[^0-9]/g, ""), acc.bankName)}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 text-xs flex items-center gap-1 shadow-xs"
                    title="Salin Nomor Rekening"
                  >
                    {copiedKey === acc.bankName ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-600 font-medium pt-1">
                  Atas Nama: <strong className="text-slate-900">{acc.accountHolder}</strong>
                </p>
              </div>
            </div>
          ))}

          {/* Kartu QRIS */}
          <div className="card p-5 space-y-3 border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">QRIS Sepakatin Indonesia</span>
              <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium">
                Multi Bank &amp; E-Wallet
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <p className="text-[11px] text-slate-500">Keterangan Akun:</p>
              <span className="font-bold text-sm text-slate-900 block">
                Sepakatin Legal Tech Indonesia
              </span>
              <p className="text-[11px] text-slate-500 pt-1 leading-relaxed">
                {OFFICIAL_QRIS_INFO.notes}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Panduan Operasional Cepat Admin (SOP Verifikasi) */}
      <div className="card p-6 space-y-5 border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="card-title text-base">Panduan Verifikasi Pembayaran untuk Admin</h3>
            <p className="text-xs text-slate-500">Alur sederhana mencocokkan mutasi hingga aktivasi akun pengguna</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
              1
            </span>
            <p className="font-bold text-slate-900 text-sm">Pengguna Pesan</p>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Pengguna memilih paket di web. Sistem membuat pesanan dengan 3-digit kode unik mutasi (contoh: Rp19.248 atau Rp49.312).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
              2
            </span>
            <p className="font-bold text-slate-900 text-sm">Pengguna Transfer</p>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Pengguna mentransfer sesuai nominal persis ke rekening BCA, Mandiri, atau QRIS, lalu menekan tombol konfirmasi WhatsApp ke admin.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
              3
            </span>
            <p className="font-bold text-slate-900 text-sm">Admin Cek Mutasi</p>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Admin membuka BCA Mobile / Livin Mandiri, lalu mencocokkan nominal masuk dengan baris transaksi di menu <strong>Transaksi Pembayaran</strong>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
              4
            </span>
            <p className="font-bold text-slate-900 text-sm">Klik Verifikasi</p>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Admin klik tombol <strong>Verifikasi</strong>. Sistem otomatis mengubah status pesanan menjadi lunas dan memberikan akses Pro / kredit secara instan.
            </p>
          </div>
        </div>

        {/* Kontak Bantuan Langsung */}
        <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 text-slate-600">
            <span>
              WhatsApp Admin: <strong className="text-slate-900">{WHATSAPP_NUMBER_DISPLAY}</strong>
            </span>
            <span>
              Email: <strong className="text-slate-900">admin@sepakatin.id</strong>
            </span>
          </div>
          <a
            href={whatsappLink("Halo Admin Sepakatin, ada konfirmasi pembayaran baru.")}
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary btn-sm text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50 self-start sm:self-auto flex items-center gap-1.5"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Buka WhatsApp Admin
          </a>
        </div>
      </div>

      {/* 4. Layanan Cloud & Infrastruktur Backend Platform */}
      <div>
        <div className="mb-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Cloud className="w-5 h-5 text-blue-600" />
            Layanan Cloud &amp; Infrastruktur Backend
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Penyimpanan data, berkas dokumen PDF, dan keamanan platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-5 space-y-3 border-slate-200">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  stats?.isSupabaseConnected
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                {stats?.isSupabaseConnected ? "Terhubung" : "Mode Lokal"}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Database Supabase</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Penyimpanan profil pengguna, draf kesepakatan, dan riwayat pesanan pembayaran.
              </p>
            </div>
          </div>

          <div className="card p-5 space-y-3 border-slate-200">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Bucket Aktif
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Penyimpanan PDF</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Bucket Supabase Storage untuk menyimpan dokumen salinan resmi bermeterai dan bertanda tangan.
              </p>
            </div>
          </div>

          <div className="card p-5 space-y-3 border-slate-200">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                Anti-Bot Aktif
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Cloudflare Turnstile</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Proteksi formulir pendaftaran dan login dari spam bot tanpa puzzle gambar CAPTCHA yang merepotkan.
              </p>
            </div>
          </div>

          <div className="card p-5 space-y-3 border-slate-200">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Email Aktif
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Email Gateway (Resend)</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Pengiriman notifikasi otomatis saat kesepakatan ditinjau atau ditandatangani oleh klien.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
