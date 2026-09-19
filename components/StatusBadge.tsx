import React from "react";
import { AgreementStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: AgreementStatus;
  className?: string;
}

const STATUS_STYLES: Record<AgreementStatus, { label: string; style: string; dot: string }> = {
  DRAFT: { label: "Draf", style: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400" },
  PENDING_CLIENT: { label: "Menunggu Klien", style: "bg-brand-50 text-brand-700 border-brand-100", dot: "bg-brand-600" },
  CHANGES_REQUESTED: { label: "Klien Minta Perubahan", style: "bg-amber-50 text-amber-800 border-amber-200", dot: "bg-amber-500" },
  PENDING_APPROVAL: { label: "Menunggu Persetujuan", style: "bg-indigo-50 text-indigo-700 border-indigo-100", dot: "bg-indigo-500" },
  AGREED: { label: "Sudah Disepakati", style: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  ACTIVE: { label: "Sedang Berjalan", style: "bg-brand-50 text-brand-700 border-brand-100", dot: "bg-brand-600" },
  COMPLETED: { label: "Selesai", style: "bg-slate-100 text-slate-700 border-slate-200", dot: "bg-slate-500" },
  CANCELLED: { label: "Dibatalkan", style: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-500" },
  EXPIRED: { label: "Kedaluwarsa", style: "bg-slate-100 text-slate-500 border-slate-200", dot: "bg-slate-400" },
  REJECTED: { label: "Ditolak", style: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-500" },
};

export function statusLabel(status: AgreementStatus): string {
  return STATUS_STYLES[status]?.label ?? status;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const { label, style, dot } = STATUS_STYLES[status] ?? STATUS_STYLES.DRAFT;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border select-none ${style} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
