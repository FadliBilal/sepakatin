"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  Users,
  FileText,
  Wallet,
  CheckCircle2,
  Sparkles,
  Database,
  Search,
  ExternalLink,
  Printer,
  RefreshCw,
  AlertTriangle,
  Settings,
} from "lucide-react";
import { isAdmin, useSession } from "@/lib/auth";
import {
  adminGetAllAgreements,
  adminGetAllUsers,
  adminGetPlatformStats,
  adminModerateAgreement,
  adminUpdateUserCredits,
  adminUpdateUserPlan,
  AdminPlatformStats,
  AdminUserView,
} from "@/lib/store";
import { AgreementRecord } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrencyIDR, formatDateID } from "@/lib/crypto";

export default function AdminPage() {
  const { user, ready } = useSession();

  const [activeTab, setActiveTab] = useState<"overview" | "users" | "agreements" | "settings">("overview");
  const [stats, setStats] = useState<AdminPlatformStats | null>(null);
  const [usersList, setUsersList] = useState<AdminUserView[]>([]);
  const [agreementsList, setAgreementsList] = useState<AgreementRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  async function loadAdminData() {
    setIsLoading(true);
    try {
      const [s, u, a] = await Promise.all([
        adminGetPlatformStats(),
        adminGetAllUsers(),
        adminGetAllAgreements(),
      ]);
      setStats(s);
      setUsersList(u);
      setAgreementsList(a);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (ready && user && isAdmin(user)) {
      loadAdminData();
    }
  }, [ready, user]);

  const showNotification = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleTogglePlan = async (u: AdminUserView) => {
    const nextPlan = u.plan === "pro" ? "gratis" : "pro";
    await adminUpdateUserPlan(u.id, nextPlan);
    showNotification(`Paket ${u.fullName} berhasil diubah menjadi ${nextPlan.toUpperCase()}.`);
    loadAdminData();
  };

  const handleAddCredits = async (u: AdminUserView, amount = 3) => {
    await adminUpdateUserCredits(u.id, u.credits + amount);
    showNotification(`Kredit ${u.fullName} berhasil ditambah +${amount} kredit.`);
    loadAdminData();
  };

  const handleModerate = async (agreementId: string, action: "cancel" | "delete") => {
    if (!confirm(action === "delete" ? "Hapus dokumen ini dari sistem?" : "Batalkan status kesepakatan ini?")) return;
    await adminModerateAgreement(agreementId, action);
    showNotification(action === "delete" ? "Dokumen berhasil dihapus." : "Status dokumen diubah menjadi Dibatalkan.");
    loadAdminData();
  };

  if (!ready) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-sm text-slate-500 animate-pulse">Memverifikasi hak akses admin...</p>
      </div>
    );
  }

  // Access control
  if (!user || !isAdmin(user)) {
    return (
      <div className="w-full max-w-lg mx-auto px-4 py-20">
        <div className="card p-8 text-center space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Akses Khusus Admin</h2>
            <p className="text-sm text-slate-500 mt-1">
              Halaman ini hanya dapat diakses oleh akun Admin Sepakatin.
              {user ? ` Anda saat ini masuk sebagai ${user.fullName} (${user.email}).` : " Silakan masuk terlebih dahulu."}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Link href="/auth/login?next=/admin" className="btn btn-primary">
              Masuk sebagai Admin
            </Link>
            <Link href="/dashboard" className="btn btn-secondary">
              Ke Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const filteredAgreements = agreementsList.filter((a) => {
    const matchSearch =
      a.contractId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.currentVersion.contentJson.freelancer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.currentVersion.contentJson.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.currentVersion.contentJson.projectName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "ALL" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="container-page py-10 space-y-8">
      {/* Toast Notification */}
      {actionMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg animate-fade-in flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {actionMessage}
        </div>
      )}

      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="eyebrow">
              <ShieldCheck className="w-3.5 h-3.5" />
              Panel Pengelola Platform
            </span>
            {stats?.isSupabaseConnected ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Supabase Cloud Aktif
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Mode Lokal (Demo)
              </span>
            )}
          </div>
          <h1 className="page-title">Dasbor Administrator</h1>
          <p className="text-sm text-slate-500 mt-1">
            Pantau statistik platform, atur paket dan kredit pengguna, serta lakukan moderasi kesepakatan.
          </p>
        </div>

        <button onClick={loadAdminData} disabled={isLoading} className="btn btn-secondary self-start sm:self-auto">
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Segarkan Data
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("overview")}
          className={`tab ${activeTab === "overview" ? "tab-active" : "tab-idle"}`}
        >
          Ikhtisar Platform
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`tab ${activeTab === "users" ? "tab-active" : "tab-idle"}`}
        >
          Pengguna ({usersList.length})
        </button>
        <button
          onClick={() => setActiveTab("agreements")}
          className={`tab ${activeTab === "agreements" ? "tab-active" : "tab-idle"}`}
        >
          Semua Kesepakatan ({agreementsList.length})
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`tab ${activeTab === "settings" ? "tab-active" : "tab-idle"}`}
        >
          Pengaturan & Cloud
        </button>
      </div>

      {/* TAB 1: IKHTISAR PLATFORM */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* 4 Top Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Pengguna</span>
                <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">{stats?.totalUsers ?? 0}</div>
              <p className="text-xs text-slate-500">Terdaftar di platform</p>
            </div>

            <div className="card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Kesepakatan</span>
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">{stats?.totalAgreements ?? 0}</div>
              <p className="text-xs text-slate-500">
                {stats?.totalAgreed ?? 0} disepakati · {stats?.totalPending ?? 0} berjalan
              </p>
            </div>

            <div className="card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nilai Transaksi</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {formatCurrencyIDR(stats?.totalProjectValue ?? 0)}
              </div>
              <p className="text-xs text-slate-500">Total nilai seluruh kontrak aktif</p>
            </div>

            <div className="card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tingkat Kesepakatan</span>
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {stats?.totalAgreements
                  ? `${Math.round(((stats.totalAgreed || 0) / stats.totalAgreements) * 100)}%`
                  : "0%"}
              </div>
              <p className="text-xs text-slate-500">Rasio kontrak yang disetujui kedua pihak</p>
            </div>
          </div>

          {/* Quick Guidance Box */}
          <div className="card p-6 bg-gradient-to-br from-brand-50/50 to-indigo-50/30 border-brand-100 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">Hak & Tanggung Jawab Administrator</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Sesuai PRD Sepakatin Bab 4.3, Admin memiliki hak moderasi pengguna, mengaktifkan paket langganan Pro,
                  memberikan kuota kredit proyek, dan memantau integritas kontrak. Admin <strong>dilarang</strong> mengubah
                  isi pasal kesepakatan yang telah disetujui para pihak untuk menjaga keabsahan hash SHA-256 dokumen.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MANAJEMEN PENGGUNA */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Daftar Pengguna Platform</h2>
              <p className="text-xs text-slate-500">Kelola paket langganan dan kredit proyek untuk setiap pengguna.</p>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Pengguna</th>
                    <th className="px-5 py-3.5">Peran</th>
                    <th className="px-5 py-3.5">Paket Akun</th>
                    <th className="px-5 py-3.5">Kredit Proyek</th>
                    <th className="px-5 py-3.5">Total Kontrak</th>
                    <th className="px-5 py-3.5">Nilai Proyek</th>
                    <th className="px-5 py-3.5 text-right">Aksi Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900">{u.fullName}</div>
                        <div className="text-xs text-slate-500">{u.email}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs text-slate-600 font-medium">{u.role}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                            u.plan === "pro"
                              ? "bg-brand-50 text-brand-700 border border-brand-200"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {u.plan === "pro" ? "⭐ Pro" : "Gratis"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-semibold text-slate-800">{u.credits}</span>
                        <span className="text-xs text-slate-500"> kredit</span>
                      </td>
                      <td className="px-5 py-4 text-slate-700">{u.agreementCount} dokumen</td>
                      <td className="px-5 py-4 font-medium text-slate-900">{formatCurrencyIDR(u.totalValue)}</td>
                      <td className="px-5 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleTogglePlan(u)}
                          className={`btn btn-sm ${u.plan === "pro" ? "btn-secondary" : "btn-primary"}`}
                        >
                          {u.plan === "pro" ? "Set ke Gratis" : "Upgrade ke Pro"}
                        </button>
                        <button onClick={() => handleAddCredits(u, 3)} className="btn btn-secondary btn-sm" title="Tambah 3 kredit proyek">
                          +3 Kredit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SEMUA KESEPAKATAN */}
      {activeTab === "agreements" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Semua Dokumen Kesepakatan</h2>
              <p className="text-xs text-slate-500">Pantau dan moderasi semua surat kontrak di seluruh platform.</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari kontrak, pihak, proyek..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-9 py-2 text-xs w-60"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input py-2 text-xs w-auto cursor-pointer"
              >
                <option value="ALL">Semua Status</option>
                <option value="AGREED">Disepakati (AGREED)</option>
                <option value="PENDING_CLIENT">Menunggu Klien</option>
                <option value="DRAFT">Draf</option>
                <option value="CANCELLED">Dibatalkan</option>
              </select>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Nomor Dokumen</th>
                    <th className="px-5 py-3.5">Proyek</th>
                    <th className="px-5 py-3.5">Freelancer</th>
                    <th className="px-5 py-3.5">Klien</th>
                    <th className="px-5 py-3.5">Nilai Proyek</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredAgreements.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-4">
                        <span className="font-mono font-bold text-xs text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                          {a.contractId}
                        </span>
                        <div className="text-[11px] text-slate-500 mt-1">Versi {a.currentVersionNumber}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900 max-w-[200px] truncate">
                          {a.currentVersion.contentJson.projectName}
                        </div>
                        <div className="text-xs text-slate-500">{formatDateID(a.createdAt)}</div>
                      </td>
                      <td className="px-5 py-4 text-slate-700">
                        {a.currentVersion.contentJson.freelancer.name}
                      </td>
                      <td className="px-5 py-4 text-slate-700">
                        {a.currentVersion.contentJson.client.name}
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-900">
                        {formatCurrencyIDR(a.currentVersion.contentJson.payment.totalValue)}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={a.status} />
                      </td>
                      <td className="px-5 py-4 text-right space-x-1.5">
                        <Link
                          href={`/agreements/${a.id}/print`}
                          target="_blank"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-brand-600 hover:border-brand-600 inline-flex items-center"
                          title="Buka Dokumen PDF"
                        >
                          <Printer className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/verify/${a.contractId}`}
                          target="_blank"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-600 inline-flex items-center"
                          title="Cek Keaslian & Hash"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        {a.status !== "CANCELLED" && (
                          <button
                            onClick={() => handleModerate(a.id, "cancel")}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-600 inline-flex items-center"
                            title="Batalkan Kesepakatan"
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredAgreements.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-8 text-center text-xs text-slate-500">
                        Tidak ada kesepakatan yang cocok dengan pencarian.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PENGATURAN & CLOUD */}
      {activeTab === "settings" && (
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
                  1. Freelancer klik tombol paket di web & chat ke WhatsApp Admin.<br />
                  2. Freelancer transfer biaya langganan.<br />
                  3. Buka tab <strong>Pengguna</strong> di atas, cari email pemohon, klik <strong>Upgrade ke Pro</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
