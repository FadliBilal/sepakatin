// ==============================================================================
// Sepakatin — Paket harga & aturan pemakaian (satu sumber kebenaran)
// Dipakai oleh halaman harga, UI, API server, dan mode lokal.
// ==============================================================================

import type { AgreementStatus, PlanId } from "./types";

export interface PricingPlan {
  id: PlanId;
  name: string;
  tagline: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
}

/** Aturan paket Gratis. Ubah angka di sini, server & tampilan ikut menyesuaikan. */
export const FREE_RULES = {
  /** Jumlah kesepakatan Gratis yang boleh aktif bersamaan (belum selesai/dibatalkan). */
  maxActiveAgreements: 2,
  /** Jumlah versi per kesepakatan Gratis (versi 1 + 1 kali perubahan). */
  maxVersions: 2,
} as const;

/** Status yang tidak lagi dihitung sebagai "aktif". */
export const CLOSED_STATUSES: AgreementStatus[] = ["COMPLETED", "CANCELLED", "EXPIRED", "REJECTED"];

export function isActiveStatus(status: AgreementStatus): boolean {
  return !CLOSED_STATUSES.includes(status);
}

/** Kesepakatan berbayar (Per Proyek / Pro) membuka e-Materai, tanda tangan, dan permintaan perubahan klien. */
export function isPremiumPlan(plan: PlanId | undefined): boolean {
  return plan === "per-proyek" || plan === "pro";
}

export interface AccountUsage {
  /** Paket akun yang berlaku sekarang ("gratis" atau "pro"). */
  plan: "gratis" | "pro";
  planExpiresAt?: string | null;
  /** Sisa kredit Per Proyek (1 kredit = 1 kesepakatan berfitur lengkap). */
  credits: number;
  /** Jumlah kesepakatan Gratis yang sedang aktif. */
  activeFreeAgreements: number;
  maxActiveFreeAgreements: number;
}

/** Pro dianggap aktif jika belum ada tanggal kedaluwarsa atau tanggalnya masih di depan. */
export function effectiveAccountPlan(plan: string | null | undefined, expiresAt: string | null | undefined): "gratis" | "pro" {
  if (plan !== "pro") return "gratis";
  if (!expiresAt) return "pro";
  return new Date(expiresAt).getTime() > Date.now() ? "pro" : "gratis";
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "gratis",
    name: "Gratis",
    tagline: "Untuk mencoba",
    price: "Rp0",
    period: "selamanya",
    description: "Cocok untuk freelancer yang ingin merapikan kesepakatan proyek pertamanya.",
    features: [
      `Maksimal ${FREE_RULES.maxActiveAgreements} kesepakatan aktif`,
      "Persetujuan online oleh kedua pihak",
      `Ubah isi kesepakatan ${FREE_RULES.maxVersions - 1} kali`,
      "Nomor dokumen & cek keaslian",
      "Cetak atau simpan sebagai PDF",
    ],
    cta: "Daftar Gratis",
  },
  {
    id: "per-proyek",
    name: "Per Proyek",
    tagline: "Bayar sekali",
    price: "Rp19.000",
    period: "per kesepakatan",
    description: "Untuk freelancer yang proyeknya datang sesekali, tanpa biaya bulanan.",
    features: [
      "Semua fitur paket Gratis",
      "Tidak dihitung dalam batas paket Gratis",
      "Tempel e-Materai & tanda tangan online",
      "Riwayat perubahan tanpa batas",
      "Klien bisa minta perubahan langsung",
    ],
    cta: "Pesan Kredit",
    highlighted: true,
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Langganan bulanan",
    price: "Rp49.000",
    period: "per bulan",
    description: "Untuk freelancer penuh waktu dan studio kreatif dengan banyak proyek.",
    features: [
      "Kesepakatan tanpa batas",
      "Semua fitur paket Per Proyek di setiap kesepakatan",
      "Bantuan prioritas",
    ],
    cta: "Langganan Pro",
  },
];
