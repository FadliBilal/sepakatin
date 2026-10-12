"use client";

import { AdminAuditLogItem, AgreementRecord, ContractContentJSON, CopyType, PaymentOrderRecord, PlanId, PublicVerificationData } from "./types";
import {
  ClientAction,
  OwnerAction,
  applyClientAction,
  applyOwnerAction,
  buildNewAgreement,
  toVerificationData,
} from "./agreement-logic";
import { generateContractId } from "./crypto";
import { AccountUsage, FREE_RULES, isActiveStatus } from "./plans";
import { isSupabaseConfigured } from "./supabase";
import { getAccessToken, getCachedRemoteUsage, getSession, localAccounts, refreshAccount, updateLocalAccount } from "./auth";
import { DEMO_ACCOUNTS } from "./demo-accounts";
import { saveLocalDocument, getLocalDocument, removeLocalDocument } from "./local-storage-db";

async function loadDemoAgreement(userId: string): Promise<AgreementRecord> {
  const { buildSealedDemoAgreement } = await import("./demo-data");
  return buildSealedDemoAgreement(userId);
}

export type { OwnerAction, ClientAction };

/** Kesalahan yang pesannya aman ditampilkan ke pengguna. */
export class StoreError extends Error {
  code?: string;
  status?: number;
  constructor(message: string, code?: string, status?: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export function errorMessage(err: unknown): string {
  return err instanceof Error && err.message ? err.message : "Terjadi kesalahan. Coba lagi.";
}

// ------------------------------------------------------------------------------
// Mode Supabase — pemanggil API
// ------------------------------------------------------------------------------

async function api<T>(path: string, init: RequestInit = {}, withAuth = true): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (withAuth) {
    const token = await getAccessToken();
    if (!token) throw new StoreError("Sesi Anda sudah berakhir. Silakan masuk lagi.", "UNAUTHENTICATED", 401);
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(path, { ...init, headers: { ...headers, ...(init.headers as Record<string, string>) }, cache: "no-store" });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new StoreError(body.error || "Terjadi kesalahan. Coba lagi.", body.code, res.status);
  return body as T;
}

// ------------------------------------------------------------------------------
// Mode lokal — penyimpanan di browser
// ------------------------------------------------------------------------------

const LOCAL_KEY = "sepakatin_agreements_v2";
const CREDITS_KEY = "sepakatin_credits_v2";

async function readLocal(): Promise<AgreementRecord[]> {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) return JSON.parse(raw) as AgreementRecord[];
  } catch {
    // data rusak → mulai ulang dari contoh
  }
  const fadli = DEMO_ACCOUNTS.find((a) => a.hasSampleAgreement);
  const seed = fadli ? [await loadDemoAgreement(fadli.id)] : [];
  writeLocal(seed);
  return seed;
}

function writeLocal(list: AgreementRecord[]) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
  } catch {
    throw new StoreError(
      "Penyimpanan browser sudah penuh. Berkas PDF bermeterai biasanya terlalu besar untuk mode demo lokal — " +
        "coba unggah berkas yang lebih kecil, hapus kesepakatan lama, atau hubungkan aplikasi ke Supabase."
    );
  }
  // Sinkronisasi lokal ke server agar bisa diuji coba lintas tab, Incognito, atau browser lain
  if (typeof window !== "undefined") {
    fetch("/api/local-agreements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agreements: list }),
    }).catch(() => {});
  }
}

function readCredits(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(CREDITS_KEY) || "{}");
  } catch {
    return {};
  }
}

function localCredits(userId: string): number {
  const stored = readCredits()[userId];
  if (typeof stored === "number") return stored;
  return localAccounts().find((a) => a.id === userId)?.credits ?? 0;
}

function setLocalCredits(userId: string, credits: number) {
  const all = readCredits();
  all[userId] = credits;
  localStorage.setItem(CREDITS_KEY, JSON.stringify(all));
}

function requireLocalUser() {
  const user = getSession();
  if (!user) throw new StoreError("Silakan masuk terlebih dahulu.", "UNAUTHENTICATED", 401);
  return user;
}

function localUsage(userId: string, list: AgreementRecord[]): AccountUsage {
  const account = localAccounts().find((a) => a.id === userId);
  return {
    plan: account?.plan ?? "gratis",
    planExpiresAt: null,
    credits: localCredits(userId),
    activeFreeAgreements: list.filter((a) => a.ownerId === userId && a.plan === "gratis" && isActiveStatus(a.status)).length,
    maxActiveFreeAgreements: FREE_RULES.maxActiveAgreements,
  };
}

async function updateLocal(
  match: (a: AgreementRecord) => boolean,
  change: (a: AgreementRecord) => Promise<AgreementRecord>,
  notFound: string
): Promise<AgreementRecord> {
  let list = await readLocal();
  let idx = list.findIndex(match);
  if (idx === -1 && typeof window !== "undefined") {
    try {
      const res = await fetch("/api/local-agreements");
      if (res.ok) {
        const body = await res.json();
        if (Array.isArray(body.agreements)) {
          list = body.agreements;
          localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
          idx = list.findIndex(match);
        }
      }
    } catch {}
  }
  if (idx === -1) throw new StoreError(notFound, "NOT_FOUND", 404);
  const updated = await change(structuredClone(list[idx]));
  list[idx] = updated;
  writeLocal(list);
  return updated;
}

// ------------------------------------------------------------------------------
// API untuk halaman
// ------------------------------------------------------------------------------

/** Kesepakatan milik akun yang sedang masuk. */
export async function getAgreements(): Promise<AgreementRecord[]> {
  if (isSupabaseConfigured) return (await api<{ agreements: AgreementRecord[] }>("/api/agreements")).agreements;
  const user = requireLocalUser();
  return (await readLocal()).filter((a) => a.ownerId === user.id);
}

/** Satu kesepakatan milik akun yang sedang masuk (null jika bukan miliknya / tidak ada). */
export async function getAgreement(id: string): Promise<AgreementRecord | null> {
  if (isSupabaseConfigured) {
    try {
      return (await api<{ agreement: AgreementRecord }>(`/api/agreements/${encodeURIComponent(id)}`)).agreement;
    } catch (err) {
      if (err instanceof StoreError && err.status === 404) {
        if (id === "agr_default_001") return await loadDemoAgreement("usr_freelancer_fadli");
        return null;
      }
      throw err;
    }
  }
  const user = getSession();
  if (id === "agr_default_001") {
    const list = await readLocal();
    const found = list.find((a) => a.id === "agr_default_001");
    if (found) return found;
    return await loadDemoAgreement("usr_freelancer_fadli");
  }
  if (!user) return null;
  let found = (await readLocal()).find((a) => a.id === id && a.ownerId === user.id) ?? null;
  if (!found && typeof window !== "undefined") {
    try {
      const res = await fetch(`/api/local-agreements?id=${encodeURIComponent(id)}`);
      if (res.ok) {
        const body = await res.json();
        if (body.agreement && body.agreement.ownerId === user.id) {
          found = body.agreement;
        }
      }
    } catch {}
  }
  return found;
}

/** Kesepakatan untuk klien, lewat link undangan. */
export async function getAgreementByReviewToken(token: string): Promise<AgreementRecord | null> {
  if (isSupabaseConfigured) {
    try {
      return (await api<{ agreement: AgreementRecord }>(`/api/review/${encodeURIComponent(token)}`, {}, false)).agreement;
    } catch (err) {
      if (err instanceof StoreError && err.status === 404) return null;
      throw err;
    }
  }
  let item = (await readLocal()).find((a) => a.reviewToken === token) ?? null;

  // Bila belum ada di localStorage (mis. dibuka di jendela Incognito / browser berbeda saat dev lokal),
  // ambil dari sinkronisasi server lokal
  if (!item && typeof window !== "undefined") {
    try {
      const res = await fetch(`/api/local-agreements?token=${encodeURIComponent(token)}`);
      if (res.ok) {
        const body = await res.json();
        if (body.agreement) {
          item = body.agreement;
          const currentList = await readLocal();
          if (!currentList.some((a) => a.id === item!.id)) {
            writeLocal([item!, ...currentList]);
          }
        }
      }
    } catch {}
  }

  if (
    item &&
    item.reviewTokenExpiresAt &&
    new Date(item.reviewTokenExpiresAt) < new Date() &&
    !["AGREED", "ACTIVE", "COMPLETED"].includes(item.status)
  ) {
    throw new StoreError(
      "Tautan review ini telah kedaluwarsa (masa berlaku 14 hari). Silakan minta tautan baru kepada freelancer.",
      "TOKEN_EXPIRED",
      410
    );
  }
  return item;
}

/** Ringkasan publik untuk halaman cek keaslian. */
export async function getVerificationData(contractId: string): Promise<PublicVerificationData | null> {
  if (isSupabaseConfigured) {
    try {
      return (await api<{ verification: PublicVerificationData }>(`/api/verify/${encodeURIComponent(contractId)}`, {}, false))
        .verification;
    } catch (err) {
      if (err instanceof StoreError && err.status === 404) return null;
      throw err;
    }
  }
  const normalized = contractId.trim().toUpperCase();
  let agr = (await readLocal()).find((a) => a.contractId.toUpperCase() === normalized);

  if (!agr && typeof window !== "undefined") {
    try {
      const res = await fetch(`/api/local-agreements?contractId=${encodeURIComponent(normalized)}`);
      if (res.ok) {
        const body = await res.json();
        if (body.agreement) {
          agr = body.agreement;
          const currentList = await readLocal();
          if (!currentList.some((a) => a.id === agr!.id)) {
            writeLocal([agr!, ...currentList]);
          }
        }
      }
    } catch {}
  }

  return agr ? toVerificationData(agr) : null;
}

/** Paket, kredit, dan jumlah kesepakatan Gratis yang sedang aktif. */
export async function getAccountUsage(): Promise<AccountUsage> {
  if (isSupabaseConfigured) {
    const res = await api<{ usage: AccountUsage }>("/api/me");
    return res.usage;
  }
  const user = requireLocalUser();
  return localUsage(user.id, await readLocal());
}

export { getCachedRemoteUsage };

export async function createAgreement(
  content: ContractContentJSON,
  options: { sendDirectly: boolean; useCredit: boolean }
): Promise<AgreementRecord> {
  if (isSupabaseConfigured) {
    const res = await api<{ agreement: AgreementRecord }>("/api/agreements", {
      method: "POST",
      body: JSON.stringify({ content, ...options }),
    });
    refreshAccount();
    return res.agreement;
  }

  const user = requireLocalUser();
  const list = await readLocal();
  const usage = localUsage(user.id, list);

  let plan: PlanId;
  if (usage.plan === "pro") plan = "pro";
  else if (options.useCredit) {
    if (usage.credits < 1) throw new StoreError("Kredit Per Proyek Anda habis. Hubungi kami untuk menambah kredit.", "NO_CREDITS", 403);
    plan = "per-proyek";
  } else {
    if (usage.activeFreeAgreements >= FREE_RULES.maxActiveAgreements) {
      throw new StoreError(
        `Paket Gratis maksimal ${FREE_RULES.maxActiveAgreements} kesepakatan aktif. Selesaikan atau batalkan salah satunya, pakai kredit Per Proyek, atau upgrade ke Pro.`,
        "FREE_LIMIT",
        403
      );
    }
    plan = "gratis";
  }

  let contractId = generateContractId();
  while (list.some((a) => a.contractId === contractId)) contractId = generateContractId();

  const record = await buildNewAgreement({ content, contractId, ownerId: user.id, plan, sendDirectly: options.sendDirectly });
  writeLocal([record, ...list]);
  if (plan === "per-proyek") setLocalCredits(user.id, usage.credits - 1);
  refreshAccount();
  return record;
}

/** Aksi freelancer pada kesepakatan miliknya. */
export async function ownerAction(id: string, action: OwnerAction): Promise<AgreementRecord> {
  if (isSupabaseConfigured) {
    const res = await api<{ agreement: AgreementRecord }>(`/api/agreements/${encodeURIComponent(id)}`, {
      method: "POST",
      body: JSON.stringify(action),
    });
    if (action.type === "complete" || action.type === "cancel") refreshAccount();
    return res.agreement;
  }
  const user = requireLocalUser();
  const updated = await updateLocal(
    (a) => a.id === id && a.ownerId === user.id,
    (a) => applyOwnerAction(a, action),
    "Kesepakatan tidak ditemukan."
  );
  refreshAccount();
  return updated;
}

/** Aksi klien lewat link undangan. */
export async function clientAction(token: string, action: ClientAction): Promise<AgreementRecord> {
  if (isSupabaseConfigured) {
    const res = await api<{ agreement: AgreementRecord }>(
      `/api/review/${encodeURIComponent(token)}`,
      { method: "POST", body: JSON.stringify(action) },
      false
    );
    return res.agreement;
  }
  return updateLocal((a) => a.reviewToken === token, (a) => applyClientAction(a, action), "Link tidak berlaku.");
}

// ------------------------------------------------------------------------------
// Helper fungsi kemudahan (backward-compatible)
// ------------------------------------------------------------------------------

export async function sendAgreementToClient(id: string): Promise<AgreementRecord> {
  return ownerAction(id, { type: "send" });
}

export async function regenerateReviewToken(id: string): Promise<AgreementRecord> {
  return ownerAction(id, { type: "regenerateReviewToken" });
}

export async function completeAgreement(id: string): Promise<AgreementRecord> {
  return ownerAction(id, { type: "complete" });
}

export async function cancelAgreement(id: string): Promise<AgreementRecord> {
  return ownerAction(id, { type: "cancel" });
}

export async function deleteAgreement(id: string): Promise<void> {
  if (isSupabaseConfigured) {
    await api(`/api/agreements/${encodeURIComponent(id)}`, { method: "DELETE" });
    refreshAccount();
    return;
  }
  const user = requireLocalUser();
  const list = await readLocal();
  const agr = list.find((a) => a.id === id);
  if (!agr || agr.ownerId !== user.id) throw new StoreError("Kesepakatan tidak ditemukan.", "NOT_FOUND", 404);
  if (agr.status !== "DRAFT") throw new StoreError("Hanya draf yang dapat dihapus permanen.", "INVALID_STATUS", 400);
  writeLocal(list.filter((a) => a.id !== id));
  refreshAccount();
}


export async function createNewVersion(
  id: string,
  content: ContractContentJSON,
  _actorName?: string
): Promise<AgreementRecord> {
  void _actorName;
  return ownerAction(id, { type: "newVersion", content });
}

export async function uploadStampedDocument(
  id: string,
  data: {
    copyType: "freelancer_copy" | "client_copy";
    fileName: string;
    fileUrl?: string;
    fileSize?: number;
    notes?: string;
    file?: File;
  }
): Promise<AgreementRecord> {
  if (isSupabaseConfigured) {
    if (data.file) {
      const formData = new FormData();
      formData.append("file", data.file);
      formData.append("copyType", data.copyType);
      if (data.notes) formData.append("notes", data.notes);
      const token = await getAccessToken();
      const res = await fetch(`/api/agreements/${encodeURIComponent(id)}/document`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new StoreError(body.error || "Gagal mengunggah dokumen.", body.code, res.status);
      return body.agreement as AgreementRecord;
    }

    return ownerAction(id, {
      type: "uploadStampedDocument",
      copyType: data.copyType,
      fileName: data.fileName,
      fileUrl: data.fileUrl,
      fileSize: data.fileSize,
      notes: data.notes,
    });
  }

  // Mode lokal: simpan data berkas ke IndexedDB agar tidak melebihi kuota localStorage
  const storageKey = `stamped_doc_${id}_${data.copyType}`;
  if (data.file) {
    await saveLocalDocument(storageKey, data.file);
  } else if (data.fileUrl) {
    await saveLocalDocument(storageKey, data.fileUrl);
  }

  return ownerAction(id, {
    type: "uploadStampedDocument",
    copyType: data.copyType,
    fileName: data.fileName,
    storagePath: `indexeddb://${storageKey}`,
    fileSize: data.fileSize || (data.file ? data.file.size : undefined),
    notes: data.notes,
  });
}

export async function removeStampedDocument(
  id: string,
  copyType: "freelancer_copy" | "client_copy"
): Promise<AgreementRecord> {
  if (!isSupabaseConfigured) {
    await removeLocalDocument(`stamped_doc_${id}_${copyType}`);
  }
  return ownerAction(id, {
    type: "removeStampedDocument",
    copyType,
  });
}

/**
 * Mengambil isi berkas PDF bermeterai saat benar-benar akan diunduh.
 *
 * Pada mode Supabase: menghasilkan Signed Download URL (berlaku 15 menit).
 * Pada mode lokal: mengambil berkas dari IndexedDB atau fallback URL.
 *
 * `idOrToken`: id kesepakatan untuk pemilik, atau token undangan untuk klien.
 */
export async function fetchStampedDocumentUrl(
  idOrToken: string,
  copyType: "freelancer_copy" | "client_copy",
  viaReviewToken = false
): Promise<{ fileUrl: string; fileName: string }> {
  if (isSupabaseConfigured) {
    const path = viaReviewToken
      ? `/api/review/${encodeURIComponent(idOrToken)}/document`
      : `/api/agreements/${encodeURIComponent(idOrToken)}/document?copy=${copyType}`;
    const body = await api<{ document: { fileUrl: string; fileName: string } }>(path, {}, !viaReviewToken);
    return body.document;
  }

  // Mode lokal: periksa IndexedDB terlebih dahulu, lalu fallback ke doc.fileUrl
  const list = await readLocal();
  const agr = list.find((a) => (viaReviewToken ? a.reviewToken === idOrToken : a.id === idOrToken));
  const doc = agr?.stampedDocuments?.find((d) => d.copyType === copyType);
  if (!doc) throw new StoreError("Berkas dokumen ini belum diunggah.", "NOT_FOUND", 404);

  if (doc.storagePath?.startsWith("indexeddb://")) {
    const key = doc.storagePath.replace("indexeddb://", "");
    const localUrl = await getLocalDocument(key);
    if (localUrl) return { fileUrl: localUrl, fileName: doc.fileName };
  }

  if (doc.fileUrl) {
    return { fileUrl: doc.fileUrl, fileName: doc.fileName };
  }

  throw new StoreError("Berkas dokumen ini belum diunggah.", "NOT_FOUND", 404);
}

export async function uploadEMaterai(
  id: string,
  data: { imageUrl: string; serialNumber?: string; targetCopy: CopyType; uploadedBy?: string }
): Promise<AgreementRecord> {
  return ownerAction(id, {
    type: "ematerai",
    imageUrl: data.imageUrl,
    serialNumber: data.serialNumber,
    targetCopy: data.targetCopy,
  });
}

export async function removeEMaterai(id: string): Promise<AgreementRecord> {
  return ownerAction(id, { type: "removeEmaterai" });
}

export async function submitVisualSignature(
  idOrToken: string,
  role: "freelancer" | "client",
  name: string,
  dataUrl: string
): Promise<AgreementRecord> {
  if (role === "freelancer") {
    return ownerAction(idOrToken, { type: "signature", dataUrl });
  }
  return clientAction(idOrToken, { type: "signature", name, dataUrl });
}

export async function approveVersion(
  idOrToken: string,
  role: "freelancer" | "client" = "freelancer",
  name?: string,
  email?: string
): Promise<AgreementRecord> {
  if (role === "freelancer") {
    return ownerAction(idOrToken, { type: "approve" });
  }
  return clientAction(idOrToken, { type: "approve", name: name || "Klien", email: email || "" });
}

export async function requestChange(
  idOrToken: string,
  name: string,
  title: string,
  description: string,
  email?: string
): Promise<AgreementRecord> {
  return clientAction(idOrToken, { type: "requestChange", name, email, title, description });
}

// ------------------------------------------------------------------------------
// Admin Platform Management
// ------------------------------------------------------------------------------

export interface AdminPlatformStats {
  totalUsers: number;
  totalAgreements: number;
  totalAgreed: number;
  totalPending: number;
  totalCancelled: number;
  totalProjectValue: number;
  isSupabaseConnected: boolean;
}

export interface AdminUserView {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  phone: string;
  plan: "gratis" | "pro";
  credits: number;
  agreementCount: number;
  totalValue: number;
}

export async function adminGetPlatformStats(): Promise<AdminPlatformStats> {
  if (isSupabaseConfigured) {
    try {
      const res = await api<{ stats: AdminPlatformStats }>("/api/admin");
      return res.stats;
    } catch (err) {
      console.error("Failed to get cloud admin stats, falling back", err);
    }
  }
  const users = localAccounts();
  const agreements = await readLocal();
  const agreed = agreements.filter((a) => a.status === "AGREED" || a.status === "ACTIVE" || a.status === "COMPLETED").length;
  const pending = agreements.filter((a) => a.status === "PENDING_CLIENT" || a.status === "CHANGES_REQUESTED" || a.status === "PENDING_APPROVAL" || a.status === "DRAFT").length;
  const cancelled = agreements.filter((a) => a.status === "CANCELLED" || a.status === "REJECTED").length;
  const totalValue = agreements
    .filter((a) => a.status !== "CANCELLED" && a.status !== "REJECTED")
    .reduce((sum, a) => sum + (Number(a.currentVersion?.contentJson?.payment?.totalValue) || 0), 0);

  return {
    totalUsers: users.length,
    totalAgreements: agreements.length,
    totalAgreed: agreed,
    totalPending: pending,
    totalCancelled: cancelled,
    totalProjectValue: totalValue,
    isSupabaseConnected: isSupabaseConfigured,
  };
}

export async function adminGetAllUsers(): Promise<AdminUserView[]> {
  if (isSupabaseConfigured) {
    try {
      const res = await api<{ users: AdminUserView[] }>("/api/admin");
      return res.users;
    } catch (err) {
      console.error("Failed to get cloud admin users, falling back", err);
    }
  }
  const users = localAccounts();
  const agreements = await readLocal();

  return users.map((u) => {
    const userAgreements = agreements.filter((a) => a.ownerId === u.id);
    const totalVal = userAgreements
      .filter((a) => a.status !== "CANCELLED")
      .reduce((sum, a) => sum + (Number(a.currentVersion?.contentJson?.payment?.totalValue) || 0), 0);
    return {
      id: u.id,
      username: u.username,
      email: u.email,
      fullName: u.fullName,
      role: u.role,
      phone: u.phone,
      plan: u.plan,
      credits: localCredits(u.id),
      agreementCount: userAgreements.length,
      totalValue: totalVal,
    };
  });
}

export async function adminUpdateUserPlan(userId: string, plan: "gratis" | "pro"): Promise<void> {
  if (isSupabaseConfigured) {
    await api("/api/admin", {
      method: "PATCH",
      body: JSON.stringify({ action: "updatePlan", userId, plan }),
    });
    return;
  }
  updateLocalAccount(userId, { plan });
}

export async function adminUpdateUserCredits(userId: string, credits: number): Promise<void> {
  if (isSupabaseConfigured) {
    await api("/api/admin", {
      method: "PATCH",
      body: JSON.stringify({ action: "updateCredits", userId, credits }),
    });
    return;
  }
  setLocalCredits(userId, credits);
  updateLocalAccount(userId, { credits });
}

export async function adminDeleteUser(userId: string): Promise<void> {
  if (isSupabaseConfigured) {
    await api("/api/admin", {
      method: "DELETE",
      body: JSON.stringify({ action: "deleteUser", userId }),
    });
    return;
  }
  try {
    const raw = localStorage.getItem("sepakatin_users_v2");
    const list = raw ? JSON.parse(raw) : [];
    localStorage.setItem("sepakatin_users_v2", JSON.stringify(list.filter((u: { id: string }) => u.id !== userId)));
  } catch {}
}

export async function adminGetAllAgreements(): Promise<AgreementRecord[]> {
  if (isSupabaseConfigured) {
    try {
      const res = await api<{ agreements: AgreementRecord[] }>("/api/admin");
      return res.agreements;
    } catch (err) {
      console.error("Failed to get cloud admin agreements, falling back", err);
    }
  }
  return readLocal();
}

export async function adminModerateAgreement(agreementId: string, action: "cancel" | "delete"): Promise<void> {
  if (isSupabaseConfigured) {
    await api("/api/admin", {
      method: "DELETE",
      body: JSON.stringify({ action, agreementId }),
    });
    return;
  }
  const list = await readLocal();
  if (action === "delete") {
    writeLocal(list.filter((a) => a.id !== agreementId));
    return;
  }
  const item = list.find((a) => a.id === agreementId);
  if (item) {
    item.status = "CANCELLED";
    item.updatedAt = new Date().toISOString();
    writeLocal(list);
  }
}

export async function adminGetAuditLogs(): Promise<AdminAuditLogItem[]> {
  if (isSupabaseConfigured) {
    try {
      const res = await api<{ auditLogs: AdminAuditLogItem[] }>("/api/admin");
      return res.auditLogs || [];
    } catch (err) {
      console.error("Gagal memuat log audit admin:", err);
    }
  }
  return [];
}

export async function adminGetAllPaymentOrders(): Promise<PaymentOrderRecord[]> {
  if (isSupabaseConfigured) {
    try {
      const res = await api<{ paymentOrders: PaymentOrderRecord[] }>("/api/admin");
      return res.paymentOrders || [];
    } catch (err) {
      console.error("Gagal memuat daftar pesanan pembayaran admin:", err);
    }
  }
  return [];
}

export async function adminApprovePaymentOrder(orderId: string): Promise<void> {
  if (isSupabaseConfigured) {
    await api("/api/admin", {
      method: "PATCH",
      body: JSON.stringify({ action: "approveOrder", orderId }),
    });
    return;
  }
}

export async function adminRejectPaymentOrder(orderId: string): Promise<void> {
  if (isSupabaseConfigured) {
    await api("/api/admin", {
      method: "PATCH",
      body: JSON.stringify({ action: "rejectOrder", orderId }),
    });
    return;
  }
}


