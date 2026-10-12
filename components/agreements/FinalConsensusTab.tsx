"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Download,
  ExternalLink,
  MessageSquare,
  Copy,
  Check,
  FileText,
} from "lucide-react";
import { AgreementRecord, ContractContentJSON } from "@/lib/types";
import { formatDateTimeID } from "@/lib/crypto";

export interface FinalConsensusTabProps {
  agreement: AgreementRecord;
  content: ContractContentJSON;
  bothSigned: boolean;
  stampedCount: number;
  isUnder5Million: boolean;
  onCompleteAgreement: () => void;
  onCopyWhatsAppMessage: () => void;
  onCopyReviewUrl: () => void;
  copiedWaText: boolean;
  copiedLink: boolean;
  waMessage: string;
}

/**
 * Tab 4: Sah & Mengikat Penuh
 * Tab mandiri yang memuat status konsensus akhir, unduhan 2 salinan PDF,
 * tautan verifikasi publik, pesan WhatsApp klien, dan penyelesaian proyek.
 */
export function FinalConsensusTab({
  agreement,
  content,
  bothSigned,
  stampedCount,
  isUnder5Million,
  onCompleteAgreement,
  onCopyWhatsAppMessage,
  onCopyReviewUrl,
  copiedWaText,
  copiedLink,
  waMessage,
}: FinalConsensusTabProps) {
  const freelancerApproval = agreement.approvals.find(
    (a) => a.versionId === agreement.currentVersion.id && a.role === "freelancer" && a.status === "APPROVED"
  );
  const clientApproval = agreement.approvals.find(
    (a) => a.versionId === agreement.currentVersion.id && a.role === "client" && a.status === "APPROVED"
  );

  return (
    <div className="space-y-6">
      <div className="card p-6 sm:p-8 space-y-6">
        {/* Banner Utama Status Sah */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/60 to-emerald-50 border-2 border-emerald-300 text-emerald-950 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-emerald-950">
                  {bothSigned ? "Kesepakatan Sah & Mengikat Penuh" : "Menunggu Konsensus Kedua Pihak"}
                </h2>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {isUnder5Million ? "Bebas Bea Meterai (≤ Rp5 Juta)" : stampedCount === 2 ? "2/2 e-Meterai Resmi" : "Sah UU ITE & KUHPerdata"}
                </span>
              </div>
              <p className="text-xs text-emerald-900 mt-1 leading-relaxed max-w-2xl">
                {bothSigned
                  ? `Kedua belah pihak (${content.freelancer.name} & ${content.client.name}) telah resmi menyetujui dan menandatangani dokumen ini. Kesepakatan sah mengikat secara hukum perdata (Pasal 1320 KUHPerdata & UU ITE No. 1/2024).`
                  : "Dokumen ini akan terkunci otomatis dan sah mengikat penuh begitu kedua belah pihak membubuhkan tanda tangan."}
              </p>
            </div>
          </div>

          {bothSigned && agreement.status !== "COMPLETED" && (
            <button
              type="button"
              onClick={onCompleteAgreement}
              className="btn btn-primary btn-sm flex-shrink-0 self-start md:self-center text-xs"
              title="Tandai proyek telah selesai setelah pekerjaan diserahkan"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Tandai Proyek Selesai
            </button>
          )}
        </div>

        {/* 1. Unduh Dokumen Resmi */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-brand-600" />
                Unduh Salinan Dokumen Sah (PDF)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pilih salinan yang ingin Anda buka atau simpan sebagai dokumen PDF resmi:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Salinan Freelancer */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:border-brand-300 transition-all space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Pihak Pertama
                  </span>
                  <span className="text-[10px] font-semibold text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-full">
                    Arsip Freelancer
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">Salinan Dokumen Freelancer</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Format resmi untuk arsip pribadi freelancer lengkap dengan tanda tangan kedua pihak dan segel verifikasi.
                </p>
              </div>
              <Link
                href={`/agreements/${agreement.id}/print?copy=freelancer_copy`}
                target="_blank"
                className="btn btn-primary btn-sm w-full text-xs justify-center"
              >
                <Download className="w-3.5 h-3.5" />
                Buka / Unduh Salinan Freelancer
              </Link>
            </div>

            {/* Salinan Klien */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:border-blue-300 transition-all space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Pihak Kedua
                  </span>
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                    Untuk Klien
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">Salinan Dokumen Klien</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Salinan resmi untuk klien ({content.client.name}) yang juga dapat diunduh langsung lewat tautan review klien.
                </p>
              </div>
              <Link
                href={`/agreements/${agreement.id}/print?copy=client_copy`}
                target="_blank"
                className="btn btn-secondary btn-sm w-full text-xs justify-center"
              >
                <Download className="w-3.5 h-3.5" />
                Buka / Unduh Salinan Klien
              </Link>
            </div>
          </div>
        </div>

        {/* 2. Bagikan ke Klien via WhatsApp */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              Kirimkan Bukti Kesepakatan Sah ke Klien ({content.client.name})
            </span>
            <div className="flex items-center gap-2">
              <button onClick={onCopyWhatsAppMessage} className="btn btn-whatsapp btn-sm text-xs">
                {copiedWaText ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedWaText ? "Pesan Tersalin!" : "Salin Pesan WA"}
              </button>
              <button onClick={onCopyReviewUrl} className="btn btn-secondary btn-sm text-xs">
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedLink ? "Link Tersalin!" : "Salin Link"}
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-600 whitespace-pre-wrap bg-slate-50 p-3 rounded-lg border border-slate-200 font-sans leading-relaxed">
            {waMessage}
          </p>
        </div>

        {/* 3. Ringkasan Forensik & Verifikasi Publik */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              Jejak Forensik Konsensus &amp; Keaslian Publik
            </h4>
            <Link
              href={`/verify/${agreement.contractId}`}
              target="_blank"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
            >
              Cek Halaman Verifikasi Publik
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <span className="text-slate-400 block text-[11px]">Nomor Dokumen</span>
              <span className="font-bold text-slate-900 font-mono">{agreement.contractId}</span>
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <span className="text-slate-400 block text-[11px]">Persetujuan Freelancer</span>
              <span className="font-semibold text-emerald-700">
                {freelancerApproval ? formatDateTimeID(freelancerApproval.approvedAt) : "Sudah Bertanda Tangan"}
              </span>
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <span className="text-slate-400 block text-[11px]">Persetujuan Klien</span>
              <span className="font-semibold text-emerald-700">
                {clientApproval ? formatDateTimeID(clientApproval.approvedAt) : "Sudah Bertanda Tangan"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
