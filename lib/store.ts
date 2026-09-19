// ==============================================================================
// Sepakatin — Akses data dari halaman (browser)
// Mode Supabase: memanggil API server (/api/*) yang menjalankan aturan paket.
// Mode lokal   : aturan yang sama dijalankan di browser, data di localStorage.
// ==============================================================================

"use client";

import { AgreementRecord, ContractContentJSON, PlanId, PublicVerificationData } from "./types";
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
import { buildSealedDemoAgreement } from "./demo-data";
import { DEMO_ACCOUNTS } from "./demo-accounts";

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
  const seed = fadli ? [await buildSealedDemoAgreement(fadli.id)] : [];
  writeLocal(seed);
  return seed;
}

function writeLocal(list: AgreementRecord[]) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
  } catch {
    throw new StoreError("Penyimpanan browser penuh. Hapus beberapa kesepakatan atau gunakan gambar yang lebih kecil.");
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
  const list = await readLocal();
  const idx = list.findIndex(match);
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
        if (id === "agr_default_001") return buildSealedDemoAgreement("usr_freelancer_fadli");
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
    return buildSealedDemoAgreement("usr_freelancer_fadli");
  }
  if (!user) return null;
  return (await readLocal()).find((a) => a.id === id && a.ownerId === user.id) ?? null;
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
  return (await readLocal()).find((a) => a.reviewToken === token) ?? null;
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
  const agr = (await readLocal()).find((a) => a.contractId.toUpperCase() === normalized);
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

export async function createNewVersion(
  id: string,
  content: ContractContentJSON,
  _actorName?: string
): Promise<AgreementRecord> {
  void _actorName;
  return ownerAction(id, { type: "newVersion", content });
}

export async function uploadEMaterai(
  id: string,
  data: { imageUrl: string; serialNumber?: string; targetCopy: "freelancer_copy" | "client_copy"; uploadedBy?: string }
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
  role: "freelancer" | "client",
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

export async function getAgreementByContractId(contractId: string): Promise<AgreementRecord | null> {
  const normalized = contractId.trim().toUpperCase();
  if (isSupabaseConfigured) {
    try {
      const res = await api<{ agreement: AgreementRecord }>(`/api/verify/${encodeURIComponent(normalized)}?full=true`, {}, false);
      return res.agreement ?? null;
    } catch {
      return null;
    }
  }
  const list = await readLocal();
  return list.find((a) => a.contractId.toUpperCase() === normalized) ?? null;
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
  const users = localAccounts();
  const agreements = await readLocal();

  return users.map((u) => {
    const userAgreements = agreements.filter((a) => a.ownerId === u.id);
    const totalVal = userAgreements
      .filter((a) => a.status !== "CANCELLED" && a.status !== "REJECTED")
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
  updateLocalAccount(userId, { plan });
}

export async function adminUpdateUserCredits(userId: string, credits: number): Promise<void> {
  setLocalCredits(userId, credits);
  updateLocalAccount(userId, { credits });
}

export async function adminGetAllAgreements(): Promise<AgreementRecord[]> {
  return readLocal();
}

export async function adminModerateAgreement(agreementId: string, action: "cancel" | "delete"): Promise<void> {
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


