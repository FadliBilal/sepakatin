// Sepakatin — Menyalin teks ke papan klip dengan fallback aman
//
// `navigator.clipboard` tidak selalu tersedia: butuh HTTPS (atau localhost),
// izin browser, dan bisa ditolak di dalam WebView aplikasi lain. Kalau panggilannya
// tidak ditunggu, tampilan bisa terlanjur bilang "Tersalin!" padahal papan klip kosong —
// dan itu fatal di sini, karena seluruh alur klien bergantung pada link yang tersalin.

"use client";

/** Cara lama: <textarea> sementara + execCommand. Dipakai kalau Clipboard API ditolak. */
function legacyCopy(text: string): boolean {
  try {
    const area = document.createElement("textarea");
    area.value = text;
    // Jauhkan dari layar supaya tidak terlihat berkedip, tapi tetap bisa diseleksi.
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "-1000px";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    area.setSelectionRange(0, text.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

/**
 * Menyalin teks. Mengembalikan `true` hanya kalau benar-benar berhasil,
 * sehingga pemanggil boleh menampilkan konfirmasi.
 */
export async function copyText(text: string): Promise<boolean> {
  if (!text) return false;

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Lanjut ke cara lama di bawah.
    }
  }

  if (typeof document === "undefined") return false;
  return legacyCopy(text);
}
