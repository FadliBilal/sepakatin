"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, Check, Clock, Copy, RefreshCw } from "lucide-react";
import { AgreementStatus } from "@/lib/types";
import { formatDateTimeID } from "@/lib/crypto";

export interface ClientLinkBannerProps {
  clientReviewUrl: string;
  reviewToken: string;
  reviewTokenExpiresAt?: string | null;
  status: AgreementStatus;
  copiedLink: boolean;
  isRegeneratingToken: boolean;
  onCopyReviewUrl: () => void;
  onRegenerateToken: () => void;
}

export function ClientLinkBanner({
  clientReviewUrl,
  reviewToken,
  reviewTokenExpiresAt,
  status,
  copiedLink,
  isRegeneratingToken,
  onCopyReviewUrl,
  onRegenerateToken,
}: ClientLinkBannerProps) {
  const isExpired =
    Boolean(reviewTokenExpiresAt) &&
    new Date(reviewTokenExpiresAt!) < new Date() &&
    !["AGREED", "ACTIVE", "COMPLETED"].includes(status);

  return (
    <div className="mt-6 p-4 rounded-xl bg-brand-50/60 border border-brand-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <p className="text-sm font-semibold text-brand-700">Link untuk klien</p>
          {reviewTokenExpiresAt && (
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                isExpired
                  ? "bg-rose-100 text-rose-700 border border-rose-200"
                  : "bg-amber-100/70 text-amber-800 border border-amber-200"
              }`}
            >
              <Clock className="w-3 h-3" />
              {isExpired
                ? "Tautan Kedaluwarsa (14 Hari)"
                : `Berlaku s/d ${formatDateTimeID(reviewTokenExpiresAt)}`}
            </span>
          )}
        </div>
        <p className="text-sm text-slate-600 truncate">{clientReviewUrl}</p>
        <p className="text-xs text-amber-800 mt-1.5 flex items-start gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span>
            Siapa pun yang memegang link ini bisa menyetujui dan menandatangani atas nama klien.
            Kirim secara privat ke klien Anda (hindari membagikan ke grup publik).
          </span>
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
        <button
          onClick={onCopyReviewUrl}
          className="btn btn-primary btn-sm"
          aria-label={copiedLink ? "Link tersalin" : "Salin link review klien"}
        >
          {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copiedLink ? "Tersalin!" : "Salin Link"}
        </button>
        <button
          onClick={onRegenerateToken}
          disabled={isRegeneratingToken}
          className="btn btn-secondary btn-sm"
          title="Terbitkan ulang tautan baru jika tautan lama kedaluwarsa atau bocor"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRegeneratingToken ? "animate-spin" : ""}`} />
          Terbitkan Ulang
        </button>
        <Link
          href={`/review/${reviewToken}`}
          target="_blank"
          className="btn btn-secondary btn-sm"
        >
          Lihat sebagai Klien
        </Link>
      </div>
    </div>
  );
}
