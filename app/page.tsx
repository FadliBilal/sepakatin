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
  QrCode,
  FileCheck,
  FileText,
  CreditCard,
  ShieldAlert,
  Scale,
  Fingerprint,
  FileSignature,
  Clock,
  Check,
} from "lucide-react";
import { PricingCards } from "@/components/PricingCards";
import { HomeHeroCta } from "@/components/home/HomeHeroCta";
import { QuickVerifyForm } from "@/components/home/QuickVerifyForm";

const DEMO_CONTRACT_ID = "SPK-2026-00124";

export default function HomePage() {
  const marqueeItems = [
    {
      category: "Desain Grafis & UI/UX",
      guarantee: "Jatah Revisi Terkunci Sejak Hari Pertama",
    },
    {
      category: "Pembuatan Web & Aplikasi",
      guarantee: "Jadwal DP & Termin Pelunasan Pasti",
    },
    {
      category: "Produksi Foto & Video",
      guarantee: "Ruang Lingkup & Hak Penggunaan Transparan",
    },
    {
      category: "Penulis & Konten Kreator",
      guarantee: "Perjanjian Sah Mengikat KUHPerdata 1320",
    },
    {
      category: "Konsultan & Jasa Profesional",
      guarantee: "Tanda Tangan Digital Sah Tanpa Ribet",
    },
    {
      category: "Klien UMKM & Perusahaan",
      guarantee: "Tanda Tangan Instan Tanpa Wajib Buat Akun",
    },
    {
      category: "Permintaan Kerja Baru",
      guarantee: "Terbitkan Addendum Resmi Berkompensasi",
    },
    {
      category: "Integritas Dokumen",
      guarantee: "Segel Kriptografis SHA-256 & QR Code Publik",
    },
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

  const productSuite = [
    {
      id: "spk",
      name: "Sepakatin SPK",
      badge: "Perjanjian Kerja",
      icon: FileText,
      desc: "Susun kesepakatan tertulis terstruktur dengan rincian luaran kerja, batas revisi, dan termin pembayaran tanpa pasal berbelit.",
      linkText: "Mulai Buat Dokumen SPK",
      href: "/agreements/new",
    },
    {
      id: "sign",
      name: "Sepakatin Sign",
      badge: "Tanda Tangan Digital",
      icon: PenLine,
      desc: "Penandatanganan digital langsung dari layar ponsel atau laptop berlandaskan UU ITE. Klien menandatangani tanpa wajib registrasi akun.",
      linkText: "Pelajari Tanda Tangan Digital",
      href: "#cara-kerja",
    },
    {
      id: "scopelock",
      name: "Sepakatin ScopeLock",
      badge: "Kontrol Revisi",
      icon: ShieldAlert,
      desc: "Kunci batas pekerjaan agar bebas dari revisi liar. Jika klien meminta fitur tambahan di tengah jalan, terbitkan Addendum resmi.",
      linkText: "Pelajari Dokumen Addendum",
      href: "#faq",
    },
    {
      id: "payschedule",
      name: "Sepakatin PaySchedule",
      badge: "Termin Pembayaran",
      icon: CreditCard,
      desc: "Atur jadwal uang muka (DP) sebelum mulai kerja dan batas pelunasan sebelum serah terima berkas dengan tanggal jatuh tempo pasti.",
      linkText: "Lihat Skema Termin",
      href: "#harga",
    },
    {
      id: "verify",
      name: "Sepakatin Verify",
      badge: "Audit Keaslian",
      icon: QrCode,
      desc: "Setiap dokumen memiliki segel hash SHA-256 dan kode QR publik untuk membuktikan keaslian serta memastikan naskah tidak diubah sepihak.",
      linkText: "Coba Cek Keaslian Dokumen",
      href: "/verify",
    },
    {
      id: "meterai",
      name: "Sepakatin e-Meterai",
      badge: "Kepatuhan Pajak",
      icon: Stamp,
      desc: "Panduan dan integrasi pembubuhan meterai elektronik resmi Peruri untuk perjanjian bernilai di atas Rp5.000.000 sesuai UU No. 10/2020.",
      linkText: "Pelajari Aturan e-Meterai",
      href: "#faq",
    },
  ];

  const platformStages = [
    {
      step: "01",
      title: "Inisiasi & Perumusan",
      subtitle: "Susun Rincian Kesepakatan",
      icon: FileSignature,
      desc: "Tentukan ruang lingkup kerja, hasil akhir (deliverables), tanggal jatuh tempo, dan kuota revisi gratis lewat formulir ringkas.",
    },
    {
      step: "02",
      title: "Penelaahan & Konsensus",
      subtitle: "Tanda Tangan Instan",
      icon: Send,
      desc: "Kirimkan tautan review resmi ke klien. Klien menelaah pasal dari peramban dan langsung membubuhkan tanda tangan digital tanpa hambatan akun.",
    },
    {
      step: "03",
      title: "Penguncian Kriptografis",
      subtitle: "Segel Sah KUHPerdata 1320",
      icon: Lock,
      desc: "Saat kedua pihak sepakat, sistem mengunci dokumen secara permanen dengan stempel audit SHA-256, cap waktu ISO 8601, dan alamat IP.",
    },
    {
      step: "04",
      title: "Pengerjaan & Pembuktian",
      subtitle: "Proyek Terlindungi",
      icon: Handshake,
      desc: "Freelancer bekerja dengan kepastian pembayaran, klien menerima hasil sesuai standar, dan dokumen siap diverifikasi lewat QR Code.",
    },
  ];

  const enterpriseCapabilities = [
    {
      icon: Scale,
      title: "Kepatuhan Hukum Perdata Indonesia",
      desc: "Memenuhi seluruh syarat sah perjanjian sesuai Pasal 1320 KUHPerdata dan kekuatan pembuktian dokumen elektronik UU ITE No. 1/2024.",
      points: [
        "Asas kesepakatan bebas para pihak",
        "Kecakapan dan obyek tertentu yang jelas",
        "Klausul sebab yang halal dan mengikat sah",
      ],
    },
    {
      icon: Fingerprint,
      title: "Audit Trail Forensik Menyeluruh",
      desc: "Setiap tindakan persetujuan direkam dengan metadata forensik lengkap untuk menjamin akuntabilitas pembuktian jika terjadi sengketa.",
      points: [
        "Pencatatan alamat IP dan User-Agent peramban",
        "Stempel waktu ISO 8601 presisi",
        "Jejak riwayat peninjauan dokumen",
      ],
    },
    {
      icon: ShieldCheck,
      title: "Integritas Anti-Tampering SHA-256",
      desc: "Naskah perjanjian dilindungi algoritma kriptografi deterministik. Perubahan sekecil Rp1 atau satu karakter langsung membatalkan validitas berkas.",
      points: [
        "Karakteristik hash unik per dokumen",
        "Deteksi instan terhadap manipulasi naskah",
        "Verifikasi keaslian mandiri via QR Code",
      ],
    },
    {
      icon: Clock,
      title: "Perlindungan Privasi & Keamanan Akses",
      desc: "Dirancang sesuai prinsip UU Perlindungan Data Pribadi (UU PDP) dengan pengamanan bot Cloudflare Turnstile dan pembatasan laju akses.",
      points: [
        "Nomor rekening privat tidak terekspos publik",
        "Distributed rate limiting anti-brute force",
        "Koneksi aman terenkripsi TLS 1.3",
      ],
    },
  ];

  const customerStories = [
    {
      quote:
        "Sebelum pakai Sepakatin, proyek pembuatan website saya sering molor berbulan-bulan karena klien terus menambah halaman tanpa bayaran. Sekarang, deliverables dan kuota revisi terkunci sejak awal. Pembayaran DP dan pelunasan jadi tertib.",
      author: "Aditya Pratama",
      role: "Lead Full-stack Developer",
      meta: "Spesialis Aplikasi Web UMKM",
    },
    {
      quote:
        "Klien agensi saya sangat menghargai profesionalisme surat perjanjian Sepakatin. Mereka tidak perlu repot daftar akun, cukup buka link di HP, baca poin-poinnya, lalu tanda tangan langsung. Kesepakatan selesai dalam 5 menit.",
      author: "Rania Wardani",
      role: "UI/UX & Brand Designer",
      meta: "Studio Kreatif Mandiri",
    },
    {
      quote:
        "Di industri video komersial, revisi warna dan pergantian adegan bisa makan biaya besar. Fitur Dokumen Tambahan (Addendum) Sepakatin menyelamatkan margin proyek saya saat klien meminta perubahan konsep di tengah pengerjaan.",
      author: "Farhan Mahendra",
      role: "Commercial Videographer",
      meta: "Produksi Konten Brand",
    },
  ];

  const faqs = [
    {
      q: "Apakah surat perjanjian di Sepakatin sah secara hukum?",
      a: "Ya, sah mengikat. Berdasarkan Pasal 1320 KUHPerdata dan UU ITE No. 1/2024, kesepakatan tertulis yang disetujui bersama secara elektronik memiliki kekuatan hukum yang sah dan mengikat para pihak di Indonesia.",
    },
    {
      q: "Apakah klien saya wajib membuat akun untuk tanda tangan?",
      a: "Tidak perlu. Klien cukup membuka tautan review resmi yang Anda kirimkan lewat peramban di ponsel atau komputer, membaca rinciannya, dan langsung membubuhkan tanda tangan digital secara instan.",
    },
    {
      q: "Bagaimana jika klien meminta revisi melebihi jatah yang disepakati?",
      a: "Jika jatah revisi gratis telah habis atau klien meminta pekerjaan di luar ruang lingkup awal, Anda dapat menerbitkan Dokumen Tambahan (Addendum) resmi yang tertaut ke dokumen induk lengkap dengan penyesuaian biaya.",
    },
    {
      q: "Kapan dokumen memerlukan pembubuhan e-Meterai resmi?",
      a: "Berdasarkan UU No. 10 Tahun 2020 tentang Bea Meterai, dokumen perjanjian perdata bernilai nominal di atas Rp5.000.000 disarankan dibubuhi e-Meterai Peruri agar memenuhi ketentuan perpajakan sebagai alat bukti perdata di pengadilan.",
    },
    {
      q: "Apakah Sepakatin bisa digunakan secara gratis?",
      a: "Ya. Paket Gratis Sepakatin dapat digunakan hingga 2 kesepakatan aktif. Anda dapat meng-upgrade kapan saja per proyek seharga Rp19.000 atau paket Pro bulanan Rp49.000 untuk kesepakatan tanpa batas.",
    },
  ];

  return (
    <div className="w-full bg-[#F8FAFC] text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* 1. Hero Section (Dipertahankan sesuai gaya kesukaan pengguna) */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl -z-10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-8 right-1/4 w-[500px] h-[500px] bg-orange-500/15 rounded-full blur-3xl -z-10"
        />

        <div className="container-page pt-10 sm:pt-14 pb-4 sm:pb-6 max-w-5xl mx-auto text-center flex flex-col items-center">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-orange-600 mb-3">
            Surat Perjanjian Kerja Praktis untuk Freelancer & Klien
          </p>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.16] mb-4 max-w-4xl">
            Clear Agreement, Great Collaboration.{" "}
            <span className="text-orange-600">
              Kerja Sama Pasti & Terlindungi.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-6 max-w-2xl mx-auto">
            Kunci rincian kerja, jatah revisi, dan tanggal pelunasan sebelum proyek dimulai. Cukup kirim satu tautan resmi, klien tanda tangan instan dari ponsel tanpa wajib daftar akun.
          </p>

          <div className="w-full flex justify-center mb-6">
            <HomeHeroCta />
          </div>

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

        {/* Busur lengkung dan gradasi oranye */}
        <div
          aria-hidden="true"
          className="relative w-full overflow-hidden pointer-events-none flex justify-center -mb-px z-0"
        >
          <svg
            viewBox="0 0 1440 220"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto min-w-[1100px] max-w-[2000px] -mt-10 sm:-mt-16 md:-mt-20"
          >
            <defs>
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

              <linearGradient id="heroOrangeAestheticStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F97316" stopOpacity="0" />
                <stop offset="15%" stopColor="#FB923C" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#EA580C" stopOpacity="0.95" />
                <stop offset="85%" stopColor="#FB923C" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
              </linearGradient>

              <filter id="heroAestheticBlur" x="-30%" y="-50%" width="160%" height="200%">
                <feGaussianBlur stdDeviation="30" />
              </filter>

              <filter id="heroArcBloom" x="-20%" y="-100%" width="140%" height="300%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <ellipse
              cx="720"
              cy="220"
              rx="760"
              ry="170"
              fill="url(#heroOrangeAestheticGlow)"
              filter="url(#heroAestheticBlur)"
            />

            <path
              d="M -160,220 Q 720,20 1600,220"
              stroke="url(#heroOrangeAestheticStroke)"
              strokeWidth="2.5"
              opacity="0.5"
              fill="none"
              filter="url(#heroArcBloom)"
            />
            <path
              d="M -160,220 Q 720,20 1600,220"
              stroke="url(#heroOrangeAestheticStroke)"
              strokeWidth="1.5"
              fill="none"
            />
          </svg>
        </div>

        {/* 2. Marquee Proteksi Terstruktur (Mudah dipahami) */}
        <div className="w-full overflow-hidden py-3 bg-slate-50 border-y border-slate-200/80 relative z-10">
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-white via-white/80 to-transparent z-20 pointer-events-none"
          />
          <div
            aria-hidden="true"
            className="absolute inset-y-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-white via-white/80 to-transparent z-20 pointer-events-none"
          />

          <div className="relative w-full overflow-hidden flex items-center">
            <div className="animate-marquee flex items-center gap-4 whitespace-nowrap">
              {[...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs shadow-2xs hover:border-slate-300 transition-colors"
                >
                  <span className="font-bold text-slate-900 tracking-tight">
                    {item.category}:
                  </span>
                  <span className="font-medium text-slate-600">
                    {item.guarantee}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 select-none ml-1 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Kolaborasi Resmi & 4 Pilar Metrik */}
      <section className="border-b border-slate-200 bg-white py-12 sm:py-14">
        <div className="container-page">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            <div className="lg:col-span-7 text-center lg:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
                Kolaborasi Resmi
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tracking-tight mt-1">
                Didukung oleh Ekosistem Inovasi Digital
              </h2>
              <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Sepakatin lahir dari program inkubasi inovasi digital nasional untuk menciptakan ekosistem kerja lepas yang lebih aman dan terpercaya.
              </p>
            </div>

            <div className="lg:col-span-5 flex flex-wrap items-center justify-center lg:justify-end gap-3 sm:gap-4">
              <div className="flex items-center justify-center px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-slate-300 transition-all duration-200">
                <Image
                  src="/garuda-spark.png"
                  alt="Garuda Spark Innovation Hub by KOMDIGI"
                  width={170}
                  height={44}
                  className="h-8 sm:h-9 w-auto object-contain max-w-[190px] select-none"
                />
              </div>

              <div className="flex items-center gap-3 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-slate-300 transition-all duration-200">
                <Image
                  src="/ngalup.png"
                  alt="Ngalup.co Collaborative Hub"
                  width={48}
                  height={48}
                  className="w-8 h-8 sm:w-9 sm:h-9 object-contain rounded-full select-none"
                />
                <div className="text-left">
                  <span className="block text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                    Ngalup.co
                  </span>
                  <span className="block text-[11px] font-medium text-slate-500">
                    Collaborative Hub
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-8 sm:mt-10 pt-8 sm:pt-10 border-t border-slate-100">
            <div className="group p-4 sm:p-5 rounded-xl bg-slate-50/60 border border-slate-200/70 hover:bg-white hover:border-slate-300 hover:shadow-xs transition-all duration-200 text-center sm:text-left">
              <p className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tracking-tight group-hover:text-orange-600 transition-colors">
                100%
              </p>
              <p className="text-xs sm:text-sm font-bold text-slate-800 mt-1.5">
                Sah Mengikat
              </p>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-relaxed">
                Sesuai hukum perdata Indonesia
              </p>
            </div>

            <div className="group p-4 sm:p-5 rounded-xl bg-slate-50/60 border border-slate-200/70 hover:bg-white hover:border-slate-300 hover:shadow-xs transition-all duration-200 text-center sm:text-left">
              <p className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tracking-tight group-hover:text-orange-600 transition-colors">
                Bebas
              </p>
              <p className="text-xs sm:text-sm font-bold text-slate-800 mt-1.5">
                Revisi Liar
              </p>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-relaxed">
                Jatah revisi dipatok sejak awal
              </p>
            </div>

            <div className="group p-4 sm:p-5 rounded-xl bg-slate-50/60 border border-slate-200/70 hover:bg-white hover:border-slate-300 hover:shadow-xs transition-all duration-200 text-center sm:text-left">
              <p className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tracking-tight group-hover:text-orange-600 transition-colors">
                Tepat
              </p>
              <p className="text-xs sm:text-sm font-bold text-slate-800 mt-1.5">
                Waktu Bayar
              </p>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-relaxed">
                Jadwal DP & pelunasan tercatat pasti
              </p>
            </div>

            <div className="group p-4 sm:p-5 rounded-xl bg-slate-50/60 border border-slate-200/70 hover:bg-white hover:border-slate-300 hover:shadow-xs transition-all duration-200 text-center sm:text-left">
              <p className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tracking-tight group-hover:text-orange-600 transition-colors">
                Anti-Ubah
              </p>
              <p className="text-xs sm:text-sm font-bold text-slate-800 mt-1.5">
                Terkunci Resmi
              </p>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-relaxed">
                Tidak bisa diedit sepihak
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Product Showcase (Inspirasi Mekari: Daftar Produk Bersih & Tipografis Tanpa Preview Mockup) */}
      <section id="produk" className="border-b border-slate-200 bg-[#F8FAFC] py-16 sm:py-20 scroll-mt-16">
        <div className="container-page">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs uppercase tracking-wider font-bold text-blue-600">
              Solusi Ekosistem Sepakatin
            </span>
            <h2 className="section-title text-2xl sm:text-3xl lg:text-4xl mt-2 text-slate-900">
              Rangkaian Solusi untuk Setiap Tahap Kerja Sama Proyek
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2.5 leading-relaxed">
              Mulai dari perumusan kontrak kerja tertulis, tanda tangan digital sah, penguncian kuota revisi, hingga audit keaslian publik dalam satu arsitektur SaaS yang rapi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productSuite.map((product) => {
              const Icon = product.icon;
              return (
                <div
                  key={product.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 flex flex-col justify-between hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                        {product.badge}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold font-display text-slate-900 mb-2">
                      {product.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                      {product.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <Link
                      href={product.href}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors group"
                    >
                      <span>{product.linkText}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Integrated Platform (Diagram Konseptual Siklus Kerja Sama Terpadu) */}
      <section id="cara-kerja" className="border-b border-slate-200 bg-white py-16 sm:py-20 scroll-mt-16">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs uppercase tracking-wider font-bold text-orange-600">
              Platform Terpadu
            </span>
            <h2 className="section-title text-2xl sm:text-3xl lg:text-4xl mt-2 text-slate-900">
              Satu Alur Kerja Berkelanjutan Tanpa Celah
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2.5">
              Hubungan logis dari setiap modul Sepakatin bekerja bersama untuk melindungi hak kedua belah pihak secara otomatis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {platformStages.map((stage) => {
              const StepIcon = stage.icon;
              return (
                <div
                  key={stage.step}
                  className="relative rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 flex flex-col justify-between hover:border-slate-300 hover:shadow-xs transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono text-sm font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        Tahap {stage.step}
                      </span>
                      <div className="w-9 h-9 rounded-lg bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center">
                        <StepIcon className="w-4 h-4" />
                      </div>
                    </div>

                    <h3 className="text-base font-bold font-display text-slate-900">
                      {stage.title}
                    </h3>
                    <p className="text-xs font-semibold text-orange-600 mt-0.5 mb-2.5">
                      {stage.subtitle}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {stage.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. Enterprise Solutions (Keandalan Standar Korporasi, Audit & Kepatuhan Hukum) */}
      <section className="border-b border-slate-200 bg-[#F8FAFC] py-16 sm:py-20">
        <div className="container-page">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs uppercase tracking-wider font-bold text-blue-600">
              Standar Keamanan & Legalitas
            </span>
            <h2 className="section-title text-2xl sm:text-3xl lg:text-4xl mt-2 text-slate-900">
              Fondasi Hukum Kuat dan Keamanan Berstandar Enterprise
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2.5 leading-relaxed">
              Sepakatin dirancang untuk memenuhi standar pembuktian hukum perdata Indonesia, perlindungan privasi data, dan keamanan kriptografis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {enterpriseCapabilities.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold font-display text-slate-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                      {item.desc}
                    </p>
                  </div>

                  <ul className="space-y-2 border-t border-slate-100 pt-4">
                    {item.points.map((pt, pIdx) => (
                      <li key={pIdx} className="flex items-center gap-2 text-xs text-slate-700">
                        <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. Key Benefits (Variasi Layout Alami: Tidak Semua Kartu Seragam) */}
      <section className="border-b border-slate-200 bg-white py-16 sm:py-20">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-wider font-bold text-orange-600">
              Nilai Manfaat Utama
            </span>
            <h2 className="section-title text-2xl sm:text-3xl lg:text-4xl mt-2 text-slate-900">
              Perlindungan Kerja Nyata untuk Freelancer & Klien
            </h2>
          </div>

          {/* Asymmetrical Layout: Highlight Banner di atas, 2 Kolom Komplementer di bawah */}
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Banner Utama: Hentikan Scope Creep */}
            <div className="rounded-2xl border-2 border-blue-600/30 bg-gradient-to-r from-blue-50/60 via-white to-blue-50/30 p-7 sm:p-9 shadow-xs">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-8">
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                    Fokus Solusi Utama
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold font-display text-slate-900 mt-1 mb-2.5">
                    Hentikan Budaya Revisi Liar dan Tugas Tambahan Tanpa Bayaran
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Masalah nomor satu pekerja lepas di Indonesia adalah ruang lingkup yang terus melebar (scope creep) tanpa penyesuaian biaya. Sepakatin mengunci kuota revisi gratis sejak awal. Ketika klien meminta fitur atau halaman baru, Anda memiliki dasar dokumen resmi untuk menerbitkan Dokumen Tambahan (Addendum) secara profesional.
                  </p>
                </div>
                <div className="lg:col-span-4 flex flex-col gap-2.5 bg-white p-5 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Jatah revisi dipatok jelas di awal</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Addendum resmi jika tugas meluas</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Dokumen terkunci tanpa manipulasi</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2 Kolom Asimetris: Sisi Finansial vs Sisi Hubungan Kerja */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-7">
                <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center mb-4">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold font-display text-slate-900 mb-2">
                  Kepastian Finansial: Uang Muka & Tanggal Pelunasan
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  Hindari situasi mulai bekerja tanpa kepastian pembayaran. Sepakatin memfasilitasi kesepakatan uang muka (DP) di awal dan tanggal jatuh tempo pelunasan sebelum serah terima berkas master final.
                </p>
                <div className="text-xs font-medium text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
                  Transparansi jadwal pembayaran melindungi arus kas Anda dari risiko gagal bayar.
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-7">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mb-4">
                  <Handshake className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold font-display text-slate-900 mb-2">
                  Kemitraan Profesional Tanpa Hambatan Birokrasi
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  Klien tidak merasa terintimidasi oleh dokumen hukum yang rumit. Tampilan naskah ringkas, mudah dipahami di layar smartphone, dan ditandatangani dalam hitungan detik tanpa mewajibkan klien membuat akun baru.
                </p>
                <div className="text-xs font-medium text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
                  Membangun reputasi kerja sama yang terpercaya sejak pertemuan pertama.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Cek Dokumen Publik Bar */}
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

      {/* 9. Perbandingan Solusi (Konvensional vs Standar Sepakatin) */}
      <section className="border-b border-slate-200 bg-white py-16 sm:py-20">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-wider font-bold text-orange-600">Perbandingan Solusi</span>
            <h2 className="section-title text-2xl sm:text-3xl lg:text-4xl mt-2 text-slate-900">
              Selesaikan Masalah yang Sering Terjadi di Platform Lain
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Bandingkan kesepakatan konvensional yang rawan sengketa dengan perlindungan kerja sama terpadu di Sepakatin.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Box Kiri: Cara Konvensional */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 sm:p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-rose-700 font-bold text-sm mb-4">
                  <XCircle className="w-5 h-5 text-rose-600" />
                  Cara Konvensional & Obrolan Terpisah
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

      {/* 10. Customer Stories (Testimoni Otentik Praktisi Tanpa Screenshot Palsu) */}
      <section className="border-b border-slate-200 bg-[#F8FAFC] py-16 sm:py-20">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-wider font-bold text-blue-600">
              Pengalaman Pengguna
            </span>
            <h2 className="section-title text-2xl sm:text-3xl lg:text-4xl mt-2 text-slate-900">
              Dipercaya Praktisi Lepas & Studio Kreatif
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Bagaimana kejelasan surat kesepakatan membantu menyelesaikan proyek tepat waktu dan aman.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {customerStories.map((story, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 flex flex-col justify-between"
              >
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic mb-6">
                  &ldquo;{story.quote}&rdquo;
                </p>
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-sm font-bold text-slate-900">{story.author}</p>
                  <p className="text-xs font-semibold text-blue-600">{story.role}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{story.meta}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. Pilihan Paket */}
      <section id="harga" className="border-b border-slate-200 bg-white py-16 sm:py-20 scroll-mt-16">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-wider font-bold text-orange-600">
              Pilihan Paket
            </span>
            <h2 className="section-title text-2xl sm:text-3xl lg:text-4xl mt-2 text-slate-900">
              Mulai Gratis. Bayar Pas Sesuai Kebutuhan.
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Gunakan gratis untuk proyek pertama Anda. Upgrade kapan saja dengan pembayaran instan lewat QRIS. Klien Anda selalu gratis.
            </p>
          </div>

          <PricingCards />
        </div>
      </section>

      {/* 12. Tanya Jawab (FAQ) */}
      <section id="faq" className="border-b border-slate-200 bg-[#F8FAFC] py-16 sm:py-20 scroll-mt-16">
        <div className="container-page max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs uppercase tracking-wider font-bold text-blue-600">
              Bantuan & Regulasi
            </span>
            <h2 className="section-title text-2xl sm:text-3xl lg:text-4xl mt-2 text-slate-900">
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="text-sm text-slate-600 mt-1.5">
              Jawaban seputar kekuatan hukum, tanda tangan digital klien, kuota revisi, dan e-meterai.
            </p>
          </div>

          <div className="space-y-3.5">
            {faqs.map((faq, idx) => (
              <div key={idx} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
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

      {/* 13. Banner Penutup Enterprise */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white py-16 sm:py-20">
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
