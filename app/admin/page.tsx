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
  Database,
  Search,
  ExternalLink,
  Printer,
  RefreshCw,
  AlertTriangle,
  Settings,
  History,
  CreditCard,
  Star,
} from "lucide-react";
import { isAdmin, useSession } from "@/lib/auth";
import {
  adminGetAllAgreements,
  adminGetAllUsers,
  adminGetPlatformStats,
  adminGetAuditLogs,
  adminGetAllPaymentOrders,
  adminApprovePaymentOrder,
  adminRejectPaymentOrder,
  adminModerateAgreement,
  adminUpdateUserCredits,
  adminUpdateUserPlan,
  AdminPlatformStats,
  AdminUserView,
  errorMessage,
} from "@/lib/store";
import { AdminAuditLogItem, AgreementRecord, PaymentOrderRecord } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrencyIDR, formatDateID, formatDateTimeID } from "@/lib/crypto";
import { ModalDialog, ModalType } from "@/components/ModalDialog";

export default function AdminPage() {
  const { user, ready } = useSession();

  const [activeTab, setActiveTab] = useState<"overview" | "users" | "agreements" | "orders" | "audit" | "settings">("overview");
  const [stats, setStats] = useState<AdminPlatformStats | null>(null);
  const [usersList, setUsersList] = useState<AdminUserView[]>([]);
  const [agreementsList, setAgreementsList] = useState<AgreementRecord[]>([]);
  const [paymentOrdersList, setPaymentOrdersList] = useState<PaymentOrderRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLogItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    title: string;
    description: React.ReactNode;
    type?: ModalType;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void | Promise<void>;
    isLoading?: boolean;
  }>({
    isOpen: false,
    title: "",
    description: "",
  });

  const closeDialog = () => setDialogState((prev) => ({ ...prev, isOpen: false, isLoading: false }));

  const showConfirm = ({
    title,
    description,
    type = "danger",
    confirmText = "Ya, Lanjutkan",
    cancelText = "Batal",
    onConfirm,
  }: {
    title: string;
    description: React.ReactNode;
    type?: ModalType;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => Promise<void> | void;
  }) => {
    setDialogState({
      isOpen: true,
      title,
      description,
      type,
      confirmText,
      cancelText,
      onConfirm,
    });
  };

  async function loadAdminData() {
    setIsLoading(true);
    setLoadError("");
    try {
      const [s, u, a, l, o] = await Promise.all([
        adminGetPlatformStats(),
        adminGetAllUsers(),
        adminGetAllAgreements(),
        adminGetAuditLogs(),
        adminGetAllPaymentOrders(),
      ]);
      setStats(s);
      setUsersList(u);
      setAgreementsList(a);
      setAuditLogs(l);
      setPaymentOrdersList(o);
    } catch (err) {
      // Tanpa ini, gagal memuat tampak sama persis dengan "memang tidak ada data".
      console.error(err);
      setLoadError(errorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  const handleApproveOrder = (orderId: string) => {
    showConfirm({
      title: "Verifikasi Manual Pembayaran",
      description: `Apakah Anda yakin ingin memverifikasi pesanan ${orderId}? Saldo kredit proyek atau paket Pro akan otomatis ditambahkan ke akun pengguna terkait.`,
      type: "info",
      confirmText: "Ya, Verifikasi",
      onConfirm: async () => {
        setDialogState((prev) => ({ ...prev, isLoading: true }));
        try {
          await adminApprovePaymentOrder(orderId);
          showNotification(`Pesanan ${orderId} berhasil diverifikasi dan diaktifkan.`);
          loadAdminData();
        } finally {
          closeDialog();
        }
      },
    });
  };

  const handleRejectOrder = (orderId: string) => {
    showConfirm({
      title: "Batalkan / Tolak Pesanan",
      description: `Apakah Anda yakin ingin membatalkan pesanan ${orderId}?`,
      type: "danger",
      confirmText: "Ya, Tolak",
      onConfirm: async () => {
        setDialogState((prev) => ({ ...prev, isLoading: true }));
        try {
          await adminRejectPaymentOrder(orderId);
          showNotification(`Pesanan ${orderId} telah ditolak.`);
          loadAdminData();
        } finally {
          closeDialog();
        }
      },
    });
  };

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

  const handleModerate = (agreementId: string, action: "cancel" | "delete") => {
    showConfirm({
      title: action === "delete" ? "Hapus Dokumen" : "Batalkan Kesepakatan",
      description:
        action === "delete"
          ? "Apakah Anda yakin ingin menghapus dokumen ini secara permanen dari sistem?"
          : "Apakah Anda yakin ingin membatalkan status kesepakatan ini?",
      type: "danger",
      confirmText: action === "delete" ? "Ya, Hapus" : "Ya, Batalkan",
      onConfirm: async () => {
        setDialogState((prev) => ({ ...prev, isLoading: true }));
        try {
          await adminModerateAgreement(agreementId, action);
          showNotification(action === "delete" ? "Dokumen berhasil dihapus." : "Status dokumen diubah menjadi Dibatalkan.");
          loadAdminData();
        } finally {
          closeDialog();
        }
      },
    });
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

      {loadError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-rose-900">Gagal memuat data panel</p>
            <p className="text-sm text-rose-800 mt-0.5">{loadError}</p>
          </div>
          <button onClick={loadAdminData} disabled={isLoading} className="btn btn-secondary btn-sm self-start sm:self-auto">
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Coba Lagi
          </button>
        </div>
      )}

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
          onClick={() => setActiveTab("orders")}
          className={`tab ${activeTab === "orders" ? "tab-active" : "tab-idle"}`}
        >
          Transaksi Pembayaran ({paymentOrdersList.length})
        </button>
        <button
          onClick={() => setActiveTab("audit")}
          className={`tab ${activeTab === "audit" ? "tab-active" : "tab-idle"}`}
        >
          Jejak Audit ({auditLogs.length})
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
                          {u.plan === "pro" ? (
                            <span className="inline-flex items-center gap-1">
                              <Star className="w-3 h-3 text-brand-600 fill-brand-600" /> Pro
                            </span>
                          ) : (
                            "Gratis"
                          )}
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

      {/* TAB: TRANSAKSI PEMBAYARAN */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-brand-600" />
                Daftar Transaksi Pembayaran (Mayar.id QRIS)
              </h2>
              <p className="text-xs text-slate-500">
                Semua pesanan kredit proyek dan langganan paket Pro yang dibuat pengguna.
              </p>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">ID Pesanan</th>
                    <th className="px-5 py-3.5">Pengguna</th>
                    <th className="px-5 py-3.5">Paket</th>
                    <th className="px-5 py-3.5">Nominal</th>
                    <th className="px-5 py-3.5">Metode</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Waktu</th>
                    <th className="px-5 py-3.5 text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {paymentOrdersList.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-4">
                        <span className="font-mono font-bold text-xs text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {order.orderId}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-900 text-xs">{order.userEmail}</div>
                        <div className="text-[11px] text-slate-400 font-mono truncate max-w-[120px]">{order.userId}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-semibold text-xs text-slate-800">
                          {order.packageType === "credit_1" ? "1 Kredit Proyek" : "Paket Pro Bulanan"}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-900 text-xs">
                        {formatCurrencyIDR(order.amount)}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                          {order.paymentMethod || "QRIS"} ({order.paymentGateway || "MAYAR"})
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            order.status === "PAID"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : order.status === "PENDING"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {order.status === "PAID"
                            ? "Lunas"
                            : order.status === "PENDING"
                            ? "Menunggu"
                            : order.status === "FAILED"
                            ? "Gagal/Ditolak"
                            : order.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">
                        <div>{formatDateTimeID(order.createdAt)}</div>
                        {order.paidAt && (
                          <div className="text-[11px] text-emerald-600">Dibayar: {formatDateTimeID(order.paidAt)}</div>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right space-x-2">
                        {order.status === "PENDING" ? (
                          <>
                            <button
                              onClick={() => handleApproveOrder(order.orderId)}
                              className="btn btn-sm btn-primary text-xs"
                              title="Verifikasi Manual & Tambahkan Saldo"
                            >
                              Verifikasi
                            </button>
                            <button
                              onClick={() => handleRejectOrder(order.orderId)}
                              className="btn btn-sm btn-secondary text-xs text-rose-600 hover:text-rose-700"
                              title="Tolak Pesanan"
                            >
                              Tolak
                            </button>
                          </>
                        ) : order.status === "PAID" ? (
                          <span className="text-xs text-emerald-600 font-semibold inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Terverifikasi
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">Selesai</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {paymentOrdersList.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-5 py-8 text-center text-xs text-slate-500">
                        Belum ada riwayat transaksi pembayaran.
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

      {/* TAB: JEJAK AUDIT ADMINISTRATOR */}
      {activeTab === "audit" && (
        <div className="card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-brand-600" />
                Jejak Audit Administrator (Admin Audit Trail)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Merekam riwayat pengubahan paket, penambahan kredit, pembatalan, dan penghapusan kontrak demi akuntabilitas platform.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              {auditLogs.length} Aktivitas Terekam
            </span>
          </div>

          {auditLogs.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              Belum ada riwayat aktivitas administratif yang tercatat.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-medium">
                    <th className="py-2.5 px-3">Waktu</th>
                    <th className="py-2.5 px-3">Admin</th>
                    <th className="py-2.5 px-3">Aksi</th>
                    <th className="py-2.5 px-3">Target</th>
                    <th className="py-2.5 px-3">Detail</th>
                    <th className="py-2.5 px-3">IP / Jaringan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 whitespace-nowrap text-slate-600 font-mono text-[11px]">
                        {formatDateTimeID(log.createdAt)}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap font-medium text-slate-900">
                        {log.adminEmail}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                            log.action === "DELETE_AGREEMENT"
                              ? "bg-rose-100 text-rose-700"
                              : log.action === "CANCEL_AGREEMENT"
                              ? "bg-amber-100 text-amber-800"
                              : log.action === "UPDATE_PLAN"
                              ? "bg-brand-100 text-brand-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-slate-700">
                        <span className="font-semibold text-slate-500">{log.targetType}:</span>{" "}
                        <span className="font-mono">{log.targetId}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-mono text-[11px] max-w-xs truncate">
                        {JSON.stringify(log.details)}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                        {log.ipAddress || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <ModalDialog onClose={closeDialog} {...dialogState} />
    </div>
  );
}
