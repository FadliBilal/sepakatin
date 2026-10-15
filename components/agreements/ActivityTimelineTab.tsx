"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";
import { ActivityLogItem, AgreementVersion } from "@/lib/types";
import { formatDateID, formatDateTimeID } from "@/lib/crypto";

export interface ActivityTimelineTabProps {
  versions: AgreementVersion[];
  activityLogs: ActivityLogItem[];
  selectedVersionNum?: number;
  onSelectVersion?: (versionNum: number) => void;
}

const EVENT_LABELS: Record<ActivityLogItem["eventType"], string> = {
  CREATED: "Dibuat",
  SENT_TO_CLIENT: "Dikirim ke klien",
  VIEWED_BY_CLIENT: "Dibuka klien",
  CHANGE_REQUESTED: "Minta perubahan",
  VERSION_BUMPED: "Pembaruan",
  FREELANCER_APPROVED: "Freelancer",
  CLIENT_APPROVED: "Klien",
  AGREED_LOCKED: "Disepakati",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

/**
 * Tab Riwayat & Catatan Aktivitas: Menampilkan daftar seluruh versi dokumen yang pernah
 * diterbitkan serta jejak kronologis aktivitas audit dokumen.
 */
export function ActivityTimelineTab({
  versions,
  activityLogs,
  selectedVersionNum,
  onSelectVersion,
}: ActivityTimelineTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Kolom Kiri: Riwayat Versi Dokumen */}
      <div className="card p-6">
        <h2 className="card-title mb-4">Versi Dokumen</h2>
        <div className="space-y-2">
          {versions.map((v) => {
            const isSelected = selectedVersionNum === v.versionNumber;
            const isLatest = v.versionNumber === versions[versions.length - 1]?.versionNumber;
            return (
              <div
                key={v.id}
                onClick={() => onSelectVersion?.(v.versionNumber)}
                className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                  isSelected
                    ? "bg-brand-50/70 border-brand-300 ring-1 ring-brand-400"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100/70 cursor-pointer"
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-slate-900">Versi {v.versionNumber}</p>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isLatest
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {isLatest ? "Aktif" : "Riwayat"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{formatDateID(v.createdAt)}</p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Hash Terverifikasi
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Kolom Kanan: Catatan Kronologis Aktivitas */}
      <div className="card p-6 lg:col-span-2">
        <h2 className="card-title mb-4">Catatan Aktivitas</h2>
        {activityLogs.length === 0 ? (
          <p className="text-sm text-slate-400 italic">Belum ada riwayat aktivitas tercatat.</p>
        ) : (
          <ol className="relative border-l-2 border-slate-100 ml-2 space-y-5">
            {[...activityLogs].reverse().map((log) => (
              <li key={log.id} className="pl-5 relative">
                <span className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-brand-600 ring-4 ring-white" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full self-start border border-brand-200/60">
                    {EVENT_LABELS[log.eventType] ?? "Aktivitas"}
                  </span>
                  <span className="text-xs text-slate-400">{formatDateTimeID(log.createdAt)}</span>
                </div>
                <p className="text-sm text-slate-700 mt-1.5 leading-relaxed">{log.description}</p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
