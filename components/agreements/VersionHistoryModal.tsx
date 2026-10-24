"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { X, Plus, Trash2, Layers, DollarSign, RefreshCw, AlertCircle } from "lucide-react";
import { AgreementStatus } from "@/lib/types";
import { FREE_RULES } from "@/lib/plans";
import { formatCurrencyIDR } from "@/lib/crypto";

export interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: AgreementStatus;
  currentVersionNumber: number;
  freeVersionLimitReached: boolean;
  isLastFreeVersion: boolean;
  hasSignatures: boolean;
  // Lingkup Kerja
  revisedScopeDesc: string;
  setRevisedScopeDesc: (val: string) => void;
  revisedDeliverables: string[];
  setRevisedDeliverables: React.Dispatch<React.SetStateAction<string[]>>;
  revisedExclusions: string[];
  setRevisedExclusions: React.Dispatch<React.SetStateAction<string[]>>;
  // Pembayaran & Jadwal
  revisedTotalValue: number;
  setRevisedTotalValue: (val: number) => void;
  revisedDpPercent: number;
  setRevisedDpPercent: (val: number) => void;
  revisedDeadline: string;
  setRevisedDeadline: (val: string) => void;
  // Revisi
  revisedRevisionCount: number;
  setRevisedRevisionCount: (val: number) => void;
  revisedExtraRevisionRate: number;
  setRevisedExtraRevisionRate: (val: number) => void;
  // Status
  isSavingVersion: boolean;
  newVersionError: string;
  onSubmit: (e: React.FormEvent) => void;
}

/**
 * Modal dialog komprehensif untuk mengedit draf atau menerbitkan versi baru kesepakatan.
 * Memungkinkan pembaruan lengkap: deskripsi, deliverables, exclusions, nominal, DP,
 * tenggat waktu, serta kuota dan tarif revisi.
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
  revisedDeliverables,
  setRevisedDeliverables,
  revisedExclusions,
  setRevisedExclusions,
  revisedTotalValue,
  setRevisedTotalValue,
  revisedDpPercent,
  setRevisedDpPercent,
  revisedDeadline,
  setRevisedDeadline,
  revisedRevisionCount,
  setRevisedRevisionCount,
  revisedExtraRevisionRate,
  setRevisedExtraRevisionRate,
  isSavingVersion,
  newVersionError,
  onSubmit,
}: VersionHistoryModalProps) {
  const [activeSection, setActiveSection] = useState<"scope" | "payment" | "revision">("scope");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSavingVersion) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, isSavingVersion, onClose]);

  if (!isOpen) return null;

  const isDraft = status === "DRAFT";
  const isAmendment = status === "AGREED" || status === "ACTIVE";

  // Hitung DP otomatis
  const safeTotal = Math.max(0, Number(revisedTotalValue) || 0);
  const safeDpPercent = Math.min(100, Math.max(0, Number(revisedDpPercent) || 0));
  const calcDpAmount = Math.round((safeTotal * safeDpPercent) / 100);
  const calcRemainingAmount = Math.max(0, safeTotal - calcDpAmount);

  // Helper Array List
  const handleDeliverableChange = (idx: number, val: string) => {
    const updated = [...revisedDeliverables];
    updated[idx] = val;
    setRevisedDeliverables(updated);
  };

  const addDeliverable = () => {
    setRevisedDeliverables([...revisedDeliverables, ""]);
  };

  const removeDeliverable = (idx: number) => {
    if (revisedDeliverables.length <= 1) {
      setRevisedDeliverables([""]);
      return;
    }
    setRevisedDeliverables(revisedDeliverables.filter((_, i) => i !== idx));
  };

  const handleExclusionChange = (idx: number, val: string) => {
    const updated = [...revisedExclusions];
    updated[idx] = val;
    setRevisedExclusions(updated);
  };

  const addExclusion = () => {
    setRevisedExclusions([...revisedExclusions, ""]);
  };

  const removeExclusion = (idx: number) => {
    setRevisedExclusions(revisedExclusions.filter((_, i) => i !== idx));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="card-flat max-w-2xl w-full max-h-[92vh] flex flex-col shadow-xl animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Header Modal */}
        <div className="p-5 sm:p-6 border-b border-[#E8E8EC] flex items-start justify-between gap-4 flex-shrink-0">
          <div>
            <p className="kicker">
              {isDraft ? "Edit draf kesepakatan" : isAmendment ? "Amandemen kesepakatan" : "Pembaruan kesepakatan"}
            </p>
            <h3 className="font-display text-xl font-bold text-[#0A0A0A]">
              {isDraft
                ? "Edit Isi Draf Kesepakatan"
                : isAmendment
                ? `Formulir Amandemen (Versi ${currentVersionNumber + 1})`
                : `Formulir Versi ${currentVersionNumber + 1}`}
            </h3>
            <p className="text-xs text-[#6B6B6B] mt-1 leading-relaxed">
              {isDraft
                ? "Draf belum dikirim ke klien. Perubahan disimpan langsung tanpa menaikkan nomor versi."
                : isAmendment
                ? `Versi ${currentVersionNumber} yang telah disepakati tetap tersimpan dalam riwayat audit. Amandemen ini akan menjadi Versi ${currentVersionNumber + 1} dan mewajibkan persetujuan ulang kedua pihak.`
                : `Versi sebelumnya tetap tersimpan dalam riwayat audit. Versi ${currentVersionNumber + 1} mewajibkan persetujuan ulang kedua pihak.`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-md text-[#6B6B6B] hover:text-[#0A0A0A] hover:bg-slate-100 transition-colors"
            aria-label="Tutup dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Banner Peringatan */}
        {!isDraft && (
          <div className="px-6 pt-4 flex-shrink-0">
            {hasSignatures && !freeVersionLimitReached && (
              <div className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-md p-3 leading-relaxed flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Penting:</strong> Tanda tangan sebelumnya akan diatur ulang karena ada perubahan isi kesepakatan. Kedua pihak perlu menandatangani ulang Versi {currentVersionNumber + 1}.
                </div>
              </div>
            )}
            {isLastFreeVersion && (
              <p className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-md p-3 mt-2 leading-relaxed">
                Ini <strong>kesempatan perubahan terakhir</strong> untuk kesepakatan pada paket Gratis.
              </p>
            )}
          </div>
        )}

        {/* Tab Navigasi Bagian */}
        {!freeVersionLimitReached && (
          <div className="px-6 pt-3 flex-shrink-0">
            <div className="flex border-b border-[#E8E8EC] gap-2">
              <button
                type="button"
                onClick={() => setActiveSection("scope")}
                className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
                  activeSection === "scope"
                    ? "border-brand-500 text-brand-600"
                    : "border-transparent text-[#6B6B6B] hover:text-[#0A0A0A]"
                }`}
              >
                <Layers className="w-4 h-4" />
                1. Ruang Lingkup & Deliverables
              </button>
              <button
                type="button"
                onClick={() => setActiveSection("payment")}
                className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
                  activeSection === "payment"
                    ? "border-brand-500 text-brand-600"
                    : "border-transparent text-[#6B6B6B] hover:text-[#0A0A0A]"
                }`}
              >
                <DollarSign className="w-4 h-4" />
                2. Harga & Jadwal
              </button>
              <button
                type="button"
                onClick={() => setActiveSection("revision")}
                className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
                  activeSection === "revision"
                    ? "border-brand-500 text-brand-600"
                    : "border-transparent text-[#6B6B6B] hover:text-[#0A0A0A]"
                }`}
              >
                <RefreshCw className="w-4 h-4" />
                3. Ketentuan Revisi
              </button>
            </div>
          </div>
        )}

        {/* Body Modal (Scrollable Form) */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {freeVersionLimitReached ? (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-sm text-amber-900 leading-relaxed space-y-2">
                <p className="font-bold text-amber-950">Batas perubahan paket Gratis telah tercapai</p>
                <p>
                  Kesepakatan pada paket Gratis dibatasi maksimal {FREE_RULES.maxVersions} versi ({FREE_RULES.maxVersions - 1} kali pembaruan). Untuk menerbitkan versi berikutnya tanpa batas, gunakan kredit Per Proyek atau langganan Pro.
                </p>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={onClose} className="btn btn-secondary">
                  Tutup
                </button>
                <Link href="/#harga" className="btn btn-primary">
                  Lihat Pilihan Paket
                </Link>
              </div>
            </div>
          ) : (
            <form id="new-version-form" onSubmit={onSubmit} className="space-y-5">
              {/* BAGIAN 1: RUANG LINGKUP & DELIVERABLES */}
              {activeSection === "scope" && (
                <div className="space-y-4 animate-in fade-in duration-100">
                  <div>
                    <label className="label">Deskripsi / Gambaran Umum Pekerjaan *</label>
                    <textarea
                      rows={3}
                      required
                      value={revisedScopeDesc}
                      onChange={(e) => setRevisedScopeDesc(e.target.value)}
                      className="input leading-relaxed"
                      placeholder="Ringkasan tugas atau proyek yang dikerjakan..."
                    />
                  </div>

                  {/* Deliverables */}
                  <div className="space-y-2.5 pt-2">
                    <div className="flex items-center justify-between">
                      <label className="label mb-0">Daftar Hasil Kerja (*Deliverables*) *</label>
                      <button
                        type="button"
                        onClick={addDeliverable}
                        className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Tambah Butir
                      </button>
                    </div>
                    <p className="text-xs text-slate-500">
                      Rincikan apa saja luaran konkret yang diserahkan kepada klien.
                    </p>
                    <div className="space-y-2">
                      {revisedDeliverables.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            required
                            placeholder={`Contoh: File desain Figma dan dokumentasi komponen`}
                            value={item}
                            onChange={(e) => handleDeliverableChange(idx, e.target.value)}
                            className="input flex-1 text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => removeDeliverable(idx)}
                            className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Hapus butir ini"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Exclusions / Batasan Pekerjaan */}
                  <div className="space-y-2.5 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <label className="label mb-0">Batasan Pekerjaan (*Exclusions* / Apa yang TIDAK Dikerjakan)</label>
                      <button
                        type="button"
                        onClick={addExclusion}
                        className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Tambah Batasan
                      </button>
                    </div>
                    <p className="text-xs text-slate-500">
                      Mencegah *scope creep* dengan menegaskan apa yang tidak termasuk dalam biaya ini.
                    </p>
                    <div className="space-y-2">
                      {revisedExclusions.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Contoh: Tidak termasuk pembelian lisensi font komersial"
                            value={item}
                            onChange={(e) => handleExclusionChange(idx, e.target.value)}
                            className="input flex-1 text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => removeExclusion(idx)}
                            className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Hapus batasan ini"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* BAGIAN 2: HARGA, DP & JADWAL */}
              {activeSection === "payment" && (
                <div className="space-y-4 animate-in fade-in duration-100">
                  <div>
                    <label className="label">Total Nilai Proyek (Rp) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={revisedTotalValue || ""}
                      onChange={(e) => setRevisedTotalValue(Number(e.target.value))}
                      className="input font-semibold text-slate-900"
                      placeholder="0"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Terbilang: {formatCurrencyIDR(safeTotal)}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Uang Muka / DP (%)</label>
                      <div className="flex items-center gap-2">
                        <select
                          value={revisedDpPercent}
                          onChange={(e) => setRevisedDpPercent(Number(e.target.value))}
                          className="input"
                        >
                          <option value={0}>0% (Tanpa DP)</option>
                          <option value={20}>20% DP</option>
                          <option value={30}>30% DP</option>
                          <option value={50}>50% DP (Rekomendasi)</option>
                          <option value={70}>70% DP</option>
                          <option value={100}>100% Pembayaran di Awal</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="label">Tenggat Waktu Selesai (*Deadline*) *</label>
                      <input
                        type="date"
                        required
                        value={revisedDeadline}
                        onChange={(e) => setRevisedDeadline(e.target.value)}
                        className="input"
                      />
                    </div>
                  </div>

                  {/* Ringkasan Termin */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
                    <p className="font-semibold text-slate-800">Rincian Pembayaran Otomatis:</p>
                    <div className="flex justify-between">
                      <span>Uang Muka (DP {safeDpPercent}%):</span>
                      <strong className="text-slate-900">{formatCurrencyIDR(calcDpAmount)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Pelunasan Akhir ({100 - safeDpPercent}%):</span>
                      <strong className="text-slate-900">{formatCurrencyIDR(calcRemainingAmount)}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* BAGIAN 3: KETENTUAN REVISI */}
              {activeSection === "revision" && (
                <div className="space-y-4 animate-in fade-in duration-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Jatah Revisi Minor Gratis *</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          required
                          min={0}
                          max={20}
                          value={revisedRevisionCount}
                          onChange={(e) => setRevisedRevisionCount(Number(e.target.value))}
                          className="input"
                        />
                        <span className="text-xs text-slate-500 whitespace-nowrap">kali putaran</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">Standar umum: 2 atau 3 kali.</p>
                    </div>

                    <div>
                      <label className="label">Tarif Revisi Tambahan (Rp/Revisi)</label>
                      <input
                        type="number"
                        min={0}
                        value={revisedExtraRevisionRate || ""}
                        onChange={(e) => setRevisedExtraRevisionRate(Number(e.target.value))}
                        className="input"
                        placeholder="Contoh: 300000"
                      />
                      <p className="text-xs text-slate-400 mt-1">
                        Biaya jika jatah gratis di atas telah habis.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
                    <strong className="text-slate-800">Catatan:</strong> Batasan revisi ini berlaku untuk revisi hasil pengerjaan (desain/kode). Ketentuan ini melindungi Anda dari permintaan revisi tanpa henti (*infinite revisions*).
                  </div>
                </div>
              )}

              {newVersionError && (
                <p className="text-sm text-rose-800 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 leading-relaxed">
                  {newVersionError}
                </p>
              )}
            </form>
          )}
        </div>

        {/* Footer Actions */}
        {!freeVersionLimitReached && (
          <div className="p-5 sm:p-6 border-t border-[#E8E8EC] flex items-center justify-between gap-3 flex-shrink-0 bg-white rounded-b-xl">
            <div className="flex items-center gap-2">
              {activeSection !== "scope" && (
                <button
                  type="button"
                  onClick={() =>
                    setActiveSection(activeSection === "revision" ? "payment" : "scope")
                  }
                  className="btn btn-secondary btn-sm"
                >
                  Sebelumnya
                </button>
              )}
              {activeSection !== "revision" && (
                <button
                  type="button"
                  onClick={() =>
                    setActiveSection(activeSection === "scope" ? "payment" : "revision")
                  }
                  className="btn btn-secondary btn-sm"
                >
                  Selanjutnya
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSavingVersion}
                className="btn btn-secondary"
              >
                Batal
              </button>
              <button
                type="submit"
                form="new-version-form"
                disabled={isSavingVersion}
                className="btn btn-primary"
              >
                {isSavingVersion
                  ? isAmendment
                    ? "Menyimpan Amandemen..."
                    : "Menyimpan..."
                  : isDraft
                  ? "Simpan Draf"
                  : isAmendment
                  ? `Simpan & Terbitkan Amandemen (Versi ${currentVersionNumber + 1})`
                  : `Simpan & Buat Versi ${currentVersionNumber + 1}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
