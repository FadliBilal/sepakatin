import React from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
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

        <div className="rounded-xl border border-slate-200 bg-white p-4 mb-8">
          <p className="text-xs text-slate-500 leading-relaxed">
            <strong className="text-slate-700">Catatan:</strong> Sepakatin adalah platform pencatatan kesepakatan kerja online, bukan kantor atau penasihat hukum. Dokumen yang disetujui terlindungi dari perubahan sepihak.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-400 border-t border-slate-200 pt-6">
          <p>© {new Date().getFullYear()} Sepakatin. Kesepakatan kerja freelancer Indonesia.</p>
          <p>Dibuat dengan ❤ di Indonesia</p>
        </div>
      </div>
    </footer>
  );
}
