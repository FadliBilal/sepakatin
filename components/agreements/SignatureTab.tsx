"use client";

import React from "react";
import Link from "next/link";
import {
  Check,
  CheckCircle2,
  Clock,
  Printer,
  ShieldCheck,
  ArrowRight,
  AlertTriangle,
  PenTool,
  Send,
  Copy,
  MessageSquare,
} from "lucide-react";
import { AgreementRecord, ContractContentJSON, VisualSignature } from "@/lib/types";
import { SignaturePad } from "@/components/SignaturePad";
import { formatCurrencyIDR, formatDateTimeID } from "@/lib/crypto";

export interface SignatureTabProps {
  agreement: AgreementRecord;
  content: ContractContentJSON;
  bothSigned: boolean;
  signedCount: number;
  isUnder5Million: boolean;
  isSentToClient: boolean;
  canSign: boolean;
  freelancerSig?: VisualSignature;
  clientSig?: VisualSignature;
  freelancerApproval?: AgreementRecord["approvals"][number];
  clientApproval?: AgreementRecord["approvals"][number];
  isClientSigned: boolean;
  isEditingSignature: boolean;
  setIsEditingSignature: (val: boolean) => void;
  isSavingSignature: boolean;
  isApproving: boolean;
  copiedLink: boolean;
  copiedWaText: boolean;
  onSaveFreelancerSignature: (dataUrl: string) => Promise<void>;
  onSendToClient: () => void;
  onApproveClick: () => void;
  onCopyReviewUrl: () => void;
  onCopyWhatsAppMessage: () => void;
  onSwitchToMeteraiTab: () => void;
}

/**
 * Tab Tanda Tangan: Mengelola tanda tangan digital pihak freelancer dan klien,
 * verifikasi keabsahan pasal 1320 KUHPerdata & UU ITE, serta audit forensik persetujuan.
 */
export function SignatureTab({
  agreement,
  content,
  bothSigned,
  signedCount,
  isUnder5Million,
  isSentToClient,
  canSign,
  freelancerSig,
  clientSig,
  freelancerApproval,
  clientApproval,
  isClientSigned,
  isEditingSignature,
  setIsEditingSignature,
  isSavingSignature,
  isApproving,
  copiedLink,
  copiedWaText,
  onSaveFreelancerSignature,
  onSendToClient,
  onApproveClick,
  onCopyReviewUrl,
  onCopyWhatsAppMessage,
  onSwitchToMeteraiTab,
}: SignatureTabProps) {
  return (
    <div className="space-y-5">
      <div className="card p-6 space-y-4">
        {/* Header Tab */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Tanda Tangan Digital &amp; Persetujuan Kedua Pihak
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Sesuai hukum perdata (KUHPerdata Pasal 1320) &amp; UU ITE No. 1/2024: Dokumen sah mengikat saat kedua pihak membubuhkan tanda tangan dan persetujuan digital.
            </p>
          </div>
          {bothSigned ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full self-start">
              <CheckCircle2 className="w-3.5 h-3.5" /> 2/2 Pihak Lengkap Bertanda Tangan
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full self-start">
              <Clock className="w-3.5 h-3.5" /> Menunggu Tanda Tangan Lengkap ({signedCount}/2)
            </span>
          )}
        </div>

        {/* Banner Status Sah Konsensus */}
        {bothSigned ? (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-900">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold text-emerald-950 text-sm">Kesepakatan Sah &amp; Mengikat Secara Hukum!</p>
                <p className="text-emerald-800 leading-relaxed">
                  Sesuai Pasal 1320 KUHPerdata &amp; UU ITE No. 1/2024, kesepakatan ini telah sah mengikat kedua belah pihak sejak ditandatangani. Pengerjaan proyek dapat segera dimulai!
                </p>
                {isUnder5Million ? (
                  <p className="text-emerald-700 text-[11px] pt-1 flex items-center gap-1 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Total nilai proyek {formatCurrencyIDR(content.payment.totalValue)} (≤ Rp5 Juta) bebas Bea Meterai berdasarkan UU No. 10/2020 Pasal 7.
                  </p>
                ) : (
                  <p className="text-slate-600 text-[11px] pt-1">
                    Untuk nilai proyek di atas Rp5 Juta, Anda dapat membubuhkan e-Meterai resmi Peruri di Tab 3 sebagai penguat alat bukti perdata di persidangan jika diperlukan.
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 flex-shrink-0 self-start sm:self-center">
              <Link
                href={`/agreements/${agreement.id}/print`}
                target="_blank"
                className="btn btn-secondary btn-sm text-xs w-full sm:w-auto"
              >
                <Printer className="w-3.5 h-3.5" />
                Unduh PDF
              </Link>
              <button
                type="button"
                onClick={onSwitchToMeteraiTab}
                className="btn btn-primary btn-sm text-xs w-full sm:w-auto"
              >
                {isUnder5Million ? "e-Meterai (Opsional)" : "Lanjut ke e-Meterai"}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : !isSentToClient ? (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-950">Kesepakatan Masih Draf</p>
              <p className="mt-0.5">
                Kirimkan kesepakatan terlebih dahulu ke klien melalui tab <strong>1. Draf Dokumen</strong> agar tautan review dan penandatanganan klien dapat aktif.
              </p>
            </div>
          </div>
        ) : null}

        {/* Banner Pembaruan Versi Baru (Amandemen / Revisi) */}
        {agreement.status === "PENDING_APPROVAL" && !bothSigned && (
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-2.5 text-xs text-blue-900">
            <Clock className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-blue-950">
                Pembaruan Versi {agreement.currentVersionNumber} Menunggu Persetujuan &amp; Tanda Tangan Ulang
              </p>
              <p className="mt-0.5 text-blue-800 leading-relaxed">
                Karena ada penyesuaian klausul atau amandemen ruang lingkup pada Versi {agreement.currentVersionNumber}, tanda tangan sebelumnya di-reset sesuai hukum agar sah mengikat klausul baru ini. Silakan bubuhkan tanda tangan Anda dan minta pihak klien menyetujui ulang via tautan review.
              </p>
            </div>
          </div>
        )}

        {/* Grid 2 Kotak Tanda Tangan */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2">
          {/* Kotak Freelancer */}
          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Pihak Pertama</span>
                <h4 className="text-sm font-bold text-slate-900">Tanda Tangan Anda (Freelancer)</h4>
              </div>
              {freelancerSig ? (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3" /> Sudah TTD
                </span>
              ) : freelancerApproval ? (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3" /> Sudah Setuju
                </span>
              ) : (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100/80 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Belum TTD
                </span>
              )}
            </div>

            <div className="text-xs text-slate-600 space-y-0.5">
              <p className="font-semibold text-slate-800 text-sm">{content.freelancer.name}</p>
              <p className="text-slate-500">{content.freelancer.email}</p>
            </div>

            {freelancerSig && !isEditingSignature ? (
              <div className="p-3 bg-white rounded-lg border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">Goresan Tanda Tangan:</span>
                  {canSign && (
                    <button
                      type="button"
                      onClick={() => setIsEditingSignature(true)}
                      className="text-xs font-medium text-brand-600 hover:underline inline-flex items-center gap-1"
                    >
                      <PenTool className="w-3 h-3" /> Tanda Tangan Ulang
                    </button>
                  )}
                </div>
                <div className="p-2 bg-slate-50 rounded border border-slate-200 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={freelancerSig.signatureDataUrl}
                    alt="Tanda tangan freelancer"
                    className="max-h-16 w-auto object-contain"
                  />
                </div>
              </div>
            ) : !canSign ? (
              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5 text-xs">
                <p className="text-slate-500 leading-relaxed">
                  Dokumen sudah dikunci, sehingga goresan tanda tangan tidak bisa diubah lagi. Persetujuan Anda tercatat sah pada sistem.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[11px] text-slate-500">Goreskan tanda tangan Anda, lalu simpan:</p>
                <SignaturePad
                  signerName={content.freelancer.name}
                  onSave={onSaveFreelancerSignature}
                  confirmLabel="Simpan Tanda Tangan"
                  isSaving={isSavingSignature}
                />
                {isEditingSignature && (
                  <button
                    type="button"
                    onClick={() => setIsEditingSignature(false)}
                    className="btn btn-ghost btn-sm text-xs text-slate-500"
                  >
                    Batal
                  </button>
                )}
              </div>
            )}

            {/* Audit Approval Freelancer */}
            <div className="pt-2 border-t border-slate-200 text-xs">
              {freelancerApproval ? (
                <div className="space-y-1 text-slate-600">
                  <p className="font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Disetujui sah pada {formatDateTimeID(freelancerApproval.approvedAt)}
                  </p>
                  {freelancerApproval.ipAddress && (
                    <p className="text-slate-400">IP: {freelancerApproval.ipAddress}</p>
                  )}
                </div>
              ) : !isSentToClient ? (
                <button onClick={onSendToClient} className="btn btn-primary btn-sm w-full">
                  <Send className="w-4 h-4" />
                  Kirim ke Klien Sekarang
                </button>
              ) : (
                <button
                  onClick={onApproveClick}
                  disabled={isApproving}
                  className="btn btn-primary btn-sm w-full"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isApproving ? "Menyimpan..." : "Setujui Kesepakatan Sekarang"}
                </button>
              )}
            </div>
          </div>

          {/* Kotak Klien */}
          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Pihak Kedua</span>
                <h4 className="text-sm font-bold text-slate-900">Tanda Tangan Klien</h4>
              </div>
              {isClientSigned ? (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3" /> Sudah Menyetujui
                </span>
              ) : (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100/80 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Belum TTD
                </span>
              )}
            </div>

            <div className="text-xs text-slate-600 space-y-0.5">
              <p className="font-semibold text-slate-800 text-sm">{content.client.name}</p>
              <p className="text-slate-500">{content.client.email}</p>
            </div>

            {isClientSigned ? (
              <div className="p-3 bg-white rounded-lg border border-emerald-200 space-y-2">
                <p className="text-xs font-semibold text-slate-700">Goresan Tanda Tangan Klien:</p>
                {clientSig?.signatureDataUrl ? (
                  <div className="p-2 bg-slate-50 rounded border border-slate-200 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={clientSig.signatureDataUrl}
                      alt="TTD Klien"
                      className="max-h-16 w-auto object-contain"
                    />
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 p-2 bg-slate-50 rounded border border-slate-200">
                    Disetujui secara digital dengan verifikasi token rahasia.
                  </p>
                )}
              </div>
            ) : (
              <div className="p-4 bg-white rounded-lg border border-amber-200 space-y-2.5 text-xs">
                <p className="text-slate-600">
                  Klien menandatangani dan menyetujui dokumen melalui link peninjauan rahasia mereka:
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <button onClick={onCopyReviewUrl} className="btn btn-primary btn-sm flex-1 w-full text-xs">
                    {copiedLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedLink ? "Link Tersalin!" : "Salin Link Klien"}
                  </button>
                  <button onClick={onCopyWhatsAppMessage} className="btn btn-whatsapp btn-sm flex-1 w-full text-xs">
                    {copiedWaText ? <Check className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />}
                    {copiedWaText ? "Pesan Tersalin!" : "Salin Pesan WA"}
                  </button>
                </div>
              </div>
            )}

            {/* Audit Approval Klien */}
            <div className="pt-2 border-t border-slate-200 text-xs">
              {clientApproval ? (
                <div className="space-y-1 text-slate-600">
                  <p className="font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Disetujui pada {formatDateTimeID(clientApproval.approvedAt)}
                  </p>
                  {clientApproval.ipAddress && (
                    <p className="text-slate-400">IP: {clientApproval.ipAddress}</p>
                  )}
                </div>
              ) : (
                <p className="text-slate-400 text-xs">Klien belum membuka atau menyetujui dokumen ini.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
