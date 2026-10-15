# Panduan Arah Desain & Identitas Visual Sepakatin (DESIGN.md)

Dokumen ini merupakan sumber kebenaran (*single source of truth*) arah desain dan identitas produk Sepakatin untuk tim dan agen AI, dipadukan dengan filter **anti-slop**.

---

## 1. Identitas & Nilai Inti Produk

- **Nama Platform**: Sepakatin (sepakatin.id)
- **Tagline**: *"Jangan cuma deal di chat. Tulis kesepakatannya."*
- **Tujuan**: Membantu pekerja lepas (*freelancer*) dan klien di Indonesia mencatat kesepakatan kerja secara tertulis, transparan, berkekuatan hukum, dan saling melindungi tanpa kerumitan birokrasi legal tradisional.
- **Prinsip Arsitektur**: **100% Bebas Biaya Tambahan / Zero-Cost Friendly**. Sistem dirancang agar freelancer pemula dapat menggunakannya secara gratis (kuota draf gratis, verifikasi hash SHA-256 gratis, cetak PDF gratis).

---

## 2. Karakter & Nada Suara (*Brand Voice*)

1. **Lugas & Jujur**: Tidak menggunakan istilah pemasaran AI yang bombastis (*cutting-edge*, *revolutionary*, *AI-powered synergy*). Menggunakan bahasa Indonesia yang ringkas, mudah dipahami orang awam, dan tepat sasaran.
2. **Menenangkan & Netral**: Kontrak dan uang sering memicu ketegangan. Antarmuka Sepakatin harus terasa adil bagi kedua belah pihak (freelancer dan klien), bukan intimidatif.
3. **Pasti & Sah**: Mengedepankan bukti forensik digital (IP, User-Agent forensik, SHA-256 hash, kepatuhan UU ITE & UU Bea Meterai No. 10/2020).

---

## 3. Pengaturan Dial anti-slop (*Liveliness Dials*)

Mengacu pada Liveliness Toolkit anti-slop:

- **ENERGY: 2 (Tenang & Terkendali)**
  - Tidak ada warna neon, animasi bouncing liar, atau teks berkedip.
  - Fokus visual tertuju pada isi pasal kesepakatan, angka pembayaran, dan status persetujuan.
- **RHYTHM: 2 (Terstruktur & Rapi)**
  - Mengikuti alur 5 langkah nyata: *Isi formulir → Kirim ke klien → Tanda tangan & setuju → Bubuhkan e-Meterai → Unggah & simpan*.
  - Jarak antar bagian konsisten menggunakan standar Tailwind (`py-12`, `py-20`, `gap-6`, `space-y-4`).
- **MOTION: 1 (Fungsional & Ringan)**
  - Transisi CSS sederhana (`transition-colors duration-200`).
  - Modal muncul dengan transisi cepat tanpa efek 3D berlebihan yang membebani browser HP.

---

## 4. Sistem Warna & Kontras (WCAG AA Certified)

| Peran | Token Tailwind | Kode Hex | Penggunaan |
|:---|:---|:---|:---|
| **Primary Brand** | `brand-600` | `#0a1fd4` | Tombol aksi utama, tautan aktif, border penanda aktif |
| **Brand Dark** | `brand-700` | `#0819aa` | Hover tombol utama, teks judul aksen |
| **Brand Surface** | `brand-50` | `#eef1ff` | Latar belakang badge, penanda info, wadah ikon |
| **Teks Utama** | `slate-900` | `#0f172a` | Judul, label penting, nilai nominal |
| **Teks Badan (Body)** | `slate-600` | `#475569` | Paragraf deskripsi (kontras ≥ 5.7:1 terhadap putih) |
| **Teks Sekunder/Batas**| `slate-500` | `#64748b` | Keterangan tambahan (kontras ≥ 4.5:1 terhadap putih) |
| **Success / Sah** | `emerald-600` | `#059669` | Status AGREED, tanda tangan terverifikasi |
| **Warning / Revisi** | `amber-600` | `#d97706` | Status CHANGES_REQUESTED, draf belum sah |
| **Danger / Tolak** | `rose-600` | `#e11d48` | Batalkan kesepakatan, peringatan kedaluwarsa |

> **Catatan Kontras Aksesibilitas**: Hindari penggunaan `slate-400` untuk teks deskripsi penting di atas latar putih atau abu-abu terang. Semua teks normal wajib memenuhi rasio kontras minimal 4.5:1.

---

## 5. Tipografi

- **Keluarga Font**: `Poppins, ui-sans-serif, system-ui, sans-serif`
  - Dipilih karena memiliki geometri yang jelas, ramah dibaca di layar smartphone, dan formal saat dicetak ke lembar kertas A4.
- **Hirarki Ukuran**:
  - `page-title`: `text-2xl sm:text-3xl font-bold tracking-tight text-slate-900`
  - `section-title`: `text-2xl sm:text-3xl font-bold tracking-tight text-slate-900`
  - `card-title`: `text-base font-semibold text-slate-900`
  - `kicker`: `text-sm font-semibold text-brand-600`
  - `body`: `text-sm sm:text-base text-slate-600 leading-relaxed`

---

## 6. Aturan Penulisan Copywriting (*Copy Rules*)

1. **Larangan Em Dash (`—`)**: Gunakan tanda titik dua (`:`), koma (`,`), tanda kurung `()`, atau titik (`.`).
2. **Kesesuaian Fakta**: Tidak mencantumkan testimoni fiktif, metrik palsu (misal: "Dipercaya 100.000 Perusahaan"), atau klaim sertifikasi yang belum dimiliki.
3. **Pemberitahuan Transparan**: Selalu cantumkan penafian bahwa Sepakatin adalah platform pencatatan kesepakatan perdata online, bukan kantor advokat atau penasihat hukum resmi.
