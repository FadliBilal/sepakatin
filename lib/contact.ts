// Sepakatin — Kontak WhatsApp untuk paket harga, bantuan & konfirmasi pembayaran

export const WHATSAPP_NUMBER_DISPLAY = "0853-3933-3616";
export const WHATSAPP_NUMBER_INTL = "6285339333616";

export function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER_INTL}?text=${encodeURIComponent(message)}`;
}

export function planWhatsappLink(planName: string): string {
  return whatsappLink(
    `Halo Tim Sepakatin, saya tertarik dengan Paket ${planName}. Boleh minta info lebih lanjut?`
  );
}

export interface BankAccountInfo {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  badge?: string;
}

export const OFFICIAL_PAYMENT_ACCOUNTS: BankAccountInfo[] = [
  {
    bankName: "BCA (Bank Central Asia)",
    accountNumber: process.env.NEXT_PUBLIC_PAYMENT_BCA_ACCOUNT || "8735-092-118",
    accountHolder: process.env.NEXT_PUBLIC_PAYMENT_ACCOUNT_NAME || "Sepakatin Legal Tech",
    badge: "BCA Mobile / myBCA / ATM",
  },
  {
    bankName: "Bank Mandiri",
    accountNumber: process.env.NEXT_PUBLIC_PAYMENT_MANDIRI_ACCOUNT || "142-00-1928374-1",
    accountHolder: process.env.NEXT_PUBLIC_PAYMENT_ACCOUNT_NAME || "Sepakatin Legal Tech",
    badge: "Livin by Mandiri / ATM",
  },
];

export const OFFICIAL_QRIS_INFO = {
  label: "QRIS Sepakatin (BCA, Mandiri, BRI, GoPay, OVO, Dana, ShopeePay)",
  imageUrl:
    process.env.NEXT_PUBLIC_PAYMENT_QRIS_URL ||
    "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=00020101021126570014ID.LINKAJA.WWW011893600911002234032002081234567851440014ID.CO.QRIS.WWW0215ID10200238491820303UMI5204581253033605802ID5918SEPAKATIN%20TECH6007JAKARTA61051219062070703A0163048B2A",
  notes: "Pindai kode QRIS di atas memakai aplikasi perbankan atau e-wallet apa saja di smartphone Anda.",
};

