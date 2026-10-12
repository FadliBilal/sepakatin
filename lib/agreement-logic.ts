import {
  AgreementRecord,
  AgreementStatus,
  AgreementVersionRecord,
  ContractContentJSON,
  CopyType,
  PlanId,
  PublicVerificationData,
  StampedDocumentRecord,
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
  get statusCode(): number {
    return this.status;
  }
}

export const REVIEW_TOKEN_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 hari TTL

export type OwnerAction =
  | { type: "send" }
  | { type: "approve" }
  | { type: "newVersion"; content: ContractContentJSON }
  | { type: "regenerateReviewToken" }
  | {
      type: "uploadStampedDocument";
      copyType: "freelancer_copy" | "client_copy";
      fileName: string;
      fileUrl?: string;
      storagePath?: string;
      fileSize?: number;
      notes?: string;
    }
  | {
      type: "removeStampedDocument";
      copyType: "freelancer_copy" | "client_copy";
    }
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

const MAX_OPEN_CHANGE_REQUESTS = 3;

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

  const validFrom = date(raw.validFrom, "Berlaku mulai") || startDate;
  const validUntil = date(raw.validUntil, "Berlaku sampai") || deadline;
  if (new Date(validUntil) < new Date(validFrom)) {
    throw new AgreementError("Tanggal berlaku sampai tidak boleh sebelum tanggal berlaku mulai.");
  }

  const deliverables = list(raw.scope?.deliverables, "Hasil kerja");
  if (deliverables.length === 0) {
    throw new AgreementError("Hasil kerja yang diserahkan minimal 1 baris.");
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
      deliverables,
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
  if (typeof value !== "string" || !/^data:image\/(png|jpe?g|webp|svg\+xml)(;base64|;utf8)?,/i.test(value)) {
    throw new AgreementError(`${label} harus berupa gambar PNG, JPG, WEBP, atau SVG.`);
  }
  if (value.length > MAX_IMAGE_CHARS) throw new AgreementError(`${label} terlalu besar. Maksimal sekitar 1 MB.`);
  return value;
}

const MAX_DOCUMENT_CHARS = 10_000_000; // ± 7.5 MB berkas dokumen base64

function documentDataUrl(value: unknown, label: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new AgreementError(`${label} wajib diisi.`);
  }
  const v = value.trim();
  if (v.length > MAX_DOCUMENT_CHARS) {
    throw new AgreementError(`${label} terlalu besar. Maksimal sekitar 7 MB.`);
  }

  if (v.startsWith("data:")) {
    // Validasi prefix Data URL harus application/pdf dengan encoding base64
    if (!v.toLowerCase().startsWith("data:application/pdf;base64,")) {
      throw new AgreementError(`${label} harus berupa berkas berformat PDF resmi (application/pdf).`);
    }
    const base64Data = v.slice("data:application/pdf;base64,".length).trim();
    // Validasi Magic Bytes: Setiap berkas PDF asli diawali dengan biner "%PDF-" yang dalam base64 dikodekan sebagai "JVBERi0"
    if (!base64Data.startsWith("JVBERi0")) {
      throw new AgreementError(`${label} tidak valid atau rusak. Berkas bukan dokumen PDF asli yang terverifikasi.`);
    }
    return v;
  }

  if (v.startsWith("http://") || v.startsWith("https://")) {
    return v;
  }

  // Mendukung format path Supabase Storage atau IndexedDB lokal
  if (
    v.startsWith("storage://") ||
    v.startsWith("indexeddb://") ||
    v.startsWith("agreement-documents/") ||
    /^agreements\/[\w-]+\/[\w.-]+\.pdf$/i.test(v)
  ) {
    return v;
  }

  throw new AgreementError(`${label} harus berupa berkas dokumen PDF yang valid.`);
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
    reviewTokenExpiresAt: params.sendDirectly
      ? new Date(Date.now() + REVIEW_TOKEN_TTL_MS).toISOString()
      : undefined,
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

function log(agr: AgreementRecord, actorName: string, eventType: AgreementRecord["activityLogs"][number]["eventType"], description: string) {
  agr.activityLogs.push({ id: newId("log"), agreementId: agr.id, actorName, eventType, description, createdAt: new Date().toISOString() });
}

function hasApproved(agr: AgreementRecord, role: "freelancer" | "client") {
  return agr.approvals.some((ap) => ap.versionId === agr.currentVersion.id && ap.role === role && ap.status === "APPROVED");
}

/** Jejak teknis yang hanya boleh diisi server. */
export interface RequestContext {
  ipAddress?: string;
  userAgent?: string;
}

function addApproval(
  agr: AgreementRecord,
  role: "freelancer" | "client",
  name: string,
  emailAddr: string,
  ctx?: RequestContext
) {
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
    ...(ctx?.ipAddress ? { ipAddress: ctx.ipAddress } : {}),
    ...(ctx?.userAgent ? { userAgent: ctx.userAgent.slice(0, 300) } : {}),
  });
  log(agr, name, role === "freelancer" ? "FREELANCER_APPROVED" : "CLIENT_APPROVED", `${name} (${role === "freelancer" ? "freelancer" : "klien"}) menyetujui versi ${v.versionNumber}`);

  if (hasApproved(agr, "freelancer") && hasApproved(agr, "client")) {
    agr.status = "AGREED";
    log(agr, "Sistem Sepakatin", "AGREED_LOCKED", `Kedua pihak sudah setuju dengan versi ${v.versionNumber}. Dokumen dikunci dan tidak bisa diubah lagi.`);
  }
}

function upsertSignature(
  agr: AgreementRecord,
  role: "freelancer" | "client",
  name: string,
  dataUrl: string,
  ctx?: RequestContext
) {
  const sigs = agr.signatures ?? [];
  const record = {
    id: newId("sig"),
    signerRole: role,
    signerName: name,
    signatureDataUrl: dataUrl,
    signedAt: new Date().toISOString(),
    ...(ctx?.ipAddress ? { ipAddress: ctx.ipAddress } : {}),
    ...(ctx?.userAgent ? { userAgent: ctx.userAgent.slice(0, 300) } : {}),
  };
  const idx = sigs.findIndex((s) => s.signerRole === role);
  if (idx >= 0) sigs[idx] = record;
  else sigs.push(record);
  agr.signatures = sigs;
  log(agr, name, role === "freelancer" ? "FREELANCER_APPROVED" : "CLIENT_APPROVED", `${name} (${role === "freelancer" ? "freelancer" : "klien"}) menandatangani dokumen`);
}

/** Aksi yang dilakukan freelancer pemilik kesepakatan. Mengubah `agr` dan mengembalikannya. */
export async function applyOwnerAction(
  agr: AgreementRecord,
  action: OwnerAction,
  ctx?: RequestContext
): Promise<AgreementRecord> {
  const content = agr.currentVersion.contentJson;
  const owner = content.freelancer.name;
  const closed = ["COMPLETED", "CANCELLED", "EXPIRED", "REJECTED"].includes(agr.status);

  switch (action?.type) {
    case "send": {
      if (agr.status !== "DRAFT") throw new AgreementError("Kesepakatan ini sudah pernah dikirim ke klien.");
      agr.status = "PENDING_CLIENT";
      agr.reviewTokenExpiresAt = new Date(Date.now() + REVIEW_TOKEN_TTL_MS).toISOString();
      log(agr, owner, "SENT_TO_CLIENT", `Link kesepakatan dikirim ke klien (${content.client.email})`);
      break;
    }
    case "regenerateReviewToken": {
      if (closed) throw new AgreementError("Kesepakatan ini sudah ditutup.");
      agr.reviewToken = newReviewToken();
      agr.reviewTokenExpiresAt = new Date(Date.now() + REVIEW_TOKEN_TTL_MS).toISOString();
      log(
        agr,
        owner,
        "SENT_TO_CLIENT",
        `${owner} menerbitkan ulang tautan review klien. Tautan sebelumnya otomatis dinonaktifkan.`
      );
      break;
    }
    case "approve": {
      if (closed) throw new AgreementError("Kesepakatan ini sudah ditutup.");
      if (hasApproved(agr, "freelancer")) throw new AgreementError("Anda sudah menyetujui versi ini.");
      addApproval(agr, "freelancer", owner, content.freelancer.email, ctx);
      break;
    }
    case "newVersion": {
      if (LOCKED_STATUSES.includes(agr.status)) {
        throw new AgreementError("Kesepakatan yang sudah disepakati atau ditutup tidak bisa diubah lagi.", 409);
      }
      if (agr.status === "DRAFT") {
        // Draf yang belum dikirim ke klien diedit langsung in-place tanpa menaikkan versi
        const updated = sanitizeContent(action.content, agr.contractId);
        const hash = await generateDocumentHash(updated);
        agr.currentVersion.contentJson = updated;
        agr.currentVersion.documentHash = hash;
        agr.currentVersion.createdAt = new Date().toISOString();
        const vIdx = agr.versions.findIndex((v) => v.id === agr.currentVersion.id);
        if (vIdx >= 0) {
          agr.versions[vIdx] = agr.currentVersion;
        }
        agr.validFrom = updated.validFrom;
        agr.validUntil = updated.validUntil;
        agr.signatures = [];
        log(agr, owner, "VERSION_BUMPED", `${owner} memperbarui isi draf kesepakatan`);
        break;
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
      agr.status = "PENDING_APPROVAL";
      agr.changeRequests.forEach((cr) => {
        if (cr.status === "OPEN") {
          cr.status = "APPLIED";
          cr.resolvedAt = new Date().toISOString();
        }
      });
      log(agr, owner, "VERSION_BUMPED", `Kesepakatan diperbarui menjadi versi ${v.versionNumber}. Kedua pihak perlu menyetujui ulang.`);
      break;
    }
    case "uploadStampedDocument": {
      if (closed) throw new AgreementError("Kesepakatan ini sudah ditutup.");
      if (action.copyType !== "freelancer_copy" && action.copyType !== "client_copy") {
        throw new AgreementError("Pilihan salinan dokumen tidak valid.");
      }
      const safeFileName = text(action.fileName, "Nama file dokumen", { required: true, max: 200 });
      let safeUrl = "";
      const safeStoragePath = action.storagePath ? text(action.storagePath, "Path penyimpanan", { max: 500 }) : undefined;

      if (action.fileUrl) {
        safeUrl = documentDataUrl(action.fileUrl, "File dokumen bermeterai");
      } else if (!safeStoragePath) {
        throw new AgreementError("Berkas dokumen atau path penyimpanan wajib diisi.");
      }
      const safeNotes = action.notes ? text(action.notes, "Catatan dokumen", { max: 500 }) : undefined;

      const newDoc: StampedDocumentRecord = {
        id: newId("doc"),
        agreementId: agr.id,
        copyType: action.copyType,
        fileName: safeFileName,
        fileUrl: safeUrl,
        storagePath: safeStoragePath,
        fileSize: typeof action.fileSize === "number" ? action.fileSize : undefined,
        uploadedAt: new Date().toISOString(),
        uploadedBy: owner,
        notes: safeNotes,
      };

      const existingDocs = agr.stampedDocuments ? [...agr.stampedDocuments] : [];
      const filtered = existingDocs.filter((d) => d.copyType !== action.copyType);
      filtered.push(newDoc);
      agr.stampedDocuments = filtered;

      const copyLabel =
        action.copyType === "freelancer_copy"
          ? "Salinan Freelancer (e-Meterai pada pihak Klien)"
          : "Salinan Klien (e-Meterai pada pihak Freelancer)";
      log(agr, owner, "VERSION_BUMPED", `${owner} mengunggah berkas ${copyLabel} yang sudah bermeterai resmi (${safeFileName})`);
      break;
    }
    case "removeStampedDocument": {
      if (closed) throw new AgreementError("Kesepakatan ini sudah ditutup.");
      const existingDocs = agr.stampedDocuments ? [...agr.stampedDocuments] : [];
      const found = existingDocs.find((d) => d.copyType === action.copyType);
      if (!found) {
        throw new AgreementError("Berkas dokumen salinan ini belum diunggah.");
      }
      agr.stampedDocuments = existingDocs.filter((d) => d.copyType !== action.copyType);
      const copyLabel =
        action.copyType === "freelancer_copy" ? "Salinan Freelancer" : "Salinan Klien";
      log(agr, owner, "VERSION_BUMPED", `${owner} menghapus berkas ${copyLabel} bermeterai`);
      break;
    }
    case "ematerai": {
      if (closed) throw new AgreementError("Kesepakatan ini sudah ditutup.");
      if (action.targetCopy !== "freelancer_copy" && action.targetCopy !== "client_copy" && action.targetCopy !== "both") {
        throw new AgreementError("Pilihan salinan tidak valid.");
      }
      const emtRecord = {
        id: newId("emt"),
        agreementId: agr.id,
        versionNumber: agr.currentVersionNumber,
        imageUrl: imageDataUrl(action.imageUrl, "Gambar e-Materai"),
        serialNumber: text(action.serialNumber, "Nomor seri e-Materai", { max: 80 }) || undefined,
        targetCopy: action.targetCopy,
        uploadedAt: new Date().toISOString(),
        uploadedBy: owner,
      };

      const list = agr.emateraiList ? [...agr.emateraiList] : (agr.ematerai ? [agr.ematerai] : []);
      if (action.targetCopy === "both") {
        // Jika "both", berlaku untuk kedua salinan
        agr.emateraiList = [emtRecord];
      } else {
        const filtered = list.filter((m) => m.targetCopy !== action.targetCopy && m.targetCopy !== "both");
        filtered.push(emtRecord);
        agr.emateraiList = filtered;
      }
      agr.ematerai = emtRecord;

      const where =
        action.targetCopy === "both"
          ? "kedua salinan dokumen (Salinan Freelancer & Salinan Klien)"
          : action.targetCopy === "freelancer_copy"
          ? "salinan freelancer (di kolom tanda tangan klien)"
          : "salinan klien (di kolom tanda tangan freelancer)";
      log(agr, owner, "VERSION_BUMPED", `${owner} menempelkan e-Materai Rp10.000 pada ${where}`);
      break;
    }
    case "removeEmaterai": {
      if (!agr.ematerai && (!agr.emateraiList || agr.emateraiList.length === 0)) {
        throw new AgreementError("Belum ada e-Materai di dokumen ini.");
      }
      agr.ematerai = undefined;
      agr.emateraiList = [];
      log(agr, owner, "VERSION_BUMPED", "e-Materai dilepas dari dokumen oleh freelancer");
      break;
    }
    case "signature": {
      if (closed || LOCKED_STATUSES.includes(agr.status)) {
        throw new AgreementError("Kesepakatan sudah disetujui dan dikunci. Tanda tangan tidak dapat diubah lagi.", 409);
      }
      upsertSignature(agr, "freelancer", owner, imageDataUrl(action.dataUrl, "Tanda tangan"), ctx);
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
export async function applyClientAction(
  agr: AgreementRecord,
  action: ClientAction,
  ctx?: RequestContext
): Promise<AgreementRecord> {
  if (CLOSED_FOR_CLIENT.includes(agr.status)) {
    throw new AgreementError(
      agr.status === "DRAFT" ? "Kesepakatan ini masih draf dan belum dikirim oleh freelancer." : "Kesepakatan ini sudah ditutup.",
      409
    );
  }

  // Cek masa berlaku tautan review klien (14 hari TTL)
  if (
    agr.reviewTokenExpiresAt &&
    new Date(agr.reviewTokenExpiresAt) < new Date() &&
    !["AGREED", "ACTIVE", "COMPLETED"].includes(agr.status)
  ) {
    throw new AgreementError(
      "Tautan review ini telah kedaluwarsa (masa berlaku 14 hari). Silakan hubungi freelancer untuk menerbitkan tautan baru.",
      410,
      "TOKEN_EXPIRED"
    );
  }

  switch (action?.type) {
    case "approve": {
      if (hasApproved(agr, "client")) throw new AgreementError("Anda sudah menyetujui versi ini.");
      addApproval(agr, "client", text(action.name, "Nama", { required: true, max: 120 }), email(action.email, "Email"), ctx);
      break;
    }
    case "requestChange": {
      if (LOCKED_STATUSES.includes(agr.status)) throw new AgreementError("Kesepakatan sudah dikunci, tidak bisa minta perubahan lagi.", 409);
      if (!isPremiumPlan(agr.plan) && agr.currentVersionNumber >= FREE_RULES.maxVersions) {
        throw new AgreementError(
          "Kesepakatan paket Gratis telah mencapai batas perubahan (maksimal 2 versi). Silakan diskusikan langsung dengan freelancer Anda via WhatsApp.",
          403,
          "VERSION_LIMIT"
        );
      }
      const openCount = agr.changeRequests.filter((cr) => cr.status === "OPEN").length;
      if (openCount >= MAX_OPEN_CHANGE_REQUESTS) {
        throw new AgreementError(
          `Masih ada ${openCount} permintaan perubahan yang belum ditindaklanjuti. ` +
            "Tunggu freelancer memperbarui kesepakatan dulu sebelum mengirim permintaan baru.",
          429,
          "TOO_MANY_OPEN_REQUESTS"
        );
      }
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
      if (LOCKED_STATUSES.includes(agr.status)) {
        throw new AgreementError("Kesepakatan sudah disetujui dan dikunci. Tanda tangan tidak dapat diubah lagi.", 409);
      }
      upsertSignature(agr, "client", text(action.name, "Nama", { required: true, max: 120 }), imageDataUrl(action.dataUrl, "Tanda tangan"), ctx);
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
    hasStampedDocuments: Boolean(agr.stampedDocuments && agr.stampedDocuments.length > 0),
    stampedDocumentsCount: agr.stampedDocuments?.length ?? 0,
    verifiedAt: new Date().toISOString(),
  };
}
