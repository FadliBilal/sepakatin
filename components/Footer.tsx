import React from "react";
import Link from "next/link";
import { MessageCircle, Heart } from "lucide-react";
import { Logo } from "@/components/Logo";
import { whatsappLink } from "@/lib/contact";

export function Footer() {
  return (
    <footer className="w-full border-t border-[#E8E8EC] bg-white text-[#6B6B6B] no-print">
      <div className="container-page py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <div className="md:col-span-2 space-y-4">
            <Logo showTagline />
            <p className="text-sm leading-relaxed max-w-md">
              Sepakatin membantu freelancer dan klien menuliskan kesepakatan kerja dengan jelas, menyetujuinya lewat tanda tangan digital resmi, dan menyimpannya dengan aman tanpa risiko diubah sepihak.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-[#0A0A0A]">Menu</h4>
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
                <Link href="/#fitur" className="hover:text-brand-600 transition-colors">
                  Fitur Platform
                </Link>
              </li>
              <li>
                <Link href="/#cara-kerja" className="hover:text-brand-600 transition-colors">
                  Cara Kerja
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-brand-600 transition-colors">
                  Tanya Jawab (FAQ)
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-[#0A0A0A]">Hubungi Kami</h4>
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

        <div className="rounded-xl border border-[#E8E8EC] bg-[#FAFAFA] p-5 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <p className="text-xs text-[#6B6B6B] leading-relaxed max-w-xl">
            <strong className="text-[#0A0A0A]">Catatan:</strong> Sepakatin adalah platform pencatatan kesepakatan kerja online, bukan kantor atau penasihat hukum. Dokumen yang disetujui terlindungi dari perubahan sepihak.
          </p>
          <div className="flex items-center gap-3 self-start md:self-auto bg-white border border-[#E8E8EC] px-3.5 py-2 rounded-md">
            <span className="text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider">Supported by:</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/garuda-spark.png" alt="Garuda Spark by KOMDIGI" className="h-6 w-auto object-contain" />
            <div className="w-px h-4 bg-[#E8E8EC]" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/ngalup.png" alt="Ngalup.co" className="h-6 w-6 object-contain rounded-full" />
            <span className="text-[11px] font-bold text-[#0A0A0A]">Ngalup.co</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-[#6B6B6B] border-t border-[#E8E8EC] pt-6">
          <p>© {new Date().getFullYear()} Sepakatin. Kesepakatan kerja freelancer Indonesia.</p>
          <p className="inline-flex items-center gap-1">
            Dibuat dengan <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> di Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
}
