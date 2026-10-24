import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://sepakatin.id"),
  title: {
    default: "Sepakatin: Kesepakatan Kerja Freelancer yang Jelas & Aman",
    template: "%s | Sepakatin",
  },
  description:
    "Ubah obrolan WhatsApp menjadi surat kesepakatan kerja resmi yang rapi: apa yang dikerjakan, berapa kali revisi, kapan dibayar, lengkap dengan tanda tangan digital sah dan verifikasi resmi.",
  keywords: [
    "sepakatin",
    "kesepakatan kerja",
    "kontrak kerja freelancer",
    "surat perjanjian kerja",
    "e-materai",
    "tanda tangan digital",
    "freelancer indonesia",
    "spk online",
    "mou kerja",
  ],
  authors: [{ name: "Sepakatin" }],
  creator: "Sepakatin",
  publisher: "Sepakatin",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/icon.png?v=2", type: "image/png" },
      { url: "/favicon.ico?v=2" },
    ],
    apple: [
      { url: "/icon.png?v=2" },
    ],
    shortcut: ["/icon.png?v=2"],
  },
  openGraph: {
    title: "Sepakatin: Kesepakatan Kerja Freelancer yang Jelas & Aman",
    description:
      "Ubah deal di chat WhatsApp menjadi surat kesepakatan kerja resmi yang rapi: apa yang dikerjakan, berapa kali revisi, kapan dibayar, lengkap dengan tanda tangan digital sah dan verifikasi resmi.",
    url: "https://sepakatin.id",
    siteName: "Sepakatin",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "Sepakatin - Surat Kesepakatan Kerja Digital",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Sepakatin: Kesepakatan Kerja Freelancer yang Jelas & Aman",
    description:
      "Ubah obrolan WhatsApp menjadi surat kesepakatan kerja resmi yang rapi dengan tanda tangan digital sah dan verifikasi resmi.",
    images: ["/icon.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://sepakatin.id/#organization",
      name: "Sepakatin",
      url: "https://sepakatin.id",
      logo: {
        "@type": "ImageObject",
        url: "https://sepakatin.id/icon.png",
        width: 512,
        height: 512,
      },
      description:
        "Platform pembuatan dan verifikasi surat kesepakatan kerja digital resmi untuk freelancer dan klien di Indonesia.",
    },
    {
      "@type": "WebSite",
      "@id": "https://sepakatin.id/#website",
      url: "https://sepakatin.id",
      name: "Sepakatin",
      publisher: {
        "@id": "https://sepakatin.id/#organization",
      },
      inLanguage: "id-ID",
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://sepakatin.id/#software",
      name: "Sepakatin",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web Browser",
      url: "https://sepakatin.id",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "IDR",
        description: "Akses gratis pembuatan kesepakatan kerja digital dan tanda tangan online.",
      },
      description:
        "Ubah kesepakatan obrolan chat menjadi surat kesepakatan kerja resmi yang rapi. Mengunci ruang lingkup pekerjaan, jatah revisi, dan termin pembayaran secara transparan.",
      featureList: [
        "Pembuatan surat perjanjian kerja (SPK) digital terstruktur",
        "Tanda tangan digital kanvas langsung kedua belah pihak",
        "Penguncian dokumen otomatis setelah disetujui bersama",
        "Pencatatan riwayat revisi dan perubahan transparan",
        "Pemeriksaan keaslian dokumen via kode QR publik",
        "Panduan pembubuhan e-Meterai resmi Peruri",
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable @next/next/no-page-custom-font */}
        <link href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
        {/* eslint-enable @next/next/no-page-custom-font */}
        <link rel="icon" href="/icon.png?v=2" type="image/png" />
        <link rel="shortcut icon" href="/icon.png?v=2" />
        <link rel="apple-touch-icon" href="/icon.png?v=2" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="font-sans bg-[#FAFAFA] text-[#0A0A0A] min-h-screen flex flex-col antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
