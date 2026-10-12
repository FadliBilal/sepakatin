"use client";

import React from "react";
import Link from "next/link";
import { Search, Printer, ExternalLink, AlertTriangle } from "lucide-react";
import { AgreementRecord } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrencyIDR, formatDateID } from "@/lib/crypto";

export function AdminAgreementsTab({
  agreementsList,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  onModerate,
}: {
  agreementsList: AgreementRecord[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: string;
  setStatusFilter: (f: string) => void;
  onModerate: (agreementId: string, action: "cancel" | "delete") => void;
}) {
  const filteredAgreements = agreementsList.filter((a) => {
    const matchesSearch =
      a.contractId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.currentVersion.contentJson.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.currentVersion.contentJson.freelancer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.currentVersion.contentJson.client.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
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
                        onClick={() => onModerate(a.id, "cancel")}
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
  );
}
