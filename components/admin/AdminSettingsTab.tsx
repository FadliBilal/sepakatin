"use client";

import React from "react";
import { Database, Settings } from "lucide-react";
import { AdminPlatformStats } from "@/lib/store";

export function AdminSettingsTab({ stats }: { stats: AdminPlatformStats | null }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Card Status Supabase */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="card-title">Status Database Backend</h3>
            <p className="text-xs text-slate-500">Koneksi penyimpanan cloud Supabase</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600">Mode Saat Ini:</span>
            <strong className={stats?.isSupabaseConnected ? "text-emerald-600" : "text-amber-600"}>
              {stats?.isSupabaseConnected ? "Supabase Cloud Terhubung" : "Mode Browser Lokal (LocalStorage)"}
            </strong>
          </div>
          <div className="text-xs text-slate-500 leading-relaxed">
            {stats?.isSupabaseConnected
              ? "Aplikasi sudah menyimpan data pengguna dan dokumen ke PostgreSQL di Supabase Cloud."
              : "Data disimpan di memori browser perangkat ini. Untuk menghubungkan ke Cloud, isi file .env.local dan jalankan SQL schema di Supabase."}
          </div>
        </div>

        <div className="text-xs text-slate-600 space-y-2">
          <p className="font-semibold text-slate-900">Variabel yang Dibutuhkan di .env.local / Vercel:</p>
          <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg text-[11px] font-mono overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
SUPABASE_SERVICE_ROLE_KEY=eyJh...`}
          </pre>
        </div>
      </div>

      {/* Card Kontak & Operasional */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="card-title">Kontak & Operasional Platform</h3>
            <p className="text-xs text-slate-500">Saluran bantuan dan penerimaan pembayaran</p>
          </div>
        </div>

        <div className="space-y-3 text-xs text-slate-600">
          <div className="p-3 rounded-lg border border-slate-200">
            <p className="text-slate-500">WhatsApp Layanan Pelanggan & Upgrade:</p>
            <p className="text-sm font-semibold text-slate-900 mt-0.5">+62 853-3933-3616</p>
          </div>

          <div className="p-3 rounded-lg border border-slate-200">
            <p className="text-slate-500">Email Operasional Admin:</p>
            <p className="text-sm font-semibold text-slate-900 mt-0.5">admin@sepakatin.id</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <p className="font-semibold text-slate-900">SOP Aktivasi Paket Pro Freelancer:</p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              1. Freelancer klik tombol paket di web &amp; chat ke WhatsApp Admin.<br />
              2. Freelancer transfer biaya langganan.<br />
              3. Buka tab <strong>Pengguna</strong> di atas, cari email pemohon, klik <strong>Upgrade ke Pro</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
