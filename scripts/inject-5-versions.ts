import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { buildSealedDemoAgreement } from "../lib/demo-data";
import { DEMO_ACCOUNTS } from "../lib/demo-accounts";

function readEnv(name: string): string {
  if (process.env[name]) return process.env[name]!;
  try {
    const content = readFileSync(".env.local", "utf8");
    const line = content.split(/\r?\n/).find((l) => l.startsWith(`${name}=`));
    return line ? line.slice(name.length + 1).trim().replace(/^["']|["']$/g, "") : "";
  } catch {
    return "";
  }
}

async function main() {
  const supabaseUrl = readEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = readEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Supabase URL atau Service Role Key tidak ditemukan di .env.local");
    process.exit(1);
  }

  const db = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const fadliDemo = DEMO_ACCOUNTS.find((a) => a.email === "fadli@sepakatin.id");
  if (!fadliDemo) {
    console.error("Akun fadli@sepakatin.id tidak ditemukan di DEMO_ACCOUNTS");
    process.exit(1);
  }

  console.log("1. Memeriksa pengguna Fadli Bilal di Supabase Auth...");
  const { data: usersData, error: listError } = await db.auth.admin.listUsers({ perPage: 1000 });
  if (listError) {
    console.error("Gagal membaca daftar pengguna:", listError);
    process.exit(1);
  }

  let user = usersData.users.find((u) => u.email?.toLowerCase() === fadliDemo.email.toLowerCase());
  let userId = user?.id;

  if (userId) {
    console.log(`✓ Pengguna ditemukan (ID: ${userId}). Memastikan kata sandi & status email...`);
    await db.auth.admin.updateUserById(userId, {
      password: fadliDemo.password,
      email_confirm: true,
      user_metadata: { full_name: fadliDemo.fullName },
    });
  } else {
    console.log(`Membuat pengguna baru untuk ${fadliDemo.email}...`);
    const { data: newUser, error: createError } = await db.auth.admin.createUser({
      email: fadliDemo.email,
      password: fadliDemo.password,
      email_confirm: true,
      user_metadata: { full_name: fadliDemo.fullName },
    });
    if (createError || !newUser.user) {
      console.error("Gagal membuat user:", createError);
      process.exit(1);
    }
    userId = newUser.user.id;
    console.log(`✓ Pengguna baru berhasil dibuat (ID: ${userId})`);
  }

  console.log("2. Memperbarui profil Fadli Bilal (Pro)...");
  const { error: profileError } = await db.from("profiles").upsert({
    id: userId,
    email: fadliDemo.email,
    full_name: fadliDemo.fullName,
    skill: fadliDemo.role,
    phone: fadliDemo.phone,
    plan: "pro",
    plan_expires_at: null,
    project_credits: 0,
  });
  if (profileError) {
    console.error("Gagal upsert profile:", profileError);
    process.exit(1);
  }
  console.log("✓ Profil berhasil diperbarui.");

  console.log("3. Mengambil review token dokumen yang sudah ada (jika ada)...");
  const { data: existingAgr } = await db
    .from("agreements")
    .select("review_token")
    .eq("contract_id", "SPK-2026-00124")
    .maybeSingle();

  const reviewToken = existingAgr?.review_token || "token_abc_solusidigital_2026";

  console.log("4. Membuat data kesepakatan 5 versi dengan segel hash SHA-256...");
  const record = await buildSealedDemoAgreement(userId, reviewToken);

  console.log(`✓ Dokumen ${record.contractId} disiapkan:`);
  console.log(`  - Jumlah versi: ${record.versions.length}`);
  console.log(`  - Versi aktif: Versi ${record.currentVersionNumber}`);
  console.log(`  - Jumlah Permintaan Perubahan (CR): ${record.changeRequests.length}`);
  console.log(`  - Hash Versi 1: ${record.versions[0].documentHash.slice(0, 16)}...`);
  console.log(`  - Hash Versi 5: ${record.versions[4].documentHash.slice(0, 16)}...`);
  console.log(`  - Persetujuan: ${record.approvals.map((a) => `${a.signerName} (${a.role})`).join(", ")}`);
  console.log(`  - e-Materai serial: ${record.ematerai?.serialNumber}`);

  console.log("5. Menyuntikkan ke tabel public.agreements di Supabase...");
  const { error: agreementError } = await db.from("agreements").upsert(
    {
      id: record.id,
      owner_id: userId,
      contract_id: record.contractId,
      review_token: record.reviewToken,
      status: record.status,
      plan: record.plan,
      record,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "contract_id" }
  );

  if (agreementError) {
    console.error("Gagal upsert agreement ke Supabase:", agreementError);
    process.exit(1);
  }

  console.log("==================================================================");
  console.log("✅ BERHASIL SUNTIKKAN DOKUMEN 5 VERSI KE SUPABASE!");
  console.log(`   Akun       : ${fadliDemo.email}`);
  console.log(`   Kata Sandi : ${fadliDemo.password}`);
  console.log(`   Paket      : Pro`);
  console.log(`   Kontrak ID : ${record.contractId}`);
  console.log(`   Total Versi: ${record.versions.length} versi`);
  console.log(`   Status     : ${record.status}`);
  console.log("==================================================================");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
