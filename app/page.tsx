"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ShieldCheck,
  FileText,
  CheckCircle2,
  XCircle,
  Search,
  PenLine,
  Send,
  Handshake,
  Stamp,
  Printer,
} from "lucide-react";
import { useSession } from "@/lib/auth";
import { PricingCards } from "@/components/PricingCards";

const DEMO_CONTRACT_ID = "SPK-2026-00124";

export default function HomePage() {
  const router = useRouter();
  const { user } = useSession();
  const [quickVerifyId, setQuickVerifyId] = useState("");

  const startHref = user ? "/agreements/new" : "/auth/register";

  const targetRoles = [
    "Pembuat Website & Aplikasi",
    "Desainer Grafis",
    "Desainer UI/UX",
    "Editor Video",
    "Admin Media Sosial",
    "Penulis Konten",
    "Konsultan Pemasaran",
  ];

  const problems = [
    "Rincian pekerjaan tercecer di ratusan chat dan voice note.",
    "Revisi diminta terus-menerus dengan alasan “masih satu paket”.",
    "Pelunasan molor karena tidak ada tanggal bayar yang disepakati.",
    "Saat ada selisih paham, tidak ada bukti tertulis yang kuat.",
  ];

  const solutions = [
    { title: "Satu link, semua jelas", desc: "Pekerjaan, harga, jadwal, dan jatah revisi tertulis rapi dalam satu dokumen." },
    { title: "Disetujui kedua pihak", desc: "Tercatat siapa yang setuju, kapan, dan untuk versi dokumen yang mana." },
    { title: "e-Materai & tanda tangan", desc: "Tempel e-Materai resmi Rp10.000 dan tanda tangan langsung dari HP." },
    { title: "Tidak bisa diubah diam-diam", desc: "Setiap perubahan tersimpan sebagai versi baru. Versi lama tetap bisa dilihat." },
  ];

  const steps = [
    { icon: PenLine, title: "Isi formulir", desc: "Tulis pekerjaan, harga, DP, jatah revisi, dan tenggat waktu." },
    { icon: Send, title: "Kirim ke klien", desc: "Bagikan link lewat WhatsApp. Klien tidak perlu daftar akun." },
    { icon: Handshake, title: "Setujui bersama", desc: "Klien bisa langsung setuju atau minta perubahan dulu." },
    { icon: Stamp, title: "Materai & tanda tangan", desc: "Tempel e-Materai dan tanda tangan kedua pihak." },
    { icon: Printer, title: "Simpan & cetak", desc: "Dokumen terkunci, punya kode QR, dan siap diunduh PDF." },
  ];

  return (
    <div className="w-full bg-white text-slate-900">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-brand-50/60 to-white">
        <div className="container-page pt-16 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.1] mb-6">
              Jangan cuma deal di chat.{" "}
              <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent">
                Tulis kesepakatannya.
              </span>
            </h1>

            <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-xl">
              Ubah obrolan WhatsApp menjadi surat kesepakatan kerja yang rapi: apa yang dikerjakan,
              berapa kali revisi, kapan dibayar, lengkap dengan <strong className="text-slate-900">e-Materai
              dan tanda tangan online</strong>.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href={startHref} className="btn btn-primary btn-lg">
                {user ? "Buat Kesepakatan" : "Coba Gratis Sekarang"}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/agreements/agr_default_001/print" className="btn btn-secondary btn-lg">
                <FileText className="w-5 h-5" />
                Lihat Contoh Dokumen
              </Link>
            </div>
          </div>

          {/* Animasi 3D SepakatIn */}
          <div className="lg:col-span-5 flex justify-center items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/SepakatIn_3D.gif"
              alt="Animasi 3D Sepakatin — Kesepakatan Kerja Aman & Jelas"
              width={512}
              height={512}
              className="w-full max-w-[440px] h-auto object-contain select-none"
              draggable={false}
            />
          </div>
        </div>

        {/* MARQUEE: COCOK UNTUK */}
        <div className="w-full overflow-hidden py-3.5 bg-slate-100 border-y border-slate-200">
          <div className="relative w-full overflow-hidden flex items-center">
            <div className="animate-marquee flex items-center gap-6 whitespace-nowrap">
              {[...targetRoles, ...targetRoles, ...targetRoles, ...targetRoles].map((role, idx) => (
                <div key={idx} className="inline-flex items-center gap-6">
                  <span className="text-sm sm:text-base font-light text-slate-700 tracking-wide">
                    {role}
                  </span>
                  <span className="text-slate-400 select-none text-xs">•</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CEK DOKUMEN */}
      <section className="border-b border-slate-200">
        <div className="container-page py-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="card-title">Cek keaslian dokumen</h3>
              <p className="text-sm text-slate-500 mt-0.5">
                Masukkan nomor dokumen untuk memastikan isinya asli dan sudah disetujui.
              </p>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (quickVerifyId.trim()) router.push(`/verify/${quickVerifyId.trim().toUpperCase()}`);
            }}
            className="flex gap-2 w-full md:w-auto"
          >
            <input
              type="text"
              placeholder={`Contoh: ${DEMO_CONTRACT_ID}`}
              value={quickVerifyId}
              onChange={(e) => setQuickVerifyId(e.target.value)}
              className="input md:w-72 uppercase placeholder:normal-case"
            />
            <button type="submit" className="btn btn-primary">
              <Search className="w-4 h-4" />
              Cek
            </button>
          </form>
        </div>
      </section>

      {/* MASALAH VS SOLUSI */}
      <section className="border-b border-slate-200">
        <div className="container-page py-20">
          <div className="max-w-2xl mb-12">
            <p className="kicker mb-2">Kenapa perlu Sepakatin?</p>
            <h2 className="section-title">Berhenti ribut soal “dulu kan katanya…”</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-7">
              <p className="text-sm font-semibold text-rose-600 mb-5">Kalau cuma lewat chat</p>
              <ul className="space-y-4">
                {problems.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-sm text-slate-600">
                    <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border-2 border-brand-600 bg-white p-7 shadow-sm">
              <p className="text-sm font-semibold text-brand-600 mb-5">Dengan Sepakatin</p>
              <ul className="space-y-4">
                {solutions.map((s) => (
                  <li key={s.title} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-brand-600 flex-shrink-0" />
                    <span className="text-slate-600">
                      <strong className="text-slate-900">{s.title}.</strong> {s.desc}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CARA KERJA */}
      <section id="cara-kerja" className="border-b border-slate-200 scroll-mt-16">
        <div className="container-page py-20">
          <div className="max-w-2xl mb-12">
            <p className="kicker mb-2">Cara kerja</p>
            <h2 className="section-title">5 langkah mudah mengamankan proyek Anda</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {steps.map((step, idx) => (
              <div key={step.title} className="card p-5 hover:border-brand-300 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold text-slate-300">0{idx + 1}</span>
                </div>
                <h4 className="text-sm font-semibold text-slate-900 mb-1.5">{step.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTOH NYATA */}
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="container-page py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="kicker mb-2">Contoh nyata</p>
            <h2 className="section-title mb-4">Website profil perusahaan: Fadli & PT Solusi Digital</h2>
            <p className="text-slate-600 leading-relaxed mb-8">
              Proyek senilai <strong className="text-slate-900">Rp8.000.000</strong> dengan DP 50%, jatah 3 kali
              revisi, dan persetujuan dari kedua pihak. Semua tercatat rapi dan bisa dicek kapan saja.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/agreements/agr_default_001/print" className="btn btn-primary">
                <FileText className="w-4 h-4" />
                Lihat Dokumen
              </Link>
              <Link href={`/verify/${DEMO_CONTRACT_ID}`} className="btn btn-secondary">
                <ShieldCheck className="w-4 h-4" />
                Cek Keaslian
              </Link>
            </div>
          </div>

          <div className="card p-6">
            <dl className="divide-y divide-slate-100 text-sm">
              {[
                ["Nomor dokumen", <span key="id" className="font-semibold text-brand-600">{DEMO_CONTRACT_ID}</span>],
                ["Status", <span key="st" className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Sudah Disepakati</span>],
                ["Versi dokumen", "Versi 1"],
                ["Persetujuan", <span key="ap" className="font-semibold text-emerald-700">2 dari 2 pihak</span>],
                ["e-Materai", "Bisa ditempel di samping tanda tangan"],
              ].map(([k, v], i) => (
                <div key={i} className="flex justify-between items-center gap-4 py-3">
                  <dt className="text-slate-500">{k}</dt>
                  <dd className="font-medium text-slate-900 text-right">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* HARGA */}
      <section id="harga" className="scroll-mt-16">
        <div className="container-page py-20">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="kicker mb-2">Harga</p>
            <h2 className="section-title">Mulai gratis. Klien tidak pernah dikenai biaya.</h2>
            <p className="text-slate-500 mt-3">Pilih paket, lalu hubungi kami lewat WhatsApp untuk aktivasi.</p>
          </div>
          <PricingCards />
        </div>
      </section>
    </div>
  );
}
