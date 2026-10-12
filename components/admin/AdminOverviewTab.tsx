"use client";

import React from "react";
import { Users, FileText, Wallet, CheckCircle2 } from "lucide-react";
import { AdminPlatformStats } from "@/lib/store";
import { formatCurrencyIDR } from "@/lib/crypto";

export function AdminOverviewTab({ stats }: { stats: AdminPlatformStats | null }) {
  return (
    <div className="space-y-6">
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
  );
}
