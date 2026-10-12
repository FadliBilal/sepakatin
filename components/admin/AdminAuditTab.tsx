"use client";

import React from "react";
import { History } from "lucide-react";
import { AdminAuditLogItem } from "@/lib/types";
import { formatDateTimeID } from "@/lib/crypto";

export function AdminAuditTab({ auditLogs }: { auditLogs: AdminAuditLogItem[] }) {
  return (
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
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.action === "UPDATE_PLAN"
                          ? "bg-brand-50 text-brand-700 border border-brand-200"
                          : log.action === "UPDATE_CREDITS"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : log.action === "DELETE_USER"
                          ? "bg-rose-100 text-rose-800 border border-rose-300"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-500 max-w-[120px] truncate">
                    {log.targetType}: {log.targetId}
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-600 max-w-[200px] truncate">
                    {JSON.stringify(log.details)}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap text-slate-400 font-mono text-[10px]">
                    {log.ipAddress || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
