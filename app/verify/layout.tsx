import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cek Keaslian Dokumen Kesepakatan",
  description:
    "Verifikasi nomor dokumen dan kode QR surat kesepakatan kerja Sepakatin. Pastikan status persetujuan kedua pihak dan keutuhan isi dokumen secara transparan.",
  alternates: {
    canonical: "/verify",
  },
  openGraph: {
    title: "Cek Keaslian Dokumen Kesepakatan | Sepakatin",
    description:
      "Verifikasi nomor dokumen dan kode QR surat kesepakatan kerja Sepakatin. Pastikan status persetujuan kedua pihak dan keutuhan isi dokumen secara transparan.",
    url: "https://sepakatin.id/verify",
  },
};

export default function VerifyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
