"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, Check, Clock, Copy, ExternalLink, RefreshCw } from "lucide-react";
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
    <div className="mt-6 p-4 rounded-xl bg-blue-50/50 border border-blue-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="min-w-0 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Tautan untuk Klien</p>
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

        <div>
          <Link
            href={`/review/${reviewToken}`}
            target="_blank"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-4 inline-flex items-center gap-1.5 transition-colors"
            title={`Buka tautan: ${clientReviewUrl}`}
          >
            <span>Buka Halaman Peninjauan Klien</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <p className="text-xs text-amber-800 flex items-center gap-1.5 pt-0.5">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Kirim privat ke klien Anda (hindari membagikan ke grup publik).</span>
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onCopyReviewUrl}
          className="btn btn-primary btn-sm"
          aria-label={copiedLink ? "Link tersalin" : "Salin tautan review klien"}
        >
          {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copiedLink ? "Tersalin!" : "Salin Link"}
        </button>

        <button
          onClick={onRegenerateToken}
          disabled={isRegeneratingToken}
          className="btn btn-ghost btn-sm text-xs text-slate-500 hover:text-slate-900"
          title="Terbitkan ulang jika tautan bocor atau kedaluwarsa"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRegeneratingToken ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Terbitkan Ulang</span>
        </button>
      </div>
    </div>
  );
}
