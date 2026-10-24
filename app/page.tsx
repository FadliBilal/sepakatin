import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  PenLine,
  Send,
  Handshake,
  Stamp,
  Lock,
  ArrowRight,
  Sparkles,
  Zap,
  HelpCircle,
  Layers,
  QrCode,
  FileCheck,
} from "lucide-react";
import { PricingCards } from "@/components/PricingCards";
import { HomeHeroCta } from "@/components/home/HomeHeroCta";
import { QuickVerifyForm } from "@/components/home/QuickVerifyForm";

const DEMO_CONTRACT_ID = "SPK-2026-00124";

export default function HomePage() {
  const targetAudiences = [
    "Freelancer & Pekerja Lepas",
    "Proyek Skala Kecil & Sampingan",
    "Klien Individu & Bisnis UMKM",
    "Jasa Desain, Foto & Video",
    "Pembuatan Web & Aplikasi",
    "Kerja Kolaborasi & Proyek Tim",
    "Konten Kreator & Admin Medsos",
    "Pekerjaan Lepas Tanpa PT/CV",
    "Konsultan & Jasa Profesional",
  ];

  const oldWays = [
    {
      title: "Rincian Tugas Tercecer",
      desc: "Kesepakatan tersebar di berbagai ruang obrolan tanpa dokumen resmi, rawan salah paham saat proyek berjalan.",
    },
    {
      title: "Revisi Bertambah Tanpa Batas",
      desc: "Jatah revisi tidak pernah disepakati di awal, pekerjaan terus bertambah tanpa ada kompensasi tambahan.",
    },
    {
      title: "Jadwal Pembayaran Tidak Pasti",
      desc: "Nominal uang muka (DP) dan batas pelunasan sering molor karena tidak ada tanggal jatuh tempo yang tegas.",
    },
    {
      title: "Dokumen Mudah Diubah Sepihak",
      desc: "Tanpa tanda tangan digital sah dan segel pengunci, dokumen rentan dimanipulasi jika timbul masalah.",
    },
  ];

  const newWays = [
    {
      title: "Lingkup Kerja Terkunci Rapi",
      desc: "Daftar hasil kerja (deliverables) dan batasan proyek tertulis jelas dalam satu tautan resmi.",
    },
    {
      title: "Batas Revisi Pasti & Terukur",
      desc: "Jatah revisi gratis disepakati di depan. Permintaan baru dicatat melalui dokumen tambahan (Addendum).",
    },
    {
      title: "Jadwal Pembayaran Disepakati",
      desc: "Nominal DP dan sisa pelunasan memiliki tanggal jatuh tempo yang disetujui kedua belah pihak.",
    },
    {
      title: "Tanda Tangan Digital Sah & Terkunci",
      desc: "Para pihak tanda tangan langsung dari perangkat; dokumen terkunci otomatis dengan QR Code pembuktian.",
    },
  ];

  const workflowSteps = [
    {
      step: "01",
      icon: PenLine,
      title: "Tulis Kesepakatan",
      desc: "Isi nama proyek, hasil kerja, harga, uang muka (DP), dan batas revisi lewat formulir praktis.",
    },
    {
      step: "02",
      icon: Send,
      title: "Kirim Tautan Resmi ke Klien",
      desc: "Kirimkan tautan dokumen langsung ke klien. Klien membaca dan tanda tangan digital secara instan tanpa wajib membuat akun.",
    },
    {
      step: "03",
      icon: Handshake,
      title: "Sah & Terkunci Otomatis",
      desc: "Kedua pihak memiliki bukti surat perjanjian resmi ber-QR Code. Proyek siap dikerjakan dengan aman.",
    },
  ];

  const coreFeatures = [
    {
      icon: Layers,
      title: "Rincian Tugas & Batasan Jelas",
      desc: "Tuliskan luaran kerja dan apa saja yang tidak termasuk untuk mencegah permintaan tugas tambahan tanpa bayaran.",
      tag: "Cegah Kerjaan Tambahan",
    },
    {
      icon: Lock,
      title: "Tanda Tangan Digital Sah",
      desc: "Kedua belah pihak membubuhkan tanda tangan langsung di layar HP atau laptop dengan kekuatan hukum yang sah.",
      tag: "Kekuatan Hukum",
    },
    {
      icon: ShieldCheck,
      title: "Kunci Kuota Revisi",
      desc: "Tentukan jatah revisi sejak awal. Jika klien meminta fitur baru di tengah jalan, terbitkan dokumen tambahan resmi.",
      tag: "Bebas Revisi Liar",
    },
    {
      icon: Zap,
      title: "Jadwal Uang Muka & Pelunasan",
      desc: "Bagi pembayaran menjadi DP di awal dan pelunasan saat selesai dengan tanggal jatuh tempo yang transparan.",
      tag: "Pembayaran Pasti",
    },
    {
      icon: QrCode,
      title: "QR Code Bukti Asli",
      desc: "Setiap surat perjanjian memiliki QR Code yang bisa dipindai untuk membuktikan keaslian dokumen secara instan.",
      tag: "Anti-Pemalsuan",
    },
    {
      icon: Stamp,
      title: "Surat PDF & Opsi e-Meterai",
      desc: "Unduh surat perjanjian dalam format PDF rapi, serta tersedia opsi pembubuhan e-Meterai resmi Peruri jika dibutuhkan.",
      tag: "Format Rapi",
    },
  ];

  const faqs = [
    {
      q: "Apakah surat perjanjian di Sepakatin sah secara hukum?",
      a: "Ya, sah mengikat. Berdasarkan Pasal 1320 KUHPerdata dan UU ITE, kesepakatan tertulis yang disetujui bersama secara elektronik memiliki kekuatan hukum yang sah di Indonesia.",
    },
    {
      q: "Apakah klien saya wajib membuat akun untuk tanda tangan?",
      a: "Tidak perlu. Klien cukup membuka tautan yang Anda kirimkan lewat browser di HP atau laptop, lalu langsung membaca dan menandatanganinya.",
    },
    {
      q: "Bagaimana jika klien minta revisi melebihi jatah yang disepakati?",
      a: "Jika jatah revisi gratis sudah habis atau klien meminta pekerjaan di luar kesepakatan, Anda bisa menerbitkan Dokumen Tambahan (Addendum) resmi dengan tarif tambahan.",
    },
    {
      q: "Apakah Sepakatin bisa digunakan secara gratis?",
      a: "Ya. Paket Gratis Sepakatin dapat digunakan hingga 2 kesepakatan aktif. Anda bisa upgrade kapan saja per proyek atau langganan bulanan saat membutuhkan fitur lengkap.",
    },
  ];

  return (
    <div className="w-full bg-[#F8FAFC] text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* =========================================================================
          HERO SECTION: WARNA ORANYE & BIRU LOGO DENGAN TAMPILAN MODERN
          ========================================================================= */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        {/* Ambient Glow Latar Belakang */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-12 right-1/4 w-96 h-96 bg-orange-500/15 rounded-full blur-3xl -z-10"
        />


        <div className="container-page pt-10 sm:pt-14 pb-4 sm:pb-6 max-w-5xl mx-auto text-center flex flex-col items-center">
          {/* Eyebrow Text (Bukan Bubble) */}
          <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-orange-600 mb-3">
            Surat Perjanjian Kerja Praktis untuk Freelancer & Klien
          </p>

          {/* Heading Utama: Semi-Inggris & General */}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.16] mb-4 max-w-4xl">
            Clear Agreement, Great Collaboration.{" "}
            <span className="text-orange-600">
              Kerja Sama Pasti & Terlindungi.
            </span>
          </h1>

          {/* Subheading Ringkas & General */}
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-6 max-w-2xl mx-auto">
            Susun rincian hasil kerja, kuota revisi, dan jadwal pelunasan dalam hitungan menit. Ditandatangani secara digital oleh kedua pihak sebagai bukti kerja sama resmi yang sah dan mengikat.
          </p>

          {/* CTA Buttons */}
          <div className="w-full flex justify-center mb-6">
            <HomeHeroCta />
          </div>

          {/* Trust Micro-Signals */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Mulai gratis tanpa kartu kredit
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              Sah mengikat di Indonesia
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-orange-600" />
              Klien tanda tangan tanpa wajib buat akun
            </span>
          </div>
        </div>

        {/* Lengkungan Gradasi Oranye Melingkar Estetik & Mulus di Atas Marquee */}
        <div
          aria-hidden="true"
          className="relative w-full overflow-hidden pointer-events-none flex justify-center -mb-px z-0"
        >
          <svg
            viewBox="0 0 1440 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto min-w-[1200px] max-w-[2200px] -mt-12 sm:-mt-18 md:-mt-22"
          >
            <defs>
              {/* Radial Glow Halus & Mulus Bebas Efek Kotak/Patah */}
              <radialGradient
                id="heroOrangeAestheticGlow"
                cx="50%"
                cy="100%"
                r="70%"
                fx="50%"
                fy="100%"
              >
                <stop offset="0%" stopColor="#EA580C" stopOpacity="0.45" />
                <stop offset="35%" stopColor="#F97316" stopOpacity="0.25" />
                <stop offset="70%" stopColor="#FB923C" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
              </radialGradient>

              {/* Garis Busur Horizon Mulus Memudar Natural di Ujung Kiri dan Kanan */}
              <linearGradient id="heroOrangeAestheticStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F97316" stopOpacity="0" />
                <stop offset="25%" stopColor="#FB923C" stopOpacity="0.35" />
                <stop offset="50%" stopColor="#EA580C" stopOpacity="0.8" />
                <stop offset="75%" stopColor="#FB923C" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
              </linearGradient>

              <filter id="heroAestheticBlur" x="-20%" y="-40%" width="140%" height="180%">
                <feGaussianBlur stdDeviation="28" />
              </filter>
            </defs>

            {/* Kubah Cahaya Oranye Ambien Lebar */}
            <ellipse
              cx="720"
              cy="200"
              rx="750"
              ry="160"
              fill="url(#heroOrangeAestheticGlow)"
              filter="url(#heroAestheticBlur)"
            />

            {/* Garis Horizon Melingkar Tipis & Halus (Bukan Kotak) */}
            <path
              d="M -150,200 Q 720,25 1590,200"
              stroke="url(#heroOrangeAestheticStroke)"
              strokeWidth="1.5"
              fill="none"
            />
          </svg>
        </div>

        {/* Marquee Pengguna & Proyek Skala Kecil */}
        <div className="w-full overflow-hidden py-3.5 bg-slate-50 border-y border-slate-200 relative z-10">
          <div className="relative w-full overflow-hidden flex items-center">
            <div className="animate-marquee flex items-center gap-6 whitespace-nowrap">
              {[...targetAudiences, ...targetAudiences, ...targetAudiences, ...targetAudiences].map((item, idx) => (
                <div key={idx} className="inline-flex items-center gap-6">
                  <span className="text-xs sm:text-sm font-semibold text-slate-700 tracking-normal">
                    {item}
                  </span>
                  <span className="text-orange-500 select-none text-xs">•</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          DUKUNGAN EKOSISTEM & 4 KEUNGGULAN UTAMA
          ========================================================================= */}
      <section className="border-b border-slate-200 bg-white py-12">
        <div className="container-page">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 text-center lg:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-600">Kolaborasi Resmi</span>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 tracking-tight mt-1">
                Didukung oleh Ekosistem Inovasi Digital
              </h2>
              <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                Sepakatin lahir dari program inkubasi inovasi digital nasional untuk menciptakan ekosistem kerja lepas yang lebih aman dan terpercaya.
              </p>
            </div>

            <div className="lg:col-span-7 flex flex-wrap items-center justify-center lg:justify-end gap-4">
              <div className="flex items-center justify-center px-5 py-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:border-orange-300 transition-colors">
                <Image
                  src="/garuda-spark.png"
                  alt="Garuda Spark Innovation Hub by KOMDIGI"
                  width={180}
                  height={50}
                  className="h-10 sm:h-11 w-auto object-contain max-w-[200px] select-none"
                />
              </div>

              <div className="flex items-center gap-3.5 px-5 py-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:border-blue-300 transition-colors">
                <Image
                  src="/ngalup.png"
                  alt="Ngalup.co Collaborative Hub"
                  width={56}
                  height={56}
                  className="w-10 h-10 object-contain rounded-full select-none"
                />
                <div className="text-left">
                  <span className="block text-sm font-bold text-slate-900 tracking-tight">
                    Ngalup.co
                  </span>
                  <span className="block text-xs font-medium text-slate-500">
                    Collaborative Hub
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Pilar Metrik Ramah Pengguna */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 pt-10 border-t border-slate-200">
            <div className="p-4 rounded-xl bg-orange-50/50 border border-orange-100 text-center">
              <p className="text-2xl sm:text-3xl font-extrabold font-display text-orange-600">100%</p>
              <p className="text-xs sm:text-sm font-bold text-slate-800 mt-1">Sah Mengikat</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Sesuai hukum perdata Indonesia</p>
            </div>
            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 text-center">
              <p className="text-2xl sm:text-3xl font-extrabold font-display text-blue-600">Bebas</p>
              <p className="text-xs sm:text-sm font-bold text-slate-800 mt-1">Revisi Liar</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Jatah revisi dipatok sejak awal</p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 text-center">
              <p className="text-2xl sm:text-3xl font-extrabold font-display text-emerald-600">Tepat</p>
              <p className="text-xs sm:text-sm font-bold text-slate-800 mt-1">Waktu Bayar</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Jadwal DP & pelunasan tercatat pasti</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <p className="text-2xl sm:text-3xl font-extrabold font-display text-slate-800">Anti-Ubah</p>
              <p className="text-xs sm:text-sm font-bold text-slate-800 mt-1">Terkunci Resmi</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Tidak bisa diedit sepihak</p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          CEK KEASLIAN DOKUMEN SECTION
          ========================================================================= */}
      <section className="border-b border-slate-200 bg-gradient-to-r from-orange-50/20 via-white to-blue-50/20">
        <div className="container-page py-9 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-3.5 max-w-xl">
            <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Cek Dokumen Publik</span>
              <h3 className="card-title text-base sm:text-lg font-display text-slate-900 mt-0.5">
                Cek Keaslian Surat Perjanjian
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                Punya nomor dokumen Sepakatin? Masukkan nomor atau scan QR Code untuk memastikan surat perjanjian asli dan sah.
              </p>
            </div>
          </div>

          <QuickVerifyForm demoContractId={DEMO_CONTRACT_ID} />
        </div>
      </section>

      {/* =========================================================================
          KOMPARASI: CARA KONVENSIONAL VS STANDAR SEPAKATIN
          ========================================================================= */}
      <section className="border-b border-slate-200 bg-white py-16">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-wider font-bold text-orange-600">Perbandingan Solusi</span>
            <h2 className="section-title text-2xl sm:text-3xl mt-1 text-slate-900">
              Selesaikan Masalah yang Sering Terjadi di Platform Lain
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Bandingkan kesepakatan konvensional yang rawan sengketa dengan perlindungan kerja sama terpadu di Sepakatin.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Box Kiri: Cara Konvensional di Platform Lain */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 sm:p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-rose-700 font-bold text-sm mb-4">
                  <XCircle className="w-5 h-5 text-rose-600" />
                  Cara Konvensional & Platform Terpisah
                </div>
                <ul className="space-y-3">
                  {oldWays.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm">
                      <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        ✕
                      </span>
                      <span className="text-slate-700 leading-relaxed">
                        <strong className="text-slate-900 font-semibold">{item.title}:</strong> {item.desc}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6 pt-3.5 border-t border-slate-200 text-xs font-semibold text-rose-700">
                Masalah: Rawan salah paham, pekerjaan meluas tanpa bayaran, dan pelunasan sering terhambat.
              </div>
            </div>

            {/* Box Kanan: Standar Sepakatin */}
            <div className="rounded-2xl border-2 border-blue-600 bg-white p-6 sm:p-7 shadow-md flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-bl-lg tracking-wider">
                Standar Sepakatin
              </div>
              <div>
                <div className="flex items-center gap-2 text-blue-700 font-bold text-sm mb-4">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  Solusi Terpadu di Sepakatin
                </div>
                <ul className="space-y-3">
                  {newWays.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700 leading-relaxed">
                        <strong className="text-slate-900 font-semibold">{item.title}:</strong> {item.desc}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6 pt-3.5 border-t border-slate-100 text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Hasil: Kerja sama transparan, batasan kerja terlindungi, dan hak pembayaran aman.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FITUR UTAMA: 6 KARTU RINGKAS & GENERAL
          ========================================================================= */}
      <section id="fitur" className="border-b border-slate-200 bg-[#F8FAFC] py-16 scroll-mt-16">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-wider font-bold text-blue-600">Fitur Utama</span>
            <h2 className="section-title text-2xl sm:text-3xl mt-1 text-slate-900">
              Semua yang Anda Butuhkan untuk Kerja Sama Aman
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Fitur sederhana dan praktis untuk melindungi hasil kerja dan hak pembayaran Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {coreFeatures.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="card p-5 sm:p-6 flex flex-col justify-between hover:border-blue-300 hover:shadow-md transition-all bg-white"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold text-orange-700 bg-orange-50 border border-orange-100 px-2.5 py-0.5 rounded-full">
                        {feat.tag}
                      </span>
                    </div>
                    <h3 className="text-base font-bold font-display text-slate-900 mb-1.5">
                      {feat.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          CARA KERJA (3 LANGKAH MUDAH)
          ========================================================================= */}
      <section id="cara-kerja" className="border-b border-slate-200 bg-white py-16 scroll-mt-16">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-wider font-bold text-orange-600">Alur Praktis</span>
            <h2 className="section-title text-2xl sm:text-3xl mt-1 text-slate-900">
              3 Langkah Mudah Menuju Kesepakatan Sah
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Tidak perlu repot membuat surat panjang. Cukup 3 langkah dari ponsel atau laptop Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {workflowSteps.map((ws, idx) => {
              const StepIcon = ws.icon;
              return (
                <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-6 hover:border-blue-300 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center shadow-xs">
                      <StepIcon className="w-5 h-5" />
                    </div>
                    <span className="font-mono text-sm font-extrabold text-blue-600">
                      {ws.step}
                    </span>
                  </div>
                  <h3 className="text-base font-bold font-display text-slate-900 mb-1.5">
                    {ws.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {ws.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          DAFTAR HARGA & PAKET
          ========================================================================= */}
      <section id="harga" className="border-b border-slate-200 bg-[#F8FAFC] py-16 scroll-mt-16">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-wider font-bold text-orange-600">Pilihan Paket</span>
            <h2 className="section-title text-2xl sm:text-3xl mt-1 text-slate-900">
              Mulai Gratis. Bayar Pas Sesuai Kebutuhan.
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Gunakan gratis untuk proyek pertama Anda. Upgrade kapan saja dengan pembayaran instan lewat QRIS. Klien Anda selalu gratis.
            </p>
          </div>

          <PricingCards />
        </div>
      </section>

      {/* =========================================================================
          FAQ (PERTANYAAN UMUM)
          ========================================================================= */}
      <section id="faq" className="border-b border-slate-200 bg-white py-16 scroll-mt-16">
        <div className="container-page max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs uppercase tracking-wider font-bold text-blue-600">Bantuan</span>
            <h2 className="section-title text-2xl sm:text-3xl mt-1 text-slate-900">
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="text-sm text-slate-600 mt-1.5">
              Jawaban seputar legalitas, cara tanda tangan klien, dan penggunaan Sepakatin.
            </p>
          </div>

          <div className="space-y-3.5">
            {faqs.map((faq, idx) => (
              <div key={idx} className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-5">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-start gap-2.5">
                  <HelpCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>{faq.q}</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 ml-7.5 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          FINAL CTA BANNER: KOMBINASI ORANYE & BIRU
          ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white py-16 sm:py-20">
        {/* Glow Orb Oranye & Biru */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-orange-500/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -left-20 w-96 h-96 rounded-full bg-blue-500/15 blur-3xl"
        />

        <div className="container-page relative z-10 max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-400/30 text-orange-300 text-xs font-semibold mb-4">
            <FileCheck className="w-3.5 h-3.5 text-orange-400" />
            Mulai dalam 3 Menit
          </span>

          <h2 className="text-2xl sm:text-4xl font-extrabold font-display tracking-tight text-white leading-tight mb-3">
            Amankan Proyek & Pembayaran Anda Sekarang
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-8 max-w-lg mx-auto">
            Tinggalkan cara lama yang berisiko. Buat surat kesepakatan kerja pertama Anda secara gratis hari ini.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/agreements/new"
              className="w-full sm:w-auto px-7 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm transition-all shadow-[0_4px_16px_rgba(249,115,22,0.4)] flex items-center justify-center gap-2"
            >
              <span>Buat Kesepakatan Gratis</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/verify"
              className="w-full sm:w-auto px-6 py-3 rounded-lg border border-slate-500 hover:border-slate-300 text-slate-100 font-semibold text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Cek Keaslian Dokumen</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
