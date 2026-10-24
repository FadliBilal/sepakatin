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
    tagline: "Eksplorasi & Proyek Personal",
    price: "Rp0",
    period: "selamanya",
    description: "Cocok untuk mengenal platform dan mendokumentasikan kerja sama proyek sederhana.",
    features: [
      `Maksimal ${FREE_RULES.maxActiveAgreements} kesepakatan aktif bersamaan`,
      "Format kesepakatan resmi & sah (KUHPerdata)",
      "Persetujuan online praktis via tautan",
      `Maksimal ${FREE_RULES.maxVersions} versi draf (1 kali revisi)`,
      "Nomor seri resmi & tautan cek keaslian publik",
      "Cetak atau simpan draf PDF (watermark Sepakatin)",
    ],
    cta: "Daftar Gratis",
  },
  {
    id: "per-proyek",
    name: "Per Proyek",
    tagline: "Kontrak Resmi Fleksibel",
    price: "Rp19.000",
    period: "sekali bayar",
    description: "Amankan proyek profesional tanpa komitmen bulanan. Kredit tersimpan aman hingga digunakan.",
    features: [
      "Semua fitur paket Gratis",
      "Tanpa biaya bulanan (1 kredit untuk 1 proyek tuntas)",
      "Tanda tangan digital resmi (langsung di layar HP/laptop)",
      "Unduh dokumen PDF bersih tanpa watermark",
      "Kunci batas revisi & tarif revisi tambahan disepakati di awal",
      "Fitur catatan revisi langsung dari klien",
      "Format siap cetak 2 salinan (untuk Freelancer & Klien)",
      "QR Code anti-pemalsuan (scan untuk cek keaslian dokumen)",
    ],
    cta: "Pesan Kredit",
    highlighted: true,
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Akses Penuh Freelancer & Agensi",
    price: "Rp49.000",
    period: "per bulan",
    description: "Solusi terpadu bagi pekerja lepas aktif dan studio kreatif dengan intensitas proyek berkelanjutan.",
    features: [
      "Kesepakatan tanpa batas (buat proyek sepuasnya setiap bulan)",
      "Semua fitur resmi paket Per Proyek di setiap dokumen",
      "Fitur kesepakatan susulan (Addendum) jika ada pekerjaan baru",
      "Simpan riwayat perubahan dokumen tanpa batas",
      "Arsip digital aman & bantuan operasional prioritas",
    ],
    cta: "Langganan Pro",
  },
];
