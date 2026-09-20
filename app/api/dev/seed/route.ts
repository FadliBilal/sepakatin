import { NextResponse } from "next/server";
import { buildSealedDemoAgreement } from "@/lib/demo-data";
import { DEMO_ACCOUNTS } from "@/lib/demo-accounts";
import { newReviewToken } from "@/lib/agreement-logic";
import { getAdmin } from "@/lib/server/supabase-admin";

export const dynamic = "force-dynamic";

/**
 * Membuat 2 akun demo di Supabase + contoh dokumen milik Fadli.
 * Hanya aktif jika env SEED_SECRET diisi, dan harus dipanggil dengan header x-seed-secret yang sama.
 * Jalankan: npm run seed:demo  (lihat scripts/seed-demo.mjs)
 */
export async function POST(req: Request) {
  const secret = process.env.SEED_SECRET;
  if (!secret || secret.length < 12 || req.headers.get("x-seed-secret") !== secret) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const db = getAdmin();
  const report: string[] = [];

  const { data: existing, error: listError } = await db.auth.admin.listUsers({ perPage: 1000 });
  if (listError) return NextResponse.json({ error: listError.message }, { status: 500 });

  for (const acc of DEMO_ACCOUNTS) {
    let userId = existing.users.find((u) => u.email?.toLowerCase() === acc.email)?.id;
    if (userId) {
      await db.auth.admin.updateUserById(userId, { password: acc.password, email_confirm: true });
      report.push(`Akun ${acc.email} sudah ada — kata sandi disetel ulang.`);
    } else {
      const { data, error } = await db.auth.admin.createUser({
        email: acc.email,
        password: acc.password,
        email_confirm: true,
        user_metadata: { full_name: acc.fullName },
      });
      if (error || !data.user) return NextResponse.json({ error: error?.message ?? "Gagal membuat akun" }, { status: 500 });
      userId = data.user.id;
      report.push(`Akun ${acc.email} dibuat.`);
    }

    const { error: profileError } = await db.from("profiles").upsert({
      id: userId,
      email: acc.email,
      full_name: acc.fullName,
      skill: acc.role,
      phone: acc.phone,
      plan: acc.plan,
      plan_expires_at: null,
      project_credits: acc.credits,
    });
    if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 });

    if (acc.hasSampleAgreement) {
      const record = await buildSealedDemoAgreement(userId, newReviewToken());
      const { error } = await db.from("agreements").upsert(
        {
          id: record.id,
          owner_id: userId,
          contract_id: record.contractId,
          review_token: record.reviewToken,
          status: record.status,
          plan: record.plan,
          record,
        },
        { onConflict: "contract_id", ignoreDuplicates: false }
      );
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      report.push(`Contoh dokumen ${record.contractId} tersedia untuk ${acc.email}.`);
    }
  }

  return NextResponse.json({ ok: true, report });
}
