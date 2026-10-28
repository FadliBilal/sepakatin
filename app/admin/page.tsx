"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, ShieldAlert, RefreshCw, CheckCircle2 } from "lucide-react";
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
  adminDeleteUser,
  AdminPlatformStats,
  AdminUserView,
  errorMessage,
} from "@/lib/store";
import { AdminAuditLogItem, AgreementRecord, PaymentOrderRecord } from "@/lib/types";
import { ModalDialog, ModalType } from "@/components/ModalDialog";
import { AdminOverviewTab } from "@/components/admin/AdminOverviewTab";
import { AdminUsersTab } from "@/components/admin/AdminUsersTab";
import { AdminAgreementsTab } from "@/components/admin/AdminAgreementsTab";
import { AdminOrdersTab } from "@/components/admin/AdminOrdersTab";
import { AdminAuditTab } from "@/components/admin/AdminAuditTab";
import { AdminSettingsTab } from "@/components/admin/AdminSettingsTab";

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
      if (process.env.NODE_ENV !== "production") {
        console.warn("Gagal memuat data admin:", err);
      }
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

  const handleDeleteUser = (u: AdminUserView) => {
    showConfirm({
      title: "Hapus Pengguna Permanen",
      description: (
        <div className="space-y-2">
          <p>
            Apakah Anda yakin ingin menghapus akun pengguna <strong>{u.fullName}</strong> ({u.email})?
          </p>
          <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
            Perhatian: Tindakan ini tidak dapat dibatalkan. Akun login, profil, seluruh draf &amp; dokumen kesepakatan, serta riwayat pesanan milik pengguna ini akan dihapus secara permanen dari basis data.
          </p>
        </div>
      ),
      type: "danger",
      confirmText: "Ya, Hapus Akun",
      onConfirm: async () => {
        setDialogState((prev) => ({ ...prev, isLoading: true }));
        try {
          await adminDeleteUser(u.id);
          showNotification(`Pengguna ${u.fullName} (${u.email}) berhasil dihapus.`);
          loadAdminData();
        } catch (err) {
          showNotification(`Gagal menghapus pengguna: ${errorMessage(err)}`);
        } finally {
          closeDialog();
        }
      },
    });
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

  const pendingOrdersCount = paymentOrdersList.filter((o) => o.status === "PENDING").length;

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E8EC] pb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="eyebrow">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              Panel Pengelola Platform
            </span>
            {stats?.isSupabaseConnected ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Supabase Cloud Aktif
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Mode Lokal (Demo)
              </span>
            )}
          </div>
          <h1 className="page-title font-display">Dasbor Administrator</h1>
          <p className="text-sm text-[#6B6B6B] mt-1">
            Pantau statistik platform, atur paket dan kredit pengguna, serta lakukan moderasi kesepakatan.
          </p>
        </div>

        <button onClick={loadAdminData} disabled={isLoading} className="btn btn-secondary self-start sm:self-auto">
          <RefreshCw className={`w-4 h-4 text-blue-600 ${isLoading ? "animate-spin" : ""}`} />
          Segarkan Data
        </button>
      </div>

      {loadError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-rose-900 font-display">Gagal memuat data panel</p>
            <p className="text-xs sm:text-sm text-rose-800 mt-0.5">{loadError}</p>
          </div>
          <button onClick={loadAdminData} disabled={isLoading} className="btn btn-secondary btn-sm self-start sm:self-auto">
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Coba Lagi
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#E8E8EC]">
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
          className={`tab ${activeTab === "orders" ? "tab-active" : "tab-idle"} flex items-center gap-1.5`}
        >
          <span>Transaksi Pembayaran</span>
          {pendingOrdersCount > 0 ? (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white animate-pulse">
              {pendingOrdersCount} baru
            </span>
          ) : (
            <span className="text-xs text-slate-400">({paymentOrdersList.length})</span>
          )}
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

      {activeTab === "overview" && <AdminOverviewTab stats={stats} />}

      {activeTab === "users" && (
        <AdminUsersTab
          usersList={usersList}
          currentUserId={user.id}
          onTogglePlan={handleTogglePlan}
          onAddCredits={handleAddCredits}
          onDeleteUser={handleDeleteUser}
        />
      )}

      {activeTab === "agreements" && (
        <AdminAgreementsTab
          agreementsList={agreementsList}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          onModerate={handleModerate}
        />
      )}

      {activeTab === "orders" && (
        <AdminOrdersTab
          paymentOrdersList={paymentOrdersList}
          onApprove={handleApproveOrder}
          onReject={handleRejectOrder}
        />
      )}

      {activeTab === "settings" && <AdminSettingsTab stats={stats} />}

      {activeTab === "audit" && <AdminAuditTab auditLogs={auditLogs} />}

      <ModalDialog onClose={closeDialog} {...dialogState} />
    </div>
  );
}
