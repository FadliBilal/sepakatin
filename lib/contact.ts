// ==============================================================================
// Sepakatin — Kontak WhatsApp untuk paket harga & bantuan
// ==============================================================================

export const WHATSAPP_NUMBER_DISPLAY = "0853-3933-3616";
const WHATSAPP_NUMBER_INTL = "6285339333616";

export function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER_INTL}?text=${encodeURIComponent(message)}`;
}

export function planWhatsappLink(planName: string): string {
  return whatsappLink(
    `Halo Tim Sepakatin, saya tertarik dengan Paket ${planName}. Boleh minta info lebih lanjut?`
  );
}
