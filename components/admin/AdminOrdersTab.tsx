"use client";

import React, { useState } from "react";
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Search,
  Copy,
  Check,
  MessageCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { PaymentOrderRecord } from "@/lib/types";
import { formatCurrencyIDR, formatDateTimeID } from "@/lib/crypto";

export function AdminOrdersTab({
  paymentOrdersList,
  onApprove,
  onReject,
}: {
  paymentOrdersList: PaymentOrderRecord[];
  onApprove: (orderId: string) => void;
  onReject: (orderId: string) => void;
}) {
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "PAID" | "FAILED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Metrik ringkasan transaksi
  const totalOrders = paymentOrdersList.length;
  const pendingOrders = paymentOrdersList.filter((o) => o.status === "PENDING");
  const paidOrders = paymentOrdersList.filter((o) => o.status === "PAID");
  const failedOrders = paymentOrdersList.filter((o) => o.status === "FAILED" || o.status === "EXPIRED");
  const totalPaidRevenue = paidOrders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);

  // Filter pencarian
  const filteredOrders = paymentOrdersList.filter((order) => {
    if (statusFilter === "PENDING" && order.status !== "PENDING") return false;
    if (statusFilter === "PAID" && order.status !== "PAID") return false;
    if (statusFilter === "FAILED" && order.status !== "FAILED" && order.status !== "EXPIRED") return false;

    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const orderIdMatch = order.orderId.toLowerCase().includes(query);
    const emailMatch = (order.userEmail || "").toLowerCase().includes(query);
    const nameMatch = (order.userName || (order.metadata?.profile_name as string) || "").toLowerCase().includes(query);
    const phoneMatch = (order.userPhone || (order.metadata?.user_phone as string) || "").includes(query);

    return orderIdMatch || emailMatch || nameMatch || phoneMatch;
  });

  return (
    <div className="space-y-6">
      {/* Header Tab */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            Transaksi &amp; Verifikasi Pembayaran
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola dan verifikasi pembayaran masuk paket Pro dan kredit proyek. Cocokkan nominal transfer dengan kode unik mutasi perbankan.
          </p>
        </div>
      </div>

      {/* Ringkasan Kartu Metrik Transaksi */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="card p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Total Pesanan</span>
            <CreditCard className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{totalOrders}</p>
          <p className="text-[11px] text-slate-400">Seluruh riwayat checkout</p>
        </div>

        <div className="card p-4 space-y-1 border-amber-200 bg-amber-50/30">
          <div className="flex items-center justify-between text-xs text-amber-700 font-medium">
            <span>Menunggu Verifikasi</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-amber-900">{pendingOrders.length}</p>
            {pendingOrders.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            )}
          </div>
          <p className="text-[11px] text-amber-700">Perlu dicocokkan ke mutasi</p>
        </div>

        <div className="card p-4 space-y-1 border-emerald-200 bg-emerald-50/30">
          <div className="flex items-center justify-between text-xs text-emerald-700 font-medium">
            <span>Lunas / Terverifikasi</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-900">{paidOrders.length}</p>
          <p className="text-[11px] text-emerald-700">Akses aktif diberikan</p>
        </div>

        <div className="card p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Total Pendapatan</span>
            <DollarSign className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 truncate">
            {formatCurrencyIDR(totalPaidRevenue)}
          </p>
          <p className="text-[11px] text-slate-400">Akumulasi pesanan lunas</p>
        </div>
      </div>

      {/* Kontrol Filter dan Pencarian */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Filter Status */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              statusFilter === "ALL"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Semua ({totalOrders})
          </button>
          <button
            onClick={() => setStatusFilter("PENDING")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              statusFilter === "PENDING"
                ? "bg-amber-500 text-white shadow-sm"
                : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
            }`}
          >
            <span>Menunggu</span>
            <span className="px-1.5 py-0.2 bg-white/20 rounded text-[10px]">
              {pendingOrders.length}
            </span>
          </button>
          <button
            onClick={() => setStatusFilter("PAID")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              statusFilter === "PAID"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
            }`}
          >
            Lunas ({paidOrders.length})
          </button>
          <button
            onClick={() => setStatusFilter("FAILED")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              statusFilter === "FAILED"
                ? "bg-rose-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Ditolak ({failedOrders.length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari ID, nama, email, no WA..."
            className="input pl-9 pr-3 py-1.5 text-xs w-full"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Tabel Transaksi */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">ID Pesanan</th>
                <th className="px-5 py-3.5">Pengguna</th>
                <th className="px-5 py-3.5">Paket</th>
                <th className="px-5 py-3.5">Nominal Transfer</th>
                <th className="px-5 py-3.5">Metode</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Waktu</th>
                <th className="px-5 py-3.5 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredOrders.map((order) => {
                const meta = (order.metadata || {}) as Record<string, unknown>;
                const userName = order.userName || (meta.profile_name as string) || order.userEmail;
                const userPhone = order.userPhone || (meta.user_phone as string) || "";
                const uniqueCode = typeof meta.unique_code === "number" ? meta.unique_code : null;
                const baseAmount = typeof meta.base_amount === "number" ? meta.base_amount : null;

                const cleanPhone = userPhone.replace(/[^0-9]/g, "");
                const waNumber = cleanPhone.startsWith("0") ? `62${cleanPhone.slice(1)}` : cleanPhone;
                const waChatUrl = waNumber
                  ? `https://wa.me/${waNumber}?text=${encodeURIComponent(
                      `Halo ${userName}, konfirmasi pesanan Sepakatin dengan ID ${order.orderId}.`
                    )}`
                  : null;

                return (
                  <tr key={order.id || order.orderId} className="hover:bg-slate-50/70 transition-colors">
                    {/* ID Pesanan & Copy */}
                    <td className="px-5 py-4 align-top">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-xs text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {order.orderId}
                        </span>
                        <button
                          onClick={() => handleCopy(order.orderId, order.orderId)}
                          className="text-slate-400 hover:text-slate-600 p-1 rounded"
                          title="Salin ID Pesanan"
                        >
                          {copiedId === order.orderId ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Pengguna */}
                    <td className="px-5 py-4 align-top">
                      <div className="font-semibold text-slate-900 text-xs">{userName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{order.userEmail}</div>
                      {userPhone && (
                        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-700">
                          <span>WA: {userPhone}</span>
                          {waChatUrl && (
                            <a
                              href={waChatUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-600 hover:text-emerald-800 inline-flex items-center gap-0.5 font-medium underline text-[10px]"
                            >
                              <MessageCircle className="w-3 h-3" />
                              Chat
                            </a>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Paket */}
                    <td className="px-5 py-4 align-top">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-xs font-semibold ${
                          order.packageType === "pro_monthly"
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {order.packageType === "credit_1" ? "1 Kredit Proyek" : "Paket Pro (30 Hari)"}
                      </span>
                    </td>

                    {/* Nominal Transfer (Penting untuk cek mutasi) */}
                    <td className="px-5 py-4 align-top">
                      <div className="font-bold text-slate-900 text-sm font-mono">
                        {formatCurrencyIDR(order.amount)}
                      </div>
                      {uniqueCode && baseAmount && (
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          Dasar {formatCurrencyIDR(baseAmount)} +{" "}
                          <span className="font-bold text-amber-700 bg-amber-50 px-1 py-0.2 rounded border border-amber-200">
                            kode {uniqueCode}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Metode Pembayaran */}
                    <td className="px-5 py-4 align-top">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {order.paymentMethod || "QRIS / Transfer Bank"}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4 align-top">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          order.status === "PAID"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : order.status === "PENDING"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {order.status === "PENDING" && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        )}
                        {order.status === "PAID"
                          ? "Lunas & Aktif"
                          : order.status === "PENDING"
                          ? "Menunggu Verifikasi"
                          : order.status === "FAILED"
                          ? "Ditolak / Batal"
                          : order.status}
                      </span>
                    </td>

                    {/* Waktu */}
                    <td className="px-5 py-4 align-top text-xs text-slate-500 whitespace-nowrap">
                      <div>{formatDateTimeID(order.createdAt)}</div>
                      {order.paidAt && (
                        <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
                          Diverifikasi: {formatDateTimeID(order.paidAt)}
                        </div>
                      )}
                    </td>

                    {/* Tindakan Admin */}
                    <td className="px-5 py-4 align-top text-right space-x-2">
                      {order.status === "PENDING" ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onApprove(order.orderId)}
                            className="btn btn-sm btn-primary text-xs flex items-center gap-1"
                            title="Verifikasi Manual & Aktifkan Paket Pengguna"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Verifikasi
                          </button>
                          <button
                            onClick={() => onReject(order.orderId)}
                            className="btn btn-sm btn-secondary text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1"
                            title="Tolak / Batalkan Pesanan"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Tolak
                          </button>
                        </div>
                      ) : order.status === "PAID" ? (
                        <span className="text-xs text-emerald-600 font-semibold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Terverifikasi
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Dibatalkan</span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-xs text-slate-500">
                    <div className="max-w-xs mx-auto space-y-2">
                      <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="font-semibold text-slate-700 text-sm">Tidak ada transaksi ditemukan</p>
                      <p className="text-slate-400">
                        {searchQuery
                          ? `Tidak ada transaksi yang cocok dengan kata kunci "${searchQuery}".`
                          : "Belum ada riwayat pesanan pembayaran pada filter ini."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Panduan Singkat Verifikasi Mutasi */}
      <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-blue-900">
        <div className="space-y-1">
          <p className="font-semibold flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            Panduan Cepat Verifikasi Mutasi Rekening
          </p>
          <p className="text-blue-800 text-[11px] leading-relaxed">
            Periksa mutasi m-banking BCA / Livin Mandiri / Dashboard QRIS Anda. Cocokkan nominal transfer yang masuk dengan 3-digit kode unik di atas. Setelah dana masuk, tekan tombol <strong>Verifikasi</strong> untuk otomatis mengaktifkan paket atau menambah kredit proyek pengguna tanpa jeda.
          </p>
        </div>
      </div>
    </div>
  );
}
