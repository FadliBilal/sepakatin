// ==============================================================================
// Sepakatin — Aturan bisnis kesepakatan (murni, tanpa database)
// Dipakai oleh API server (Supabase) dan mode lokal agar hasilnya selalu sama.
// ==============================================================================

import {
  AgreementRecord,
  AgreementStatus,
  AgreementVersionRecord,
  ContractContentJSON,
  CopyType,
  PlanId,
  PublicVerificationData,
} from "./types";
import { generateDocumentHash } from "./crypto";
import { FREE_RULES, isPremiumPlan } from "./plans";

/** Kesalahan yang aman ditampilkan ke pengguna. `status` dipakai sebagai kode HTTP. */
export class AgreementError extends Error {
  status: number;
  code: string;
  constructor(message: string, status = 400, code = "BAD_REQUEST") {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export type OwnerAction =
  | { type: "send" }
  | { type: "approve" }
  | { type: "newVersion"; content: ContractContentJSON }
  | { type: "ematerai"; imageUrl: string; serialNumber?: string; targetCopy: CopyType }
  | { type: "removeEmaterai" }
  | { type: "signature"; dataUrl: string }
  | { type: "complete" }
  | { type: "cancel" };

export type ClientAction =
  | { type: "approve"; name: string; email: string }
  | { type: "requestChange"; name: string; email?: string; title: string; description: string }
  | { type: "signature"; name: string; dataUrl: string };

/** Kesepakatan yang sudah disetujui kedua pihak atau ditutup tidak bisa diubah isinya. */
const LOCKED_STATUSES: AgreementStatus[] = ["AGREED", "ACTIVE", "COMPLETED", "CANCELLED", "EXPIRED", "REJECTED"];
const CLOSED_FOR_CLIENT: AgreementStatus[] = ["DRAFT", "COMPLETED", "CANCELLED", "EXPIRED", "REJECTED"];

const MAX_IMAGE_CHARS = 1_500_000; // ± 1,1 MB gambar base64
const PREMIUM_MESSAGE =
  "Fitur ini khusus kesepakatan Per Proyek atau Pro. Kesepakatan paket Gratis tidak bisa memakai fitur ini.";

let idCounter = 0;
export function newId(prefix: string): string {
  idCounter = (idCounter + 1) % 1000;
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 12)
      : Math.random().toString(36).slice(2, 14);
  return `${prefix}_${Date.now().toString(36)}${idCounter}${rand}`;
}

export function newReviewToken(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `rev_${crypto.randomUUID().replace(/-/g, "")}${crypto.randomUUID().replace(/-/g, "").slice(0, 8)}`;
  }
  return `rev_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
}

// ------------------------------------------------------------------------------
// Validasi isi kesepakatan
// ------------------------------------------------------------------------------

function text(value: unknown, label: string, { required = false, max = 2000 } = {}): string {
  const v = typeof value === "string" ? value.trim() : "";
  if (required && !v) throw new AgreementError(`${label} wajib diisi.`);
  if (v.length > max) throw new AgreementError(`${label} terlalu panjang (maks. ${max} karakter).`);
  return v;
}

function amount(value: unknown, label: string, max = 1e13): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0 || n > max) throw new AgreementError(`${label} tidak valid.`);
  return Math.round(n);
}

function list(value: unknown, label: string, maxItems = 30): string[] {
  if (!Array.isArray(value)) return [];
  if (value.length > maxItems) throw new AgreementError(`${label} maksimal ${maxItems} baris.`);
  return value.map((v, i) => text(v, `${label} baris ${i + 1}`, { max: 500 })).filter(Boolean);
}

function date(value: unknown, label: string, required = false): string {
  const v = typeof value === "string" ? value.trim() : "";
  if (!v) {
    if (required) throw new AgreementError(`${label} wajib diisi.`);
    return "";
  }
  if (Number.isNaN(new Date(v).getTime())) throw new AgreementError(`${label} tidak valid.`);
  return v.slice(0, 10);
}

function email(value: unknown, label: string): string {
  const v = text(value, label, { required: true, max: 254 }).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) throw new AgreementError(`${label} tidak valid.`);
  return v;
}

/** Membersihkan & memvalidasi isi kesepakatan dari formulir. Field asing dibuang. */
export function sanitizeContent(raw: ContractContentJSON, contractId: string): ContractContentJSON {
  if (!raw || typeof raw !== "object") throw new AgreementError("Isi kesepakatan kosong.");
  const f = raw.freelancer ?? ({} as ContractContentJSON["freelancer"]);
  const c = raw.client ?? ({} as ContractContentJSON["client"]);
  const pay = raw.payment ?? ({} as ContractContentJSON["payment"]);
  const rev = raw.revision ?? ({} as ContractContentJSON["revision"]);

  const totalValue = amount(pay.totalValue, "Total harga");
  const dpPercent = amount(pay.dpPercent, "Persentase DP", 100);
  const milestones = Array.isArray(pay.milestones)
    ? pay.milestones.slice(0, 20).map((m, i) => ({
        title: text(m?.title, `Tahap pembayaran ${i + 1}`, { required: true, max: 200 }),
        amount: amount(m?.amount, `Nominal tahap ${i + 1}`),
        ...(m?.dueDate ? { dueDate: date(m.dueDate, `Tanggal tahap ${i + 1}`) } : {}),
      }))
    : [];

  const startDate = date(raw.timeline?.startDate, "Tanggal mulai", true);
  const deadline = date(raw.timeline?.deadline, "Tenggat selesai", true);
  if (new Date(deadline) < new Date(startDate)) {
    throw new AgreementError("Tenggat selesai tidak boleh sebelum tanggal mulai.");
  }

  return {
    contractId,
    projectName: text(raw.projectName, "Nama proyek", { required: true, max: 200 }),
    freelancer: {
      name: text(f.name, "Nama freelancer", { required: true, max: 120 }),
      email: email(f.email, "Email freelancer"),
      phone: text(f.phone, "WhatsApp freelancer", { max: 40 }),
      role: text(f.role, "Keahlian", { max: 120 }),
      ...(f.company ? { company: text(f.company, "Nama usaha freelancer", { max: 160 }) } : {}),
    },
    client: {
      name: text(c.name, "Nama klien", { required: true, max: 120 }),
      email: email(c.email, "Email klien"),
      phone: text(c.phone, "WhatsApp klien", { max: 40 }),
      company: text(c.company, "Perusahaan klien", { max: 160 }),
      ...(c.address ? { address: text(c.address, "Alamat klien", { max: 300 }) } : {}),
    },
    scope: {
      description: text(raw.scope?.description, "Gambaran pekerjaan", { required: true, max: 3000 }),
      deliverables: list(raw.scope?.deliverables, "Hasil kerja"),
      exclusions: list(raw.scope?.exclusions, "Yang tidak termasuk"),
      acceptanceCriteria: list(raw.scope?.acceptanceCriteria, "Kriteria selesai"),
    },
    payment: {
      totalValue,
      currency: "IDR",
      paymentMethod: text(pay.paymentMethod, "Cara pembayaran", { max: 300 }),
      dpPercent,
      milestones,
      finalPaymentDueDays: amount(pay.finalPaymentDueDays ?? 7, "Batas pelunasan", 365),
    },
    revision: {
      count: amount(rev.count, "Jatah revisi", 100),
      terms: text(rev.terms, "Ketentuan revisi", { max: 2000 }),
      extraRevisionRate: amount(rev.extraRevisionRate ?? 0, "Biaya revisi tambahan"),
    },
    timeline: { startDate, deadline },
    ip: {
      ownershipClause: text(raw.ip?.ownershipClause, "Kepemilikan hasil kerja", { max: 2000 }),
      ...(raw.ip?.customTerms ? { customTerms: text(raw.ip.customTerms, "Ketentuan tambahan", { max: 2000 }) } : {}),
    },
    termination: {
      cancellationCondition: text(raw.termination?.cancellationCondition, "Ketentuan pembatalan", { max: 2000 }),
      noticePeriodDays: amount(raw.termination?.noticePeriodDays ?? 7, "Masa pemberitahuan", 365),
      outstandingPaymentTerms: text(raw.termination?.outstandingPaymentTerms, "Ketentuan sisa pembayaran", { max: 2000 }),
    },
    validFrom: date(raw.validFrom, "Berlaku mulai") || startDate,
    validUntil: date(raw.validUntil, "Berlaku sampai") || deadline,
    ...(raw.specialNotes ? { specialNotes: text(raw.specialNotes, "Catatan khusus", { max: 2000 }) } : {}),
  };
}

function imageDataUrl(value: unknown, label: string): string {
  if (typeof value !== "string" || !/^data:image\/(png|jpe?g|webp|svg\+xml);base64,/.test(value)) {
    throw new AgreementError(`${label} harus berupa gambar PNG, JPG, WEBP, atau SVG.`);
  }
  if (value.length > MAX_IMAGE_CHARS) throw new AgreementError(`${label} terlalu besar. Maksimal sekitar 1 MB.`);
  return value;
}

// ------------------------------------------------------------------------------
// Membuat kesepakatan baru
// ------------------------------------------------------------------------------

export async function buildNewAgreement(params: {
  content: ContractContentJSON;
  contractId: string;
  ownerId: string;
  plan: PlanId;
  sendDirectly: boolean;
}): Promise<AgreementRecord> {
  const now = new Date().toISOString();
  const content = sanitizeContent(params.content, params.contractId);
  const agreementId = newId("agr");
  const versionId = newId("ver");
  const status: AgreementStatus = params.sendDirectly ? "PENDING_CLIENT" : "DRAFT";

  const version: AgreementVersionRecord = {
    id: versionId,
    agreementId,
    versionNumber: 1,
    contentJson: content,
    documentHash: await generateDocumentHash(content),
    createdBy: content.freelancer.name,
    createdAt: now,
  };

  const logs: AgreementRecord["activityLogs"] = [
    {
      id: newId("log"),
      agreementId,
      actorName: content.freelancer.name,
      eventType: "CREATED",
      description: `Kesepakatan ${params.contractId} dibuat oleh ${content.freelancer.name}`,
      createdAt: now,
    },
  ];
  if (params.sendDirectly) {
    logs.push({
      id: newId("log"),
      agreementId,
      actorName: content.freelancer.name,
      eventType: "SENT_TO_CLIENT",
      description: `Link kesepakatan dikirim ke klien (${content.client.email})`,
      createdAt: now,
    });
  }

  return {
    id: agreementId,
    projectId: newId("proj"),
    contractId: params.contractId,
    status,
    currentVersionNumber: 1,
    reviewToken: newReviewToken(),
    ownerId: params.ownerId,
    plan: params.plan,
    validFrom: content.validFrom,
    validUntil: content.validUntil,
    createdBy: content.freelancer.name,
    createdAt: now,
    updatedAt: now,
    versions: [version],
    currentVersion: version,
    approvals: [],
    changeRequests: [],
    activityLogs: logs,
    signatures: [],
  };
}

// ------------------------------------------------------------------------------
// Aksi pada kesepakatan
// ------------------------------------------------------------------------------

function requirePremium(agr: AgreementRecord) {
  if (!isPremiumPlan(agr.plan)) throw new AgreementError(PREMIUM_MESSAGE, 403, "PREMIUM_REQUIRED");
}

function log(agr: AgreementRecord, actorName: string, eventType: AgreementRecord["activityLogs"][number]["eventType"], description: string) {
  agr.activityLogs.push({ id: newId("log"), agreementId: agr.id, actorName, eventType, description, createdAt: new Date().toISOString() });
}

function hasApproved(agr: AgreementRecord, role: "freelancer" | "client") {
  return agr.approvals.some((ap) => ap.versionId === agr.currentVersion.id && ap.role === role && ap.status === "APPROVED");
}

function addApproval(agr: AgreementRecord, role: "freelancer" | "client", name: string, emailAddr: string) {
  const v = agr.currentVersion;
  if (hasApproved(agr, role)) return;
  agr.approvals.push({
    id: newId("app"),
    agreementId: agr.id,
    versionId: v.id,
    versionNumber: v.versionNumber,
    signerName: name,
    signerEmail: emailAddr,
    role,
    status: "APPROVED",
    documentHash: v.documentHash,
    approvedAt: new Date().toISOString(),
  });
  log(agr, name, role === "freelancer" ? "FREELANCER_APPROVED" : "CLIENT_APPROVED", `${name} (${role === "freelancer" ? "freelancer" : "klien"}) menyetujui versi ${v.versionNumber}`);

  if (hasApproved(agr, "freelancer") && hasApproved(agr, "client")) {
    agr.status = "AGREED";
    log(agr, "Sistem Sepakatin", "AGREED_LOCKED", `Kedua pihak sudah setuju dengan versi ${v.versionNumber}. Dokumen dikunci dan tidak bisa diubah lagi.`);
  }
}

function upsertSignature(agr: AgreementRecord, role: "freelancer" | "client", name: string, dataUrl: string) {
  const sigs = agr.signatures ?? [];
  const record = { id: newId("sig"), signerRole: role, signerName: name, signatureDataUrl: dataUrl, signedAt: new Date().toISOString() };
  const idx = sigs.findIndex((s) => s.signerRole === role);
  if (idx >= 0) sigs[idx] = record;
  else sigs.push(record);
  agr.signatures = sigs;
  log(agr, name, role === "freelancer" ? "FREELANCER_APPROVED" : "CLIENT_APPROVED", `${name} (${role === "freelancer" ? "freelancer" : "klien"}) menandatangani dokumen`);
}

/** Aksi yang dilakukan freelancer pemilik kesepakatan. Mengubah `agr` dan mengembalikannya. */
export async function applyOwnerAction(agr: AgreementRecord, action: OwnerAction): Promise<AgreementRecord> {
  const content = agr.currentVersion.contentJson;
  const owner = content.freelancer.name;
  const closed = ["COMPLETED", "CANCELLED", "EXPIRED", "REJECTED"].includes(agr.status);

  switch (action?.type) {
    case "send": {
      if (agr.status !== "DRAFT") throw new AgreementError("Kesepakatan ini sudah pernah dikirim ke klien.");
      agr.status = "PENDING_CLIENT";
      log(agr, owner, "SENT_TO_CLIENT", `Link kesepakatan dikirim ke klien (${content.client.email})`);
      break;
    }
    case "approve": {
      if (closed) throw new AgreementError("Kesepakatan ini sudah ditutup.");
      if (hasApproved(agr, "freelancer")) throw new AgreementError("Anda sudah menyetujui versi ini.");
      addApproval(agr, "freelancer", owner, content.freelancer.email);
      break;
    }
    case "newVersion": {
      if (LOCKED_STATUSES.includes(agr.status)) {
        throw new AgreementError("Kesepakatan yang sudah disepakati atau ditutup tidak bisa diubah lagi.", 409);
      }
      if (!isPremiumPlan(agr.plan) && agr.currentVersionNumber >= FREE_RULES.maxVersions) {
        throw new AgreementError(
          `Paket Gratis hanya bisa mengubah kesepakatan ${FREE_RULES.maxVersions - 1} kali. Gunakan kredit Per Proyek atau paket Pro untuk perubahan tanpa batas.`,
          403,
          "VERSION_LIMIT"
        );
      }
      const updated = sanitizeContent(action.content, agr.contractId);
      const v: AgreementVersionRecord = {
        id: newId("ver"),
        agreementId: agr.id,
        versionNumber: agr.currentVersionNumber + 1,
        contentJson: updated,
        documentHash: await generateDocumentHash(updated),
        createdBy: owner,
        createdAt: new Date().toISOString(),
      };
      agr.versions.push(v);
      agr.currentVersion = v;
      agr.currentVersionNumber = v.versionNumber;
      agr.validFrom = updated.validFrom;
      agr.validUntil = updated.validUntil;
      // Tanda tangan lama milik isi versi sebelumnya — harus ditandatangani ulang
      agr.signatures = [];
      agr.status = agr.status === "DRAFT" ? "DRAFT" : "PENDING_APPROVAL";
      agr.changeRequests.forEach((cr) => {
        if (cr.status === "OPEN") {
          cr.status = "APPLIED";
          cr.resolvedAt = new Date().toISOString();
        }
      });
      log(agr, owner, "VERSION_BUMPED", `Kesepakatan diperbarui menjadi versi ${v.versionNumber}. Kedua pihak perlu menyetujui ulang.`);
      break;
    }
    case "ematerai": {
      requirePremium(agr);
      if (closed) throw new AgreementError("Kesepakatan ini sudah ditutup.");
      if (action.targetCopy !== "freelancer_copy" && action.targetCopy !== "client_copy") {
        throw new AgreementError("Pilihan salinan tidak valid.");
      }
      agr.ematerai = {
        id: newId("emt"),
        agreementId: agr.id,
        versionNumber: agr.currentVersionNumber,
        imageUrl: imageDataUrl(action.imageUrl, "Gambar e-Materai"),
        serialNumber: text(action.serialNumber, "Nomor seri e-Materai", { max: 80 }) || undefined,
        targetCopy: action.targetCopy,
        uploadedAt: new Date().toISOString(),
        uploadedBy: owner,
      };
      const where = action.targetCopy === "freelancer_copy" ? "salinan freelancer (di kolom tanda tangan klien)" : "salinan klien (di kolom tanda tangan freelancer)";
      log(agr, owner, "VERSION_BUMPED", `${owner} menempelkan e-Materai Rp10.000 pada ${where}`);
      break;
    }
    case "removeEmaterai": {
      requirePremium(agr);
      if (!agr.ematerai) throw new AgreementError("Belum ada e-Materai di dokumen ini.");
      agr.ematerai = undefined;
      log(agr, owner, "VERSION_BUMPED", "e-Materai dilepas dari dokumen oleh freelancer");
      break;
    }
    case "signature": {
      if (closed) throw new AgreementError("Kesepakatan ini sudah ditutup.");
      upsertSignature(agr, "freelancer", owner, imageDataUrl(action.dataUrl, "Tanda tangan"));
      break;
    }
    case "complete": {
      if (agr.status !== "AGREED" && agr.status !== "ACTIVE") {
        throw new AgreementError("Hanya kesepakatan yang sudah disepakati yang bisa ditandai selesai.");
      }
      agr.status = "COMPLETED";
      log(agr, owner, "COMPLETED", "Proyek ditandai selesai oleh freelancer");
      break;
    }
    case "cancel": {
      if (closed) throw new AgreementError("Kesepakatan ini sudah ditutup.");
      agr.status = "CANCELLED";
      log(agr, owner, "CANCELLED", "Kesepakatan dibatalkan oleh freelancer");
      break;
    }
    default:
      throw new AgreementError("Aksi tidak dikenal.");
  }

  agr.updatedAt = new Date().toISOString();
  return agr;
}

/** Aksi yang dilakukan klien lewat link undangan (tanpa akun). */
export async function applyClientAction(agr: AgreementRecord, action: ClientAction): Promise<AgreementRecord> {
  if (CLOSED_FOR_CLIENT.includes(agr.status)) {
    throw new AgreementError(
      agr.status === "DRAFT" ? "Kesepakatan ini masih draf dan belum dikirim oleh freelancer." : "Kesepakatan ini sudah ditutup.",
      409
    );
  }

  switch (action?.type) {
    case "approve": {
      if (hasApproved(agr, "client")) throw new AgreementError("Anda sudah menyetujui versi ini.");
      addApproval(agr, "client", text(action.name, "Nama", { required: true, max: 120 }), email(action.email, "Email"));
      break;
    }
    case "requestChange": {
      requirePremium(agr);
      if (LOCKED_STATUSES.includes(agr.status)) throw new AgreementError("Kesepakatan sudah dikunci, tidak bisa minta perubahan lagi.", 409);
      const name = text(action.name, "Nama", { required: true, max: 120 });
      const title = text(action.title, "Judul perubahan", { required: true, max: 200 });
      agr.changeRequests.unshift({
        id: newId("cr"),
        agreementId: agr.id,
        requestedBy: name,
        requesterEmail: action.email ? email(action.email, "Email") : undefined,
        title,
        description: text(action.description, "Penjelasan perubahan", { required: true, max: 3000 }),
        status: "OPEN",
        createdAt: new Date().toISOString(),
      });
      agr.status = "CHANGES_REQUESTED";
      log(agr, name, "CHANGE_REQUESTED", `Klien meminta perubahan: "${title}"`);
      break;
    }
    case "signature": {
      upsertSignature(agr, "client", text(action.name, "Nama", { required: true, max: 120 }), imageDataUrl(action.dataUrl, "Tanda tangan"));
      break;
    }
    default:
      throw new AgreementError("Aksi tidak dikenal.");
  }

  agr.updatedAt = new Date().toISOString();
  return agr;
}

// ------------------------------------------------------------------------------
// Data publik untuk halaman cek keaslian (tanpa isi detail kontrak)
// ------------------------------------------------------------------------------

export async function toVerificationData(agr: AgreementRecord): Promise<PublicVerificationData> {
  const v = agr.currentVersion;
  const approvals = agr.approvals.filter((a) => a.versionId === v.id && a.status === "APPROVED");
  const computedHash = await generateDocumentHash(v.contentJson);
  return {
    contractId: agr.contractId,
    status: agr.status,
    projectName: v.contentJson.projectName,
    versionNumber: v.versionNumber,
    documentHash: v.documentHash,
    isIntegrityMatched: computedHash === v.documentHash,
    partiesApprovedCount: approvals.length,
    totalPartiesRequired: 2,
    freelancerApprovedAt: approvals.find((a) => a.role === "freelancer")?.approvedAt,
    clientApprovedAt: approvals.find((a) => a.role === "client")?.approvedAt,
    validFrom: v.contentJson.validFrom,
    validUntil: v.contentJson.validUntil,
    freelancerName: v.contentJson.freelancer.name,
    clientName: v.contentJson.client.name,
    verifiedAt: new Date().toISOString(),
  };
}
