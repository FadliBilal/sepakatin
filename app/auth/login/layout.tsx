import type { Metadata } from "next";

const siteUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://sepakatin.my.id").replace(/\/+$/, "");

export const metadata: Metadata = {
  title: "Masuk ke Akun",
  description:
    "Masuk ke akun Sepakatin untuk mengelola surat perjanjian kerja (SPK), memantau status persetujuan klien, dan menambah kredit proyek.",
  alternates: {
    canonical: `${siteUrl}/auth/login`,
  },
  openGraph: {
    title: "Masuk ke Akun | Sepakatin",
    description: "Masuk ke akun Sepakatin untuk mengelola surat perjanjian kerja digital Anda.",
    url: `${siteUrl}/auth/login`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
