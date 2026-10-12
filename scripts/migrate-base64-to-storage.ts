// ==============================================================================
// Sepakatin — Skrip Migrasi Kompatibilitas Mundur (Backward Compatibility)
// Memindahkan data Base64 PDF dari 'agreements.record' JSONB ke Supabase Storage.
//
// Cara menjalankan:
//   npx tsx scripts/migrate-base64-to-storage.ts
// ==============================================================================

import { createClient } from "@supabase/supabase-js";
import type { AgreementRecord, StampedDocumentRecord } from "../lib/types";

// Muat variabel lingkungan
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const STORAGE_BUCKET = "agreement-documents";

async function main() {
  console.log("================================================================================");
  console.log("   SEPAKATIN — MIGRASI DOKUMEN: BASE64 JSONB -> SUPABASE STORAGE BUCKET        ");
  console.log("================================================================================");

  if (!supabaseUrl || !serviceKey) {
    console.error("❌ Galat: Variabel NEXT_PUBLIC_SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY belum diatur.");
    console.log("   Pastikan konfigurasi lingkungan telah diisi sebelum menjalankan skrip ini.");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // 1. Pastikan bucket 'agreement-documents' sudah ada
  console.log(`\n🔍 1. Memeriksa keberadaan bucket penyimpanan '${STORAGE_BUCKET}'...`);
  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
  if (bucketError) {
    console.error(`❌ Gagal memeriksa bucket storage: ${bucketError.message}`);
    process.exit(1);
  }

  const bucketExists = buckets?.some((b) => b.id === STORAGE_BUCKET || b.name === STORAGE_BUCKET);
  if (!bucketExists) {
    console.log(`📦 Bucket '${STORAGE_BUCKET}' belum ada. Membuat bucket privat baru...`);
    const { error: createError } = await supabase.storage.createBucket(STORAGE_BUCKET, {
      public: false,
      fileSizeLimit: 10485760, // 10 MB
      allowedMimeTypes: ["application/pdf"],
    });
    if (createError) {
      console.error(`❌ Gagal membuat bucket: ${createError.message}`);
      process.exit(1);
    }
    console.log(`✅ Bucket '${STORAGE_BUCKET}' berhasil dibuat.`);
  } else {
    console.log(`✅ Bucket '${STORAGE_BUCKET}' terverifikasi siap.`);
  }

  // 2. Ambil seluruh data kesepakatan dari database
  console.log("\n🔍 2. Memindai data kesepakatan di database...");
  const { data: rows, error: fetchError } = await supabase
    .from("agreements")
    .select("id, contract_id, record");

  if (fetchError) {
    console.error(`❌ Gagal memuat data agreements: ${fetchError.message}`);
    process.exit(1);
  }

  if (!rows || rows.length === 0) {
    console.log("ℹ️ Tidak ada baris kesepakatan yang ditemukan di database.");
    console.log("Migrasi selesai (0 dokumen diproses).");
    return;
  }

  console.log(`📊 Ditemukan ${rows.length} kesepakatan untuk dipindai.`);

  let totalMigratedDocs = 0;
  let totalSavedBytes = 0;
  let updatedAgreementsCount = 0;

  for (const row of rows) {
    const record = row.record as AgreementRecord;
    if (!record || !record.stampedDocuments || record.stampedDocuments.length === 0) {
      continue;
    }

    let agreementModified = false;
    const updatedDocs: StampedDocumentRecord[] = [];

    for (const doc of record.stampedDocuments) {
      // Periksa apakah dokumen masih menyimpan Base64
      if (doc.fileUrl && doc.fileUrl.startsWith("data:application/pdf;base64,")) {
        console.log(`\n📄 Memproses dokumen '${doc.fileName}' (${doc.copyType}) pada kontrak ${row.contract_id}...`);
        
        try {
          const base64Content = doc.fileUrl.slice("data:application/pdf;base64,".length).trim();
          const buffer = Buffer.from(base64Content, "base64");
          const storagePath = `agreements/${row.id}/${doc.copyType}.pdf`;

          // Unggah ke Supabase Storage
          const { error: uploadError } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(storagePath, buffer, {
              contentType: "application/pdf",
              upsert: true,
            });

          if (uploadError) {
            console.error(`  ❌ Gagal mengunggah ke storage: ${uploadError.message}`);
            updatedDocs.push(doc); // Pertahankan data lama jika gagal
            continue;
          }

          const originalLength = doc.fileUrl.length;
          totalSavedBytes += originalLength;
          totalMigratedDocs++;
          agreementModified = true;

          // Bersihkan string Base64 dari database, simpan storagePath
          updatedDocs.push({
            ...doc,
            storagePath,
            fileUrl: "", // Mengeliminasi jutaan karakter Base64 dari Postgres JSONB
            fileSize: doc.fileSize || buffer.length,
          });

          console.log(`  ✅ Berhasil dimigrasikan ke: ${storagePath} (Menghemat ${(originalLength / 1024 / 1024).toFixed(2)} MB di JSONB)`);
        } catch (err) {
          console.error(`  ❌ Terjadi kesalahan saat memproses dokumen:`, err);
          updatedDocs.push(doc);
        }
      } else {
        // Sudah berformat storagePath atau URL eksternal
        updatedDocs.push(doc);
      }
    }

    if (agreementModified) {
      record.stampedDocuments = updatedDocs;
      const { error: updateError } = await supabase
        .from("agreements")
        .update({ record })
        .eq("id", row.id);

      if (updateError) {
        console.error(`❌ Gagal memperbarui record kesepakatan ${row.id}: ${updateError.message}`);
      } else {
        updatedAgreementsCount++;
      }
    }
  }

  console.log("\n================================================================================");
  console.log("                       RANGKUMAN HASIL MIGRASI STORAGE                          ");
  console.log("================================================================================");
  console.log(`Total Kesepakatan Dipindai : ${rows.length}`);
  console.log(`Kesepakatan Dimutakhirkan  : ${updatedAgreementsCount}`);
  console.log(`Dokumen PDF Dimigrasikan   : ${totalMigratedDocs}`);
  console.log(`Total Ruang JSONB Dihemat  : ${(totalSavedBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log("================================================================================");
  console.log("🎉 MIGRASI SELESAI DENGAN AMAN TANPA MERUSAK RIWAYAT DATA HISTORIS!");
}

main().catch((err) => {
  console.error("Fatal error saat menjalankan migrasi:", err);
  process.exit(1);
});
