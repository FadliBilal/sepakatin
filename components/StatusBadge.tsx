import React from "react";
import { AgreementStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: AgreementStatus;
  className?: string;
}

const STATUS_STYLES: Record<AgreementStatus, { label: string; style: string; dot: string }> = {
  DRAFT: { label: "Draf", style: "bg-[#F4F4F6] text-[#4B4B4B] border-[#E8E8EC]", dot: "bg-[#8E8E93]" },
  PENDING_CLIENT: { label: "Menunggu Klien", style: "bg-indigo-50 text-[#6366F1] border-indigo-200", dot: "bg-[#6366F1]" },
  CHANGES_REQUESTED: { label: "Klien Minta Perubahan", style: "bg-amber-50 text-amber-800 border-amber-200", dot: "bg-amber-500" },
  PENDING_APPROVAL: { label: "Menunggu Persetujuan", style: "bg-indigo-50 text-[#6366F1] border-indigo-200", dot: "bg-[#6366F1]" },
  AGREED: { label: "Sudah Disepakati", style: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  ACTIVE: { label: "Sedang Berjalan", style: "bg-indigo-50 text-[#6366F1] border-indigo-200", dot: "bg-[#6366F1]" },
  COMPLETED: { label: "Selesai", style: "bg-[#F4F4F6] text-[#4B4B4B] border-[#E8E8EC]", dot: "bg-[#8E8E93]" },
  CANCELLED: { label: "Dibatalkan", style: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-500" },
  EXPIRED: { label: "Kedaluwarsa", style: "bg-[#F4F4F6] text-[#8E8E93] border-[#E8E8EC]", dot: "bg-[#8E8E93]" },
  REJECTED: { label: "Ditolak", style: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-500" },
};

export function statusLabel(status: AgreementStatus): string {
  return STATUS_STYLES[status]?.label ?? status;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const { label, style, dot } = STATUS_STYLES[status] ?? STATUS_STYLES.DRAFT;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium rounded border select-none ${style} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
