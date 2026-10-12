"use client";

import React from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { AgreementStatus } from "@/lib/types";
import { FREE_RULES } from "@/lib/plans";

export interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: AgreementStatus;
  currentVersionNumber: number;
  freeVersionLimitReached: boolean;
  isLastFreeVersion: boolean;
  hasSignatures: boolean;
  revisedScopeDesc: string;
  setRevisedScopeDesc: (val: string) => void;
  revisedTotalValue: number;
  setRevisedTotalValue: (val: number) => void;
  revisedDeadline: string;
  setRevisedDeadline: (val: string) => void;
  isSavingVersion: boolean;
  newVersionError: string;
  onSubmit: (e: React.FormEvent) => void;
}

/**
 * Modal dialog untuk mengedit draf (in-place) atau menerbitkan versi baru kesepakatan.
 * Memuat validasi batasan paket gratis, peringatan penghapusan tanda tangan lama,
 * dan input form terstruktur.
 */
export function VersionHistoryModal({
  isOpen,
  onClose,
  status,
  currentVersionNumber,
  freeVersionLimitReached,
  isLastFreeVersion,
  hasSignatures,
  revisedScopeDesc,
  setRevisedScopeDesc,
  revisedTotalValue,
  setRevisedTotalValue,
  revisedDeadline,
  setRevisedDeadline,
  isSavingVersion,
  newVersionError,
  onSubmit,
}: VersionHistoryModalProps) {
  if (!isOpen) return null;

  const isDraft = status === "DRAFT";

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="card p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="kicker">{isDraft ? "Edit draf" : "Ubah kesepakatan"}</p>
            <h3 className="text-lg font-bold text-slate-900">
              {isDraft ? "Edit Draf Kesepakatan" : `Buat versi ${currentVersionNumber + 1}`}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {isDraft
                ? "Draf belum dikirim ke klien. Perubahan disimpan langsung tanpa menaikkan nomor versi."
                : "Versi lama tetap tersimpan. Kedua pihak perlu meninjau dan menyetujui ulang versi baru ini."}
            </p>
            {!isDraft && hasSignatures && !freeVersionLimitReached && (
              <p className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2.5 leading-relaxed">
                <strong>Perhatikan:</strong> tanda tangan yang sudah ada akan dihapus, karena tanda
                tangan itu melekat secara hukum pada isi versi lama. Kedua pihak perlu menandatangani ulang.
              </p>
            )}
            {isLastFreeVersion && (
              <p className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2.5 leading-relaxed">
                Ini <strong>kesempatan perubahan terakhir</strong> untuk kesepakatan paket Gratis.
                Pastikan seluruh klausul sudah benar sebelum menyimpan.
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {freeVersionLimitReached ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900 leading-relaxed space-y-1.5">
              <p className="font-semibold text-amber-950">Batas perubahan paket Gratis sudah tercapai</p>
              <p>
                Kesepakatan paket Gratis dibatasi maksimal {FREE_RULES.maxVersions} versi ({FREE_RULES.maxVersions - 1} kali revisi).
                Untuk mengubah isi kesepakatan ini lagi, silakan gunakan kredit Per Proyek atau paket Pro.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Tutup
              </button>
              <Link href="/#harga" className="btn btn-primary">
                Lihat Paket
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="label">Gambaran pekerjaan</label>
              <textarea
                rows={3}
                required
                value={revisedScopeDesc}
                onChange={(e) => setRevisedScopeDesc(e.target.value)}
                className="input leading-relaxed"
                placeholder="Rincian lingkup tugas yang diperbarui..."
              />
            </div>
            <div>
              <label className="label">Total harga (Rp)</label>
              <input
                type="number"
                required
                min={0}
                value={revisedTotalValue || ""}
                onChange={(e) => setRevisedTotalValue(Number(e.target.value))}
                className="input"
                placeholder="0"
              />
            </div>
            <div>
              <label className="label">Tenggat selesai</label>
              <input
                type="date"
                required
                value={revisedDeadline}
                onChange={(e) => setRevisedDeadline(e.target.value)}
                className="input"
              />
            </div>
            {newVersionError && (
              <p className="text-sm text-rose-800 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 leading-relaxed">
                {newVersionError}
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isSavingVersion}
                className="btn btn-secondary"
              >
                Batal
              </button>
              <button type="submit" disabled={isSavingVersion} className="btn btn-primary">
                {isSavingVersion
                  ? "Menyimpan..."
                  : isDraft
                  ? "Simpan Perubahan Draf"
                  : `Simpan Versi ${currentVersionNumber + 1}`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
