import type { Metadata } from "next";
import "@fontsource/poppins/300.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "@fontsource/poppins/400-italic.css";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://sepakatin.id"),
  title: {
    default: "Sepakatin — Kesepakatan Kerja Freelancer yang Jelas & Aman",
    template: "%s | Sepakatin",
  },
  description:
    "Ubah obrolan WhatsApp menjadi surat kesepakatan kerja resmi yang rapi: apa yang dikerjakan, berapa kali revisi, kapan dibayar, lengkap dengan e-Materai dan tanda tangan digital sah.",
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
    title: "Sepakatin — Kesepakatan Kerja Freelancer yang Jelas & Aman",
    description:
      "Ubah deal di chat WhatsApp menjadi surat kesepakatan kerja resmi yang rapi: apa yang dikerjakan, berapa kali revisi, kapan dibayar, lengkap dengan e-Materai dan tanda tangan online.",
    url: "https://sepakatin.id",
    siteName: "Sepakatin",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "Sepakatin Logo",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Sepakatin — Kesepakatan Kerja Freelancer yang Jelas & Aman",
    description:
      "Ubah obrolan WhatsApp menjadi surat kesepakatan kerja resmi yang rapi dengan e-Materai dan tanda tangan online.",
    images: ["/icon.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="/icon.png?v=2" type="image/png" />
        <link rel="shortcut icon" href="/icon.png?v=2" />
        <link rel="apple-touch-icon" href="/icon.png?v=2" />
      </head>
      <body className="font-sans bg-white text-slate-900 min-h-screen flex flex-col antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
