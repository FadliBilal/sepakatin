# 06. Strategic Open Questions & Decision Log: Sepakatin

**Project:** Sepakatin  
**Auditor Roles:** Senior Product Manager, Software Architect, QA Engineer, UI/UX Auditor, Technical Business Analyst  
**Document Purpose:** Daftar pertanyaan strategis, opsi keputusan teknis, dan trade-off bisnis yang memerlukan arahan dan persetujuan dari Pemilik Produk (Product Owner) sebelum tahap implementasi dimulai.  
**Repository Working Directory:** `e:\Fadli\7 Kegiatan\Lomba\Exploreaition\sepakatin`  

---

## 1. Domain: Monetisasi & Operasional Pembayaran

### OQ-001: Model Checkout Pembayaran Paket & Kredit Proyek
- **Latar Belakang & Bukti Kode:**
  Saat ini, CTA pada tabel harga ([lib/plans.ts:89](file:///e:/Fadli/7%20Kegiatan/Lomba/Exploreaition/sepakatin/lib/plans.ts#L89) & [lib/contact.ts:12-16](file:///e:/Fadli/7%20Kegiatan/Lomba/Exploreaition/sepakatin/lib/contact.ts#L12-L16)) mengarahkan pengguna ke tautan WhatsApp admin. Upgrade paket akun (`pro`) dan penambahan saldo kredit per-proyek (`project_credits`) harus dilakukan secara manual oleh administrator melalui dasbor `/admin` ([app/api/admin/route.ts:89-102](file:///e:/Fadli/7%20Kegiatan/Lomba/Exploreaition/sepakatin/app/api/admin/route.ts#L89-L102)).
- **Opsi Keputusan:**
  - **Opsi A (Tetap Manual via WhatsApp):** Pertahankan alur saat ini untuk tahap validasi awal (MVP). Pengguna chat WhatsApp, transfer manual, lalu admin mengklik upgrade di dashboard.
  - **Opsi B (Otomatisasi Penuh via Payment Gateway - Disarankan):** Integrasikan Midtrans Snap atau Xendit Invoice. Pengguna membayar via QRIS/GoPay/Virtual Account secara instan; webhook serverless langsung menambah kredit akun tanpa campur tangan admin.
- **Rekomendasi:** **Opsi B**. Nilai transaksi Rp19.000 (Per Proyek) bersifat transaksi mikro berfrekuensi tinggi (*micro-transaction*). Meminta transfer manual via WhatsApp memicu friksi sangat tinggi dan potensi drop-off pembayaran hingga > 60%.
- **Dampak Implementasi:** Memerlukan akun merchant Midtrans/Xendit dan penambahan tabel `transactions` untuk rekonsiliasi pembayaran.

---

## 2. Domain: Kepatuhan Hukum & Alur e-Materai

### OQ-002: Status Fitur Simulasi Stempel Grafis e-Materai
- **Latar Belakang & Bukti Kode:**
  Aplikasi saat ini memiliki dua fitur yang tumpang tindih: (1) Simulasi grafis penempelan stempel e-Materai di browser ([lib/agreement-logic.ts:520-555](file:///e:/Fadli/7%20Kegiatan/Lomba/Exploreaition/sepakatin/lib/agreement-logic.ts#L520-L555) & [components/PrintableAgreement.tsx:53](file:///e:/Fadli/7%20Kegiatan/Lomba/Exploreaition/sepakatin/components/PrintableAgreement.tsx#L53)), dan (2) Fitur unggah berkas PDF resmi bermeterai hasil stempel di portal Peruri ([lib/agreement-logic.ts:474-506](file:///e:/Fadli/7%20Kegiatan/Lomba/Exploreaition/sepakatin/lib/agreement-logic.ts#L474-L506)).
- **Opsi Keputusan:**
  - **Opsi A (Hapus Total Simulasi Grafis - Disarankan demi Kepatuhan Hukum):** Hilangkan penempelan stempel grafis internal. Posisikan tab "e-Materai" murni sebagai panduan alur resmi: unduh PDF Sepakatin → bayar & bubuhkan di portal Peruri/Pos Fin → unggah kembali PDF resmi yang sah.
  - **Opsi B (Pertahankan Keduanya dengan Disclaimer Tegas):** Pertahankan penempelan stempel grafis lokal sebagai penanda visual tata letak, namun beri label besar "SIMULASI VISUAL / BUKAN BEA METERAI RESMI".
- **Rekomendasi:** **Opsi A**. Menurut UU Bea Meterai No. 10 Tahun 2020, meterai elektronik hanya sah jika diterbitkan oleh Perum Peruri melalui sistem terakreditasi. Menyediakan stempel gambar tiruan berisiko menyesatkan pengguna dan menimbulkan risiko hukum bagi platform.
- **Dampak Implementasi:** Penyederhanaan komponen UI pada `app/agreements/[id]/page.tsx` dan peniadaan payload gambar meterai lokal.

---

## 3. Domain: Keamanan Akses & Siklus Hidup Review Token

### OQ-003: Masa Berlaku (TTL) & Keamanan Tautan Undangan Klien
- **Latar Belakang & Bukti Kode:**
  Saat ini, kolom `review_token` pada basis data ([supabase/migrations/001_initial_schema.sql:43](file:///e:/Fadli/7%20Kegiatan/Lomba/Exploreaition/sepakatin/supabase/migrations/001_initial_schema.sql#L43)) tidak memiliki masa kedaluwarsa. Endpoint `/api/review/[token]` dapat diakses kapan saja tanpa autentikasi.
- **Opsi Keputusan:**
  - **Opsi A (Terapkan TTL 14 Hari + Fitur Terbitkan Ulang - Disarankan):** Tautan otomatis kedaluwarsa dalam 14 hari sejak dikirimkan. Freelancer memiliki tombol di dasbor untuk menerbitkan ulang tautan (*Regenerate Token*) jika masa berlaku habis atau link bocor.
  - **Opsi B (Tetap Tanpa Kedaluwarsa):** Tautan berlaku selamanya selama dokumen belum dibatalkan oleh freelancer.
  - **Opsi C (Wajibkan OTP WhatsApp Klien):** Klien yang membuka tautan wajib memasukkan nomor WhatsApp dan memverifikasi kode OTP 4-digit sebelum melihat isi kontrak.
- **Rekomendasi:** **Opsi A**. Opsi A menyeimbangkan antara keamanan (mencegah link lama dieksploitasi) dan pengalaman tanpa friksi (*frictionless experience*) tanpa membebani klien dengan biaya SMS/OTP.
- **Dampak Implementasi:** Penambahan kolom `review_token_expires_at` pada tabel `agreements` dan penanganan status HTTP 410 Gone di antarmuka review klien.

---

## 4. Domain: Arsitektur Data & Penyimpanan Dokumen PDF

### OQ-004: Migrasi Berkas Biner dari Kolom JSONB ke Object Storage
- **Latar Belakang & Bukti Kode:**
  Berkas PDF bermeterai saat ini dikonversi menjadi string Base64 dan disimpan di kolom `agreements.record` JSONB ([lib/agreement-logic.ts:480-498](file:///e:/Fadli/7%20Kegiatan/Lomba/Exploreaition/sepakatin/lib/agreement-logic.ts#L480-L498)). Hal ini membuat ukuran baris database membengkak hingga 7–9 MB dan memicu `QuotaExceededError` di mode LocalStorage browser.
- **Opsi Keputusan:**
  - **Opsi A (Migrasi Penuh ke Supabase Storage Bucket - Disarankan):** Berkas PDF disimpan di bucket privat Supabase Storage. Basis data hanya menyimpan path URL objek. Di mode lokal, file hanya disimpan sementara di IndexedDB atau dibatasi ukuran pratinjaunya.
  - **Opsi B (Pertahankan Base64 dengan Batas Ukuran Sangat Kecil):** Batasi ukuran maksimal unggahan PDF menjadi < 1 MB agar muat di LocalStorage dan baris JSONB.
- **Rekomendasi:** **Opsi A**. Standar industri untuk penyimpanan dokumen hukum adalah object storage (S3-compatible). Opsi B tidak realistis karena berkas PDF resmi bermeterai hasil scan atau stempel Peruri umumnya berukuran 2–6 MB.
- **Dampak Implementasi:** Pembuatan Supabase Storage bucket `agreement-documents` dan pembuatan endpoint penerbitan Signed Download URL.

---

### OQ-005: Normalisasi Skema Database vs Struktur Dokumen JSONB Tunggal
- **Latar Belakang & Bukti Kode:**
  PRD awal merencanakan 10 tabel relasional terpisah, namun implementasi riil menggabungkan seluruh versi, persetujuan, dan perubahan ke dalam satu kolom `record jsonb` ([supabase/migrations/001_initial_schema.sql:49](file:///e:/Fadli/7%20Kegiatan/Lomba/Exploreaition/sepakatin/supabase/migrations/001_initial_schema.sql#L49)).
- **Opsi Keputusan:**
  - **Opsi A (Arsitektur Hibrida - Disarankan):** Pertahankan `record jsonb` sebagai representasi dokumen utuh yang tidak dapat diubah (*snapshot document*), namun ekstrak data `milestones` dan `change_requests` ke tabel relasional pendukung jika fitur pelacakan progres proyek interaktif diaktifkan di Fase 2.
  - **Opsi B (Tetap Dokumen Tunggal Murni JSONB):** Pertahankan struktur tabel saat ini secara penuh tanpa tabel relasional tambahan.
  - **Opsi C (Normalisasi Penuh ke 10 Tabel Sesuai PRD Lama):** Rombak ulang skema menjadi 10 tabel relasional terpisah.
- **Rekomendasi:** **Opsi A**. Menjaga keseimbangan antara kemudahan integritas hash dokumen (yang memerlukan canonical snapshot utuh) dan efisiensi kueri analitik platform.
- **Dampak Implementasi:** Skema saat ini dipertahankan untuk Fase 0 & Fase 1, normalisasi parsial dievaluasi kembali pada Fase 2.

---

## 5. Domain: Notifikasi & Komunikasi Pengguna

### OQ-006: Kanal Notifikasi Transaksional Utama
- **Latar Belakang & Bukti Kode:**
  Aplikasi saat ini tidak memiliki sistem pengiriman notifikasi otomatis ([lib/contact.ts](file:///e:/Fadli/7%20Kegiatan/Lomba/Exploreaition/sepakatin/lib/contact.ts)). Semua tautan harus dibagikan secara manual oleh pengguna melalui clipboard atau tombol `wa.me`.
- **Opsi Keputusan:**
  - **Opsi A (Email Transaksional via Resend / SendGrid - Disarankan Tahap Awal):** Kirim notifikasi otomatis ke email freelancer saat klien membuka tautan, meminta revisi, atau menandatangani dokumen.
  - **Opsi B (WhatsApp Gateway API Otomatis):** Gunakan penyedia WhatsApp Gateway (misal Fonnte atau Twilio) untuk mengirim pesan instan langsung ke nomor WhatsApp klien dan freelancer.
  - **Opsi C (Hibrida Email + WhatsApp):** Email untuk salinan resmi dokumen PDF, WhatsApp untuk pemberitahuan tautan instan.
- **Rekomendasi:** **Opsi A untuk Fase Rebuild Cepat**, dilanjutkan ke **Opsi C** setelah integrasi email stabil. Pengiriman email memiliki biaya infrastruktur mendekati nol (kuota gratis Resend 3.000 email/bulan) dan tidak memerlukan pendaftaran akun WhatsApp Business API yang birokratis.
- **Dampak Implementasi:** Penambahan dependensi SDK email dan konfigurasi domain DNS (DKIM/SPF) untuk `sepakatin.id`.

---

## 6. Domain: Tata Kelola Administrator & Integritas Dokumen

### OQ-007: Batasan Kewenangan Admin terhadap Dokumen yang Telah Disepakati (`AGREED`)
- **Latar Belakang & Bukti Kode:**
  Pada [app/api/admin/route.ts:113-124](file:///e:/Fadli/7%20Kegiatan/Lomba/Exploreaition/sepakatin/app/api/admin/route.ts#L113-L124), admin platform memiliki tombol `cancel` dan `delete` yang dapat menghapus atau membatalkan dokumen apa pun secara sepihak. Sementara itu, [PRD_Sepakatin.md:179](file:///e:/Fadli/7%20Kegiatan/Lomba/Exploreaition/sepakatin/PRD_Sepakatin.md#L179) menyatakan: *"Admin tidak boleh mengubah isi agreement yang telah disetujui."*
- **Opsi Keputusan:**
  - **Opsi A (Immutabilitas Absolut Dokumen AGREED - Disarankan):** Admin HANYA dapat menonaktifkan akun yang melanggar hukum (*suspend user*). Dokumen yang telah berstatus `AGREED` tidak boleh dihapus atau diubah oleh siapa pun termasuk admin, untuk menjaga netralitas hukum platform sebagai pihak ketiga.
  - **Opsi B (Moderasi Fleksibel dengan Pembatalan Terbatas):** Admin boleh membatalkan dokumen `AGREED` hanya jika menerima laporan sengketa resmi (*abuse report*), namun status berubah ke `CANCELLED_BY_ADMIN` disertai catatan alasan moderasi publik.
- **Rekomendasi:** **Opsi B** dengan catatan audit ketat. Jika terjadi penyalahgunaan platform (misal pembuatan kesepakatan fiktif untuk penipuan), platform harus memiliki wewenang membubuhkan status penandaan sengketa pada halaman verifikasi publik tanpa menghapus riwayat dokumen aslinya.
- **Dampak Implementasi:** Penambahan status `CANCELLED_BY_ADMIN` dan kolom `cancellation_reason` pada skema database.

---

## 7. Rangkuman Tindakan Selanjutnya

| ID Pertanyaan | Topik Utama | Rekomendasi Auditor | Memerlukan Keputusan Pemilik Produk? |
| :--- | :--- | :--- | :--- |
| **OQ-001** | Integrasi Payment Gateway Otomatis | Midtrans / Xendit (Opsi B) | **DISEPAKATI (Opsi B)** |
| **OQ-002** | Penghapusan Stempel Grafis Simulasi | Hapus Simulasi, Fokus Panduan Peruri (Opsi A) | **DISEPAKATI (Opsi A)** |
| **OQ-003** | TTL Review Token Klien | 14 Hari + Regenerasi Tautan (Opsi A) | **DISEPAKATI (Setuju)** |
| **OQ-004** | Migrasi Base64 ke Supabase Storage | Wajib Migrasi ke Object Storage (Opsi A) | **DISEPAKATI (Setuju)** |
| **OQ-005** | Struktur Data Relasional vs JSONB | Hibrida Snapshot JSONB + Ekstraksi (Opsi A) | **DISEPAKATI** (Pertahankan Snapshot JSONB) |
| **OQ-006** | Kanal Notifikasi Utama | Resend Email (Free Tier) & Webhook | **DISEPAKATI** (Zero Cost Approach) |
| **OQ-007** | Kewenangan Moderasi Dokumen Admin | Pembatalan Bersyarat dengan Audit (Opsi B) | **DISEPAKATI** |

---

## 8. Ketentuan Operasional Tambahan: Arsitektur Nol Biaya (Zero-Cost Infrastructure) & Domain Kustom

Sesuai arahan eksplisit dari Pemilik Produk:
1. **Prinsip Biaya Nol (Zero Operational Cost):**
   - **Database & Storage:** Memaksimalkan **Supabase Free Tier** (500 MB PostgreSQL database, 1 GB Object Storage, 50.000 Monthly Active Users untuk Auth). Tidak ada biaya bulanan.
   - **Hosting & Compute:** **Vercel Hobby Plan** (Serverless Next.js 14, SSL gratis, proteksi DDoS global gratis).
   - **Payment Gateway (Midtrans Snap):** Bebas biaya pendaftaran dan tanpa biaya langganan bulanan (*No Monthly Fee*). Biaya hanya dikenakan per transaksi sukses (*MDR - Merchant Discount Rate* mis. QRIS ~0.7% yang dipotong langsung dari nominal Rp19.000 atau Rp49.000 saat transaksi terjadi).
   - **Email Transaksional:** Menggunakan **Resend Free Tier** (3.000 email gratis/bulan, 100 email/hari) yang mencukupi kebutuhan validasi awal.
2. **Domain Kustom (.my.id dari Jagoan Hosting):**
   - Aplikasi akan dikonfigurasi untuk menggunakan domain gratis `.my.id` milik pengguna (misal `https://sepakatin.my.id`).
   - Variabel `NEXT_PUBLIC_APP_URL` pada `.env.local` dan konfigurasi Vercel akan diarahkan ke domain ini secara permanen agar QR Code pada fisik surat tetap valid selamanya.

---

*Status Dokumen: Seluruh keputusan strategis telah DISETUJUI oleh Pemilik Produk pada 9 Oktober 2026.*
