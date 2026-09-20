// ==============================================================================
// Sepakatin — Akses database di server (service role). Semua aturan izin ada di sini.
// ==============================================================================

import type { User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { AgreementError, buildNewAgreement } from "@/lib/agreement-logic";
import { generateContractId } from "@/lib/crypto";
import { AccountUsage, FREE_RULES, effectiveAccountPlan } from "@/lib/plans";
import type { AgreementRecord, ContractContentJSON, PlanId } from "@/lib/types";
import { getAdmin } from "./supabase-admin";

interface AgreementRow {
  id: string;
  owner_id: string;
  contract_id: string;
  review_token: string;
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

// ------------------------------------------------------------------------------
// Helper respons API
// ------------------------------------------------------------------------------

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
    console.error("[api] unexpected error", err);
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

// ------------------------------------------------------------------------------
// Autentikasi
// ------------------------------------------------------------------------------

export async function requireUser(req: Request): Promise<User> {
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) throw new AgreementError("Silakan masuk terlebih dahulu.", 401, "UNAUTHENTICATED");
  const { data, error } = await getAdmin().auth.getUser(token);
  if (error || !data.user) throw new AgreementError("Sesi Anda sudah berakhir. Silakan masuk lagi.", 401, "UNAUTHENTICATED");
  return data.user;
}

export async function getProfile(user: User): Promise<ProfileRow> {
  const db = getAdmin();
  const { data, error } = await db.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (error) throw error;
  if (data) return data as ProfileRow;

  // Jaga-jaga jika trigger profil belum terpasang saat akun dibuat
  const fresh = {
    id: user.id,
    email: user.email ?? "",
    full_name: (user.user_metadata?.full_name as string) || (user.email ?? "").split("@")[0],
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
  return {
    plan: effectiveAccountPlan(profile.plan, profile.plan_expires_at),
    planExpiresAt: profile.plan_expires_at,
    credits: profile.project_credits,
    activeFreeAgreements: count ?? 0,
    maxActiveFreeAgreements: FREE_RULES.maxActiveAgreements,
  };
}

// ------------------------------------------------------------------------------
// Baca kesepakatan
// ------------------------------------------------------------------------------

function toRecord(row: AgreementRow): AgreementRecord {
  return {
    ...row.record,
    id: row.id,
    ownerId: row.owner_id,
    contractId: row.contract_id,
    reviewToken: row.review_token,
    status: row.status,
    plan: row.plan,
  };
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
  return toRecord(row);
}

export async function getByContractId(contractId: string): Promise<AgreementRecord> {
  const row = await findRow("contract_id", contractId.trim().toUpperCase());
  if (!row) throw new AgreementError("Dokumen tidak ditemukan.", 404, "NOT_FOUND");
  return toRecord(row);
}

// ------------------------------------------------------------------------------
// Tulis kesepakatan
// ------------------------------------------------------------------------------

/**
 * Membaca baris, menjalankan `change`, lalu menyimpan hanya jika tidak ada perubahan lain
 * di antaranya (optimistic locking). Diulang otomatis bila bertabrakan.
 */
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
      .update({ record: updated, status: updated.status, rev: row.rev + 1 })
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
  body: { content: ContractContentJSON; sendDirectly?: boolean; useCredit?: boolean }
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
      });
      const { error } = await db.from("agreements").insert({
        id: record.id,
        owner_id: user.id,
        contract_id: record.contractId,
        review_token: record.reviewToken,
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
