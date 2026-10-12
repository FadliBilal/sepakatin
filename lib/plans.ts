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

/** Kesepakatan berbayar (Per Proyek / Pro) membuka tanda tangan digital, revisi tanpa batas, dan verifikasi resmi. */
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
    tagline: "Draf Santai & Coba-Coba",
    price: "Rp0",
    period: "selamanya",
    description: "Cocok untuk proyek santai atau teman yang butuh rekap kesepakatan tertulis agar tidak lupa.",
    features: [
      `Maksimal ${FREE_RULES.maxActiveAgreements} kesepakatan aktif bersamaan`,
      "Format kesepakatan sah (KUHPerdata Pasal 1320)",
      "Persetujuan online dasar (konfirmasi centang via tautan)",
      `Maksimal ${FREE_RULES.maxVersions} versi draf (1 kali revisi)`,
      "Nomor seri dokumen & cek keaslian publik",
      "Cetak atau simpan draf PDF (tanda air Sepakatin)",
    ],
    cta: "Daftar Gratis",
  },
  {
    id: "per-proyek",
    name: "Per Proyek",
    tagline: "Kontrak Resmi 1 Proyek",
    price: "Rp19.000",
    period: "sekali bayar",
    description: "Untuk mengamankan proyek nyata tanpa komitmen bulanan. Kredit tidak pernah hangus sampai dipakai.",
    features: [
      "Semua fitur paket Gratis",
      "Tidak memotong kuota paket Gratis (1 kredit = 1 proyek)",
      "Tanda Tangan Digital Resmi (gores jari di layar HP/laptop)",
      "Dokumen PDF bersih 100% tanpa tanda air (watermark)",
      "Pengunci batas revisi & biaya revisi tambahan (anti-revisi liar)",
      "Klien bisa ajukan catatan perubahan langsung via tautan",
      "Format siap cetak 2 salinan resmi (Freelancer & Klien)",
      "QR Code & verifikasi integritas kriptografis SHA-256",
    ],
    cta: "Pesan Kredit",
    highlighted: true,
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Langganan Freelancer & Studio",
    price: "Rp49.000",
    period: "per bulan",
    description: "Untuk freelancer penuh waktu dan studio kreatif dengan banyak klien. Bebas terbitkan kontrak sepuasnya.",
    features: [
      "Kesepakatan tanpa batas (Unlimited projects sebulan penuh)",
      "Semua fitur resmi paket Per Proyek di setiap dokumen",
      "Dukungan penerbitan Addendum (perjanjian lingkup tambahan)",
      "Riwayat perubahan dan komparasi versi tak terbatas",
      "Arsip digital permanen & bantuan operasional prioritas",
    ],
    cta: "Langganan Pro",
  },
];
