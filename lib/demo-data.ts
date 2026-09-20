// ==============================================================================
// Sepakatin — Data contoh untuk demo (dokumen SPK-2026-00124 dengan 5 Versi)
// ==============================================================================

import {
  AgreementRecord,
  AgreementVersionRecord,
  AgreementApprovalRecord,
  ChangeRequestRecord,
  ActivityLogItem,
  ContractContentJSON,
} from "./types";
import { generateDocumentHash } from "./crypto";
import { generateSampleStampedPdfDataUrl } from "./ematerai-sample";

export const DEMO_CONTRACT_ID = "SPK-2026-00124";

const FREELANCER_DATA = {
  name: "Fadli Bilal",
  email: "fadli@sepakatin.id",
  phone: "+62 812-3456-7890",
  role: "Fullstack Web Developer",
  company: "Studio Kreasi Mandiri",
};

const CLIENT_DATA = {
  name: "Budi Santoso",
  email: "budi@solusidigital.id",
  phone: "+62 811-9876-5432",
  company: "PT Solusi Digital Nusantara",
  address: "Jl. Sudirman Kav. 24, Jakarta Selatan",
};

// ------------------------------------------------------------------------------
// Versi 1: Draf Awal — Website Profil 5 Halaman Dasar
// ------------------------------------------------------------------------------
export const DEMO_CONTRACT_V1: ContractContentJSON = {
  contractId: DEMO_CONTRACT_ID,
  projectName: "Website Profil Perusahaan PT Solusi Digital",
  freelancer: FREELANCER_DATA,
  client: CLIENT_DATA,
  scope: {
    description:
      "Pembuatan website profil perusahaan yang modern, tampil rapi di HP maupun komputer, dilengkapi formulir kontak terhubung ke email resmi perusahaan.",
    deliverables: [
      "Desain mockup UI/UX untuk tampilan desktop dan mobile (Figma)",
      "Pembuatan 5 halaman statis utama: Beranda, Tentang Kami, Layanan, Portofolio Proyek, dan Kontak Kami",
      "Formulir pesan kontak terkirim ke email resmi perusahaan",
      "Pemasangan domain dan hosting cloud hingga website dapat diakses publik",
    ],
    exclusions: [
      "Penulisan isi artikel dan rilis berita secara berkala",
      "Halaman admin / Content Management System (CMS) mandiri",
      "Fitur portal lowongan kerja dan karir",
      "Fitur multi-bahasa (bilingual)",
      "Perawatan website setelah masa garansi 30 hari",
    ],
    acceptanceCriteria: [
      "Website tampil rapi dan responsif di Google Chrome, Safari, dan browser smartphone",
      "Halaman website terbuka cepat (kurang dari 3 detik)",
      "Semua pesan formulir kontak berhasil terkirim ke budi@solusidigital.id",
    ],
  },
  payment: {
    totalValue: 8000000,
    currency: "IDR",
    paymentMethod: "Transfer Bank BCA / Bank Mandiri",
    dpPercent: 50,
    milestones: [
      {
        title: "Uang muka (DP 50%) saat perjanjian dimulai",
        amount: 4000000,
        dueDate: "2026-09-22",
      },
      {
        title: "Pelunasan (50%) & serah terima website",
        amount: 4000000,
        dueDate: "2026-10-15",
      },
    ],
    finalPaymentDueDays: 7,
  },
  revision: {
    count: 3,
    terms:
      "Revisi kecil meliputi penyesuaian tata letak, teks, dan aset warna tanpa menambah halaman baru di luar kesepakatan.",
    extraRevisionRate: 400000,
  },
  timeline: {
    startDate: "2026-09-20",
    deadline: "2026-10-15",
  },
  ip: {
    ownershipClause:
      "Hak cipta dan seluruh file website diserahkan penuh kepada Klien setelah pembayaran lunas 100%. Freelancer boleh menampilkan proyek ini di portofolio.",
    customTerms: "Pihak Klien menjamin bahwa seluruh materi teks dan logo yang diserahkan tidak melanggar hak cipta pihak ketiga.",
  },
  termination: {
    cancellationCondition:
      "Jika dibatalkan sebelum proyek dimulai, DP dipotong 15% untuk biaya administrasi. Jika dibatalkan di tengah pengerjaan, Klien membayar sesuai tahap pekerjaan yang sudah selesai.",
    noticePeriodDays: 7,
    outstandingPaymentTerms:
      "Klien melunasi pekerjaan yang sudah diserahkan paling lambat 7 hari kerja setelah pemberitahuan pembatalan.",
  },
  validFrom: "2026-09-20",
  validUntil: "2026-10-31",
  specialNotes: "Komunikasi proyek dilakukan lewat grup WhatsApp dan email.",
};

// ------------------------------------------------------------------------------
// Versi 2: Tambahan Klien 1 — Modul CMS Berita & Artikel Mandiri (+Rp2.000.000)
// ------------------------------------------------------------------------------
export const DEMO_CONTRACT_V2: ContractContentJSON = {
  ...DEMO_CONTRACT_V1,
  projectName: "Website Profil Perusahaan & Portal Berita PT Solusi Digital",
  scope: {
    description:
      "Pembuatan website profil perusahaan modern dilengkapi halaman admin (CMS) agar tim internal dapat mempublikasikan artikel edukasi, kegiatan CSR, dan siaran pers secara mandiri.",
    deliverables: [
      "Desain mockup UI/UX untuk tampilan desktop dan mobile (Figma)",
      "Pembuatan 5 halaman utama: Beranda, Tentang Kami, Layanan, Portofolio Proyek, dan Kontak Kami",
      "Modul CMS Berita/Artikel: rich-text editor, manajemen kategori/tag, upload gambar sampul, status draf & terbit",
      "Formulir pesan kontak terhubung ke email resmi perusahaan",
      "Pemasangan domain dan hosting cloud hingga website dapat diakses publik",
    ],
    exclusions: [
      "Fitur portal lowongan kerja dan karir",
      "Fitur multi-bahasa (bilingual)",
      "Fitur pembayaran online atau toko online",
      "Perawatan website setelah masa garansi 30 hari",
    ],
    acceptanceCriteria: [
      "Website tampil rapi di Google Chrome, Safari, dan layar smartphone",
      "Halaman admin dapat diakses aman dengan akun tim internal untuk mengelola artikel",
      "Semua formulir kontak terkirim ke email resmi perusahaan",
    ],
  },
  payment: {
    totalValue: 10000000,
    currency: "IDR",
    paymentMethod: "Transfer Bank BCA / Bank Mandiri",
    dpPercent: 40,
    milestones: [
      {
        title: "Uang muka (DP 40%) & mulai pengerjaan",
        amount: 4000000,
        dueDate: "2026-09-22",
      },
      {
        title: "Modul CMS selesai & demo preview (30%)",
        amount: 3000000,
        dueDate: "2026-10-10",
      },
      {
        title: "Pelunasan (30%) & serah terima website",
        amount: 3000000,
        dueDate: "2026-10-22",
      },
    ],
    finalPaymentDueDays: 7,
  },
  timeline: {
    startDate: "2026-09-20",
    deadline: "2026-10-22",
  },
  validUntil: "2026-11-15",
  specialNotes: "Penyesuaian Versi 2: Penambahan modul CMS Berita & Artikel mandiri atas permintaan klien Budi Santoso.",
};

// ------------------------------------------------------------------------------
// Versi 3: Tambahan Klien 2 — Portal Karir & Webhook WhatsApp HRD (+Rp2.000.000)
// ------------------------------------------------------------------------------
export const DEMO_CONTRACT_V3: ContractContentJSON = {
  ...DEMO_CONTRACT_V2,
  projectName: "Website Profil Perusahaan, Portal Berita & Karir PT Solusi Digital",
  scope: {
    description:
      "Pembuatan website profil perusahaan modern, modul CMS publikasi berita/artikel, serta portal karir dengan formulir lamaran kerja terintegrasi notifikasi instan WhatsApp HRD.",
    deliverables: [
      "Desain mockup UI/UX untuk tampilan desktop dan mobile (Figma)",
      "Pengembangan 5 halaman utama: Beranda, Tentang Kami, Layanan, Portofolio Proyek, dan Kontak Kami",
      "Modul CMS Berita/Artikel: rich-text editor, manajemen kategori/tag, upload gambar sampul, status draf & terbit",
      "Halaman Karir/Lowongan Kerja & formulir submit lamaran dengan upload CV/Resume (PDF maks. 5MB)",
      "Integrasi webhook pengiriman notifikasi otomatis data pelamar ke WhatsApp HRD",
      "Pemasangan domain dan hosting cloud hingga website dapat diakses publik",
    ],
    exclusions: [
      "Fitur multi-bahasa (bilingual Indonesia - Inggris)",
      "Optimasi SEO teknis tingkat lanjut dan pelacakan pixel iklan",
      "Fitur pembayaran online atau e-commerce",
      "Perawatan website setelah masa garansi 30 hari",
    ],
    acceptanceCriteria: [
      "Pelamar sukses mengunggah file CV (PDF) dan tersimpan aman di cloud storage",
      "Nomor WhatsApp HRD menerima ringkasan nama, kontak, dan link CV setiap ada lamaran baru",
      "Website beroperasi lancar dan responsif di berbagai perangkat",
    ],
  },
  payment: {
    totalValue: 12000000,
    currency: "IDR",
    paymentMethod: "Transfer Bank BCA / Bank Mandiri",
    dpPercent: 40,
    milestones: [
      {
        title: "Uang muka (DP 40%) & mulai pengerjaan",
        amount: 4800000,
        dueDate: "2026-09-22",
      },
      {
        title: "Demo modul CMS & portal karir (35%)",
        amount: 4200000,
        dueDate: "2026-10-18",
      },
      {
        title: "Pelunasan (25%) & serah terima sistem",
        amount: 3000000,
        dueDate: "2026-11-05",
      },
    ],
    finalPaymentDueDays: 7,
  },
  timeline: {
    startDate: "2026-09-20",
    deadline: "2026-11-05",
  },
  validUntil: "2026-11-30",
  specialNotes: "Penyesuaian Versi 3: Penambahan halaman lowongan kerja dan webhook WhatsApp HRD atas permintaan klien.",
};

// ------------------------------------------------------------------------------
// Versi 4: Tambahan Klien 3 — Fitur Multi-bahasa Bilingual ID/EN (+Rp1.800.000)
// ------------------------------------------------------------------------------
export const DEMO_CONTRACT_V4: ContractContentJSON = {
  ...DEMO_CONTRACT_V3,
  projectName: "Website Profil Perusahaan Bilingual, Portal Berita & Karir PT Solusi Digital",
  scope: {
    description:
      "Pembuatan website profil perusahaan bilingual (Bahasa Indonesia & English), modul CMS berita multi-bahasa, serta portal karir dengan formulir upload CV terintegrasi WhatsApp HRD.",
    deliverables: [
      "Desain mockup UI/UX untuk tampilan desktop dan mobile (Figma)",
      "Pengembangan seluruh halaman dalam dua bahasa (ID & EN) dengan tombol switcher bahasa",
      "Modul CMS Admin Berita multi-bahasa: input terpisah untuk konten versi Bahasa Indonesia dan English",
      "Halaman Karir/Lowongan Kerja & formulir submit lamaran dengan upload CV/Resume (PDF)",
      "Integrasi webhook notifikasi otomatis data pelamar ke WhatsApp HRD",
      "Pemasangan domain dan hosting cloud hingga website dapat diakses publik",
    ],
    exclusions: [
      "Penerjemahan dokumen legal/hukum perusahaan ke bahasa asing",
      "Integrasi analitik Google Analytics 4 / Meta Pixel",
      "Pemeliharaan website setelah masa garansi 30 hari",
    ],
    acceptanceCriteria: [
      "Pengunjung dapat beralih antara Bahasa Indonesia dan English dengan instan tanpa reload halaman",
      "Seluruh menu navigasi, footer, dan konten artikel tampil akurat sesuai bahasa yang dipilih",
      "Formulir kontak dan karir berfungsi optimal pada kedua mode bahasa",
    ],
  },
  payment: {
    totalValue: 13800000,
    currency: "IDR",
    paymentMethod: "Transfer Bank BCA / Bank Mandiri",
    dpPercent: 40,
    milestones: [
      {
        title: "Uang muka (DP 40%) & mulai pengerjaan",
        amount: 5520000,
        dueDate: "2026-09-22",
      },
      {
        title: "Preview fitur bilingual & integrasi CMS (35%)",
        amount: 4830000,
        dueDate: "2026-10-25",
      },
      {
        title: "Pelunasan (25%) & serah terima sistem",
        amount: 3450000,
        dueDate: "2026-11-15",
      },
    ],
    finalPaymentDueDays: 7,
  },
  timeline: {
    startDate: "2026-09-20",
    deadline: "2026-11-15",
  },
  validUntil: "2026-12-15",
  specialNotes: "Penyesuaian Versi 4: Penambahan kapabilitas bilingual ID/EN untuk kebutuhan penjajakan investor luar negeri.",
};

// ------------------------------------------------------------------------------
// Versi 5: Tambahan Klien 4 & FINAL — GA4, Meta Pixel, SEO On-Page, Garansi 60 Hari (+Rp1.200.000)
// ------------------------------------------------------------------------------
export const DEMO_CONTRACT_V5: ContractContentJSON = {
  contractId: DEMO_CONTRACT_ID,
  projectName: "Website Profil Perusahaan Bilingual, Portal Berita, Karir & SEO PT Solusi Digital",
  freelancer: FREELANCER_DATA,
  client: CLIENT_DATA,
  scope: {
    description:
      "Pengembangan menyeluruh website profil perusahaan bilingual (Indonesia & English), portal berita/artikel dinamis CMS, portal rekrutmen karir terhubung notifikasi WhatsApp HRD, integrasi analitik (GA4 & Meta Pixel), optimasi Core Web Vitals (SEO On-Page), serta garansi pemeliharaan 60 hari.",
    deliverables: [
      "Desain mockup UI/UX untuk desktop dan mobile yang elegan & profesional (Figma)",
      "Pengembangan 5 halaman utama bilingual (ID & EN) dengan tombol switcher bahasa instan",
      "Modul CMS Admin Berita multi-bahasa: input terpisah untuk konten versi Bahasa Indonesia dan English",
      "Halaman Karir/Lowongan Kerja & formulir submit lamaran dengan upload CV/Resume (PDF)",
      "Integrasi webhook notifikasi otomatis pelamar baru langsung ke WhatsApp HRD",
      "Pemasangan Google Analytics 4 (GA4), Google Tag Manager, dan Meta Pixel untuk pelacakan konversi iklan",
      "Optimasi SEO On-Page (JSON-LD schema markup, Open Graph tags, XML sitemap otomatis, Core Web Vitals score > 90)",
      "Masa garansi perbaikan bug dan pendampingan teknis selama 60 hari kalender pasca go-live",
      "Konfigurasi domain, SSL certificate, CDN, dan cloud hosting hingga website siap pakai",
    ],
    exclusions: [
      "Biaya langganan bulanan pihak ketiga berbayar di luar paket hosting awal",
      "Biaya belanja iklan berbayar (Google Ads / Meta Ads spend)",
      "Pembuatan materi video promosi perusahaan profesional",
    ],
    acceptanceCriteria: [
      "Website tampil responsif, modern, dan bebas kendala di Google Chrome, Safari, dan Firefox",
      "Skor Google PageSpeed / Core Web Vitals mencapai nilai minimal 90 pada mode desktop",
      "Event tracking pada Google Analytics 4 dan Meta Pixel terverifikasi aktif",
      "Modul multi-bahasa, CMS berita, dan portal karir bekerja sempurna sesuai spesifikasi yang disepakati",
    ],
  },
  payment: {
    totalValue: 15000000,
    currency: "IDR",
    paymentMethod: "Transfer Bank BCA / Bank Mandiri",
    dpPercent: 40,
    milestones: [
      {
        title: "Uang muka (DP 40%) & kick-off proyek",
        amount: 6000000,
        dueDate: "2026-09-22",
      },
      {
        title: "Demo fitur bilingual, CMS & portal karir (35%)",
        amount: 5250000,
        dueDate: "2026-10-30",
      },
      {
        title: "Pelunasan (25%) setelah go-live & serah terima",
        amount: 3750000,
        dueDate: "2026-11-20",
      },
    ],
    finalPaymentDueDays: 7,
  },
  revision: {
    count: 4,
    terms:
      "Revisi mencakup penyesuaian tata letak minor, penulisan konten, dan aset visual dalam cakupan fitur yang telah disepakati.",
    extraRevisionRate: 400000,
  },
  timeline: {
    startDate: "2026-09-20",
    deadline: "2026-11-20",
  },
  ip: {
    ownershipClause:
      "Hak cipta dan seluruh aset kode sumber website diserahkan penuh kepada Klien setelah pembayaran lunas 100%. Freelancer berhak menampilkan karya ini dalam portofolio profesional.",
    customTerms: "Pihak Klien menjamin kepemilikan hak cipta atas seluruh materi teks, foto, dan logo yang diserahkan kepada Freelancer.",
  },
  termination: {
    cancellationCondition:
      "Jika terjadi pembatalan sebelum pengerjaan teknis dimulai, DP dikembalikan dengan potongan administrasi 15%. Jika pembatalan terjadi pada tahap berjalan, Klien wajib membayar kompensasi proporsional terhadap tahap yang telah diselesaikan.",
    noticePeriodDays: 7,
    outstandingPaymentTerms:
      "Pelunasan atas pekerjaan yang telah diserahkan diselesaikan paling lambat 7 hari kerja setelah konfirmasi pembatalan.",
  },
  validFrom: "2026-09-20",
  validUntil: "2026-12-31",
  specialNotes:
    "Kesepakatan final versi 5: mencakup seluruh ruang lingkup kerja awal ditambah 4 putaran penyesuaian dari klien Budi Santoso (PT Solusi Digital Nusantara).",
};

// Aliaskan default content ke versi 5
export const DEMO_CONTRACT_CONTENT = DEMO_CONTRACT_V5;

// ------------------------------------------------------------------------------
// 4 Permintaan Perubahan (Change Requests) dari Klien Budi Santoso
// ------------------------------------------------------------------------------
export const DEMO_CHANGE_REQUESTS: ChangeRequestRecord[] = [
  {
    id: "cr_004",
    agreementId: "agr_default_001",
    requestedBy: "Budi Santoso",
    requesterEmail: "budi@solusidigital.id",
    title: "Optimasi SEO Teknis, GA4/Meta Pixel & Perpanjangan Garansi 60 Hari",
    description:
      "Kami ingin memastikan website siap untuk kampanye digital marketing: pasang Google Analytics 4, Meta Pixel, optimasi skor Core Web Vitals (SEO On-page), serta perpanjangan garansi bug/maintenance menjadi 60 hari.",
    status: "APPLIED",
    createdAt: "2026-09-24T13:00:00.000Z",
    resolvedAt: "2026-09-24T15:30:00.000Z",
  },
  {
    id: "cr_003",
    agreementId: "agr_default_001",
    requestedBy: "Budi Santoso",
    requesterEmail: "budi@solusidigital.id",
    title: "Fitur Multi-bahasa (Bilingual Indonesia - Inggris)",
    description:
      "PT Solusi Digital sedang menjajaki kemitraan investor dari Singapura dan Australia. Kami butuh website memiliki opsi 2 bahasa (Bahasa Indonesia & English) dengan tombol switcher bahasa yang elegan di header.",
    status: "APPLIED",
    createdAt: "2026-09-23T11:20:00.000Z",
    resolvedAt: "2026-09-23T16:45:00.000Z",
  },
  {
    id: "cr_002",
    agreementId: "agr_default_001",
    requestedBy: "Budi Santoso",
    requesterEmail: "budi@solusidigital.id",
    title: "Integrasi Form Lamaran Karir & Notifikasi WhatsApp HRD",
    description:
      "Perusahaan sedang ekspansi dan butuh halaman Karir untuk pasang lowongan pekerjaan. Pelamar bisa langsung melampirkan file resume/CV (PDF) dan tim HRD langsung mendapatkan notifikasi ringkas lewat WhatsApp.",
    status: "APPLIED",
    createdAt: "2026-09-22T10:00:00.000Z",
    resolvedAt: "2026-09-22T14:30:00.000Z",
  },
  {
    id: "cr_001",
    agreementId: "agr_default_001",
    requestedBy: "Budi Santoso",
    requesterEmail: "budi@solusidigital.id",
    title: "Penambahan Modul CMS Berita & Artikel",
    description:
      "Perusahaan membutuhkan halaman admin (CMS) agar tim marketing kami dapat mempublikasikan artikel edukasi, kegiatan CSR, dan siaran pers perusahaan secara mandiri.",
    status: "APPLIED",
    createdAt: "2026-09-21T09:15:00.000Z",
    resolvedAt: "2026-09-21T11:00:00.000Z",
  },
];

export const SAMPLE_EMATERAI_SVG_DATA_URL =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" width="180" height="180">
  <rect width="180" height="180" fill="#ffffff"/>
  <rect x="4" y="4" width="172" height="172" fill="none" stroke="#09090b" stroke-width="2.5"/>
  <rect x="8" y="8" width="164" height="164" fill="none" stroke="#09090b" stroke-width="1" stroke-dasharray="3,2"/>
  <text x="90" y="24" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="9" fill="#09090b">METERAI ELEKTRONIK</text>
  <line x1="14" y1="28" x2="166" y2="28" stroke="#09090b" stroke-width="1"/>
  <text x="90" y="55" text-anchor="middle" font-family="monospace" font-weight="900" font-size="24" fill="#09090b">10000</text>
  <text x="90" y="68" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="9" fill="#09090b">SEPULUH RIBU RUPIAH</text>
  <rect x="55" y="76" width="70" height="70" fill="none" stroke="#09090b" stroke-width="1"/>
  <rect x="62" y="83" width="16" height="16" fill="#09090b"/>
  <rect x="102" y="83" width="16" height="16" fill="#09090b"/>
  <rect x="62" y="123" width="16" height="16" fill="#09090b"/>
  <rect x="85" y="95" width="10" height="10" fill="#09090b"/>
  <rect x="97" y="112" width="12" height="12" fill="#09090b"/>
  <text x="90" y="158" text-anchor="middle" font-family="monospace" font-size="8" fill="#09090b">SN-2026-99824-EMTR</text>
  <text x="90" y="168" text-anchor="middle" font-family="sans-serif" font-style="italic" font-size="7" fill="#09090b">PERURI - DJP RI</text>
</svg>`);

export const SAMPLE_EMATERAI_CLIENT_SVG_DATA_URL =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" width="180" height="180">
  <rect width="180" height="180" fill="#ffffff"/>
  <rect x="4" y="4" width="172" height="172" fill="none" stroke="#09090b" stroke-width="2.5"/>
  <rect x="8" y="8" width="164" height="164" fill="none" stroke="#09090b" stroke-width="1" stroke-dasharray="3,2"/>
  <text x="90" y="24" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="9" fill="#09090b">METERAI ELEKTRONIK</text>
  <line x1="14" y1="28" x2="166" y2="28" stroke="#09090b" stroke-width="1"/>
  <text x="90" y="55" text-anchor="middle" font-family="monospace" font-weight="900" font-size="24" fill="#09090b">10000</text>
  <text x="90" y="68" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="9" fill="#09090b">SEPULUH RIBU RUPIAH</text>
  <rect x="55" y="76" width="70" height="70" fill="none" stroke="#09090b" stroke-width="1"/>
  <rect x="62" y="83" width="16" height="16" fill="#09090b"/>
  <rect x="102" y="83" width="16" height="16" fill="#09090b"/>
  <rect x="62" y="123" width="16" height="16" fill="#09090b"/>
  <rect x="85" y="95" width="10" height="10" fill="#09090b"/>
  <rect x="97" y="112" width="12" height="12" fill="#09090b"/>
  <text x="90" y="158" text-anchor="middle" font-family="monospace" font-size="8" fill="#09090b">SN-2026-99825-EMTR</text>
  <text x="90" y="168" text-anchor="middle" font-family="sans-serif" font-style="italic" font-size="7" fill="#09090b">PERURI - DJP RI</text>
</svg>`);

export const SAMPLE_SIGNATURE_FADLI =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 90" width="240" height="90">
  <path d="M 20 60 Q 35 15 50 45 T 80 50 Q 100 20 120 55 T 160 45 Q 190 35 220 50" fill="none" stroke="#0a1fd4" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M 40 45 Q 90 40 170 50" fill="none" stroke="#0a1fd4" stroke-width="2" stroke-linecap="round"/>
</svg>`);

export const SAMPLE_SIGNATURE_BUDI =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 90" width="240" height="90">
  <path d="M 25 70 Q 30 20 45 40 Q 60 60 75 35 T 110 55 Q 140 25 175 60 T 215 45" fill="none" stroke="#1e293b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M 35 55 Q 110 50 190 58" fill="none" stroke="#1e293b" stroke-width="2" stroke-linecap="round"/>
</svg>`);

/**
 * Kesepakatan contoh milik akun demo Fadli (paket Pro, sudah disepakati di Versi 5).
 * Memiliki riwayat lengkap 5 versi dokumen dan 4 permintaan perubahan dari klien.
 */
export function buildDemoAgreement(ownerId: string, reviewToken = "token_abc_solusidigital_2026"): AgreementRecord {
  const agreementId = "agr_default_001";

  const versions: AgreementVersionRecord[] = [
    {
      id: "ver_default_001",
      agreementId,
      versionNumber: 1,
      contentJson: DEMO_CONTRACT_V1,
      documentHash: "",
      createdBy: "Fadli Bilal",
      createdAt: "2026-09-20T08:00:00.000Z",
    },
    {
      id: "ver_default_002",
      agreementId,
      versionNumber: 2,
      contentJson: DEMO_CONTRACT_V2,
      documentHash: "",
      createdBy: "Fadli Bilal",
      createdAt: "2026-09-21T11:00:00.000Z",
    },
    {
      id: "ver_default_003",
      agreementId,
      versionNumber: 3,
      contentJson: DEMO_CONTRACT_V3,
      documentHash: "",
      createdBy: "Fadli Bilal",
      createdAt: "2026-09-22T14:30:00.000Z",
    },
    {
      id: "ver_default_004",
      agreementId,
      versionNumber: 4,
      contentJson: DEMO_CONTRACT_V4,
      documentHash: "",
      createdBy: "Fadli Bilal",
      createdAt: "2026-09-23T16:45:00.000Z",
    },
    {
      id: "ver_default_005",
      agreementId,
      versionNumber: 5,
      contentJson: DEMO_CONTRACT_V5,
      documentHash: "",
      createdBy: "Fadli Bilal",
      createdAt: "2026-09-24T15:30:00.000Z",
    },
  ];

  const currentVersion = versions[4];

  const approvals: AgreementApprovalRecord[] = [
    {
      id: "app_free_005",
      agreementId,
      versionId: currentVersion.id,
      versionNumber: 5,
      signerName: "Fadli Bilal",
      signerEmail: "fadli@sepakatin.id",
      role: "freelancer",
      status: "APPROVED",
      documentHash: "",
      approvedAt: "2026-09-24T16:20:00.000Z",
    },
    {
      id: "app_client_005",
      agreementId,
      versionId: currentVersion.id,
      versionNumber: 5,
      signerName: "Budi Santoso",
      signerEmail: "budi@solusidigital.id",
      role: "client",
      status: "APPROVED",
      documentHash: "",
      approvedAt: "2026-09-24T16:30:00.000Z",
    },
  ];

  const activityLogs: ActivityLogItem[] = [
    {
      id: "log_001",
      agreementId,
      actorName: "Fadli Bilal",
      eventType: "CREATED",
      description: "Draf kesepakatan SPK-2026-00124 (Versi 1) dibuat oleh Fadli Bilal",
      createdAt: "2026-09-20T08:00:00.000Z",
    },
    {
      id: "log_002",
      agreementId,
      actorName: "Fadli Bilal",
      eventType: "SENT_TO_CLIENT",
      description: "Link kesepakatan dikirim ke klien (budi@solusidigital.id)",
      createdAt: "2026-09-20T09:00:00.000Z",
    },
    {
      id: "log_003",
      agreementId,
      actorName: "Budi Santoso",
      eventType: "CHANGE_REQUESTED",
      description: 'Klien meminta perubahan: "Penambahan Modul CMS Berita & Artikel"',
      createdAt: "2026-09-21T09:15:00.000Z",
    },
    {
      id: "log_004",
      agreementId,
      actorName: "Fadli Bilal",
      eventType: "VERSION_BUMPED",
      description: "Kesepakatan diperbarui menjadi versi 2 (tambah modul CMS berita mandiri)",
      createdAt: "2026-09-21T11:00:00.000Z",
    },
    {
      id: "log_005",
      agreementId,
      actorName: "Budi Santoso",
      eventType: "CHANGE_REQUESTED",
      description: 'Klien meminta perubahan: "Integrasi Form Lamaran Karir & Notifikasi WhatsApp HRD"',
      createdAt: "2026-09-22T10:00:00.000Z",
    },
    {
      id: "log_006",
      agreementId,
      actorName: "Fadli Bilal",
      eventType: "VERSION_BUMPED",
      description: "Kesepakatan diperbarui menjadi versi 3 (tambah portal karir & webhook WA HRD)",
      createdAt: "2026-09-22T14:30:00.000Z",
    },
    {
      id: "log_007",
      agreementId,
      actorName: "Budi Santoso",
      eventType: "CHANGE_REQUESTED",
      description: 'Klien meminta perubahan: "Fitur Multi-bahasa (Bilingual Indonesia - Inggris)"',
      createdAt: "2026-09-23T11:20:00.000Z",
    },
    {
      id: "log_008",
      agreementId,
      actorName: "Fadli Bilal",
      eventType: "VERSION_BUMPED",
      description: "Kesepakatan diperbarui menjadi versi 4 (tambah arsitektur multi-bahasa ID/EN)",
      createdAt: "2026-09-23T16:45:00.000Z",
    },
    {
      id: "log_009",
      agreementId,
      actorName: "Budi Santoso",
      eventType: "CHANGE_REQUESTED",
      description: 'Klien meminta perubahan: "Optimasi SEO Teknis, GA4/Meta Pixel & Perpanjangan Garansi 60 Hari"',
      createdAt: "2026-09-24T13:00:00.000Z",
    },
    {
      id: "log_010",
      agreementId,
      actorName: "Fadli Bilal",
      eventType: "VERSION_BUMPED",
      description: "Kesepakatan diperbarui menjadi versi 5 (tambah tracking analitik, SEO on-page, dan garansi 60 hari)",
      createdAt: "2026-09-24T15:30:00.000Z",
    },
    {
      id: "log_011",
      agreementId,
      actorName: "Fadli Bilal",
      eventType: "FREELANCER_APPROVED",
      description: "Fadli Bilal (freelancer) menyetujui versi 5 dan menandatangani dokumen",
      createdAt: "2026-09-24T16:20:00.000Z",
    },
    {
      id: "log_012",
      agreementId,
      actorName: "Fadli Bilal",
      eventType: "VERSION_BUMPED",
      description: "Fadli Bilal menempelkan e-Materai Rp10.000 pada salinan freelancer (di kolom tanda tangan klien)",
      createdAt: "2026-09-24T16:25:00.000Z",
    },
    {
      id: "log_013",
      agreementId,
      actorName: "Fadli Bilal",
      eventType: "SENT_TO_CLIENT",
      description: "Link kesepakatan versi 5 dikirim ke klien (budi@solusidigital.id) untuk persetujuan",
      createdAt: "2026-09-24T16:26:00.000Z",
    },
    {
      id: "log_014",
      agreementId,
      actorName: "Budi Santoso",
      eventType: "CLIENT_APPROVED",
      description: "Budi Santoso (klien) menyetujui versi 5 dan menandatangani dokumen",
      createdAt: "2026-09-24T16:30:00.000Z",
    },
    {
      id: "log_015",
      agreementId,
      actorName: "Sistem Sepakatin",
      eventType: "AGREED_LOCKED",
      description: "Kedua pihak sudah setuju dengan versi 5. Dokumen dikunci dan berkas resmi kedua salinan bermeterai siap diakses.",
      createdAt: "2026-09-24T16:30:00.000Z",
    },
  ];

  return {
    id: agreementId,
    projectId: "proj_default_001",
    contractId: DEMO_CONTRACT_ID,
    status: "AGREED",
    currentVersionNumber: 5,
    reviewToken,
    ownerId,
    plan: "pro",
    validFrom: "2026-09-20",
    validUntil: "2026-12-31",
    createdBy: "Fadli Bilal",
    createdAt: "2026-09-20T08:00:00.000Z",
    updatedAt: "2026-09-24T16:30:00.000Z",
    versions,
    currentVersion,
    approvals,
    changeRequests: DEMO_CHANGE_REQUESTS,
    activityLogs,
    stampedDocuments: [
      {
        id: "sdoc_demo_001",
        agreementId,
        copyType: "freelancer_copy",
        fileName: "SPK-2026-00124-Salinan-Freelancer-Bermeterai.pdf",
        fileUrl: generateSampleStampedPdfDataUrl(DEMO_CONTRACT_ID, "freelancer_copy", DEMO_CONTRACT_V5.projectName),
        fileSize: 42500,
        uploadedAt: "2026-09-24T16:25:00.000Z",
        uploadedBy: "Fadli Bilal",
        notes: "Salinan resmi Pihak Pertama (Freelancer) bermeterai elektronik Peruri",
      },
      {
        id: "sdoc_demo_002",
        agreementId,
        copyType: "client_copy",
        fileName: "SPK-2026-00124-Salinan-Klien-Bermeterai.pdf",
        fileUrl: generateSampleStampedPdfDataUrl(DEMO_CONTRACT_ID, "client_copy", DEMO_CONTRACT_V5.projectName),
        fileSize: 42500,
        uploadedAt: "2026-09-24T16:26:00.000Z",
        uploadedBy: "Fadli Bilal",
        notes: "Salinan resmi Pihak Kedua (Klien) bermeterai elektronik Peruri",
      },
    ],
    ematerai: {
      id: "emtr_demo_001",
      agreementId,
      versionNumber: 5,
      imageUrl: SAMPLE_EMATERAI_SVG_DATA_URL,
      serialNumber: "SN-2026-99824-EMTR",
      targetCopy: "freelancer_copy",
      uploadedAt: "2026-09-24T16:25:00.000Z",
      uploadedBy: "Fadli Bilal",
    },
    emateraiList: [
      {
        id: "emtr_demo_001",
        agreementId,
        versionNumber: 5,
        imageUrl: SAMPLE_EMATERAI_SVG_DATA_URL,
        serialNumber: "SN-2026-99824-EMTR",
        targetCopy: "freelancer_copy",
        uploadedAt: "2026-09-24T16:25:00.000Z",
        uploadedBy: "Fadli Bilal",
      },
      {
        id: "emtr_demo_002",
        agreementId,
        versionNumber: 5,
        imageUrl: SAMPLE_EMATERAI_CLIENT_SVG_DATA_URL,
        serialNumber: "SN-2026-99825-EMTR",
        targetCopy: "client_copy",
        uploadedAt: "2026-09-24T16:26:00.000Z",
        uploadedBy: "Fadli Bilal",
      },
    ],
    signatures: [
      {
        id: "sig_001",
        agreementId,
        signerRole: "freelancer",
        signerName: "Fadli Bilal",
        signatureDataUrl: SAMPLE_SIGNATURE_FADLI,
        signedAt: "2026-09-24T16:20:00.000Z",
      },
      {
        id: "sig_002",
        agreementId,
        signerRole: "client",
        signerName: "Budi Santoso",
        signatureDataUrl: SAMPLE_SIGNATURE_BUDI,
        signedAt: "2026-09-24T16:30:00.000Z",
      },
    ],
  };
}

/**
 * Kesepakatan contoh dengan segel hash SHA-256 yang sudah dihitung untuk setiap versinya.
 */
export async function buildSealedDemoAgreement(ownerId: string, reviewToken?: string): Promise<AgreementRecord> {
  const agr = structuredClone(buildDemoAgreement(ownerId, reviewToken));

  // Hitung hash independen untuk masing-masing versi (1 s/d 5)
  for (const v of agr.versions) {
    v.documentHash = await generateDocumentHash(v.contentJson);
  }

  // Versi aktif adalah versi 5
  agr.currentVersion = agr.versions[agr.versions.length - 1];

  // Approvals mengacu ke hash versi 5
  agr.approvals.forEach((a) => {
    a.documentHash = agr.currentVersion.documentHash;
  });

  return agr;
}
