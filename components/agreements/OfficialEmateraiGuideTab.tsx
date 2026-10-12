"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Trash2,
  Info,
  ArrowRight,
} from "lucide-react";
import { AgreementRecord, ContractContentJSON, StampedDocumentRecord } from "@/lib/types";
import { formatCurrencyIDR } from "@/lib/crypto";

export interface OfficialEmateraiGuideTabProps {
  agreement: AgreementRecord;
  content: ContractContentJSON;
  bothSigned: boolean;
  stampedCount: number;
  isUnder5Million: boolean;
  freelancerStampedDoc?: StampedDocumentRecord;
  clientStampedDoc?: StampedDocumentRecord;
  isUploadingDoc: string | null;
  isDownloadingDoc: string | null;
  copiedWaText: boolean;
  copiedLink: boolean;
  waMessage: string;
  onDocumentPdfUpload: (copyType: "freelancer_copy" | "client_copy", e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onRemoveStampedDoc: (copyType: "freelancer_copy" | "client_copy") => void;
  onDownloadDoc: (doc: StampedDocumentRecord) => Promise<void>;
  onCompleteAgreement: () => void;
  onCopyWhatsAppMessage: () => void;
  onCopyReviewUrl: () => void;
  onSwitchToFinalTab?: () => void;
}

/**
 * Tab 3: e-Meterai Resmi Peruri (Opsional)
 * Panduan ringkas 3 langkah untuk membubuhkan e-Meterai resmi Peruri Rp10.000
 * bagi pengguna yang menghendaki kekuatan bukti perdata tambahan.
 */
export function OfficialEmateraiGuideTab({
  agreement,
  content,
  stampedCount,
  isUnder5Million,
  freelancerStampedDoc,
  clientStampedDoc,
  isUploadingDoc,
  onDocumentPdfUpload,
  onRemoveStampedDoc,
  onDownloadDoc,
  onSwitchToFinalTab,
}: OfficialEmateraiGuideTabProps) {
  return (
    <div className="space-y-6">
      <div className="card p-6 sm:p-8 space-y-6">
        {/* Header Tab */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Pembubuhan e-Meterai Resmi Peruri</h2>
              <span className="text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
                {isUnder5Million ? "Opsional (Bebas Bea ≤ Rp5 Juta)" : "Penguat Bukti Perdata (Opsional)"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {isUnder5Million
                ? "Nilai proyek ≤ Rp5 Juta bebas bea meterai dan sah mengikat digital. Langkah ini hanya opsional jika menghendaki cap Peruri."
                : "Dokumen sah sejak kedua pihak bertanda tangan. e-Meterai menyempurnakan dokumen sebagai alat bukti formal di pengadilan."}
            </p>
          </div>
          {stampedCount === 2 ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full self-start flex-shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" /> 2/2 e-Meterai Lengkap
            </span>
          ) : stampedCount === 1 ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full self-start flex-shrink-0">
              <Clock className="w-3.5 h-3.5" /> 1/2 Salinan Diunggah
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full self-start flex-shrink-0">
              0/2 Salinan Diunggah (Opsional)
            </span>
          )}
        </div>

        {/* Status Bea Meterai Ringkas */}
        {isUnder5Million ? (
          <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-950">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-900">
                Bebas Bea Meterai (UU No. 10/2020 Pasal 7)
              </p>
              <p className="mt-0.5 text-emerald-800 leading-relaxed">
                Nilai proyek <strong>{formatCurrencyIDR(content.payment.totalValue)}</strong> tidak melampaui batas Rp5.000.000, sehingga <strong>tidak terutang bea meterai</strong>. Tanda tangan digital Anda sudah berkekuatan hukum penuh.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 flex items-start gap-2.5 text-xs text-blue-950">
            <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-blue-900">
                Rekomendasi e-Meterai Resmi (Nilai &gt; Rp5 Juta)
              </p>
              <p className="mt-0.5 text-blue-800 leading-relaxed">
                Disarankan membubuhkan e-Meterai Rp10.000 resmi Peruri pada kedua salinan dokumen untuk memenuhi ketentuan bea meterai.
              </p>
            </div>
          </div>
        )}

        {/* Tips Profesional Biaya Meterai */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-xs text-slate-700">
          <Info className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-slate-900">Tips Profesional Pembelian:</strong> Anda disarankan membeli &amp; memproses kedua e-meterai (total Rp20.000), lalu memasukkannya ke tagihan DP/invoice klien agar proses dengan klien tetap cepat tanpa klien perlu repot mendaftar ke portal distributor.
          </div>
        </div>

        {/* 3 Langkah Ringkas */}
        <div className="space-y-4 pt-1">
          {/* LANGKAH 1 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold">1</span>
              <h3 className="text-sm font-bold text-slate-900">Unduh Format Siap Meterai</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-7">
              <div className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">Salinan Freelancer</p>
                  <p className="text-[11px] text-slate-500">Meterai di kolom tanda tangan Klien</p>
                </div>
                <Link
                  href={`/agreements/${agreement.id}/print?copy=freelancer_copy&for_stamping=true`}
                  target="_blank"
                  className="btn btn-secondary btn-sm text-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  Unduh
                </Link>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">Salinan Klien</p>
                  <p className="text-[11px] text-slate-500">Meterai di kolom tanda tangan Freelancer</p>
                </div>
                <Link
                  href={`/agreements/${agreement.id}/print?copy=client_copy&for_stamping=true`}
                  target="_blank"
                  className="btn btn-secondary btn-sm text-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  Unduh
                </Link>
              </div>
            </div>
          </div>

          {/* LANGKAH 2 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold">2</span>
              <h3 className="text-sm font-bold text-slate-900">Beli &amp; Tempel di Portal Resmi Peruri</h3>
            </div>
            <div className="pl-7 flex flex-wrap items-center gap-2">
              <a
                href="https://e-meterai.co.id/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm text-xs inline-flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                e-meterai.co.id (Peruri)
              </a>
              <a
                href="https://emeterai.posfin.id/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm text-xs inline-flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Pos Fin (PT Pos Indonesia)
              </a>
            </div>
          </div>

          {/* LANGKAH 3 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold">3</span>
              <h3 className="text-sm font-bold text-slate-900">Unggah Kembali Dokumen Bermeterai</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-7">
              {/* Slot 1: Salinan Freelancer */}
              <div className="p-3 rounded-lg border border-slate-200 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Salinan Freelancer</span>
                  {freelancerStampedDoc ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Tersimpan</span>
                  ) : (
                    <span className="text-[10px] text-slate-400">Belum Ada</span>
                  )}
                </div>
                {freelancerStampedDoc ? (
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => onDownloadDoc(freelancerStampedDoc)}
                      className="btn btn-secondary btn-sm text-xs"
                    >
                      <Download className="w-3 h-3" /> Unduh Berkas
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveStampedDoc("freelancer_copy")}
                      className="text-xs text-rose-600 hover:text-rose-700 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(e) => onDocumentPdfUpload("freelancer_copy", e)}
                      disabled={isUploadingDoc === "freelancer_copy"}
                      className="block w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer"
                    />
                    {isUploadingDoc === "freelancer_copy" && (
                      <p className="text-[11px] text-brand-600 mt-1 animate-pulse">Mengunggah...</p>
                    )}
                  </div>
                )}
              </div>

              {/* Slot 2: Salinan Klien */}
              <div className="p-3 rounded-lg border border-slate-200 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Salinan Klien</span>
                  {clientStampedDoc ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Tersimpan</span>
                  ) : (
                    <span className="text-[10px] text-slate-400">Belum Ada</span>
                  )}
                </div>
                {clientStampedDoc ? (
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => onDownloadDoc(clientStampedDoc)}
                      className="btn btn-secondary btn-sm text-xs"
                    >
                      <Download className="w-3 h-3" /> Unduh Berkas
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveStampedDoc("client_copy")}
                      className="text-xs text-rose-600 hover:text-rose-700 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(e) => onDocumentPdfUpload("client_copy", e)}
                      disabled={isUploadingDoc === "client_copy"}
                      className="block w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    />
                    {isUploadingDoc === "client_copy" && (
                      <p className="text-[11px] text-blue-600 mt-1 animate-pulse">Mengunggah...</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tombol Lanjut ke Tab Final */}
        {onSwitchToFinalTab && (
          <div className="pt-2 border-t border-slate-200 flex justify-end">
            <button
              type="button"
              onClick={onSwitchToFinalTab}
              className="btn btn-primary btn-sm text-xs inline-flex items-center gap-1.5"
            >
              <span>Lanjut ke Tab 4: Sah &amp; Mengikat Penuh</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
