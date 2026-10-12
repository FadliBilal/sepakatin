"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw, ShieldCheck } from "lucide-react";

/**
 * Halaman saat terjadi kesalahan tak terduga.
 *
 * Tanpa berkas ini, Next.js menampilkan layar bawaan yang di produksi hanya
 * berbunyi "Application error: a client-side exception has occurred" — tidak
 * menjelaskan apa pun dan membuat pengguna mengira dokumennya hilang.
 *
 * Isi pesan galat sengaja tidak ditampilkan karena bisa memuat detail teknis
 * internal; yang ditampilkan hanya `digest`, penanda yang bisa dicocokkan
 * dengan catatan galat di server.
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[sepakatin] kesalahan tak tertangani:", error);
  }, [error]);

  return (
    <div className="w-full max-w-xl mx-auto px-4 sm:px-6 py-20">
      <div className="text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h1 className="page-title">Terjadi kesalahan</h1>
          <p className="text-slate-600 leading-relaxed">
            Halaman ini gagal dimuat. Kesepakatan dan dokumen Anda tetap tersimpan aman —
            tidak ada data yang hilang.
          </p>
        </div>
      </div>

      <div className="card p-6 mt-8 space-y-4">
        <p className="text-sm text-slate-600 leading-relaxed">
          Coba muat ulang halaman ini. Jika kesalahan terus muncul, hubungi kami dan sebutkan
          kode di bawah agar lebih cepat ditelusuri.
        </p>

        {error.digest && (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-xs text-slate-500">Kode kesalahan</p>
            <p className="text-sm font-semibold text-slate-900 break-all">{error.digest}</p>
          </div>
        )}

        <button type="button" onClick={reset} className="btn btn-primary w-full">
          <RefreshCw className="w-4 h-4" />
          Muat Ulang Halaman
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        <Link href="/" className="btn btn-secondary">
          <Home className="w-4 h-4" />
          Ke Beranda
        </Link>
        <Link href="/verify" className="btn btn-secondary">
          <ShieldCheck className="w-4 h-4" />
          Cek Keaslian Dokumen
        </Link>
      </div>
    </div>
  );
}
