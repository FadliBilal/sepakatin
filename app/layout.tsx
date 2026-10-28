import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const siteUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://sepakatin.my.id").replace(/\/+$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Sepakatin - Surat Perjanjian Kerja (SPK) Freelancer & Tanda Tangan Digital Sah",
    template: "%s | Sepakatin",
  },
  description:
    "Platform pembuatan surat perjanjian kerja (SPK) digital resmi untuk freelancer dan klien di Indonesia. Kunci ruang lingkup pekerjaan, jatah revisi, dan termin pembayaran dengan tanda tangan digital sah KUHPerdata 1320 & UU ITE.",
  keywords: [
    "sepakatin",
    "surat perjanjian kerja",
    "spk freelance",
    "kontrak kerja freelancer",
    "surat kesepakatan kerja",
    "tanda tangan digital online",
    "contoh spk freelance",
    "template spk freelance",
    "mou kerja sama freelance",
    "freelancer indonesia",
    "e-meterai spk peruri",
    "aplikasi kontrak kerja digital",
  ],
  authors: [{ name: "Sepakatin Indonesia", url: siteUrl }],
  creator: "Sepakatin",
  publisher: "Sepakatin Legal Tech",
  category: "Business & Legal Tech",
  alternates: {
    canonical: siteUrl,
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
    title: "Sepakatin - Surat Perjanjian Kerja (SPK) Freelancer & Tanda Tangan Digital Sah",
    description:
      "Kunci kesepakatan kerja, jatah revisi, dan termin pembayaran secara profesional. Tanda tangan digital instan dari smartphone tanpa wajib buat akun.",
    url: siteUrl,
    siteName: "Sepakatin",
    images: [
      {
        url: `${siteUrl}/logo-sepakatin.png`,
        width: 1200,
        height: 630,
        alt: "Sepakatin - Platform Surat Perjanjian Kerja Digital",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sepakatin - Surat Perjanjian Kerja (SPK) Freelancer & Tanda Tangan Digital Sah",
    description:
      "Kunci kesepakatan kerja, jatah revisi, dan termin pembayaran secara profesional dengan tanda tangan digital sah.",
    images: [`${siteUrl}/logo-sepakatin.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Sepakatin Indonesia",
      alternateName: "Sepakatin",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/icon.png`,
        width: 512,
        height: 512,
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+62-853-3933-3616",
        contactType: "customer service",
        areaServed: "ID",
        availableLanguage: ["Indonesian"],
      },
      description:
        "Platform pembuatan dan verifikasi surat perjanjian kerja (SPK) digital resmi untuk freelancer dan klien di Indonesia.",
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Sepakatin",
      description: "Surat Perjanjian Kerja (SPK) Freelancer & Tanda Tangan Digital Sah",
      publisher: {
        "@id": `${siteUrl}/#organization`,
      },
      potentialAction: {
        "@type": "SearchAction",
        target: `${siteUrl}/verify?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
      inLanguage: "id-ID",
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${siteUrl}/#software`,
      name: "Sepakatin",
      applicationCategory: "BusinessApplication",
      operatingSystem: "All Web Browsers",
      url: siteUrl,
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "128",
        bestRating: "5",
        worstRating: "1",
      },
      offers: [
        {
          "@type": "Offer",
          name: "Paket Gratis",
          price: "0",
          priceCurrency: "IDR",
          description: "Maksimal 2 kesepakatan aktif gratis selamanya dengan tanda tangan digital sah.",
        },
        {
          "@type": "Offer",
          name: "Kredit Per Proyek",
          price: "19000",
          priceCurrency: "IDR",
          description: "Bayar pas Rp 19.000 per proyek tanpa langganan.",
        },
        {
          "@type": "Offer",
          name: "Paket Pro Bulanan",
          price: "49000",
          priceCurrency: "IDR",
          description: "Akses tanpa batas kuota kesepakatan dan revisi selama 30 hari penuh.",
        },
      ],
      description:
        "Ubah kesepakatan obrolan chat menjadi surat kesepakatan kerja resmi yang rapi. Mengunci ruang lingkup pekerjaan, jatah revisi, dan termin pembayaran secara transparan.",
      featureList: [
        "Pembuatan surat perjanjian kerja (SPK) digital terstruktur",
        "Tanda tangan digital kanvas langsung kedua belah pihak",
        "Penguncian dokumen otomatis setelah disetujui bersama",
        "Pencatatan riwayat revisi dan dokumen addendum resmi",
        "Pemeriksaan keaslian dokumen via kode QR publik",
        "Panduan pembubuhan e-Meterai resmi Peruri",
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${siteUrl}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "Apakah surat perjanjian kerja di Sepakatin sah secara hukum di Indonesia?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Ya, sah dan berkekuatan hukum mengikat. Berdasarkan Pasal 1320 Kitab Undang-Undang Hukum Perdata (KUHPerdata) dan Undang-Undang ITE, kesepakatan tertulis yang disetujui bersama secara elektronik diakui secara sah sebagai alat bukti hukum yang mengikat kedua belah pihak.",
          },
        },
        {
          "@type": "Question",
          name: "Apakah klien wajib membuat akun untuk menandatangani dokumen?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Tidak perlu. Klien dapat langsung membuka tautan resmi yang dikirimkan melalui browser ponsel maupun komputer, meninjau seluruh poin kesepakatan, dan membubuhkan tanda tangan digital secara instan.",
          },
        },
        {
          "@type": "Question",
          name: "Bagaimana mekanisme penanganan revisi yang melebihi kesepakatan awal?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Jika kuota revisi gratis telah habis atau terdapat permintaan pekerjaan baru di luar ruang lingkup yang disepakati, Anda dapat menerbitkan Dokumen Tambahan (Addendum) resmi bertarif yang tertaut langsung ke kontrak induk.",
          },
        },
        {
          "@type": "Question",
          name: "Kapan dokumen perjanjian membutuhkan pembubuhan e-Meterai resmi?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Untuk sebagian besar pekerjaan lepas harian, tanda tangan digital kedua pihak sudah memiliki kekuatan hukum yang sah. Namun, sesuai UU No. 10 Tahun 2020 tentang Bea Meterai, dokumen kerja sama dengan nilai transaksi di atas Rp5.000.000 disarankan dibubuhi e-Meterai resmi Peruri yang panduannya telah tersedia di dalam platform.",
          },
        },
        {
          "@type": "Question",
          name: "Apakah platform Sepakatin dapat digunakan secara gratis?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Ya. Anda dapat membuat dan mengelola hingga 2 kesepakatan aktif secara cuma-cuma pada Paket Gratis. Untuk kebutuhan proyek lanjutan, Anda dapat memilih opsi bayar pas per proyek seharga Rp19.000 atau paket Pro bulanan tanpa batas seharga Rp49.000.",
          },
        },
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
          id="cf-turnstile-script"
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          async
          defer
        />
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
