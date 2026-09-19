// ==============================================================================
// Sepakatin — Data contoh untuk demo (dokumen SPK-2026-00124)
// ==============================================================================

import {
  AgreementRecord,
  AgreementVersionRecord,
  AgreementApprovalRecord,
  ActivityLogItem,
  ContractContentJSON,
} from "./types";
import { generateDocumentHash } from "./crypto";

export const DEMO_CONTRACT_ID = "SPK-2026-00124";

// Default Initial Mock Content matching PRD Section 34 Scenario
export const DEMO_CONTRACT_CONTENT: ContractContentJSON = {
  contractId: DEMO_CONTRACT_ID,
  projectName: "Website Profil Perusahaan PT Solusi Digital",
  freelancer: {
    name: "Fadli Bilal",
    email: "fadli@sepakatin.id",
    phone: "+62 812-3456-7890",
    role: "Fullstack Web Developer",
    company: "Studio Kreasi Mandiri",
  },
  client: {
    name: "Budi Santoso",
    email: "budi@solusidigital.id",
    phone: "+62 811-9876-5432",
    company: "PT Solusi Digital Nusantara",
    address: "Jl. Sudirman Kav. 24, Jakarta Selatan",
  },
  scope: {
    description:
      "Pembuatan website profil perusahaan yang modern, tampil rapi di HP maupun komputer, mudah ditemukan di Google, dan dilengkapi halaman admin untuk mengelola artikel serta halaman layanan.",
    deliverables: [
      "Desain tampilan website untuk komputer dan HP",
      "Pembuatan website sesuai desain yang sudah disetujui",
      "Halaman admin untuk mengelola artikel dan portofolio sendiri",
      "Pemasangan domain dan hosting sampai website bisa diakses online",
    ],
    exclusions: [
      "Penulisan isi artikel/teks dan pembuatan video",
      "Fitur pembayaran online atau toko online",
      "Perawatan website setelah masa garansi 30 hari",
    ],
    acceptanceCriteria: [
      "Website tampil rapi di Google Chrome, Safari, dan HP",
      "Halaman website terbuka cepat (kurang dari 3 detik)",
      "Semua formulir kontak terkirim ke email resmi perusahaan",
    ],
  },
  payment: {
    totalValue: 8000000,
    currency: "IDR",
    paymentMethod: "Transfer Bank BCA / Bank Mandiri",
    dpPercent: 50,
    milestones: [
      {
        title: "Uang muka (DP) & mulai desain",
        amount: 4000000,
        dueDate: "2026-09-22",
      },
      {
        title: "Website selesai dibuat & halaman admin siap",
        amount: 2400000,
        dueDate: "2026-10-15",
      },
      {
        title: "Pelunasan & serah terima website",
        amount: 1600000,
        dueDate: "2026-10-30",
      },
    ],
    finalPaymentDueDays: 7,
  },
  revision: {
    count: 3,
    terms:
      "Revisi kecil meliputi perubahan tata letak, teks, dan warna, tanpa menambah halaman baru di luar kesepakatan.",
    extraRevisionRate: 400000,
  },
  timeline: {
    startDate: "2026-09-22",
    deadline: "2026-10-30",
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
  validUntil: "2026-11-15",
  specialNotes: "Komunikasi proyek dilakukan lewat grup WhatsApp dan email.",
};

/**
 * Kesepakatan contoh milik akun demo Fadli (paket Pro, sudah disepakati).
 * `reviewToken` bisa diganti agar link klien tidak bisa ditebak (dipakai saat seed Supabase).
 */
export function buildDemoAgreement(ownerId: string, reviewToken = "token_abc_solusidigital_2026"): AgreementRecord {
  // Segel (hash) diisi oleh buildSealedDemoAgreement
  const initialHash = "";
  const agreementId = "agr_default_001";
  const versionId = "ver_default_001";

  const initialVersion: AgreementVersionRecord = {
    id: versionId,
    agreementId: agreementId,
    versionNumber: 1,
    contentJson: DEMO_CONTRACT_CONTENT,
    documentHash: initialHash,
    createdBy: "Fadli Bilal",
    createdAt: "2026-09-20T08:00:00.000Z",
  };

  const initialApprovalFreelancer: AgreementApprovalRecord = {
    id: "app_free_001",
    agreementId: agreementId,
    versionId: versionId,
    versionNumber: 1,
    signerName: "Fadli Bilal",
    signerEmail: "fadli@sepakatin.id",
    role: "freelancer",
    status: "APPROVED",
    documentHash: initialHash,
    approvedAt: "2026-09-20T10:12:00.000Z",
  };

  const initialApprovalClient: AgreementApprovalRecord = {
    id: "app_cli_001",
    agreementId: agreementId,
    versionId: versionId,
    versionNumber: 1,
    signerName: "Budi Santoso",
    signerEmail: "budi@solusidigital.id",
    role: "client",
    status: "APPROVED",
    documentHash: initialHash,
    approvedAt: "2026-09-20T10:14:00.000Z",
  };

  const initialActivityLogs: ActivityLogItem[] = [
    {
      id: "log_001",
      agreementId: agreementId,
      actorName: "Fadli Bilal",
      eventType: "CREATED",
      description: "Draf kesepakatan SPK-2026-00124 dibuat",
      createdAt: "2026-09-20T08:00:00.000Z",
    },
    {
      id: "log_002",
      agreementId: agreementId,
      actorName: "Fadli Bilal",
      eventType: "SENT_TO_CLIENT",
      description: "Link kesepakatan dikirim ke klien (budi@solusidigital.id)",
      createdAt: "2026-09-20T09:00:00.000Z",
    },
    {
      id: "log_003",
      agreementId: agreementId,
      actorName: "Fadli Bilal",
      eventType: "FREELANCER_APPROVED",
      description: "Fadli Bilal (freelancer) menyetujui versi 1",
      createdAt: "2026-09-20T10:12:00.000Z",
    },
    {
      id: "log_004",
      agreementId: agreementId,
      actorName: "Budi Santoso",
      eventType: "CLIENT_APPROVED",
      description: "Budi Santoso (klien) menyetujui seluruh isi versi 1",
      createdAt: "2026-09-20T10:14:00.000Z",
    },
    {
      id: "log_005",
      agreementId: agreementId,
      actorName: "Sistem Sepakatin",
      eventType: "AGREED_LOCKED",
      description: "Kedua pihak sudah setuju. Dokumen dikunci dan tidak bisa diubah lagi.",
      createdAt: "2026-09-20T10:14:05.000Z",
    },
  ];

  return {
    id: agreementId,
    projectId: "proj_default_001",
    contractId: DEMO_CONTRACT_ID,
    status: "AGREED",
    currentVersionNumber: 1,
    reviewToken,
    ownerId,
    plan: "pro",
    validFrom: "2026-09-20",
    validUntil: "2026-11-15",
    createdBy: "Fadli Bilal",
    createdAt: "2026-09-20T08:00:00.000Z",
    updatedAt: "2026-09-20T10:14:05.000Z",
    versions: [initialVersion],
    currentVersion: initialVersion,
    approvals: [initialApprovalFreelancer, initialApprovalClient],
    changeRequests: [],
    activityLogs: initialActivityLogs,
    ematerai: {
      id: "emtr_demo_001",
      agreementId: agreementId,
      versionNumber: 1,
      imageUrl: SAMPLE_EMATERAI_SVG_DATA_URL,
      serialNumber: "SN-2026-99824-EMTR",
      targetCopy: "freelancer_copy",
      uploadedAt: "2026-09-20T10:13:00.000Z",
      uploadedBy: "Fadli Bilal",
    },
    signatures: [
      {
        id: "sig_001",
        agreementId: agreementId,
        signerRole: "freelancer",
        signerName: "Fadli Bilal",
        signatureDataUrl: SAMPLE_SIGNATURE_FADLI,
        signedAt: "2026-09-20T10:12:00.000Z",
      },
      {
        id: "sig_002",
        agreementId: agreementId,
        signerRole: "client",
        signerName: "Budi Santoso",
        signatureDataUrl: SAMPLE_SIGNATURE_BUDI,
        signedAt: "2026-09-20T10:14:00.000Z",
      },
    ],
  };
}

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


/** Kesepakatan contoh dengan segel (hash) yang sudah dihitung. */
export async function buildSealedDemoAgreement(ownerId: string, reviewToken?: string): Promise<AgreementRecord> {
  const agr = structuredClone(buildDemoAgreement(ownerId, reviewToken));
  const hash = await generateDocumentHash(agr.currentVersion.contentJson);
  agr.versions.forEach((v) => (v.documentHash = hash));
  agr.currentVersion = agr.versions[0];
  agr.approvals.forEach((a) => (a.documentHash = hash));
  return agr;
}
