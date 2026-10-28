"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Check, CheckCircle2, Download, Printer } from "lucide-react";
import { AgreementRecord, CopyType } from "@/lib/types";
import { fetchStampedDocumentUrl } from "@/lib/store";
import { verifyUrlFor } from "@/lib/app-url";
import { QRCodeViewer } from "@/components/QRCodeViewer";
import { Logo } from "@/components/Logo";
import { statusLabel } from "@/components/StatusBadge";
import {
  formatCurrencyIDR,
  formatDateID,
  formatDateTimeID,
} from "@/lib/crypto";

interface PrintableAgreementProps {
  agreement: AgreementRecord;
  backHref: string;
  backLabel: string;
  initialCopyType?: CopyType;
  /** Ditandai jika dokumen diunduh khusus untuk dibubuhi e-meterai di portal Peruri */
  forStamping?: boolean;
  /** Diisi bila halaman dibuka klien lewat link undangan, bukan oleh pemilik akun. */
  reviewToken?: string;
}

function PeruriStampingArea() {
  return (
    <div className="w-20 h-20 border border-dashed border-slate-300 rounded flex items-center justify-center text-center select-none bg-slate-50/40">
      <span className="text-[9px] font-medium text-slate-400">e-Meterai</span>
    </div>
  );
}

function SepakatinSeal({ contractId }: { contractId: string }) {
  return (
    <div
      className="w-20 h-20 p-0.5 flex flex-col items-center justify-center select-none"
      title={`Segel Konsensus Digital Sepakatin · Dokumen ${contractId}`}
    >
      <svg
        viewBox="0 0 80 80"
        className="w-full h-full text-slate-900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Lingkar Luar Ganda & Pola Guilloche Mikro */}
        <circle cx="40" cy="40" r="38" stroke="currentColor" strokeWidth="1.5" />
        <circle
          cx="40"
          cy="40"
          r="35"
          stroke="currentColor"
          strokeWidth="0.75"
          strokeDasharray="2 1.5"
        />
        <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="1" />

        {/* Ornamen Titik Mikro Kardinal */}
        <circle cx="40" cy="11.5" r="1.2" fill="currentColor" />
        <circle cx="40" cy="68.5" r="1.2" fill="currentColor" />
        <circle cx="11.5" cy="40" r="1.2" fill="currentColor" />
        <circle cx="68.5" cy="40" r="1.2" fill="currentColor" />

        {/* Perisai Keabsahan Digital */}
        <path
          d="M40 17.5L49 21.5V29C49 35.5 45.2 41.5 40 43.5C34.8 41.5 31 35.5 31 29V21.5L40 17.5Z"
          stroke="currentColor"
          strokeWidth="1.2"
          fill="#f8fafc"
        />
        <path
          d="M36.5 28.5L39 31L44 26"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Tipografi Legal Formal Berstandar Industri */}
        <text
          x="40"
          y="50"
          textAnchor="middle"
          fontSize="6.5"
          fontWeight="800"
          letterSpacing="0.8"
          fill="currentColor"
          fontFamily="sans-serif"
        >
          SEPAKATIN
        </text>
        <text
          x="40"
          y="56"
          textAnchor="middle"
          fontSize="4.8"
          fontWeight="600"
          letterSpacing="0.5"
          fill="#475569"
          fontFamily="sans-serif"
        >
          DIGITAL SEAL
        </text>
        <line x1="22" y1="59.5" x2="58" y2="59.5" stroke="#cbd5e1" strokeWidth="0.5" />
        <text
          x="40"
          y="64.5"
          textAnchor="middle"
          fontSize="4.2"
          fontWeight="600"
          fill="#64748b"
          fontFamily="monospace"
        >
          KUHPerdata 1320
        </text>
      </svg>
    </div>
  );
}

/**
 * Surat kesepakatan versi cetak (A4). Margin tiap halaman dibuat oleh baris kosong di
 * <thead>/<tfoot> yang otomatis diulang browser di setiap kertas, jadi tetap rapi
 * apa pun pilihan "Margins" di dialog cetak.
 */
export function PrintableAgreement({
  agreement,
  backHref,
  backLabel,
  initialCopyType,
  forStamping = false,
  reviewToken,
}: PrintableAgreementProps) {
  const [copyType, setCopyType] = useState<CopyType>(
    initialCopyType ?? (agreement.ematerai?.targetCopy === "client_copy" ? "client_copy" : "freelancer_copy")
  );
  const isStampingMode = Boolean(forStamping);

  const currentVersion = agreement.currentVersion;
  const content = currentVersion.contentJson;
  const approvals = agreement.approvals.filter((a) => a.versionId === currentVersion.id);
  const freelancerApproval = approvals.find((a) => a.role === "freelancer");
  const clientApproval = approvals.find((a) => a.role === "client");

  const freelancerVisualSig = agreement.signatures?.find((s) => s.signerRole === "freelancer");
  const clientVisualSig = agreement.signatures?.find((s) => s.signerRole === "client");

  // Cari e-Materai yang sesuai dengan salinan yang sedang dilihat
  const currentMaterai =
    (agreement.emateraiList?.find((m) => m.targetCopy === copyType || m.targetCopy === "both")) ??
    agreement.ematerai;

  // Alamat verifikasi tercetak sebagai QR pada dokumen bermeterai (domain tetap)
  // bukan domain host yang bisa berubah saat pindah penyedia hosting.
  const verifyUrl = verifyUrlFor(agreement.contractId);

  // Cari berkas PDF bermeterai resmi jika sudah diunggah
  const currentStampedDoc = agreement.stampedDocuments?.find((d) => d.copyType === copyType);

  // Status draf atau belum berkonsensus sah kedua belah pihak
  const isNotAgreedYet = !["AGREED", "ACTIVE", "COMPLETED"].includes(agreement.status);
  const isPremiumPlan = agreement.plan === "pro" || agreement.plan === "per-proyek";

  /**
   * Mengunduh berkas bermeterai resmi bila sudah ada. Isi berkasnya tidak ikut
   * dimuat bersama halaman, jadi diambil lebih dulu di sini.
   */
  const downloadStampedFile = async (): Promise<boolean> => {
    if (!currentStampedDoc) return false;
    try {
      const file = await fetchStampedDocumentUrl(
        reviewToken || agreement.id,
        copyType === "client_copy" ? "client_copy" : "freelancer_copy",
        Boolean(reviewToken)
      );
      const link = document.createElement("a");
      link.href = file.fileUrl;
      link.download = file.fileName || currentStampedDoc.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen py-8 print:py-0 print:bg-white text-slate-950">
      {/* Top Floating Print Controller (Hidden in Print) */}
      <div className="max-w-4xl mx-auto mb-4 px-4 flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
        <Link href={backHref} className="back-link">
          <ArrowLeft className="w-4 h-4" />
          {backLabel}
        </Link>

        {/* Copy Selector (Tunggal sesuai permintaan user) */}
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

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="btn btn-primary"
            title="Cetak langsung atau simpan sebagai PDF presisi (Ctrl+P)"
          >
            <Printer className="w-4 h-4" />
            Cetak Dokumen
          </button>
        </div>
      </div>

      {/* Banner jika dokumen ini sudah memiliki berkas PDF bermeterai resmi */}
      {currentStampedDoc && (
        <div className="max-w-4xl mx-auto mb-5 px-4 no-print">
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm">
            <div className="flex items-center gap-2.5 text-emerald-950">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>
                Berkas <strong>{copyType === "freelancer_copy" ? "Salinan Freelancer" : "Salinan Klien"}</strong> ini telah memiliki dokumen PDF bermeterai resmi yang diunggah (<strong>{currentStampedDoc.fileName}</strong>).
              </span>
            </div>
            <button
              type="button"
              onClick={downloadStampedFile}
              className="btn btn-primary btn-sm self-start sm:self-auto flex-shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              Unduh Berkas Asli Bermeterai
            </button>
          </div>
        </div>
      )}

      {/* Banner Peringatan Draf Belum Sah */}
      {isNotAgreedYet && (
        <div className="max-w-4xl mx-auto mb-5 px-4 no-print">
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 flex items-start sm:items-center gap-2.5 text-xs text-amber-950 shadow-sm">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5 sm:mt-0" />
            <div className="flex-1 leading-relaxed">
              <strong>Perhatian:</strong> Kesepakatan ini masih berstatus <strong>{agreement.status}</strong> dan belum sah mengikat secara hukum. Dokumen ditampilkan dengan tanda air resmi <em>&ldquo;DRAF KESEPAKATAN — BELUM SAH&rdquo;</em> hingga konsensus persetujuan kedua pihak tercapai.
            </div>
          </div>
        </div>
      )}

      {/* A4 Sheet Paper Simulation (2 Halaman Terstruktur Sesuai Dimensi Fisik A4 794x1123px) */}
      <div className="w-full overflow-x-auto pb-12 flex flex-col items-center print:overflow-visible print:pb-0">
        <div id="printable-agreement-sheet" className="w-[794px] space-y-8 print:space-y-0 print:w-[210mm]">
          {/* HALAMAN 1: KOP, PASAL 1, PASAL 2, & PASAL 3 */}
          <div className="bg-white shadow-xl border border-slate-300 rounded-2xl overflow-hidden print:shadow-none print:border-0 print:rounded-none">
            <div
              id="printable-page-1"
              className="a4-page p-10 sm:p-12 text-xs leading-relaxed flex flex-col justify-between"
            >
            <div className="space-y-6 print:space-y-4">
          {/* Watermark Dinamis Draf Belum Sah */}
          {isNotAgreedYet && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center select-none overflow-hidden"
            >
              <div className="transform -rotate-45 border-4 border-dashed border-rose-500/20 px-8 sm:px-12 py-6 text-center rounded-3xl bg-white/30 backdrop-blur-[0.5px]">
                <span className="text-3xl sm:text-5xl font-black tracking-widest text-rose-500/20 uppercase block whitespace-nowrap">
                  {agreement.status === "CANCELLED" ? "KESEPAKATAN" : "DRAF KESEPAKATAN"}
                </span>
                <span className="text-xl sm:text-3xl font-bold tracking-wider text-rose-500/20 uppercase block mt-1 whitespace-nowrap">
                  {agreement.status === "CANCELLED" ? "DIBATALKAN" : "BELUM SAH"}
                </span>
                <span className="text-[10px] sm:text-xs font-semibold tracking-normal text-rose-500/30 block mt-1.5">
                  {agreement.status === "CANCELLED"
                    ? "Dibatalkan · Tidak Memiliki Kekuatan Hukum"
                    : "Belum Disetujui Kedua Belah Pihak · Tidak Sah Tanpa Konsensus"}
                </span>
              </div>
            </div>
          )}

          {/* DOCUMENT HEADER (KOP KESEPAKATAN FORMAL) */}
          <div className="border-b-2 border-slate-950 pb-6 mb-7 print:pb-5 print:mb-5 print-keep">
            <div className="flex items-start justify-between gap-6 mb-4">
              {isPremiumPlan ? (
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    SPK
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 tracking-wider text-xs uppercase block">DOKUMEN KESEPAKATAN KERJA</span>
                    <span className="text-[10px] text-slate-500 font-sans">Standar Hukum Perdata Pasal 1320 &amp; 1338 KUHPer</span>
                  </div>
                </div>
              ) : (
                <Logo size="lg" />
              )}
              <div className="text-right space-y-1.5 flex-shrink-0">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-50 border border-emerald-300 text-emerald-800 text-[11px] font-bold tracking-wide uppercase shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {statusLabel(agreement.status)}
                </div>
                <p className="text-[10px] text-slate-500 font-medium">
                  Tanggal Pengesahan: <strong className="text-slate-800">{formatDateID(agreement.createdAt)}</strong>
                </p>
              </div>
            </div>

            <div className="pt-1">
              <h1 className="text-2xl font-black tracking-wide text-slate-950 uppercase font-sans">
                {content.parentContractId ? "Addendum Surat Kesepakatan Kerja" : "Surat Kesepakatan Kerja"}
              </h1>
              {content.parentContractId && (
                <div className="mt-1.5 inline-flex items-center gap-2 px-2.5 py-1 rounded bg-amber-50 border border-amber-300 text-amber-900 text-[11px] font-medium">
                  <span className="font-bold uppercase tracking-wider text-[9px] bg-amber-200/80 px-1 py-0.5 rounded">Addendum</span>
                  <span>Terikat pada Kontrak Induk:</span>
                  <strong className="font-mono">{content.parentContractId}</strong>
                </div>
              )}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-2">
                <span>
                  Nomor Dokumen: <strong className="font-mono text-slate-950 font-semibold">{content.contractId}</strong>
                </span>
                <span className="text-slate-300">|</span>
                <span>
                  Versi: <strong>{currentVersion.versionNumber}</strong>
                </span>
                <span className="text-slate-300">|</span>
                <span className="font-semibold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-300 text-[10px]">
                  {copyType === "freelancer_copy"
                    ? "Salinan Pihak Pertama (Freelancer)"
                    : "Salinan Pihak Kedua (Klien)"}
                </span>
              </div>
            </div>
          </div>

          {/* PASAL 1: PARA PIHAK */}
          <section className="print-keep mb-5">
            <h2 className="font-bold text-slate-950 border-b border-slate-300 pb-1 mb-3 text-xs uppercase tracking-wide">
              Pasal 1 · Para Pihak
            </h2>
            <p className="mb-2 text-slate-700 leading-relaxed">
              Surat kesepakatan ini dibuat dan disetujui secara sadar oleh kedua belah pihak di bawah ini:
            </p>
            <div className="grid grid-cols-2 gap-6 pt-1">
              <div className="border-l-2 border-slate-300 pl-3.5 space-y-1">
                <span className="font-bold text-[10px] text-slate-900 block mb-1 uppercase tracking-wider">
                  Pihak Pertama (Freelancer)
                </span>
                <p><span className="text-slate-500">Nama:</span> <strong className="text-slate-950">{content.freelancer.name}</strong></p>
                <p><span className="text-slate-500">Email:</span> {content.freelancer.email}</p>
                <p><span className="text-slate-500">Keahlian:</span> {content.freelancer.role || "Penyedia Jasa"}</p>
                {content.freelancer.phone && <p><span className="text-slate-500">WhatsApp:</span> {content.freelancer.phone}</p>}
              </div>

              <div className="border-l-2 border-slate-300 pl-3.5 space-y-1">
                <span className="font-bold text-[10px] text-slate-900 block mb-1 uppercase tracking-wider">
                  Pihak Kedua (Reviewer / Klien)
                </span>
                <p><span className="text-slate-500">Nama:</span> <strong className="text-slate-950">{content.client.name}</strong></p>
                <p><span className="text-slate-500">Email:</span> {content.client.email}</p>
                <p><span className="text-slate-500">Perusahaan:</span> {content.client.company || "-"}</p>
                {content.client.phone && <p><span className="text-slate-500">WhatsApp:</span> {content.client.phone}</p>}
              </div>
            </div>
          </section>

          {/* PASAL 2: RUANG LINGKUP & DELIVERABLES */}
          <section className="print-keep mb-5">
            <h2 className="font-bold text-slate-950 border-b border-slate-300 pb-1 mb-3 text-xs uppercase tracking-wide">
              Pasal 2 · Pekerjaan yang Disepakati
            </h2>
            <p className="text-slate-800 mb-2 leading-relaxed">
              Pihak Pertama sepakat mengerjakan proyek <strong>&ldquo;{content.projectName}&rdquo;</strong> dengan rincian:
            </p>
            <div className="border-l-2 border-slate-400 pl-3.5 py-1 text-slate-700 italic my-2.5 bg-slate-50/50">
              &ldquo;{content.scope.description}&rdquo;
            </div>

            <div className="grid grid-cols-2 gap-6 pt-1">
              <div>
                <span className="font-bold text-[11px] text-slate-950 block mb-1.5">
                  A. Hasil Kerja yang Diserahkan (Deliverables)
                </span>
                <ul className="space-y-1 text-slate-800">
                  {content.scope.deliverables.map((d, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <Check className="w-3.5 h-3.5 text-slate-900 mt-0.5 shrink-0" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="font-bold text-[11px] text-slate-950 block mb-1.5">
                  B. Batasan Pekerjaan (Tidak Termasuk)
                </span>
                <ul className="space-y-1 text-slate-600">
                  {content.scope.exclusions.map((e, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="text-slate-400 font-bold">•</span>
                      <span>{e}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* PASAL 3: HARGA & PEMBAYARAN */}
          <section className="print-keep mb-5">
            <h2 className="font-bold text-slate-950 border-b border-slate-300 pb-1 mb-3 text-xs uppercase tracking-wide">
              Pasal 3 · Biaya & Ketentuan Pembayaran
            </h2>
            <div className="border border-slate-300 rounded overflow-hidden mb-2.5">
              <div className="flex items-center justify-between p-3.5 bg-slate-50/70 border-b border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                    Total Nilai Proyek
                  </span>
                  <span className="text-xl font-bold text-slate-950">
                    {formatCurrencyIDR(content.payment.totalValue)}
                  </span>
                </div>
                <div className="text-right text-[11px] space-y-0.5 text-slate-700">
                  <p>Uang Muka (DP): <strong className="text-slate-950">{content.payment.dpPercent}%</strong></p>
                  <p>Pelunasan: <strong className="text-slate-950">{content.payment.finalPaymentDueDays} hari setelah serah terima</strong></p>
                  <p>Metode Pembayaran: <strong className="text-slate-950">{content.payment.paymentMethod}</strong></p>
                </div>
              </div>

              {content.payment.milestones && content.payment.milestones.length > 0 && (
                <div className="divide-y divide-slate-200 text-xs">
                  {content.payment.milestones.map((m, idx) => (
                    <div key={idx} className="p-2 px-3.5 flex justify-between bg-white">
                      <span className="text-slate-700">Tahap {idx + 1}: {m.title}</span>
                      <span className="font-bold text-slate-950">{formatCurrencyIDR(m.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* PASAL 4: KUOTA REVISI & JADWAL */}
          <section className="print-keep">
            <h2 className="font-bold text-slate-950 border-b border-slate-300 pb-1 mb-2.5 text-xs uppercase tracking-wide">
              Pasal 4 · Ketentuan Revisi & Jadwal
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1 text-slate-700">
                <p>
                  <strong>Jatah revisi gratis:</strong>{" "}
                  {content.revision.count === 0 ? "0 kali (Tanpa revisi gratis)" : `${content.revision.count} kali`}
                </p>
                <p className="text-slate-600 leading-relaxed">{content.revision.terms}</p>
                {content.revision.extraRevisionRate ? (
                  <p className="text-slate-600">
                    Biaya revisi tambahan: <strong>{formatCurrencyIDR(content.revision.extraRevisionRate)}</strong> per permintaan
                  </p>
                ) : null}
              </div>
              <div className="space-y-1 text-slate-700">
                <p><strong>Tanggal Mulai:</strong> {formatDateID(content.timeline.startDate)}</p>
                <p><strong>Tenggat Selesai:</strong> {formatDateID(content.timeline.deadline)}</p>
              </div>
            </div>
          </section>
        </div>

        {/* FOOTER HALAMAN 1 WITH VERIFICATION QR */}
        <div className="mt-8 pt-3 border-t border-slate-200 text-[10px] text-slate-500 flex justify-between items-center print-keep">
          <div className="flex items-center gap-3">
            <QRCodeViewer value={verifyUrl} size={44} />
            <div className="leading-tight">
              <span className="font-bold text-slate-900 block">Segel Verifikasi Digital</span>
              <span className="text-[9px] text-slate-500">Pindai QR untuk verifikasi keaslian &amp; status konsensus</span>
            </div>
          </div>
          <div className="text-right">
            <span className="font-medium text-slate-700">
              {isPremiumPlan ? "Dokumen Perjanjian Mandiri" : "Sepakatin · Surat Kesepakatan Kerja"}
            </span>
            <p className="text-[9px] text-slate-400 mt-0.5">
              {!isPremiumPlan && <span className="font-semibold text-slate-500">Paket Gratis Sepakatin · </span>}
              Nomor: {content.contractId} · Halaman 1 dari 2
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* HALAMAN 2: PASAL 5, PENGESAHAN & TANDA TANGAN */}
    <div className="print-page-break bg-white shadow-xl border border-slate-300 rounded-2xl overflow-hidden print:shadow-none print:border-0 print:rounded-none">
      <div
        id="printable-page-2"
        className="a4-page p-10 sm:p-12 text-xs leading-relaxed flex flex-col justify-between"
      >
        <div className="space-y-6 print:space-y-4">
          {/* Watermark Dinamis Draf Belum Sah */}
          {isNotAgreedYet && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center select-none overflow-hidden"
            >
              <div className="transform -rotate-45 border-4 border-dashed border-rose-500/20 px-8 sm:px-12 py-6 text-center rounded-3xl bg-white/30 backdrop-blur-[0.5px]">
                <span className="text-3xl sm:text-5xl font-black tracking-widest text-rose-500/20 uppercase block whitespace-nowrap">
                  {agreement.status === "CANCELLED" ? "KESEPAKATAN" : "DRAF KESEPAKATAN"}
                </span>
                <span className="text-xl sm:text-3xl font-bold tracking-wider text-rose-500/20 uppercase block mt-1 whitespace-nowrap">
                  {agreement.status === "CANCELLED" ? "DIBATALKAN" : "BELUM SAH"}
                </span>
                <span className="text-[10px] sm:text-xs font-semibold tracking-normal text-rose-500/30 block mt-1.5">
                  {agreement.status === "CANCELLED"
                    ? "Dibatalkan · Tidak Memiliki Kekuatan Hukum"
                    : "Belum Disetujui Kedua Belah Pihak · Tidak Sah Tanpa Konsensus"}
                </span>
              </div>
            </div>
          )}

          <div className="border-b border-slate-300 pb-2 mb-5 flex justify-between items-center text-[10px] text-slate-500 print-keep">
            <span>Surat Kesepakatan Kerja: <strong className="text-slate-800">{content.contractId}</strong> · Versi {currentVersion.versionNumber}</span>
            <span>Halaman 2 dari 2</span>
          </div>

          {/* PASAL 5: HAK CIPTA & TERMINASI */}
          <section className="print-keep mb-5">
            <h2 className="font-bold text-slate-950 border-b border-slate-300 pb-1 mb-3 text-xs uppercase tracking-wide">
              Pasal 5 · Hak Cipta & Pembatalan Kesepakatan
            </h2>
            <div className="space-y-2 text-slate-700 leading-relaxed">
              <p><strong>1. Kepemilikan Hasil Kerja:</strong> {content.ip.ownershipClause}</p>
              <p><strong>2. Ketentuan Pembatalan:</strong> {content.termination.cancellationCondition}</p>
            </div>
          </section>

          {/* KLAUSUL PENUTUP KONSENSUS RESMI */}
          <section className="print-keep mb-6">
            <p className="text-slate-700 text-xs leading-relaxed italic border-l-2 border-slate-400 pl-4 py-2 bg-slate-50/50">
              Demikian Surat Kesepakatan Kerja ini dibuat dan disepakati oleh Para Pihak dalam keadaan sadar, sehat jasmani dan rohani, serta tanpa paksaan dari pihak mana pun. Kesepakatan ini sah dan berkekuatan hukum mengikat sejak tanggal disepakati bersama sesuai asas konsensualisme dan iktikad baik (Pasal 1320 &amp; 1338 KUHPerdata).
            </p>
          </section>

          {/* PENGESAHAN & TANDA TANGAN DIGITAL RESMI */}
          <section className="print-keep pt-2">
            <h2 className="font-bold text-slate-950 mb-6 text-center text-xs uppercase tracking-wider border-b border-slate-200 pb-2">
              Pengesahan &amp; Tanda Tangan Para Pihak
            </h2>

            <div className="grid grid-cols-2 gap-10">
              {/* Kolom Pihak Pertama (Freelancer) */}
              <div className="space-y-3">
                <div className="text-center pb-1.5 border-b border-slate-200">
                  <span className="font-bold text-xs uppercase tracking-wide text-slate-900 block">
                    Pihak Pertama (Freelancer)
                  </span>
                  <span className="text-[10px] text-slate-500">Penyedia Jasa</span>
                </div>

                {/* Area Tanda Tangan & Meterai */}
                <div className="min-h-[105px] flex items-center justify-center py-2">
                  {copyType === "client_copy" ? (
                    /* Salinan Klien: Meterai/Segel berada di pihak Freelancer */
                    <div className="flex items-center justify-center space-x-3 w-full">
                      {/* Meterai / Segel (Kiri) */}
                      <div className="flex flex-col items-center flex-shrink-0">
                        {isStampingMode ? (
                          <PeruriStampingArea />
                        ) : currentMaterai ? (
                          <div className="w-20 h-20 border border-slate-300 p-0.5 flex items-center justify-center bg-white shadow-sm">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={currentMaterai.imageUrl}
                              alt="e-Meterai Rp10.000"
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                        ) : (
                          <SepakatinSeal contractId={content.contractId} />
                        )}
                        {!isStampingMode && (
                          <span className="text-[8px] text-slate-600 mt-1 font-semibold text-center block">
                            {currentMaterai ? "e-Meterai Rp10.000" : "Segel Sah Sepakatin"}
                          </span>
                        )}
                      </div>

                      {/* Tanda Tangan Freelancer (Kanan) */}
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
                        <span className="text-[8px] text-slate-400 mt-1">
                          Tanda Tangan Freelancer
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* Salinan Freelancer: Tanda Tangan Freelancer */
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
                      <span className="text-[8px] text-slate-400 mt-1">
                        Tanda Tangan Freelancer
                      </span>
                    </div>
                  )}
                </div>

                {/* Nama Lengkap & Jabatan */}
                <div className="text-center pt-2 border-t border-slate-200">
                  <p className="font-bold underline text-sm text-slate-950">
                    ( {content.freelancer.name} )
                  </p>
                  <p className="text-[10px] text-slate-600 mt-0.5">{content.freelancer.role || "Penyedia Jasa"}</p>
                  {content.freelancer.company && (
                    <p className="text-[10px] text-slate-500">{content.freelancer.company}</p>
                  )}
                </div>

                {/* Timestamp Persetujuan */}
                <div className="text-center pt-1 text-[9px] text-slate-500">
                  {freelancerApproval ? (
                    <p>
                      Disetujui secara digital: <strong>{formatDateTimeID(freelancerApproval.approvedAt)}</strong>
                    </p>
                  ) : (
                    <p className="text-amber-600 font-medium">Belum disetujui</p>
                  )}
                </div>
              </div>

              {/* Kolom Pihak Kedua (Klien) */}
              <div className="space-y-3">
                <div className="text-center pb-1.5 border-b border-slate-200">
                  <span className="font-bold text-xs uppercase tracking-wide text-slate-900 block">
                    Pihak Kedua (Klien)
                  </span>
                  <span className="text-[10px] text-slate-500">Pemberi Kerja</span>
                </div>

                {/* Area Tanda Tangan & Meterai */}
                <div className="min-h-[105px] flex items-center justify-center py-2">
                  {copyType === "freelancer_copy" ? (
                    /* Salinan Freelancer: Meterai/Segel berada di pihak Klien */
                    <div className="flex items-center justify-center space-x-3 w-full">
                      {/* Meterai / Segel (Kiri) */}
                      <div className="flex flex-col items-center flex-shrink-0">
                        {isStampingMode ? (
                          <PeruriStampingArea />
                        ) : currentMaterai ? (
                          <div className="w-20 h-20 border border-slate-300 p-0.5 flex items-center justify-center bg-white shadow-sm">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={currentMaterai.imageUrl}
                              alt="e-Meterai Rp10.000"
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                        ) : (
                          <SepakatinSeal contractId={content.contractId} />
                        )}
                        {!isStampingMode && (
                          <span className="text-[8px] text-slate-600 mt-1 font-semibold text-center block">
                            {currentMaterai ? "e-Meterai Rp10.000" : "Segel Sah Sepakatin"}
                          </span>
                        )}
                      </div>

                      {/* Tanda Tangan Klien (Kanan) */}
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
                        <span className="text-[8px] text-slate-400 mt-1">
                          Tanda Tangan Klien
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* Salinan Klien: Tanda Tangan Klien */
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
                      <span className="text-[8px] text-slate-400 mt-1">
                        Tanda Tangan Klien
                      </span>
                    </div>
                  )}
                </div>

                {/* Nama Lengkap & Jabatan */}
                <div className="text-center pt-2 border-t border-slate-200">
                  <p className="font-bold underline text-sm text-slate-950">
                    ( {content.client.name} )
                  </p>
                  <p className="text-[10px] text-slate-600 mt-0.5">Pemberi Kerja</p>
                  {content.client.company && (
                    <p className="text-[10px] text-slate-500">{content.client.company}</p>
                  )}
                </div>

                {/* Timestamp Persetujuan */}
                <div className="text-center pt-1 text-[9px] text-slate-500">
                  {clientApproval ? (
                    <p>
                      Disetujui secara digital: <strong>{formatDateTimeID(clientApproval.approvedAt)}</strong>
                    </p>
                  ) : (
                    <p className="text-amber-600 font-medium">Belum disetujui</p>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>

        <div>
          {/* DOCUMENT VERIFICATION SEAL & QR */}
          <div className="mt-8 print:mt-4 pt-4 print:pt-3 border-t border-slate-300 flex items-center justify-between text-[11px] print-keep">
            <div className="space-y-1.5 max-w-lg">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                <p className="font-bold text-slate-950">
                  {isPremiumPlan ? "Jaminan Keabsahan & Integritas Dokumen" : "Jaminan Keabsahan & Integritas Sepakatin"}
                </p>
              </div>
              <p className="text-slate-700 text-xs font-sans leading-relaxed">
                {isPremiumPlan
                  ? "Naskah perjanjian ini dilindungi dari perubahan sepihak dengan pengesahan digital dan integritas kriptografis. Keabsahan konsensus dan integritas naskah dapat diverifikasi sewaktu-waktu dengan memindai kode QR di samping."
                  : "Naskah perjanjian ini tersimpan secara permanen dalam sistem Sepakatin dan dilindungi dari perubahan sepihak. Keabsahan konsensus dan integritas naskah dapat diverifikasi sewaktu-waktu dengan memindai kode QR di samping."}
              </p>
              <p className="text-[10px] text-slate-500">
                Kode Dokumen: <strong className="text-slate-900 font-mono">{content.contractId}</strong> · Versi {currentVersion.versionNumber}
              </p>
            </div>

            <div className="flex-shrink-0 ml-4 text-center">
              <QRCodeViewer value={verifyUrl} size={80} />
              <span className="text-[9px] text-slate-500 block mt-1 font-semibold">Pindai Verifikasi</span>
            </div>
          </div>

          {/* PRINT FOOTER */}
          <div className="mt-6 pt-3 border-t border-slate-200 text-[10px] text-slate-400 flex justify-between items-center print-keep">
            <span>
              {isPremiumPlan
                ? "Diterbitkan secara digital · Keabsahan naskah dilindungi integritas kriptografis"
                : "Diterbitkan resmi oleh Sepakatin (Paket Gratis) · sepakatin.com"}
            </span>
            <span>Nomor dokumen: {content.contractId} · Halaman 2 dari 2</span>
          </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
  );
}
