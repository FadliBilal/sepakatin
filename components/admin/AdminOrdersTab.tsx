"use client";

import React from "react";
import { CreditCard, CheckCircle2 } from "lucide-react";
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
  return (
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
                          onClick={() => onApprove(order.orderId)}
                          className="btn btn-sm btn-primary text-xs"
                          title="Verifikasi Manual & Tambahkan Saldo"
                        >
                          Verifikasi
                        </button>
                        <button
                          onClick={() => onReject(order.orderId)}
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
  );
}
