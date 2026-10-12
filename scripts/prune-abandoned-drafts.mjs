import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";

// Baca .env.local
const envText = fs.readFileSync(".env.local", "utf-8");
const env = {};
envText.split("\n").forEach((line) => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) env[match[1]] = match[2].trim();
});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

const isExecute = process.argv.includes("--execute");
const daysThreshold = 60; // Draf atau kesepakatan batal lebih dari 60 hari

async function prune() {
  console.log("=== SISTEM PEMBERSIHAN OTOMATIS SEPAKATIN ===");
  console.log(`Mode: ${isExecute ? "EKSEKUSI PENGHAPUSAN" : "SIMULASI (DRY RUN - Tidak ada data yang dihapus)"}`);
  console.log(`Batas waktu: Berkas status DRAFT / CANCELLED lebih tua dari ${daysThreshold} hari.\n`);

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysThreshold);
  const cutoffIso = cutoffDate.toISOString();

  // 1. Cari draf & kesepakatan batal terbengkalai
  const { data: abandoned, error: agrErr } = await supabase
    .from("agreements")
    .select("id, contract_id, status, owner_id, updated_at")
    .in("status", ["DRAFT", "CANCELLED"])
    .lt("updated_at", cutoffIso);

  if (agrErr) {
    console.error("Gagal membaca tabel agreements:", agrErr.message);
    return;
  }

  console.log(`Ditemukan ${abandoned?.length || 0} draf/kesepakatan batal terbengkalai (> ${daysThreshold} hari).`);
  if (abandoned && abandoned.length > 0) {
    console.table(abandoned);

    if (isExecute) {
      const ids = abandoned.map((a) => a.id);
      console.log(`Menghapus ${ids.length} draf dari database...`);
      const { error: delErr } = await supabase.from("agreements").delete().in("id", ids);
      if (delErr) {
        console.error("Gagal menghapus draf:", delErr.message);
      } else {
        console.log(`SUKSES: ${ids.length} draf lama berhasil dibersihkan!`);
      }
    } else {
      console.log("Tips: Jalankan dengan argumen '--execute' untuk benar-benar menghapus data ini.");
    }
  }

  // 2. Cari akun hantu (tanpa kontrak sama sekali)
  const { data: allProfiles, error: profErr } = await supabase
    .from("profiles")
    .select("id, email, full_name, created_at");

  if (!profErr && allProfiles) {
    const adminEmails = (env.ADMIN_EMAILS || "").toLowerCase().split(",");
    const { data: allAgreements } = await supabase.from("agreements").select("owner_id");
    const activeOwnerIds = new Set((allAgreements || []).map((a) => a.owner_id));

    const ghostUsers = allProfiles.filter(
      (p) =>
        !adminEmails.includes(p.email.toLowerCase()) &&
        !activeOwnerIds.has(p.id) &&
        new Date(p.created_at) < cutoffDate
    );

    console.log(`\nDitemukan ${ghostUsers.length} akun tanpa kesepakatan (> ${daysThreshold} hari sejak pendaftaran).`);
    if (ghostUsers.length > 0) {
      console.table(ghostUsers.map((g) => ({ id: g.id, email: g.email, created_at: g.created_at })));
    }
  }

  console.log("\n=== PEMERIKSAAN SELESAI ===");
}

prune();
