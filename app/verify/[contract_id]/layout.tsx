import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verifikasi Keaslian Dokumen Kesepakatan",
  description: "Status keaslian dan integritas tanda tangan digital dokumen kesepakatan Sepakatin.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function VerifyContractLayout({ children }: { children: React.ReactNode }) {
  return children;
}
