# Sepakatin

Platform kesepakatan kerja untuk freelancer & klien di Indonesia: ubah deal di chat menjadi
surat kesepakatan yang rapi, disetujui kedua pihak, lengkap dengan e-Materai dan tanda tangan online.

## Menjalankan

```bash
npm install
npm run dev
```

Buka http://localhost:3000

## Akun demo

| Nama          | Username | Email              | Kata sandi     |
| ------------- | -------- | ------------------ | -------------- |
| Fadli Bilal   | `fadli`  | fadli@sepakatin.id | `sepakatin123` |
| Pengguna Demo | `demo`   | demo@sepakatin.id  | `demo1234`     |

Bisa masuk memakai username **atau** email. Di halaman login juga ada tombol **Pakai**
untuk mengisi akun demo otomatis. Data disimpan di browser (localStorage), jadi tidak perlu server/database.

Untuk mengulang data demo dari awal, hapus data situs di browser (DevTools → Application → Local Storage → hapus kunci `sepakatin_*`).

## Alur demo yang disarankan

1. Masuk dengan akun `fadli` → Dashboard (sudah ada contoh kesepakatan `SPK-2026-00124`).
2. **Buat Kesepakatan Baru** → isi data klien → **Simpan & Kirim ke Klien**.
3. Klik **Lihat sebagai Klien** → klien tanda tangan & setujui (atau minta perubahan).
4. Kembali ke halaman kesepakatan → **Setujui** sebagai freelancer → status jadi *Sudah Disepakati*.
5. Tab **Materai & Tanda Tangan** → **Pakai Contoh e-Materai**.
6. **Cetak / PDF** dan **Cek Keaslian** (pindai kode QR).

## Paket harga

Semua tombol paket di halaman Harga terhubung ke WhatsApp **0853-3933-3616**.
