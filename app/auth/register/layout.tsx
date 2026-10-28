import type { Metadata } from "next";

const siteUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://sepakatin.my.id").replace(/\/+$/, "");

export const metadata: Metadata = {
  title: "Daftar Akun Baru",
  description:
    "Daftar akun Sepakatin gratis. Mulai buat surat kesepakatan kerja resmi dengan tanda tangan digital sah dan kuota gratis tanpa kartu kredit.",
  alternates: {
    canonical: `${siteUrl}/auth/register`,
  },
  openGraph: {
    title: "Daftar Akun Baru | Sepakatin",
    description: "Daftar akun Sepakatin gratis. Buat surat perjanjian kerja resmi dan tanda tangan digital sah.",
    url: `${siteUrl}/auth/register`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
