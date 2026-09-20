"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { AgreementRecord, CopyType } from "@/lib/types";
import { QRCodeViewer } from "@/components/QRCodeViewer";
import { Logo } from "@/components/Logo";
import { StatusBadge } from "@/components/StatusBadge";
import {
  formatCurrencyIDR,
  formatDateID,
  formatDateTimeID,
} from "@/lib/crypto";

interface PrintableAgreementProps {
  agreement: AgreementRecord;
  backHref: string;
  backLabel: string;
}

/**
 * Surat kesepakatan versi cetak (A4). Margin tiap halaman dibuat oleh baris kosong di
 * <thead>/<tfoot> yang otomatis diulang browser di setiap kertas, jadi tetap rapi
 * apa pun pilihan "Margins" di dialog cetak.
 */
export function PrintableAgreement({ agreement, backHref, backLabel }: PrintableAgreementProps) {
  const [copyType, setCopyType] = useState<CopyType>(agreement.ematerai?.targetCopy ?? "freelancer_copy");

  const currentVersion = agreement.currentVersion;
  const content = currentVersion.contentJson;
  const approvals = agreement.approvals.filter((a) => a.versionId === currentVersion.id);
  const freelancerApproval = approvals.find((a) => a.role === "freelancer");
  const clientApproval = approvals.find((a) => a.role === "client");

  const freelancerVisualSig = agreement.signatures?.find((s) => s.signerRole === "freelancer");
  const clientVisualSig = agreement.signatures?.find((s) => s.signerRole === "client");

  const verifyUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/verify/${agreement.contractId}`
      : `https://sepakatin.id/verify/${agreement.contractId}`;

  return (
    <div className="bg-slate-100 min-h-screen py-8 print:py-0 print:bg-white text-slate-950">
      {/* Top Floating Print Controller (Hidden in Print) */}
      <div className="max-w-4xl mx-auto mb-6 px-4 flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
        <Link href={backHref} className="back-link">
          <ArrowLeft className="w-4 h-4" />
          {backLabel}
        </Link>

        {/* Copy Selector Buttons */}
        <div className="flex items-center gap-1 bg-white p-1 border border-slate-200 rounded-xl shadow-sm">
          <button
            onClick={() => setCopyType("freelancer_copy")}
            className={`tab py-2 ${copyType === "freelancer_copy" ? "tab-active" : "tab-idle"}`}
          >
            Salinan Freelancer
          </button>
          <button
            onClick={() => setCopyType("client_copy")}
            className={`tab py-2 ${copyType === "client_copy" ? "tab-active" : "tab-idle"}`}
          >
            Salinan Klien
          </button>
        </div>

        <button onClick={() => window.print()} className="btn btn-primary">
          <Printer className="w-4 h-4" />
          Cetak / Simpan PDF
        </button>
      </div>

      {/* A4 Sheet Paper Simulation */}
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-14 shadow-md border border-slate-200 rounded-2xl print-sheet print:rounded-none print:border-0 print:shadow-none print:max-w-none">
        <table className="w-full border-collapse border-0 print:table">
          <thead className="hidden print:table-header-group">
            <tr>
              <th className="h-0 print:h-3 border-0 p-0 m-0 font-normal"></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border-0 p-0 m-0 align-top">
                {/* DOCUMENT HEADER */}
        <div className="border-b-2 border-slate-950 pb-6 mb-8 print:pb-4 print:mb-5 flex items-start justify-between gap-6 print-keep">
          <div>
            <div className="mb-4">
              <Logo size="lg" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">
              Surat Kesepakatan Kerja
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Nomor dokumen: <strong className="text-brand-600">{content.contractId}</strong> · Versi <strong>{currentVersion.versionNumber}</strong>
            </p>
            <div className="inline-block mt-2 px-2.5 py-0.5 border border-slate-900 text-[10px] font-semibold rounded-full">
              {copyType === "freelancer_copy" ? "Salinan pihak pertama (Freelancer)" : "Salinan pihak kedua (Klien)"}
            </div>
          </div>

          <div className="text-right text-xs space-y-1.5 flex-shrink-0">
            <StatusBadge status={agreement.status} />
            <p className="text-[11px] text-slate-500">Tanggal: {formatDateID(agreement.createdAt)}</p>
          </div>
        </div>

        {/* PASAL 1: PARA PIHAK */}
        <div className="space-y-6 print:space-y-4 text-xs leading-relaxed">
          <section className="print-keep">
            <h2 className="font-bold text-slate-950 border-b border-slate-300 pb-1 mb-3">
              Pasal 1 · Para Pihak
            </h2>
            <p className="mb-3 text-slate-700">
              Surat kesepakatan ini dibuat dan disetujui secara sadar oleh kedua pihak berikut:
            </p>
            <div className="grid grid-cols-2 gap-6 p-4 border border-slate-200 bg-slate-50/60">
              <div className="space-y-1">
                <span className="font-bold text-[10px] text-slate-500 block">
                  Pihak Pertama (Freelancer)
                </span>
                <p><strong>Nama:</strong> {content.freelancer.name}</p>
                <p><strong>Email:</strong> {content.freelancer.email}</p>
                <p><strong>Keahlian:</strong> {content.freelancer.role || "Penyedia Jasa"}</p>
                {content.freelancer.phone && <p><strong>WhatsApp:</strong> {content.freelancer.phone}</p>}
              </div>

              <div className="space-y-1">
                <span className="font-bold text-[10px] text-slate-500 block">
                  Pihak Kedua (Klien)
                </span>
                <p><strong>Nama:</strong> {content.client.name}</p>
                <p><strong>Email:</strong> {content.client.email}</p>
                <p><strong>Perusahaan:</strong> {content.client.company || "-"}</p>
                {content.client.phone && <p><strong>WhatsApp:</strong> {content.client.phone}</p>}
              </div>
            </div>
          </section>

          {/* PASAL 2: RUANG LINGKUP & DELIVERABLES */}
          <section className="print-keep">
            <h2 className="font-bold text-slate-950 border-b border-slate-300 pb-1 mb-3">
              Pasal 2 · Pekerjaan yang Disepakati
            </h2>
            <p className="text-slate-800 mb-3">
              Pihak Pertama sepakat mengerjakan proyek <strong>&ldquo;{content.projectName}&rdquo;</strong> dengan gambaran sebagai berikut:
            </p>
            <p className="p-3 bg-slate-50 border border-slate-200 text-slate-700 italic mb-4">
              &ldquo;{content.scope.description}&rdquo;
            </p>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <span className="font-bold text-[11px] text-slate-950 block mb-1.5">
                  A. Hasil kerja yang diserahkan
                </span>
                <ul className="space-y-1 text-slate-800">
                  {content.scope.deliverables.map((d, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="font-bold">✓</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="font-bold text-[11px] text-slate-950 block mb-1.5">
                  B. Tidak termasuk
                </span>
                <ul className="space-y-1 text-slate-600">
                  {content.scope.exclusions.map((e, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="">•</span>
                      <span>{e}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* PASAL 3: HARGA & PEMBAYARAN */}
          <section>
            <h2 className="font-bold text-slate-950 border-b border-slate-300 pb-1 mb-3">
              Pasal 3 · Harga & Pembayaran
            </h2>
            <div className="flex items-center justify-between p-4 border border-slate-950 bg-slate-50 mb-3 print-keep">
              <div>
                <span className="text-[10px] text-slate-500 block">Total nilai proyek</span>
                <span className="text-xl font-bold text-slate-950">
                  {formatCurrencyIDR(content.payment.totalValue)}
                </span>
              </div>
              <div className="text-right text-[11px] space-y-0.5">
                <p>Uang Muka (DP): <strong>{content.payment.dpPercent}%</strong></p>
                <p>Pelunasan: <strong>{content.payment.finalPaymentDueDays} hari setelah serah terima</strong></p>
                <p>Cara bayar: <strong>{content.payment.paymentMethod}</strong></p>
              </div>
            </div>

            {content.payment.milestones && content.payment.milestones.length > 0 && (
              <div className="border border-slate-200 divide-y divide-slate-200 print-keep">
                {content.payment.milestones.map((m, idx) => (
                  <div key={idx} className="p-2.5 flex justify-between">
                    <span>Tahap {idx + 1}: {m.title}</span>
                    <span className="font-bold">{formatCurrencyIDR(m.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* PASAL 4: KUOTA REVISI & JADWAL */}
          <section className="print-keep">
            <h2 className="font-bold text-slate-950 border-b border-slate-300 pb-1 mb-3">
              Pasal 4 · Revisi & Jadwal
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <p><strong>Jatah revisi gratis:</strong> {content.revision.count} kali</p>
                <p className="text-slate-600">{content.revision.terms}</p>
                {content.revision.extraRevisionRate ? (
                  <p className="text-slate-600">
                    Biaya revisi tambahan: {formatCurrencyIDR(content.revision.extraRevisionRate)}
                  </p>
                ) : null}
              </div>
              <div className="space-y-1">
                <p><strong>Mulai:</strong> {formatDateID(content.timeline.startDate)}</p>
                <p><strong>Tenggat selesai:</strong> {formatDateID(content.timeline.deadline)}</p>
              </div>
            </div>
          </section>

          {/* PASAL 5: HAK CIPTA & TERMINASI */}
          <section className="print-keep">
            <h2 className="font-bold text-slate-950 border-b border-slate-300 pb-1 mb-3">
              Pasal 5 · Hak Cipta & Pembatalan
            </h2>
            <div className="space-y-2 text-slate-700">
              <p><strong>1. Kepemilikan hasil kerja:</strong> {content.ip.ownershipClause}</p>
              <p><strong>2. Jika dibatalkan:</strong> {content.termination.cancellationCondition}</p>
            </div>
          </section>

          {/* BLOK TANDA TANGAN DIGITAL RESMI */}
          <section className="pt-6 print:pt-4 border-t-2 border-slate-950 print-keep">
            <h2 className="font-bold text-slate-950 mb-4 text-center">
              Pengesahan & Tanda Tangan
            </h2>

            <div className="grid grid-cols-2 gap-8 print:gap-6">
              {/* Freelancer Stamp Box (Pihak Pertama) */}
              <div className="border border-slate-400 p-4 space-y-3 print:p-3 print:space-y-2 bg-slate-50/30">
                <span className="font-bold text-[10px] text-slate-600 block border-b border-slate-200 pb-1">
                  Pihak Pertama (Freelancer)
                </span>

                {/* Signature & e-Materai Section (Above Full Name) */}
                <div className="min-h-[100px] flex items-center justify-center">
                  {copyType === "client_copy" ? (
                    /* Client Copy: e-Materai is on Freelancer's Box */
                    <div className="flex items-center justify-center space-x-3 w-full">
                      {/* e-Materai on the Left */}
                      <div className="flex flex-col items-center flex-shrink-0">
                        {agreement.ematerai ? (
                          <div className="w-20 h-20 border border-slate-300 p-0.5 flex items-center justify-center bg-white shadow-sm">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={agreement.ematerai.imageUrl}
                              alt="e-Materai Rp10.000"
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="w-20 h-20 border border-dashed border-slate-300 flex flex-col items-center justify-center text-center p-1 bg-white">
                            <span className="text-[8px] text-slate-400">e-Materai Rp10.000</span>
                          </div>
                        )}
                        <span className="text-[8px] text-slate-500 mt-1 font-semibold">
                          e-Materai
                        </span>
                        {agreement.ematerai?.serialNumber && (
                          <span className="text-[7px] text-slate-400 truncate max-w-[90px]">
                            {agreement.ematerai.serialNumber}
                          </span>
                        )}
                      </div>

                      {/* Freelancer Signature on the Right */}
                      <div className="flex flex-col items-center justify-center flex-1 min-w-0">
                        {freelancerVisualSig ? (
                          <div className="h-20 flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={freelancerVisualSig.signatureDataUrl}
                              alt="Tanda Tangan Freelancer"
                              className="max-h-20 max-w-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="h-20 w-full border border-dashed border-slate-300 flex items-center justify-center text-[10px] text-slate-400 text-center px-2">
                            (belum ditandatangani)
                          </div>
                        )}
                        <span className="text-[8px] text-slate-500 mt-1">
                          Tanda Tangan Freelancer
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* Freelancer Copy: Single Signature for Freelancer */
                    <div className="flex flex-col items-center justify-center">
                      {freelancerVisualSig ? (
                        <div className="h-20 flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={freelancerVisualSig.signatureDataUrl}
                            alt="Tanda Tangan Freelancer"
                            className="max-h-20 max-w-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="h-20 w-44 border border-dashed border-slate-300 flex items-center justify-center text-[10px] text-slate-400 text-center">
                          (belum ditandatangani)
                        </div>
                      )}
                      <span className="text-[8px] text-slate-500 mt-1">
                        Tanda Tangan Freelancer
                      </span>
                    </div>
                  )}
                </div>

                {/* Full Name & Designation (Directly Below Signature & Materai) */}
                <div className="text-center pt-2 border-t border-slate-300">
                  <p className="font-bold underline text-sm text-slate-950">{content.freelancer.name}</p>
                  <p className="text-[10px] text-slate-600">{content.freelancer.role || "Penyedia Jasa"}</p>
                  {content.freelancer.company && (
                    <p className="text-[10px] text-slate-500">{content.freelancer.company}</p>
                  )}
                </div>

                {/* Approval Timestamp */}
                <div className="border-t border-slate-200 pt-2 text-[9px] text-slate-600 space-y-0.5">
                  <p>
                    Status:{" "}
                    <strong>
                      {freelancerApproval ? "Sudah menyetujui" : "Belum menyetujui"}
                    </strong>
                  </p>
                  {freelancerApproval && (
                    <p>Waktu: {formatDateTimeID(freelancerApproval.approvedAt)}</p>
                  )}
                </div>
              </div>

              {/* Client Stamp Box (Pihak Kedua) */}
              <div className="border border-slate-400 p-4 space-y-3 print:p-3 print:space-y-2 bg-slate-50/30">
                <span className="font-bold text-[10px] text-slate-600 block border-b border-slate-200 pb-1">
                  Pihak Kedua (Klien)
                </span>

                {/* Signature & e-Materai Section (Above Full Name) */}
                <div className="min-h-[100px] flex items-center justify-center">
                  {copyType === "freelancer_copy" ? (
                    /* Freelancer Copy: e-Materai is on Client's Box */
                    <div className="flex items-center justify-center space-x-3 w-full">
                      {/* e-Materai on the Left */}
                      <div className="flex flex-col items-center flex-shrink-0">
                        {agreement.ematerai ? (
                          <div className="w-20 h-20 border border-slate-300 p-0.5 flex items-center justify-center bg-white shadow-sm">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={agreement.ematerai.imageUrl}
                              alt="e-Materai Rp10.000"
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="w-20 h-20 border border-dashed border-slate-300 flex flex-col items-center justify-center text-center p-1 bg-white">
                            <span className="text-[8px] text-slate-400">e-Materai Rp10.000</span>
                          </div>
                        )}
                        <span className="text-[8px] text-slate-500 mt-1 font-semibold">
                          e-Materai
                        </span>
                        {agreement.ematerai?.serialNumber && (
                          <span className="text-[7px] text-slate-400 truncate max-w-[90px]">
                            {agreement.ematerai.serialNumber}
                          </span>
                        )}
                      </div>

                      {/* Client Signature on the Right */}
                      <div className="flex flex-col items-center justify-center flex-1 min-w-0">
                        {clientVisualSig ? (
                          <div className="h-20 flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={clientVisualSig.signatureDataUrl}
                              alt="Tanda Tangan Klien"
                              className="max-h-20 max-w-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="h-20 w-full border border-dashed border-slate-300 flex items-center justify-center text-[10px] text-slate-400 text-center px-2">
                            (belum ditandatangani)
                          </div>
                        )}
                        <span className="text-[8px] text-slate-500 mt-1">
                          Tanda Tangan Klien
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* Client Copy: Single Signature for Client */
                    <div className="flex flex-col items-center justify-center">
                      {clientVisualSig ? (
                        <div className="h-20 flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={clientVisualSig.signatureDataUrl}
                            alt="Tanda Tangan Klien"
                            className="max-h-20 max-w-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="h-20 w-44 border border-dashed border-slate-300 flex items-center justify-center text-[10px] text-slate-400 text-center">
                          (belum ditandatangani)
                        </div>
                      )}
                      <span className="text-[8px] text-slate-500 mt-1">
                        Tanda Tangan Klien
                      </span>
                    </div>
                  )}
                </div>

                {/* Full Name & Designation (Directly Below Signature & Materai) */}
                <div className="text-center pt-2 border-t border-slate-300">
                  <p className="font-bold underline text-sm text-slate-950">{content.client.name}</p>
                  <p className="text-[10px] text-slate-600">Pemberi Kerja</p>
                  {content.client.company && (
                    <p className="text-[10px] text-slate-500">{content.client.company}</p>
                  )}
                </div>

                {/* Approval Timestamp */}
                <div className="border-t border-slate-200 pt-2 text-[9px] text-slate-600 space-y-0.5">
                  <p>
                    Status:{" "}
                    <strong>
                      {clientApproval ? "Sudah menyetujui" : "Belum menyetujui"}
                    </strong>
                  </p>
                  {clientApproval && (
                    <p>Waktu: {formatDateTimeID(clientApproval.approvedAt)}</p>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* DOCUMENT VERIFICATION SEAL & QR */}
          <div className="mt-8 print:mt-4 pt-4 print:pt-3 border-t border-slate-300 flex items-center justify-between text-[11px] print-keep">
            <div className="space-y-1.5 max-w-lg">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                <p className="font-bold text-slate-950 ">
                  Dokumen asli dari Sepakatin
                </p>
              </div>
              <p className="text-slate-700 text-xs font-sans">
                Isi kesepakatan ini tersimpan di Sepakatin dan tidak bisa diubah sepihak. Siapa pun bisa memastikan keasliannya dengan memindai kode QR di samping.
              </p>
              <p className="text-[10px] text-slate-500">
                Kode dokumen: <strong className="text-slate-900">{content.contractId}</strong> · Versi {currentVersion.versionNumber}
              </p>
            </div>

            <div className="flex-shrink-0 ml-4 text-center">
              <QRCodeViewer value={verifyUrl} size={84} />
              <span className="text-[9px] text-slate-500 block mt-1 font-semibold">Pindai untuk cek</span>
            </div>
          </div>
        </div>

        {/* PRINT FOOTER REQUIRED BY PRD SECTION 13 */}
        <div className="mt-10 print:mt-4 pt-4 print:pt-3 border-t border-slate-200 text-[10px] text-slate-500 flex justify-between items-center gap-4 print-keep">
          <span>Diterbitkan oleh Sepakatin</span>
          <span>Nomor dokumen: {content.contractId}</span>
          <span>Versi {currentVersion.versionNumber}</span>
        </div>
              </td>
            </tr>
          </tbody>
          <tfoot className="hidden print:table-footer-group">
            <tr>
              <th className="h-0 print:h-3 border-0 p-0 m-0 font-normal"></th>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
