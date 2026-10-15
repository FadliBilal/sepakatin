// Sepakatin — Alamat publik aplikasi (satu sumber kebenaran)
//
// Kenapa ini tidak boleh memakai `window.location.origin` begitu saja:
//
// Nomor dokumen dan QR code tercetak pada surat perjanjian yang ditandatangani
// dan dibubuhi e-Meterai. Alamat yang ikut tercetak bersifat PERMANEN — kertasnya
// tidak bisa ditarik kembali. Kalau alamat itu mengikuti host saat PDF dibuat
// (mis. `xxx.vercel.app`), maka begitu aplikasi pindah host, QR pada dokumen
// yang sudah sah menjadi tidak bisa dipindai.
//
// Karena itu alamat publik dikunci lewat `NEXT_PUBLIC_APP_URL` ke domain milik
// sendiri. Domain boleh diarahkan ke host mana pun di kemudian hari; dokumen yang
// sudah terlanjur tercetak tetap bisa diverifikasi.

const CONFIGURED = (process.env.NEXT_PUBLIC_APP_URL || "").trim().replace(/\/+$/, "");

/**
 * Alamat publik aplikasi tanpa garis miring di akhir.
 * Memakai `NEXT_PUBLIC_APP_URL` bila diisi; kalau tidak, jatuh ke alamat yang
 * sedang dibuka agar pengembangan lokal tetap berjalan.
 */
export function appUrl(): string {
  // Bila berjalan di browser (client-side) pada localhost/127.0.0.1/jaringan lokal,
  // selalu gunakan origin saat ini agar link uji coba (klien, QR code) tidak mengarah ke domain cloud produksi
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1" || host === "::1" || host.endsWith(".local") || host.startsWith("192.168.") || host.startsWith("10.")) {
      return window.location.origin;
    }
  }

  if (CONFIGURED) return CONFIGURED;
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

/**
 * Alamat halaman cek keaslian. Ini yang tercetak sebagai QR code di dokumen,
 * jadi harus memakai domain tetap — bukan domain host yang bisa berubah.
 */
export function verifyUrlFor(contractId: string): string {
  return `${appUrl()}/verify/${contractId}`;
}

/** Alamat undangan peninjauan untuk klien. */
export function reviewUrlFor(token: string): string {
  return `${appUrl()}/review/${token}`;
}
