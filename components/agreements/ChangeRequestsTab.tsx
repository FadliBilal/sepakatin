"use client";

import React from "react";
import { PlusCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import { ChangeRequest, ContractContentJSON } from "@/lib/types";
import { formatDateTimeID } from "@/lib/crypto";

export interface ChangeRequestsTabProps {
  changeRequests: ChangeRequest[];
  revisionContent: ContractContentJSON["revision"];
  onOpenNewVersionModal: () => void;
  agreementId?: string;
  isLocked?: boolean;
}

const CHANGE_STATUS: Record<string, { label: string; style: string }> = {
  OPEN: { label: "Menunggu ditindaklanjuti", style: "bg-amber-50 text-amber-800 border-amber-200" },
  APPLIED: { label: "Sudah diterapkan", style: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  REJECTED: { label: "Ditolak", style: "bg-rose-50 text-rose-700 border-rose-200" },
};

/**
 * Tab Permintaan Perubahan: Melacak seluruh permintaan revisi yang diajukan klien
 * secara transparan, membandingkannya dengan kuota revisi gratis yang disepakati,
 * dan mengedukasi pembuatan Addendum bila revisi telah melebihi batas.
 */
export function ChangeRequestsTab({
  changeRequests,
  revisionContent,
  onOpenNewVersionModal,
  isLocked,
}: ChangeRequestsTabProps) {
  const isOverLimit = changeRequests.length > revisionContent.count;
  const overCount = Math.max(0, changeRequests.length - revisionContent.count);

  return (
    <div className="card p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="card-title">Permintaan Perubahan dari Klien</h2>
          <p className="text-sm text-slate-500 mt-1">
            Semua permintaan perubahan tercatat secara tertulis, menghindari perselisihan ruang lingkup (*scope creep*).
          </p>
        </div>
        <button onClick={onOpenNewVersionModal} className="btn btn-primary btn-sm flex-shrink-0">
          <PlusCircle className="w-4 h-4" />
          {isLocked
            ? "Buat Amandemen (Versi Baru)"
            : isOverLimit
            ? "Buat Versi Baru (Penambahan Biaya)"
            : "Ubah Kesepakatan"}
        </button>
      </div>

      {/* Tracker Jatah Revisi & Aturan Hukum */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pemantauan Jatah Revisi
            </p>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-2xl font-extrabold text-slate-900">
                {changeRequests.length} / {revisionContent.count}
              </span>
              <span className="text-sm text-slate-600">revisi diajukan</span>
            </div>
          </div>
          <div>
            {!isOverLimit ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Dalam Jatah Kesepakatan
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Melebihi Jatah ({overCount}x di luar batas)
              </span>
            )}
          </div>
        </div>

        <div className="text-xs leading-relaxed p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
          {!isOverLimit ? (
            <p className="text-slate-600">
              <strong className="text-slate-900">Ketentuan:</strong> Revisi yang masih dalam jatah{" "}
              <strong>{revisionContent.count} kali</strong> cukup dicatat dan diselesaikan oleh freelancer{" "}
              <em>tanpa perlu menerbitkan dokumen baru bermeterai</em>.
            </p>
          ) : (
            <div className="space-y-1 text-amber-900">
              <p className="font-semibold text-amber-950 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 inline" /> Revisi Melebihi Batas Kesepakatan Awal:
              </p>
              <p>
                Karena revisi melebihi kuota awal <strong>{revisionContent.count} kali</strong>, revisi tambahan dikenakan biaya tambahan{" "}
                <strong>Rp{(revisionContent.extraRevisionRate || 0).toLocaleString("id-ID")}</strong> per revisi.
              </p>
              <p className="text-amber-800">
                Freelancer dapat membuat <strong>Amandemen / Versi Baru</strong> yang memuat penambahan biaya tersebut langsung pada kesepakatan ini untuk disahkan kembali.
              </p>
            </div>
          )}
        </div>
      </div>

      {changeRequests.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 p-10 text-center text-sm text-slate-500">
          Belum ada permintaan perubahan dari klien.
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 divide-y divide-slate-100">
          {changeRequests.map((cr) => {
            const st = CHANGE_STATUS[cr.status] ?? CHANGE_STATUS.OPEN;
            return (
              <div key={cr.id} className="p-4 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-slate-900">{cr.title}</h4>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${st.style}`}>
                    {st.label}
                  </span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{cr.description}</p>
                <p className="text-xs text-slate-400">
                  Dari {cr.requestedBy} · {formatDateTimeID(cr.createdAt)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
