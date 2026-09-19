// Membuat akun demo + contoh dokumen di Supabase.
// 1) Isi SEED_SECRET di .env.local, 2) jalankan `npm run dev`, 3) di terminal lain: `npm run seed:demo`
// Untuk server lain: SEED_URL=https://domain-anda.vercel.app npm run seed:demo
import { readFileSync } from "node:fs";

function readEnv(name) {
  if (process.env[name]) return process.env[name];
  try {
    const line = readFileSync(".env.local", "utf8")
      .split(/\r?\n/)
      .find((l) => l.startsWith(`${name}=`));
    return line ? line.slice(name.length + 1).trim().replace(/^["']|["']$/g, "") : "";
  } catch {
    return "";
  }
}

const secret = readEnv("SEED_SECRET");
const base = process.env.SEED_URL || "http://localhost:3000";
if (!secret) {
  console.error("SEED_SECRET belum diisi di .env.local");
  process.exit(1);
}

const res = await fetch(`${base}/api/dev/seed`, { method: "POST", headers: { "x-seed-secret": secret } });
const body = await res.json().catch(() => ({}));
if (!res.ok) {
  console.error(`Gagal (${res.status}):`, body.error ?? body);
  process.exit(1);
}
for (const line of body.report ?? []) console.log("✓", line);
