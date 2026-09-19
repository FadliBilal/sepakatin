import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contoh Surat Kesepakatan Kerja Freelancer",
  description:
    "Lihat contoh surat kesepakatan kerja freelancer buatan Sepakatin: pekerjaan, harga, DP, jatah revisi, jadwal, hak cipta, tanda tangan, dan kode QR cek keaslian.",
  alternates: { canonical: "/contoh-dokumen" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
