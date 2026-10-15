# DOKUMEN SPESIFIKASI ALUR & SKENARIO SISTEM SEPAKATIN
> **Panduan Acuan Standar (*Single Source of Truth*) untuk Pengembang & Pengujian**  
> *Versi Dokumen: 1.0 — Tanggal Pembaruan: 15 Oktober 2026*

Dokumen ini mendokumentasikan seluruh tahapan, skenario bisnis, logika transisi status (*state machine*), aspek hukum perdata/digital, serta interaksi antarmuka dari sudut pandang (**POV**) **Freelancer** dan **Klien**. Dokumen ini menjadi pedoman utama dalam pengembangan, perbaikan bug, dan pengujian platform Sepakatin.

---

## DAFTAR ISI
1. [Prinsip Dasar Arsitektur Hukum & Kriptografi](#1-prinsip-dasar-arsitektur-hukum--kriptografi)
2. [Status Dokumen & Mesin Transisi (State Machine)](#2-status-dokumen--mesin-transisi-state-machine)
3. [Alur Langkah-demi-Langkah: POV Freelancer](#3-alur-langkah-demi-langkah-pov-freelancer)
4. [Alur Langkah-demi-Langkah: POV Klien](#4-alur-langkah-demi-langkah-pov-klien)
5. [Siklus Pembaruan Versi (Version Bump)](#5-siklus-pembaruan-versi-version-bump)
6. [Skenario Pembubuhan Dokumen (e-Meterai: Pakai vs Tanpa)](#6-skenario-pembubuhan-dokumen-e-meterai-pakai-vs-tanpa)
7. [Skenario Pasca-Deal: Revisi Karya vs Tambahan Pekerjaan (Addendum)](#7-skenario-pasca-deal-revisi-karya-vs-tambahan-pekerjaan-addendum)
8. [Matriks File Kode Sumber & Komponen Terkait](#8-matriks-file-kode-sumber--komponen-terkait)

---

## 1. Prinsip Dasar Arsitektur Hukum & Kriptografi

Platform Sepakatin dirancang berdasarkan asas hukum perdata Indonesia dan standar pembuktian digital:

### A. Asas Konsensus (KUHPerdata Pasal 1320)
* Perjanjian sah dan mengikat saat kedua belah pihak mencapai kata sepakat (*consensus*).
* Tidak memerlukan formalities yang memberatkan bagi transaksi perdata umum.

### B. UU ITE No. 1 Tahun 2024 & Tanda Tangan Elektronik
* Tanda tangan digital memiliki kekuatan hukum yang sah jika memenuhi unsur keaslian, kepemilikan, dan integritas dokumen.
* Sistem Sepakatin mencatat jejak audit forensik pada setiap tanda tangan:
  * **Alamat IP** penandatangan.
  * **User-Agent peramban** (tipe perangkat & browser).
  * **Stempel waktu ISO (*timestamp*)**.

### C. Integritas Kriptografis (SHA-256 Hash & Immutability)
* Setiap versi kesepakatan dihitung nilai hash SHA-256 secara kanonikal.
* Ketika kesepakatan telah disetujui kedua belah pihak (**Status `AGREED`**), isi dokumen **dikunci permanen (*immutable*)**. Dokumen tidak dapat disunting in-place demi menjaga keabsahan tanda tangan yang sudah melekat pada hash tersebut.

### D. UU Bea Meterai No. 10 Tahun 2020
* **Nilai Proyek ≤ Rp5.000.000**: Dibebaskan dari bea meterai (**Bebas Meterai / Rp0**). Cukup tanda tangan digital dan stempel SHA-256, dokumen sah mengikat.
* **Nilai Proyek > Rp5.000.000**: Dikenakan bea meterai Rp10.000 untuk keperluan alat bukti di pengadilan perdata.
* **Aturan Salinan Ganda (*Dual Copy*)**: Berdasarkan regulasi Ditjen Pajak / Peruri:
  * *Salinan Freelancer*: e-Meterai dibubuhkan di atas tanda tangan pihak **Klien**.
  * *Salinan Klien*: e-Meterai dibubuhkan di atas tanda tangan pihak **Freelancer**.

---

## 2. Status Dokumen & Mesin Transisi (State Machine)

| Status Dokumen | Penjelasan Kondisi | Hak Akses Freelancer | Hak Akses Klien |
|:---|:---|:---|:---|
| **`DRAFT`** | Draf baru dibuat, belum pernah dikirim ke klien. | Bisa edit in-place tanpa naik versi, bisa tanda tangan, bisa kirim ke klien, bisa hapus draf. | Link review belum aktif / tidak bisa dibuka. |
| **`PENDING_CLIENT`** | Dokumen telah dikirim ke klien. Menunggu peninjauan klien. | Bisa setujui/ttd, bisa buat versi baru jika ada salah ketik, bisa salin link WhatsApp. | Bisa membaca dokumen, tanda tangan, setujui, atau klik Minta Perubahan. |
| **`CHANGES_REQUESTED`** | Klien telah mengajukan catatan revisi/perubahan. | Membaca catatan perubahan, membuka formulir Versi Baru untuk menerbitkan Versi berikutnya. | Menunggu freelancer memperbarui kesepakatan. Form persetujuan ditahan. |
| **`PENDING_APPROVAL`** | Versi baru (v2/v3) telah diterbitkan oleh freelancer. | Menandatangani ulang versi baru, menyetujui versi baru. | Meninjau versi baru, melihat riwayat perubahan, menandatangani dan menyetujui versi baru. |
| **`AGREED`** | **DEAL**. Kedua pihak telah menandatangani dan menyetujui versi yang sama. Dokumen TERKUNCI. | Mengunduh PDF resmi, cetak, verifikasi QR Code, unggah dokumen bermeterai, buat Addendum. | Mengunduh PDF resmi, cetak, verifikasi QR Code, unduh Salinan Klien bermeterai. |
| **`ACTIVE`** | Proyek sedang dalam pengerjaan aktif oleh freelancer. | Memantau pengerjaan, menandai selesai (`COMPLETED`), buat Addendum jika ada penambahan tugas. | Mengakses dokumen sah sebagai panduan deliverables dan batasan revisi. |
| **`COMPLETED`** | Pekerjaan telah tuntas diserahterimakan dan disetujui. | Menutup proyek, mengarsipkan dokumen, melihat audit trail. | Dokumen tersimpan sebagai arsip hukum. |
| **`CANCELLED`** | Kesepakatan dibatalkan sebelum selesai. | Dokumen memiliki watermark "DIBATALKAN", terkunci. | Dokumen memiliki watermark "DIBATALKAN", terkunci. |
| **`EXPIRED`** | Tautan review melewati batas masa berlaku 14 hari. | Menekan tombol "Perbarui Tautan Review" untuk mereset masa berlaku 14 hari. | Muncul peringatan bahwa link kedaluwarsa, instruksi menghubungi freelancer. |

---

## 3. Alur Langkah-demi-Langkah: POV Freelancer

### Tahap 3.1: Pembuatan Kesepakatan Awal (`/agreements/new`)
1. Freelancer login dan mengakses `/agreements/new`.
2. Freelancer mengisi 5 seksi formulir:
   * **Seksi 1 (Proyek & Para Pihak)**: Nama proyek, nama/email/WhatsApp freelancer, nama/email/WhatsApp klien, nama perusahaan klien (opsional).
   * **Seksi 2 (Ruang Lingkup & Hasil Kerja)**:
     * Deskripsi umum pekerjaan.
     * Daftar butir *Deliverables* (dapat menambah/menghapus butir luaran).
     * Daftar butir *Exclusions* (hal yang **tidak** dikerjakan untuk mencegah *scope creep*).
     * Kriteria penerimaan (*Acceptance Criteria*).
   * **Seksi 3 (Pembayaran & DP)**:
     * Total nilai proyek (Rp).
     * Persentase Uang Muka / DP (0%, 20%, 30%, 50%, 70%, 100% atau custom).
     * Rekening / metode pembayaran transfer bank.
     * Tenggat pelunasan (misal 7 hari kerja setelah serah terima).
   * **Seksi 4 (Revisi & Jadwal)**:
     * Jatah kuota revisi minor gratis (misal 2 atau 3 kali).
     * Definisi revisi minor.
     * Tarif biaya revisi tambahan per putaran (misal Rp300.000/revisi).
     * Tanggal mulai pengerjaan dan tanggal tenggat waktu (*deadline*).
   * **Seksi 5 (Hak Cipta & Pembatalan)**:
     * Klausul pengalihan kepemilikan aset final setelah pelunasan 100%.
     * Syarat kompensasi pembatalan sepihak.
3. Freelancer memilih tombol aksi:
   * **"Simpan Draf"**: Dokumen dibuat dengan status `DRAFT`. Link klien belum aktif.
   * **"Kirim ke Klien"**: Dokumen dibuat dengan status `PENDING_CLIENT`. Link review klien aktif dengan masa berlaku 14 hari.
4. Sistem mengarahkan browser ke halaman detail kesepakatan (`/agreements/[id]`).

### Tahap 3.2: Penandatanganan & Pengiriman (`/agreements/[id]`)
1. Di halaman `/agreements/[id]`, freelancer memeriksa draf kontrak di Tab **"1. Draf Dokumen"**.
2. Freelancer beralih ke Tab **"2. Tanda Tangan & Persetujuan"**:
   * Freelancer menggambar tanda tangan di kanvas digital (*Signature Pad*) atau memilih gaya otomatis dari nama.
   * Klik tombol **"Simpan Tanda Tangan"**.
   * Klik tombol **"Setujui Dokumen Ini"**.
3. Di banner atas, freelancer menyalin tautan review klien (`/review/[token]`) atau menekan tombol **"Kirim via WhatsApp"** untuk mengirim pesan ke klien.

### Tahap 3.3: Menangani Permintaan Perubahan Klien
1. Jika klien mengajukan perubahan, status kesepakatan menjadi `CHANGES_REQUESTED`.
2. Freelancer membuka Tab **"4. Permintaan Perubahan"**:
   * Melihat kartu permintaan revisi yang memuat tag kategori (misal: `[Lingkup & Deliverables]`), judul, penjelasan rinci, dan tanggal pengajuan.
   * Melihat pemantauan jatah revisi.
3. Freelancer menekan tombol **"Ubah Kesepakatan"**:
   * Membuka modal formulir versi baru (`VersionHistoryModal`).
   * Formulir terisi data sebelumnya. Freelancer memperbarui butir deliverables, exclusions, nominal, DP, tenggat, atau kuota revisi sesuai kesepakatan.
   * Klik **"Simpan & Buat Versi 2"**.
4. Sistem otomatis:
   * Menaikkan nomor versi: **Versi 1 ➔ Versi 2**.
   * Mengkalkulasi nilai hash SHA-256 baru.
   * Menandai status request perubahan menjadi `APPLIED`.
   * Mengosongkan tanda tangan lama (*reset signatures*) demi integritas hukum.
   * Mengubah status kesepakatan menjadi `PENDING_APPROVAL`.
5. Freelancer menandatangani ulang Versi 2 di Tab Tanda Tangan dan menyetujuinya.

### Tahap 3.4: Saat Kesepakatan Terkunci (*Deal* / Status `AGREED`)
1. Begitu klien menyetujui Versi yang sama, status berubah menjadi `AGREED`.
2. Muncul label hijau **"Terkunci"** dan banner **"Dokumen Sah & Terkunci Permanen"**.
3. Freelancer dapat:
   * Menekan **"Cetak / PDF"** untuk mengunduh dokumen bertanda tangan resmi berstempel SHA-256.
   * Menekan **"Cek Keaslian"** untuk memeriksa verifikasi publik di `/verify/[contractId]`.
   * Membuka Tab **"3. Panduan e-Meterai"** jika proyek bernilai > Rp5.000.000 untuk mengunduh 2 salinan dan mengunggah kembali berkas bermeterai resmi Peruri.
   * Menekan **"Tandai Selesai"** ketika proyek telah diserahterimakan penuh di kemudian hari.

---

## 4. Alur Langkah-demi-Langkah: POV Klien

### Tahap 4.1: Membuka Tautan Review (`/review/[token]`)
1. Klien menerima pesan WhatsApp dari freelancer berisi link unik review: `https://sepakatin.my.id/review/rev_xxxx`.
2. **Klien membuka tautan tanpa perlu membuat akun / tanpa login**.
3. Halaman menampilkan:
   * Header undangan dari nama freelancer.
   * Stepper tahapan: 1. Baca Dokumen ➔ 2. Setujui & Tanda Tangan ➔ 3. Sah & Mengikat.
   * Dokumen kontrak lengkap yang memuat deliverables, exclusions, termin pembayaran, kuota revisi, dan tanggal deadline.

### Tahap 4.2: Skenario A — Klien Mengajukan Perubahan (*Change Request*)
1. Jika ada butir yang belum pas, klien scroll ke bawah dan menekan tombol **"Minta Perubahan"**.
2. Muncul modal **"Minta Revisi Kesepakatan"**:
   * Klien memilih tag kategori yang ingin disesuaikan:
     * `[x] Lingkup & Deliverables`
     * `[x] Tenggat Waktu`
     * `[ ] Harga & DP`
     * `[ ] Jatah Revisi`
     * `[ ] Lainnya`
   * Klien mengisi Judul Permintaan (contoh: *Tambah file master Figma & geser deadline 3 hari*).
   * Klien mengisi Penjelasan Rinci.
3. Klien menekan **"Kirim Permintaan"**:
   * Status halaman klien berganti menjadi banner kuning: *"Permintaan perubahan sedang diproses. Freelancer sedang menyiapkan versi baru."*
   * Tombol persetujuan ditahan sampai freelancer menerbitkan versi pembaruan.

### Tahap 4.3: Skenario B — Klien Menyetujui Kesepakatan (*Agreement Approval*)
1. Jika isi dokumen sudah disetujui (atau setelah memeriksa Versi 2 pembaruan):
2. Di bagian bawah dokumen:
   * Klien membubuhkan tanda tangan digital pada kotak kanvas atau menekan *“Isi otomatis dari nama”*.
   * Mengisi konfirmasi Nama Lengkap dan Alamat Email.
   * Mencentang kotak persetujuan syarat dan ketentuan.
3. Klien menekan tombol hijau **"Setujui Kesepakatan"**:
   * Sistem mencatat tanda tangan dan bukti approval.
   * Sistem merekam IP Address dan User Agent peramban klien.
   * Jika pihak freelancer sudah menyetujui versi yang sama, status otomatis berubah menjadi **`AGREED`**.
4. Muncul kartu hijau resmi: **"Kesepakatan Sah & Mengikat Kedua Pihak!"**.
5. Klien dapat langsung menekan tombol **"Unduh Salinan Dokumen Bertanda Tangan (PDF)"** atau membuka tautan verifikasi keaslian.

---

## 5. Siklus Pembaruan Versi (Version Bump)

```
[Versi 1: Draf / Dikirim]
        │
   (Ada Revisi)
        ▼
[Modal Formulir Versi Baru] ──► Edit Deliverables, Exclusions, DP, Harga, Deadline, Revisi
        │
   (Simpan Versi)
        ▼
[Versi 2 Diterbitkan]
  • Nomor versi naik (v1 -> v2)
  • Hash SHA-256 baru dihitung
  • Status request perubahan -> 'APPLIED'
  • Tanda tangan lama direset (demi keabsahan hukum)
  • Status dokumen -> 'PENDING_APPROVAL'
        │
        ├──────────────────────────┐
        ▼                          ▼
 [Freelancer TTD Ulang v2]   [Klien TTD Ulang v2]
        └─────────────┬────────────┘
                      ▼
         [Konsensus Tercapai: AGREED]
            (Dokumen Dikunci Permanen)
```

---

## 6. Skenario Pembubuhan Dokumen (e-Meterai: Pakai vs Tanpa)

### Skenario A: Tanpa e-Meterai (Proyek ≤ Rp5.000.000)
1. **Dasar Regulasi**: UU Bea Meterai No. 10/2020 Pasal 3 ayat (2) menyatakan dokumen dengan nilai nominal sampai dengan Rp5.000.000 tidak dikenakan bea meterai (bebas bea meterai).
2. **Kekuatan Hukum**: Tetap berkekuatan hukum penuh perdata (KUHPerdata 1320 & UU ITE 1/2024).
3. **Alur**:
   * Begitu status `AGREED`, kedua pihak langsung mencetak atau mengunduh PDF kesepakatan bertanda tangan digital berstempel SHA-256.
   * Selesai tanpa biaya tambahan (Rp0).

### Skenario B: Menggunakan e-Meterai Resmi (Proyek > Rp5.000.000 / Klien Korporat)
1. **Dasar Regulasi**: Dokumen bernilai di atas Rp5.000.000 terutang bea meterai Rp10.000 untuk kepentingan pembuktian di pengadilan perdata.
2. **Aturan Pembubuhan Berpasangan (*Dual Copy*)**:
   * **Salinan Freelancer**: Dipegang freelancer, e-Meterai ditempel pada kolom tanda tangan **Klien**.
   * **Salinan Klien**: Dipegang klien, e-Meterai ditempel pada kolom tanda tangan **Freelancer**.
3. **Alur Eksekusi di Sepakatin**:
   1. Di halaman `/agreements/[id]`, freelancer membuka Tab **"3. Panduan e-Meterai"**.
   2. Freelancer mengunduh 2 berkas PDF: *Salinan Freelancer* dan *Salinan Klien*.
   3. Freelancer membubuhkan e-Meterai resmi Rp10.000 pada masing-masing posisi melalui distributor resmi (e-meterai Peruri, Pos Indonesia, atau Privy).
   4. Freelancer mengunggah berkas PDF yang telah bermeterai ke slot masing-masing di Sepakatin beserta nomor seri meterai.
   5. Berkas PDF bermeterai resmi tersimpan di storage cloud Sepakatin.
   6. Di halaman review klien (`/review/[token]`), otomatis muncul kartu hijau: **"Unduh Salinan Klien (Sudah Bermeterai Elektronik Rp10.000)"**.

---

## 7. Skenario Pasca-Deal: Revisi Karya vs Tambahan Pekerjaan (Addendum)

Salah satu kebingungan umum dalam pengerjaan proyek adalah membedakan **Revisi Hasil Pekerjaan** dengan **Penambahan Ruang Lingkup Kontrak**:

### Kasus 1: Klien Meminta Revisi Hasil Kerja (Masih dalam Kuota Kontrak)
* **Contoh Kasus**: Dokumen sudah Deal. Freelancer mengirim draft desain logo/website pertama. Klien meminta revisi: *"Tolong ganti warna tombol jadi biru dan perbaiki font headline."*
* **Penanganan**:
  * **Surat kontrak di Sepakatin TIDAK PERLU DIUBAH**.
  * Di dalam kontrak yang sudah Deal sudah tercantum: *"Jatah revisi minor: 2x"*.
  * Permintaan perbaikan visual ini adalah pelaksanaan kerja biasa yang dikerjakan di tools teknis (Figma/VS Code), bukan mengedit dokumen kontrak.
  * Status kontrak tetap `AGREED` sebagai acuan batas revisi.

### Kasus 2: Klien Meminta Tambahan Pekerjaan Baru di Luar Kontrak (*Scope Creep*)
* **Contoh Kasus**: Kontrak awal hanya mencakup 3 halaman landing page. Di tengah proyek, klien meminta: *"Tolong tambahkan 2 halaman baru dan integrasi payment gateway."*
* **Mengapa Kontrak Lama Tidak Boleh Diedit Langsung?**:
  * Dokumen berstatus `AGREED` telah ditandatangani dan disegel hash SHA-256. Jika teks kontrak lama bisa diedit lagi, tanda tangan klien yang lama menjadi cacat hukum dan batal demi hukum.
* **Solusi Resmi: Menerbitkan Dokumen Addendum**:
  1. Kontrak pertama (Kontrak Utama) tetap dibiarkan **`AGREED`**.
  2. Freelancer menekan tombol **"Buat Dokumen Addendum"** pada halaman kesepakatan induk (`/agreements/[id]`).
  3. Sistem mengarahkan ke formulir `/agreements/new?addendum_to=[id]`.
  4. **Data Klien, nama Freelancer, dan nomor kontrak induk otomatis terisi (*auto-prefill*)**.
  5. Freelancer cukup merincikan:
     * Judul: *"Addendum 01: [Nama Proyek]"*
     * Butir deliverables tambahan baru.
     * Biaya tambahan (misal: Rp2.500.000).
     * Deadline pekerjaan tambahan.
  6. Freelancer mengirim link review Addendum ke klien.
  7. Kedua pihak menandatangani Addendum tersebut.
  8. Sekarang para pihak memiliki 2 dokumen sah yang saling melengkapi: **Kontrak Induk + Dokumen Addendum**.

---

## 8. Matriks File Kode Sumber & Komponen Terkait

| Modul / Alur | Berkas Kode Sumber Utama | Peran Komponen |
|:---|:---|:---|
| **Formulir Kesepakatan Baru** | `app/agreements/new/page.tsx` | Formulir 5 seksi pembuatan kontrak baru & penanganan parameter `addendum_to`. |
| **Halaman Detail Kesepakatan** | `app/agreements/[id]/page.tsx` | Hub utama freelancer: navigasi tab, aksi cepat, dan tombol Addendum. |
| **Modal Versi Baru (Freelancer)** | `components/agreements/VersionHistoryModal.tsx` | Modal formulir lengkap untuk update deliverables, batasan, harga, DP, tenggat, & kuota revisi. |
| **Halaman Review Klien** | `app/review/[token]/page.tsx` | Halaman interaktif klien: tanpa login, baca dokumen, minta revisi dengan kategori, dan ttd online. |
| **Tab Permintaan Perubahan** | `components/agreements/ChangeRequestsTab.tsx` | Monitoring revisi, pelacakan kuota revisi gratis vs berbayar, tombol Addendum. |
| **Tab Tanda Tangan & Persetujuan**| `components/agreements/SignatureTab.tsx` | Kanvas tanda tangan digital freelancer & audit persetujuan para pihak. |
| **Tab Panduan e-Meterai Resmi** | `components/agreements/OfficialEmateraiGuideTab.tsx` | Alur unduh 2 salinan PDF resmi & formulir unggah berkas PDF bermeterai Peruri. |
| **Mesin Logika Bisnis & Validasi** | `lib/agreement-logic.ts` | Validasi tipe, transisi status (*state machine*), batasan paket gratis, dan pembubuhan meterai. |
| **Verifikasi Kriptografis & Keaslian**| `app/verify/[contract_id]/page.tsx` | Halaman publik verifikasi SHA-256 hash & keaslian QR Code dokumen. |
| **Cetak & Ekspor Dokumen** | `app/agreements/[id]/print/page.tsx` | Tampilan cetak formal kertas A4 berstempel digital & QR code resmi. |
