import React from "react";
import Link from "next/link";
import { MessageCircle, Heart } from "lucide-react";
import { Logo } from "@/components/Logo";
import { whatsappLink } from "@/lib/contact";

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-slate-50 text-slate-600 no-print">
      <div className="container-page py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <div className="md:col-span-2 space-y-4">
            <Logo showTagline />
            <p className="text-sm leading-relaxed max-w-md">
              Jangan cuma deal di chat. Sepakatin membantu freelancer dan klien menuliskan
              kesepakatan kerja dengan jelas, menyetujuinya bersama, dan menyimpannya dengan aman.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-900">Menu</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard" className="hover:text-brand-600 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/agreements/new" className="hover:text-brand-600 transition-colors">
                  Buat Kesepakatan
                </Link>
              </li>
              <li>
                <Link href="/verify" className="hover:text-brand-600 transition-colors">
                  Cek Keaslian Dokumen
                </Link>
              </li>
              <li>
                <Link href="/#harga" className="hover:text-brand-600 transition-colors">
                  Harga Paket
                </Link>
              </li>
              <li>
                <Link href="/#tim" className="hover:text-brand-600 transition-colors">
                  Tim Pengembang
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-900">Hubungi Kami</h4>
            <p className="text-sm">Ada pertanyaan soal paket atau cara pakai? Chat kami langsung.</p>
            <a
              href={whatsappLink("Halo Tim Sepakatin, saya mau bertanya.")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp btn-sm"
            >
              <MessageCircle className="w-4 h-4" />
              Kontak Kami
            </a>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
            <strong className="text-slate-700">Catatan:</strong> Sepakatin adalah platform pencatatan kesepakatan kerja online, bukan kantor atau penasihat hukum. Dokumen yang disetujui terlindungi dari perubahan sepihak.
          </p>
          <div className="flex items-center gap-3 self-start md:self-auto bg-slate-50 border border-slate-100 px-3.5 py-2 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Supported by:</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/garuda-spark.png" alt="Garuda Spark by KOMDIGI" className="h-6 w-auto object-contain" />
            <div className="w-px h-4 bg-slate-200" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/ngalup.png" alt="Ngalup.co" className="h-6 w-6 object-contain rounded-full" />
            <span className="text-[11px] font-bold text-slate-700">Ngalup.co</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-400 border-t border-slate-200 pt-6">
          <p>© {new Date().getFullYear()} Sepakatin. Kesepakatan kerja freelancer Indonesia.</p>
          <p className="inline-flex items-center gap-1">
            Dibuat dengan <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> di Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
}
