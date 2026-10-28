import type { Metadata } from "next";

const siteUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://sepakatin.my.id").replace(/\/+$/, "");

export const metadata: Metadata = {
  title: "Cek Keaslian Dokumen Kesepakatan & Verifikasi Surat Perjanjian Kerja",
  description:
    "Verifikasi nomor dokumen dan kode QR surat kesepakatan kerja Sepakatin secara publik. Periksa integritas hash SHA-256 dan keabsahan tanda tangan kedua belah pihak.",
  alternates: {
    canonical: `${siteUrl}/verify`,
  },
  openGraph: {
    title: "Cek Keaslian Dokumen Kesepakatan | Sepakatin",
    description:
      "Verifikasi nomor dokumen dan kode QR surat kesepakatan kerja Sepakatin secara publik. Periksa integritas hash SHA-256 dan keabsahan tanda tangan kedua belah pihak.",
    url: `${siteUrl}/verify`,
    siteName: "Sepakatin",
    locale: "id_ID",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function VerifyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
