import React from "react";
import Link from "next/link";
import { FileQuestion, Home, ShieldCheck, LayoutDashboard } from "lucide-react";

export const metadata = {
  title: "Halaman Tidak Ditemukan",
};

/**
 * Halaman 404.
 *
 * Salah satu cara paling umum orang sampai ke sini adalah salah mengetik nomor
 * dokumen saat memindai QR pada surat perjanjian (karena itu jalan pintas ke
 * halaman cek keaslian ditampilkan menonjol, bukan sekadar tombol "kembali".
 */
export default function NotFound() {
  return (
    <div className="w-full max-w-xl mx-auto px-4 sm:px-6 py-20">
      <div className="text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
          <FileQuestion className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-brand-600">Kesalahan 404</p>
          <h1 className="page-title">Halaman tidak ditemukan</h1>
          <p className="text-slate-600 leading-relaxed">
            Alamat yang Anda buka tidak ada, sudah dipindahkan, atau tautannya salah ketik.
          </p>
        </div>
      </div>

      <div className="card p-6 mt-8 space-y-4">
        <div className="space-y-1">
          <h2 className="card-title">Mencari dokumen kesepakatan?</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Jika Anda memindai kode QR pada surat perjanjian, periksa kembali penulisan nomor
            dokumennya, lalu cek keasliannya di sini.
          </p>
        </div>
        <Link href="/verify" className="btn btn-primary w-full">
          <ShieldCheck className="w-4 h-4" />
          Cek Keaslian Dokumen
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        <Link href="/" className="btn btn-secondary">
          <Home className="w-4 h-4" />
          Ke Beranda
        </Link>
        <Link href="/dashboard" className="btn btn-secondary">
          <LayoutDashboard className="w-4 h-4" />
          Kesepakatan Saya
        </Link>
      </div>
    </div>
  );
}
