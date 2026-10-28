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
  Server,
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
      {/* 1. Status Layanan Cloud & Infrastruktur Platform */}
      <div>
        <div className="mb-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Cloud className="w-5 h-5 text-blue-600" />
            Infrastruktur Cloud &amp; Layanan Terintegrasi
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Status operasional komponen cloud yang menopang database, keamanan, penyimpanan dokumen, dan notifikasi platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card Supabase Database */}
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
              <h3 className="text-sm font-bold text-slate-900">PostgreSQL &amp; RLS</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Supabase Cloud dengan isolasi hak akses data multi-tenant dan transaksi atomik settlement pesanan.
              </p>
            </div>
          </div>

          {/* Card Supabase Storage */}
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
              <h3 className="text-sm font-bold text-slate-900">Penyimpanan Dokumen</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Supabase Storage bucket <code className="text-blue-700 bg-blue-50 px-1 py-0.2 rounded">agreements</code> untuk berkas PDF bermeterai resmi (Magic Bytes %PDF- valid).
              </p>
            </div>
          </div>

          {/* Card Cloudflare Turnstile */}
          <div className="card p-5 space-y-3 border-slate-200">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                Proteksi Aktif
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Cloudflare Turnstile</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Perlindungan anti-bot cerdas pada formulir pendaftaran, login, dan tanda tangan tanpa puzzle visual yang mengganggu pengguna.
              </p>
            </div>
          </div>

          {/* Card Resend Email API */}
          <div className="card p-5 space-y-3 border-slate-200">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Email Otomatis
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Resend Email Gateway</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Notifikasi otomatis saat dokumen ditinjau klien, permintaan revisi diterbitkan, dan dokumen disepakati sah.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Rekening Resmi & Saluran Pembayaran Platform */}
      <div>
        <div className="mb-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            Rekening Penerima &amp; Saluran Pembayaran Resmi
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Rekening bank dan QRIS resmi yang ditampilkan pada modal pembayaran pengguna untuk penerimaan dana paket harga.
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
                <p className="text-[11px] text-slate-500">Nomor Rekening Resmi:</p>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-base text-slate-900">
                    {acc.accountNumber}
                  </span>
                  <button
                    onClick={() => handleCopy(acc.accountNumber.replace(/[^0-9]/g, ""), acc.bankName)}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 text-xs flex items-center gap-1 shadow-sm"
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
              <span className="text-xs font-bold text-slate-900">QRIS Multi-Payment</span>
              <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium">
                Semua Bank &amp; E-Wallet
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <p className="text-[11px] text-slate-500">Nama Akun QRIS:</p>
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

      {/* 3. SOP Verifikasi Pembayaran & Layanan (Update Terkini) */}
      <div className="card p-6 space-y-5 border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="card-title text-base">SOP Verifikasi Pembayaran &amp; Layanan Pengguna</h3>
            <p className="text-xs text-slate-500">Prosedur operasional pencocokan mutasi dan aktivasi 1-klik</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
              1
            </span>
            <p className="font-semibold text-slate-900 text-sm">Pesanan Dibuat</p>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Pengguna memilih paket (1 Kredit Rp19.000 atau Pro Bulanan Rp49.000). Sistem otomatis menyematkan 3-digit kode unik (contoh: Rp19.248).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
              2
            </span>
            <p className="font-semibold text-slate-900 text-sm">Transfer Pengguna</p>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Pengguna transfer ke rekening BCA, Mandiri, atau QRIS sesuai nominal total persis, lalu menekan tombol konfirmasi WhatsApp resmi.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
              3
            </span>
            <p className="font-semibold text-slate-900 text-sm">Cek Mutasi Rekening</p>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Admin membuka m-banking dan mencocokkan mutasi masuk dengan baris transaksi berstatus &quot;Menunggu Verifikasi&quot; di tab Transaksi Pembayaran.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
              4
            </span>
            <p className="font-semibold text-slate-900 text-sm">Aktivasi 1-Klik</p>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Admin klik tombol <strong>Verifikasi</strong>. Sistem otomatis menambahkan kredit proyek atau mengaktifkan status Pro (30 hari) secara instan.
            </p>
          </div>
        </div>

        {/* Saluran Bantuan Cepat */}
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
            href={whatsappLink("Halo Admin Sepakatin, saya membutuhkan bantuan terkait operasional platform.")}
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary btn-sm text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50 self-start sm:self-auto flex items-center gap-1.5"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Buka WhatsApp Admin
          </a>
        </div>
      </div>

      {/* 4. Referensi Variabel Lingkungan (.env.local / Hosting Platform) */}
      <div className="card p-6 space-y-4 border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="card-title text-base">Referensi Variabel Lingkungan (.env.local)</h3>
              <p className="text-xs text-slate-500">Konfigurasi kunci API dan koneksi layanan hosting</p>
            </div>
          </div>
          <button
            onClick={() =>
              handleCopy(
                `NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co\nNEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...\nSUPABASE_SERVICE_ROLE_KEY=eyJh...\nNEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAA...\nTURNSTILE_SECRET_KEY=0x4AAAAAA...\nRESEND_API_KEY=re_...\nADMIN_EMAILS=admin@sepakatin.id`,
                "all-env"
              )
            }
            className="btn btn-secondary btn-sm text-xs flex items-center gap-1"
          >
            {copiedKey === "all-env" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            Salin Template
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-700">1. Database &amp; Auth (Supabase):</span>
            <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl text-[11px] font-mono overflow-x-auto leading-relaxed">
{`NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
SUPABASE_SERVICE_ROLE_KEY=eyJh...`}
            </pre>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-700">2. Keamanan, Email &amp; Admin:</span>
            <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl text-[11px] font-mono overflow-x-auto leading-relaxed">
{`NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAA...
TURNSTILE_SECRET_KEY=0x4AAAAAA...
RESEND_API_KEY=re_...
ADMIN_EMAILS=admin@sepakatin.id`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
