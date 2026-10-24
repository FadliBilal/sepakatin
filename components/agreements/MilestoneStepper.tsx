"use client";

import React from "react";
import { Check, CheckCircle2, AlertTriangle, Clock, ShieldCheck } from "lucide-react";
import { AgreementRecord } from "@/lib/types";

export type AgreementTabId = "document" | "signatures" | "meterai" | "final" | "changes" | "audit";

export interface MilestoneStepperProps {
  agreement: AgreementRecord;
  activeTab: AgreementTabId;
  setActiveTab: (tab: AgreementTabId) => void;
  bothSigned: boolean;
  signedCount: number;
  stampedCount: number;
  isUnder5Million: boolean;
  isSentToClient: boolean;
}

/**
 * Milestone Progress Ribbon: Indikator tahapan status dokumen kesepakatan
 * dari pembuatan draf hingga sah & berkekuatan hukum penuh.
 */
export function MilestoneStepper({
  agreement,
  activeTab,
  setActiveTab,
  bothSigned,
  signedCount,
  stampedCount,
  isUnder5Million,
  isSentToClient,
}: MilestoneStepperProps) {
  const steps = [
    {
      id: "document" as AgreementTabId,
      stepNum: 1,
      title: "1. Draf Dokumen",
      desc:
        agreement.status === "CHANGES_REQUESTED"
          ? "Klien Minta Revisi"
          : bothSigned
          ? "Disepakati Bersama"
          : isSentToClient
          ? "Terkirim ke Klien"
          : "Draf Baru",
      statusText:
        agreement.status === "CHANGES_REQUESTED"
          ? "Ada Revisi"
          : isSentToClient || bothSigned
          ? "Selesai"
          : "Aktif",
      isComplete: (isSentToClient || bothSigned) && agreement.status !== "CHANGES_REQUESTED",
      isActive: activeTab === "document",
    },
    {
      id: "signatures" as AgreementTabId,
      stepNum: 2,
      title: "2. Tanda Tangan",
      desc: bothSigned
        ? "Sah & Mengikat (2/2 TTD)"
        : signedCount === 1
        ? "1/2 Bertanda Tangan"
        : "Menunggu TTD",
      statusText: bothSigned ? "Sah" : signedCount === 1 ? "1/2 TTD" : "Perlu TTD",
      isComplete: bothSigned,
      isActive: activeTab === "signatures",
    },
    {
      id: "meterai" as AgreementTabId,
      stepNum: 3,
      title: "3. e-Meterai (Opsional)",
      desc:
        stampedCount === 2
          ? "2/2 Berkas Diunggah"
          : stampedCount === 1
          ? "1/2 Berkas Diunggah"
          : isUnder5Million
          ? "Bebas Bea (≤ Rp5 Juta)"
          : "Penguat Bukti Perdata",
      statusText:
        stampedCount > 0
          ? `${stampedCount}/2 Meterai`
          : isUnder5Million
          ? "Bebas Bea"
          : "Opsional",
      isComplete: stampedCount > 0 || (bothSigned && isUnder5Million),
      isActive: activeTab === "meterai",
    },
    {
      id: "final" as AgreementTabId,
      stepNum: 4,
      title: "4. Sah & Mengikat",
      desc: bothSigned
        ? stampedCount === 2
          ? "Sah Penuh + 2 e-Meterai"
          : "Sah & Mengikat Penuh"
        : "Menunggu Tanda Tangan",
      statusText: bothSigned ? "Sah Penuh" : "Menunggu",
      isComplete: bothSigned,
      isActive: activeTab === "final",
    },
  ];

  return (
    <div className="card p-4 sm:p-5 mb-6 border border-[#E8E8EC] bg-white">
      {/* Header Baris Status & Tombol Tab Pintasan */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-[#E8E8EC]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Status Alur Dokumen:
          </span>
          {agreement.status === "COMPLETED" ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" /> Proyek Selesai &amp; Diarsipkan
            </span>
          ) : bothSigned ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" /> Sah &amp; Mengikat (KUHPerdata 1320 &amp; UU ITE) · Proyek Siap Berjalan
              {stampedCount > 0 && (
                <span className="ml-1 text-[11px] font-normal text-emerald-600">
                  (+ e-Meterai {stampedCount}/2)
                </span>
              )}
            </span>
          ) : agreement.status === "CHANGES_REQUESTED" ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
              <AlertTriangle className="w-3.5 h-3.5" /> Klien Mengajukan Perubahan · Perlu Tindak Lanjut
            </span>
          ) : isSentToClient ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
              <Clock className="w-3.5 h-3.5" /> Menunggu Persetujuan &amp; Tanda Tangan Klien
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
              Draf Baru · Tinjau &amp; Kirim ke Klien
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab("changes")}
            className={`text-xs px-3 py-1.5 rounded-md border transition-all inline-flex items-center gap-1.5 ${
              activeTab === "changes"
                ? "border-brand-500 bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-400 font-semibold"
                : "border-[#E8E8EC] bg-white text-[#6B6B6B] hover:bg-slate-50 hover:text-[#0A0A0A] font-medium"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Permintaan Perubahan</span>
            {agreement.changeRequests.length > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                {agreement.changeRequests.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("audit")}
            className={`text-xs px-3 py-1.5 rounded-md border transition-all inline-flex items-center gap-1.5 ${
              activeTab === "audit"
                ? "border-brand-500 bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-400 font-semibold"
                : "border-[#E8E8EC] bg-white text-[#6B6B6B] hover:bg-slate-50 hover:text-[#0A0A0A] font-medium"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Riwayat &amp; Audit</span>
          </button>
        </div>
      </div>

      {/* 4 Milestones */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
        {steps.map((item) => (
          <button
            key={item.title}
            type="button"
            onClick={() => setActiveTab(item.id)}
            className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
              item.isActive
                ? "border-brand-500 bg-brand-50/70 shadow-sm ring-1 ring-brand-400"
                : item.isComplete
                ? "border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50/70"
                : "border-[#E8E8EC] bg-white hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  item.isComplete
                    ? "bg-emerald-600 text-white"
                    : item.isActive
                    ? "bg-brand-600 text-white"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {item.isComplete ? <Check className="w-3 h-3 stroke-[3]" /> : item.stepNum}
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  item.isComplete
                    ? "bg-emerald-100 text-emerald-800"
                    : item.isActive
                    ? "bg-brand-100 text-brand-800"
                    : "bg-slate-100 text-[#6B6B6B]"
                }`}
              >
                {item.statusText}
              </span>
            </div>
            <div>
              <p className="font-display text-xs font-bold text-[#0A0A0A] leading-tight">{item.title}</p>
              <p className="text-[11px] text-[#6B6B6B] truncate mt-0.5">{item.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
