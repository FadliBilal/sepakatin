import React from "react";
import { Check, Minus } from "lucide-react";
import { AgreementStatus, ContractContentJSON } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrencyIDR, formatDateID } from "@/lib/crypto";

interface AgreementDocumentProps {
  content: ContractContentJSON;
  versionNumber: number;
  status: AgreementStatus;
  children?: React.ReactNode; // pemberitahuan tambahan di bawah judul
}

/** Isi surat kesepakatan (dipakai di halaman detail & halaman klien). */
export function AgreementDocument({ content, versionNumber, status, children }: AgreementDocumentProps) {
  const row = (label: string, value: React.ReactNode) => (
    <div className="flex flex-col sm:flex-row sm:gap-2">
      <span className="text-slate-500 sm:w-32 flex-shrink-0">{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );

  return (
    <div className="card p-6 sm:p-10 space-y-8">
      <div className="pb-6 border-b-2 border-slate-900 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-brand-600">Sepakatin · Surat Kesepakatan Kerja</p>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">{content.projectName}</h2>
          <p className="text-sm text-slate-500 mt-1">
            Nomor dokumen <strong className="text-slate-900">{content.contractId}</strong> · Versi {versionNumber}
          </p>
        </div>
        <StatusBadge status={status} className="self-start" />
      </div>

      {children}

      <section>
        <h3 className="doc-heading">Pasal 1 · Para pihak</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="doc-box space-y-1.5">
            <p className="text-xs font-semibold text-slate-500 mb-1">Pihak pertama (Freelancer)</p>
            {row("Nama", content.freelancer.name)}
            {row("Email", content.freelancer.email)}
            {row("Keahlian", content.freelancer.role || "Freelancer")}
            {content.freelancer.phone && row("WhatsApp", content.freelancer.phone)}
          </div>
          <div className="doc-box space-y-1.5">
            <p className="text-xs font-semibold text-slate-500 mb-1">Pihak kedua (Klien)</p>
            {row("Nama", content.client.name)}
            {row("Email", content.client.email)}
            {row("Perusahaan", content.client.company || "-")}
            {content.client.phone && row("WhatsApp", content.client.phone)}
          </div>
        </div>
      </section>

      <section>
        <h3 className="doc-heading">Pasal 2 · Pekerjaan yang disepakati</h3>
        <p className="text-sm text-slate-700 leading-relaxed mb-5">{content.scope.description}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <p className="font-semibold text-slate-900 mb-2">Hasil kerja yang diserahkan</p>
            <ul className="space-y-2">
              {content.scope.deliverables.map((d, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-700">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-semibold text-slate-900 mb-2">Tidak termasuk</p>
            <ul className="space-y-2">
              {content.scope.exclusions.map((x, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-500">
                  <Minus className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span>{x}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h3 className="doc-heading">Pasal 3 · Harga & pembayaran</h3>
        <div className="doc-box flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-slate-500">Total nilai proyek</p>
            <p className="text-2xl font-bold text-slate-900">{formatCurrencyIDR(content.payment.totalValue)}</p>
          </div>
          <div className="text-sm text-slate-600 space-y-0.5">
            <p>Uang muka (DP): <strong className="text-slate-900">{content.payment.dpPercent}%</strong></p>
            <p>Pelunasan: <strong className="text-slate-900">{content.payment.finalPaymentDueDays} hari setelah serah terima</strong></p>
            <p>Cara bayar: <strong className="text-slate-900">{content.payment.paymentMethod}</strong></p>
          </div>
        </div>

        {content.payment.milestones && content.payment.milestones.length > 0 && (
          <div className="mt-4 rounded-xl border border-slate-200 divide-y divide-slate-100 text-sm">
            {content.payment.milestones.map((m, idx) => (
              <div key={idx} className="px-4 py-3 flex items-center justify-between gap-4">
                <span className="text-slate-700">
                  <span className="text-slate-400 mr-2">Tahap {idx + 1}</span>
                  {m.title}
                </span>
                <span className="font-semibold text-slate-900 whitespace-nowrap">{formatCurrencyIDR(m.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="doc-heading">Pasal 4 · Revisi & jadwal</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="space-y-1.5">
            <p className="text-slate-700">Jatah revisi gratis: <strong className="text-slate-900">{content.revision.count} kali</strong></p>
            <p className="text-slate-500 leading-relaxed">{content.revision.terms}</p>
            {content.revision.extraRevisionRate ? (
              <p className="text-slate-500">
                Revisi tambahan: <strong className="text-slate-900">{formatCurrencyIDR(content.revision.extraRevisionRate)}</strong> per revisi
              </p>
            ) : null}
          </div>
          <div className="space-y-1.5 text-slate-700">
            <p>Mulai: <strong className="text-slate-900">{formatDateID(content.timeline.startDate)}</strong></p>
            <p>Tenggat selesai: <strong className="text-slate-900">{formatDateID(content.timeline.deadline)}</strong></p>
          </div>
        </div>
      </section>

      <section>
        <h3 className="doc-heading">Pasal 5 · Hak cipta & pembatalan</h3>
        <div className="space-y-2 text-sm text-slate-700 leading-relaxed">
          <p><strong className="text-slate-900">Kepemilikan hasil kerja:</strong> {content.ip.ownershipClause}</p>
          <p><strong className="text-slate-900">Jika dibatalkan:</strong> {content.termination.cancellationCondition}</p>
        </div>
      </section>
    </div>
  );
}
