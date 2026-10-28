import type { User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { AgreementError, buildNewAgreement } from "@/lib/agreement-logic";
import { generateContractId } from "@/lib/crypto";
import { AccountUsage, FREE_RULES, effectiveAccountPlan } from "@/lib/plans";
import type { AgreementRecord, ContractContentJSON, PlanId, StampedDocumentRecord } from "@/lib/types";
import { getAdmin } from "./supabase-admin";
export { getAdmin };

interface AgreementRow {
  id: string;
  owner_id: string;
  contract_id: string;
  review_token: string;
  review_token_expires_at?: string | null;
  status: AgreementRecord["status"];
  plan: PlanId;
  record: AgreementRecord;
  rev: number;
}

export interface ProfileRow {
  id: string;
  email: string;
  full_name: string;
  skill: string;
  phone: string;
  plan: string;
  plan_expires_at: string | null;
  project_credits: number;
}

// Helper respons API
export function ok(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export async function handle(fn: () => Promise<Response>): Promise<Response> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof AgreementError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.status });
    }
    if (process.env.NODE_ENV !== "production") {
      console.error("[api] unexpected error", err);
    }
    return NextResponse.json({ error: "Terjadi kesalahan di server. Coba lagi sebentar lagi." }, { status: 500 });
  }
}

export async function readJson<T>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw new AgreementError("Format permintaan tidak valid.");
  }
}

// Autentikasi
export async function requireUser(req: Request): Promise<User> {
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) throw new AgreementError("Silakan masuk terlebih dahulu.", 401, "UNAUTHENTICATED");
  const { data, error } = await getAdmin().auth.getUser(token);
  if (error || !data.user) throw new AgreementError("Sesi Anda sudah berakhir. Silakan masuk lagi.", 401, "UNAUTHENTICATED");
  return data.user;
}

// Daftar email administrator dari server environment (fail-closed)
export function adminEmails(): Set<string> {
  return new Set(
    (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function isAdminEmail(email: string | null | undefined): boolean {
  const normalized = (email || "").toLowerCase().trim();
  if (!normalized) return false;
  return adminEmails().has(normalized);
}

export async function getProfile(user: User): Promise<ProfileRow> {
  const db = getAdmin();
  const metaPhone = (user.user_metadata?.phone as string) || "";
  const { data, error } = await db.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (error) throw error;
  if (data) {
    if (!data.phone && metaPhone) {
      await db.from("profiles").update({ phone: metaPhone }).eq("id", user.id);
      data.phone = metaPhone;
    }
    return data as ProfileRow;
  }

  // Jaga-jaga jika trigger profil belum terpasang saat akun dibuat
  const fresh = {
    id: user.id,
    email: user.email ?? "",
    full_name: (user.user_metadata?.full_name as string) || (user.email ?? "").split("@")[0],
    phone: metaPhone,
  };
  const { data: created, error: insertError } = await db.from("profiles").upsert(fresh).select("*").single();
  if (insertError) throw insertError;
  return created as ProfileRow;
}

export async function getUsage(profile: ProfileRow): Promise<AccountUsage> {
  const { count, error } = await getAdmin()
    .from("agreements")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", profile.id)
    .eq("plan", "gratis")
    .not("status", "in", "(COMPLETED,CANCELLED,EXPIRED,REJECTED)");
  if (error) throw error;

  let planExpiresAt = profile.plan_expires_at;
  if (profile.plan === "pro" && !planExpiresAt) {
    const defaultExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    planExpiresAt = defaultExpiry;
    Promise.resolve(
      getAdmin()
        .from("profiles")
        .update({ plan_expires_at: defaultExpiry })
        .eq("id", profile.id)
    ).catch(() => {});
  }

  return {
    plan: effectiveAccountPlan(profile.plan, planExpiresAt),
    planExpiresAt: planExpiresAt,
    credits: profile.project_credits,
    activeFreeAgreements: count ?? 0,
    maxActiveFreeAgreements: FREE_RULES.maxActiveAgreements,
  };
}

// Baca kesepakatan
function toRecord(row: AgreementRow): AgreementRecord {
  return {
    ...row.record,
    id: row.id,
    ownerId: row.owner_id,
    contractId: row.contract_id,
    reviewToken: row.review_token,
    reviewTokenExpiresAt: row.review_token_expires_at || row.record?.reviewTokenExpiresAt || undefined,
    status: row.status,
    plan: row.plan,
  };
}

// Payload detail: fileUrl dikosongkan agar payload tetap ringan
export function toDetailItem(agr: AgreementRecord): AgreementRecord {
  return {
    ...agr,
    stampedDocuments: (agr.stampedDocuments ?? []).map((d) => ({ ...d, fileUrl: "" })),
  };
}

/** Berkas satu salinan bermeterai, diambil hanya saat benar-benar diunduh. */
export function stampedDocumentOf(
  agr: AgreementRecord,
  copyType: "freelancer_copy" | "client_copy"
): StampedDocumentRecord {
  const doc = agr.stampedDocuments?.find((d) => d.copyType === copyType);
  if (!doc || (!doc.fileUrl && !doc.storagePath)) {
    throw new AgreementError("Berkas dokumen ini belum diunggah.", 404, "NOT_FOUND");
  }
  return doc;
}

/** Versi ringan untuk daftar di dashboard: gambar e-Materai, berkas bermeterai, & tanda tangan tidak ikut dikirim. */
export function toListItem(agr: AgreementRecord): AgreementRecord {
  return {
    ...agr,
    stampedDocuments: (agr.stampedDocuments ?? []).map((d) => ({ ...d, fileUrl: "" })),
    ematerai: agr.ematerai ? { ...agr.ematerai, imageUrl: "" } : undefined,
    signatures: (agr.signatures ?? []).map((s) => ({ ...s, signatureDataUrl: "" })),
  };
}

export async function listOwned(ownerId: string): Promise<AgreementRecord[]> {
  const { data, error } = await getAdmin()
    .from("agreements")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as AgreementRow[]).map(toRecord);
}

async function findRow(column: "id" | "review_token" | "contract_id", value: string): Promise<AgreementRow | null> {
  if (!value || value.length > 200) return null;
  const { data, error } = await getAdmin().from("agreements").select("*").eq(column, value).maybeSingle();
  if (error) throw error;
  return (data as AgreementRow) ?? null;
}

export async function getOwned(id: string, ownerId: string): Promise<AgreementRecord> {
  const row = await findRow("id", id);
  // Kesepakatan milik orang lain diperlakukan seperti tidak ada
  if (!row || row.owner_id !== ownerId) throw new AgreementError("Kesepakatan tidak ditemukan.", 404, "NOT_FOUND");
  return toRecord(row);
}

export async function getByToken(token: string): Promise<AgreementRecord> {
  const row = await findRow("review_token", token);
  if (!row) throw new AgreementError("Link tidak berlaku.", 404, "NOT_FOUND");
  if (
    row.review_token_expires_at &&
    new Date(row.review_token_expires_at) < new Date() &&
    !["AGREED", "ACTIVE", "COMPLETED"].includes(row.status)
  ) {
    throw new AgreementError(
      "Tautan review ini telah kedaluwarsa (masa berlaku 14 hari). Silakan minta tautan baru kepada freelancer.",
      410,
      "TOKEN_EXPIRED"
    );
  }
  return toRecord(row);
}

export async function getByContractId(contractId: string): Promise<AgreementRecord> {
  const row = await findRow("contract_id", contractId.trim().toUpperCase());
  if (!row) throw new AgreementError("Dokumen tidak ditemukan.", 404, "NOT_FOUND");
  return toRecord(row);
}

// Tulis kesepakatan (mutasi dengan optimistic locking)
export async function mutate(
  column: "id" | "review_token",
  value: string,
  change: (agr: AgreementRecord, ownerId: string) => Promise<AgreementRecord>
): Promise<AgreementRecord> {
  const db = getAdmin();
  for (let attempt = 0; attempt < 4; attempt++) {
    const row = await findRow(column, value);
    if (!row) throw new AgreementError(column === "id" ? "Kesepakatan tidak ditemukan." : "Link tidak berlaku.", 404, "NOT_FOUND");

    const updated = await change(toRecord(row), row.owner_id);
    const { data, error } = await db
      .from("agreements")
      .update({
        record: updated,
        status: updated.status,
        review_token: updated.reviewToken,
        review_token_expires_at: updated.reviewTokenExpiresAt || null,
        rev: row.rev + 1,
      })
      .eq("id", row.id)
      .eq("rev", row.rev)
      .select("id");
    if (error) throw error;
    if (data && data.length === 1) return updated;
  }
  throw new AgreementError("Dokumen sedang diubah di tempat lain. Muat ulang halaman lalu coba lagi.", 409, "CONFLICT");
}

export async function createForUser(
  user: User,
  body: {
    content: ContractContentJSON;
    sendDirectly?: boolean;
    useCredit?: boolean;
    parentAgreementId?: string;
    parentContractId?: string;
  }
): Promise<AgreementRecord> {
  const db = getAdmin();
  const profile = await getProfile(user);
  const usage = await getUsage(profile);

  let plan: PlanId;
  let creditUsed = false;
  if (usage.plan === "pro") {
    plan = "pro";
  } else if (body.useCredit) {
    const { data: consumed, error } = await db.rpc("use_project_credit", { p_user: user.id });
    if (error) throw error;
    if (!consumed) {
      throw new AgreementError("Kredit Per Proyek Anda habis. Hubungi kami untuk menambah kredit.", 403, "NO_CREDITS");
    }
    plan = "per-proyek";
    creditUsed = true;
  } else {
    if (usage.activeFreeAgreements >= FREE_RULES.maxActiveAgreements) throw freeLimitError();
    plan = "gratis";
  }

  try {
    for (let attempt = 0; attempt < 5; attempt++) {
      const record = await buildNewAgreement({
        content: body.content,
        contractId: generateContractId(),
        ownerId: user.id,
        plan,
        sendDirectly: Boolean(body.sendDirectly),
        parentAgreementId: body.parentAgreementId || body.content.parentAgreementId,
        parentContractId: body.parentContractId || body.content.parentContractId,
      });
      const { error } = await db.from("agreements").insert({
        id: record.id,
        owner_id: user.id,
        contract_id: record.contractId,
        review_token: record.reviewToken,
        review_token_expires_at: record.reviewTokenExpiresAt || null,
        status: record.status,
        plan: record.plan,
        record,
      });
      if (!error) return record;
      if (error.message?.includes("FREE_LIMIT_REACHED")) throw freeLimitError();
      // 23505 = nomor dokumen kebetulan sama, coba nomor lain
      if (error.code !== "23505") throw error;
    }
    throw new AgreementError("Gagal membuat nomor dokumen unik. Coba lagi.", 500);
  } catch (err) {
    if (creditUsed) await db.rpc("refund_project_credit", { p_user: user.id });
    throw err;
  }
}

function freeLimitError() {
  return new AgreementError(
    `Paket Gratis maksimal ${FREE_RULES.maxActiveAgreements} kesepakatan aktif. Selesaikan atau batalkan salah satunya, pakai kredit Per Proyek, atau upgrade ke Pro.`,
    403,
    "FREE_LIMIT"
  );
}

export async function deleteOwned(id: string, ownerId: string): Promise<void> {
  const row = await findRow("id", id);
  if (!row || row.owner_id !== ownerId) {
    throw new AgreementError("Kesepakatan tidak ditemukan.", 404, "NOT_FOUND");
  }
  if (row.status !== "DRAFT") {
    throw new AgreementError("Hanya kesepakatan berstatus Draf yang dapat dihapus.", 400);
  }
  const { error } = await getAdmin().from("agreements").delete().eq("id", id);
  if (error) throw error;
}

export interface SettlementResult {
  success: boolean;
  status: "SETTLED" | "ALREADY_PAID";
  orderId: string;
  userId: string;
  userEmail: string;
  packageType: string;
  amount: number;
}

// Selesaikan transaksi pembayaran secara atomik
export async function settlePaymentOrder(
  orderId: string,
  gatewayTxId?: string | null,
  webhookPayload: Record<string, unknown> = {}
): Promise<SettlementResult> {
  const db = getAdmin();

  // 1. Coba jalankan RPC settle_payment_order terlebih dahulu
  try {
    const { data, error } = await db.rpc("settle_payment_order", {
      p_order_id: orderId,
      p_gateway_tx_id: gatewayTxId || null,
      p_webhook_payload: webhookPayload,
    });

    if (!error && data && data.success) {
      return {
        success: true,
        status: data.status,
        orderId: data.order_id,
        userId: data.user_id,
        userEmail: data.user_email,
        packageType: data.package_type,
        amount: Number(data.amount) || 0,
      };
    }
  } catch (rpcErr) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("RPC settle_payment_order fallback ke transaksi terpadu:", rpcErr);
    }
  }

  // 2. Fallback jika RPC database belum diaplikasikan
  const { data: order, error: orderErr } = await db
    .from("payment_orders")
    .select("*")
    .eq("order_id", orderId)
    .maybeSingle();

  if (orderErr) throw orderErr;
  if (!order) throw new AgreementError("Pesanan pembayaran tidak ditemukan.", 404, "ORDER_NOT_FOUND");

  if (order.status === "PAID") {
    return {
      success: true,
      status: "ALREADY_PAID",
      orderId: order.order_id,
      userId: order.user_id,
      userEmail: order.user_email,
      packageType: order.package_type,
      amount: Number(order.amount) || 0,
    };
  }

  const now = new Date().toISOString();
  const { error: updateErr } = await db
    .from("payment_orders")
    .update({
      status: "PAID",
      paid_at: now,
      gateway_transaction_id: gatewayTxId || order.gateway_transaction_id,
      metadata: {
        ...order.metadata,
        webhook_payload: webhookPayload,
      },
      updated_at: now,
    })
    .eq("id", order.id);

  if (updateErr) throw updateErr;

  const { data: profile } = await db.from("profiles").select("*").eq("id", order.user_id).single();
  if (profile) {
    if (order.package_type === "credit_1") {
      const currentCredits = Number(profile.project_credits) || 0;
      await db
        .from("profiles")
        .update({ project_credits: currentCredits + 1, updated_at: now })
        .eq("id", profile.id);
    } else if (order.package_type === "pro_monthly") {
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      await db
        .from("profiles")
        .update({ plan: "pro", plan_expires_at: expiresAt, updated_at: now })
        .eq("id", profile.id);
    }
  }

  return {
    success: true,
    status: "SETTLED",
    orderId: order.order_id,
    userId: order.user_id,
    userEmail: order.user_email || profile?.email || "",
    packageType: order.package_type,
    amount: Number(order.amount) || 0,
  };
}

