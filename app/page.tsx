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
import { FaqAccordion } from "@/components/home/FaqAccordion";

const DEMO_CONTRACT_ID = "SPK-2026-00124";

export default function HomePage() {
  const marqueeItems = [
    { icon: "✍️", text: "Tanda Tangan Digital Sah Tanpa Registrasi Akun" },
    { icon: "🔒", text: "Kuota Revisi Terikat Transparan di Awal" },
    { icon: "💳", text: "Kepastian Jadwal Uang Muka & Pelunasan" },
    { icon: "⚖️", text: "Berkekuatan Hukum KUHPerdata & UU ITE" },
    { icon: "📄", text: "Format PDF Resmi dengan Kode QR Publik" },
    { icon: "🛡️", text: "Penguncian Dokumen Otomatis Bebas Manipulasi" },
    { icon: "⏱️", text: "Pembuatan Dokumen Praktis dalam 3 Menit" },
    { icon: "🤝", text: "Standar Kerja Sama Profesional Klien & Mitra" },
  ];

  const oldWays = [
    {
      title: "Ruang Lingkup Tercecer",
      desc: "Rincian tugas tersebar di berbagai chat tanpa dokumen resmi, memicu perselisihan saat proyek berjalan.",
    },
    {
      title: "Revisi Tanpa Batas",
      desc: "Ketiadaan batas revisi tertulis membuat pekerjaan bertambah di luar kompensasi yang disepakati.",
    },
    {
      title: "Ketidakpastian Jadwal Bayar",
      desc: "Uang muka dan tanggal pelunasan kerap tertunda akibat ketiadaan tanggal jatuh tempo yang tegas.",
    },
    {
      title: "Dokumen Rentan Disengketakan",
      desc: "Tanpa tanda tangan sah dan segel pengunci resmi, kesepakatan mudah dibantah saat timbul masalah.",
    },
  ];

  const newWays = [
    {
      title: "Ruang Lingkup Kerja Terstruktur",
      desc: "Daftar hasil kerja (deliverables) dan batasan tanggung jawab tercantum jelas dalam satu tautan resmi.",
    },
    {
      title: "Batas Revisi & Addendum Resmi",
      desc: "Jatah revisi disepakati sejak awal. Permintaan pekerjaan baru diproses melalui dokumen tambahan bertarif.",
    },
    {
      title: "Transparansi Jadwal Pembayaran",
      desc: "Besaran uang muka (DP) dan termin pelunasan memiliki tanggal jatuh tempo yang disetujui bersama.",
    },
    {
      title: "Tanda Tangan Sah & Terkunci Permanen",
      desc: "Kedua pihak menandatangani langsung secara digital. Dokumen terkunci otomatis dengan kode QR resmi.",
    },
  ];

  const productSuite = [
    {
      id: "spk",
      name: "Surat Perjanjian Kerja (SPK)",
      badge: "Kontrak Digital",
      icon: FileText,
      desc: "Susun dokumen kesepakatan profesional lengkap dengan luaran kerja, batas revisi, dan termin pembayaran melalui formulir terpandu.",
      linkText: "Mulai Buat Dokumen SPK",
      href: "/agreements/new",
    },
    {
      id: "sign",
      name: "Tanda Tangan Digital",
      badge: "Kemudahan Akses",
      icon: PenLine,
      desc: "Tanda tangani dokumen langsung dari smartphone atau komputer. Klien memberikan persetujuan tanpa kewajiban registrasi akun.",
      linkText: "Pelajari Alur Penandatanganan",
      href: "#cara-kerja",
    },
    {
      id: "scopelock",
      name: "Manajemen Batas Revisi",
      badge: "Proteksi Lingkup Kerja",
      icon: ShieldAlert,
      desc: "Kendalikan batas pengerjaan secara transparan. Bila timbul kebutuhan baru, terbitkan Dokumen Tambahan (Addendum) resmi secara instan.",
      linkText: "Pelajari Dokumen Tambahan",
      href: "#faq",
    },
    {
      id: "payschedule",
      name: "Penjadwalan Pembayaran",
      badge: "Kepastian Finansial",
      icon: CreditCard,
      desc: "Kelola pembagian uang muka (DP) dan batas pelunasan akhir dengan tanggal jatuh tempo yang disepakati kedua belah pihak.",
      linkText: "Lihat Skema Pembayaran",
      href: "#harga",
    },
    {
      id: "verify",
      name: "Verifikasi Keaslian QR Code",
      badge: "Integritas Dokumen",
      icon: QrCode,
      desc: "Setiap dokumen dilengkapi kode QR publik untuk memvalidasi keaslian naskah serta memastikan dokumen tidak diubah sepihak.",
      linkText: "Cek Keaslian Dokumen",
      href: "/verify",
    },
    {
      id: "meterai",
      name: "Kepatuhan e-Meterai",
      badge: "Standar Regulasi",
      icon: Stamp,
      desc: "Panduan terintegrasi pembubuhan meterai elektronik resmi Peruri untuk nilai kontrak di atas Rp5.000.000 sesuai regulasi bea meterai.",
      linkText: "Pelajari Regulasi e-Meterai",
      href: "#faq",
    },
  ];

  const workflowSteps = [
    {
      step: "01",
      title: "Rumuskan Kesepakatan",
      subtitle: "Proses Cepat 3 Menit",
      icon: FileSignature,
      desc: "Tentukan rincian luaran kerja, nominal biaya, persentase uang muka (DP), dan kuota revisi gratis yang disepakati.",
    },
    {
      step: "02",
      title: "Kirim Tautan Resmi ke Klien",
      subtitle: "Akses Instan dari Ponsel",
      icon: Send,
      desc: "Bagikan tautan resmi ke klien melalui WhatsApp atau email. Klien meninjau dan menandatangani langsung tanpa hambatan akun.",
    },
    {
      step: "03",
      title: "Terkunci & Sah Mengikat",
      subtitle: "Kerja Sama Aman",
      icon: Lock,
      desc: "Dokumen resmi ber-QR Code terkunci permanen. Kedua pihak mengantongi salinan sah dan proyek siap dimulai dengan tenang.",
    },
  ];

  const enterpriseCapabilities = [
    {
      icon: Scale,
      title: "Kekuatan Hukum Sah Indonesia",
      desc: "Memenuhi keabsahan perjanjian perdata sesuai Pasal 1320 KUHPerdata dan diakui sebagai alat bukti elektronik sah berlandaskan UU ITE.",
      points: [
        "Asas konsensus kesepakatan kedua belah pihak",
        "Rincian luaran kerja yang jelas dan terukur",
        "Kekuatan hukum mengikat para pihak di Indonesia",
      ],
    },
    {
      icon: Fingerprint,
      title: "Pencatatan Audit Waktu Resmi",
      desc: "Setiap penandatanganan mencatat tanggal, jam, dan jejak persetujuan secara presisi untuk menjamin akuntabilitas pembuktian.",
      points: [
        "Cap tanggal dan waktu penandatanganan resmi",
        "Riwayat persetujuan dokumen transparan",
        "Bukti pembuktian kuat untuk mencegah sengketa",
      ],
    },
    {
      icon: ShieldCheck,
      title: "Penguncian Dokumen Otomatis",
      desc: "Begitu kedua belah pihak membubuhkan tanda tangan, isi surat perjanjian terkunci permanen untuk mencegah perubahan sepihak.",
      points: [
        "Segel dokumen otomatis pasca-penandatanganan",
        "Perlindungan menyeluruh terhadap manipulasi naskah",
        "Pembuktian keaslian mandiri melalui kode QR",
      ],
    },
    {
      icon: Clock,
      title: "Perlindungan Kerahasiaan Data",
      desc: "Informasi sensitif dan nomor rekening disimpan dengan standar keamanan tinggi dan tidak dipublikasikan ke pihak luar.",
      points: [
        "Data nomor rekening privat tetap terlindungi",
        "Pemeriksaan keaslian publik aman dan rahasia",
        "Kepatuhan terhadap prinsip privasi data pribadi",
      ],
    },
  ];

  const customerStories = [
    {
      quote:
        "Sebelum menggunakan Sepakatin, proyek sering mengalami scope creep karena penambahan fitur yang tidak terkendali. Dengan dokumen yang mengunci batasan revisi sejak awal, klien memahami batas pekerjaan dan jadwal pembayaran termin menjadi jauh lebih tertib.",
      author: "Aditya Pratama",
      role: "Lead Web Developer",
      meta: "Studio Digital Mandiri",
    },
    {
      quote:
        "Klien korporat maupun UMKM sangat menyukai kemudahan Sepakatin. Mereka tidak perlu melalui birokrasi registrasi akun, cukup membuka tautan resmi dari ponsel dan menandatangani dokumen dalam beberapa menit.",
      author: "Rania Wardani",
      role: "Brand & Visual Designer",
      meta: "Praktisi Desain Grafis",
    },
    {
      quote:
        "Di industri produksi video, penyesuaian adegan pascaproduksi memerlukan biaya operasional nyata. Sepakatin memberi kami perlindungan hukum yang jelas untuk menetapkan batasan revisi dan jadwal pelunasan sebelum berkas akhir diserahkan.",
      author: "Farhan Mahendra",
      role: "Commercial Videographer",
      meta: "Produksi Konten Kreatif",
    },
  ];

  const faqs = [
    {
      q: "Apakah surat perjanjian kerja di Sepakatin sah secara hukum di Indonesia?",
      a: "Ya, sah dan berkekuatan hukum mengikat. Berdasarkan Pasal 1320 Kitab Undang-Undang Hukum Perdata (KUHPerdata) dan Undang-Undang ITE, kesepakatan tertulis yang disetujui bersama secara elektronik diakui secara sah sebagai alat bukti hukum yang mengikat kedua belah pihak.",
    },
    {
      q: "Apakah klien wajib membuat akun untuk menandatangani dokumen?",
      a: "Tidak perlu. Klien dapat langsung membuka tautan resmi yang Anda kirimkan melalui peramban ponsel maupun komputer, meninjau seluruh poin kesepakatan, dan membubuhkan tanda tangan digital secara instan.",
    },
    {
      q: "Bagaimana mekanisme penanganan revisi yang melebihi kesepakatan awal?",
      a: "Jika kuota revisi gratis telah habis atau terdapat permintaan pekerjaan baru di luar ruang lingkup yang disepakati, Anda dapat menerbitkan Dokumen Tambahan (Addendum) resmi bertarif yang tertaut langsung ke kontrak induk.",
    },
    {
      q: "Kapan dokumen perjanjian membutuhkan pembubuhan e-Meterai resmi?",
      a: "Untuk sebagian besar pekerjaan lepas harian, tanda tangan digital kedua pihak sudah memiliki kekuatan hukum yang sah. Namun, sesuai Undang-Undang No. 10 Tahun 2020 tentang Bea Meterai, dokumen kerja sama dengan nilai transaksi di atas Rp5.000.000 disarankan dibubuhi e-Meterai resmi Peruri yang panduannya telah tersedia di dalam platform.",
    },
    {
      q: "Apakah platform Sepakatin dapat digunakan secara gratis?",
      a: "Ya. Anda dapat membuat dan mengelola hingga 2 kesepakatan aktif secara cuma-cuma pada Paket Gratis. Untuk kebutuhan proyek lanjutan, Anda dapat memilih opsi bayar pas per proyek seharga Rp19.000 atau paket Pro bulanan tanpa batas seharga Rp49.000.",
    },
  ];

  return (
    <div className="w-full bg-[#F8FAFC] text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* 1. Hero Section (Dipertahankan penuh sesuai gaya yang disukai) */}
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

        {/* 2. Marquee Profesional & Ringkas */}
        <div className="w-full overflow-hidden py-3 bg-slate-50 border-y border-slate-200/80 relative z-10">
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-16 sm:w-28 bg-gradient-to-r from-white via-white/80 to-transparent z-20 pointer-events-none"
          />
          <div
            aria-hidden="true"
            className="absolute inset-y-0 right-0 w-16 sm:w-28 bg-gradient-to-l from-white via-white/80 to-transparent z-20 pointer-events-none"
          />

          <div className="relative w-full overflow-hidden flex items-center">
            <div className="animate-marquee flex items-center gap-3.5 whitespace-nowrap">
              {[...marqueeItems, ...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-800 shadow-2xs hover:border-slate-300 transition-colors"
                >
                  <span className="text-sm">{item.icon}</span>
                  <span>{item.text}</span>
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

      {/* 4. Solusi Lengkap Sepakatin (SaaS Profesional & Bahasa Lugas) */}
      <section id="produk" className="border-b border-slate-200 bg-[#F8FAFC] py-14 sm:py-16 scroll-mt-16">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-wider font-bold text-blue-600">
              Solusi Sepakatin
            </span>
            <h2 className="section-title text-2xl sm:text-3xl mt-1 text-slate-900">
              Perlindungan Kerja Sama Proyek dalam Satu Ekosistem
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Platform terpadu untuk memastikan hasil kerja dihargai dan kepastian pembayaran terjamin.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {productSuite.map((product) => {
              const Icon = product.icon;
              return (
                <div
                  key={product.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between hover:border-blue-300 hover:shadow-xs transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                        {product.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-bold font-display text-slate-900 mb-1.5">
                      {product.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
                      {product.desc}
                    </p>
                  </div>

                  <div className="pt-3.5 border-t border-slate-100">
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

      {/* 5. Alur Praktis (3 Langkah Sederhana) */}
      <section id="cara-kerja" className="border-b border-slate-200 bg-white py-14 sm:py-16 scroll-mt-16">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-wider font-bold text-orange-600">
              Alur Kerja Sama
            </span>
            <h2 className="section-title text-2xl sm:text-3xl mt-1 text-slate-900">
              3 Langkah Mudah Menuju Kesepakatan Sah
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Tanpa prosedur rumit. Susun, bagikan, dan tanda tangani dokumen kesepakatan secara instan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {workflowSteps.map((ws) => {
              const StepIcon = ws.icon;
              return (
                <div
                  key={ws.step}
                  className="rounded-2xl border border-slate-200 bg-white p-6 hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-9 h-9 rounded-lg bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center">
                        <StepIcon className="w-4 h-4" />
                      </div>
                      <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        Langkah {ws.step}
                      </span>
                    </div>

                    <h3 className="text-base font-bold font-display text-slate-900">
                      {ws.title}
                    </h3>
                    <p className="text-xs font-semibold text-orange-600 mb-2">
                      {ws.subtitle}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {ws.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. Standar Keamanan & Legalitas Enterprise */}
      <section className="border-b border-slate-200 bg-[#F8FAFC] py-14 sm:py-16">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-wider font-bold text-blue-600">
              Standar Legalitas & Keamanan
            </span>
            <h2 className="section-title text-2xl sm:text-3xl mt-1 text-slate-900">
              Landasan Hukum Sah dan Akuntabel
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Memberikan perlindungan hukum perdata yang mengikat dan memitigasi risiko sengketa proyek.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {enterpriseCapabilities.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mb-3.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-bold font-display text-slate-900 mb-1.5">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                      {item.desc}
                    </p>
                  </div>

                  <ul className="space-y-1.5 border-t border-slate-100 pt-3.5">
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

      {/* 7. Nilai Manfaat Utama (Layout Variatif, Lugas & Profesional) */}
      <section className="border-b border-slate-200 bg-white py-14 sm:py-16">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs uppercase tracking-wider font-bold text-orange-600">
              Manfaat Utama
            </span>
            <h2 className="section-title text-2xl sm:text-3xl mt-1 text-slate-900">
              Kepastian Kerja Sama Tanpa Friksi
            </h2>
          </div>

          <div className="max-w-4xl mx-auto space-y-5">
            {/* Sorotan Utama: Pengendalian Ruang Lingkup */}
            <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-6 sm:p-7">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                Proteksi Ruang Lingkup
              </span>
              <h3 className="text-lg sm:text-xl font-bold font-display text-slate-900 mt-1 mb-2">
                Cegah Pembengkakan Tugas dan Revisi Tanpa Kompensasi
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Tantangan terbesar dalam pekerjaan proyek adalah ruang lingkup yang terus meluas tanpa batas dan tanpa penyesuaian biaya. Sepakatin memastikan batasan pekerjaan dan jatah revisi disepakati sejak hari pertama. Jika klien mengajukan kebutuhan baru di tengah proyek, Anda memiliki landasan profesional untuk menerbitkan Dokumen Tambahan (Addendum) secara tertib dan transparan.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-blue-100">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Batasan revisi tertulis pasti</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Addendum resmi untuk tugas tambahan</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Naskah terkunci otomatis</span>
                </div>
              </div>
            </div>

            {/* 2 Kolom Komplementer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6">
                <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center mb-3">
                  <CreditCard className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold font-display text-slate-900 mb-1.5">
                  Kepastian Finansial & Arus Kas
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Amankan jadwal uang muka sebelum pengerjaan dimulai, serta tetapkan batas pelunasan sebelum serah terima berkas master final dengan tanggal jatuh tempo yang tegas.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mb-3">
                  <Handshake className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold font-display text-slate-900 mb-1.5">
                  Kolaborasi Profesional Tanpa Friksi
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Format surat ringkas dan nyaman dibaca di layar ponsel. Klien dapat langsung memberikan persetujuan tanpa dibebani proses pendaftaran akun yang memakan waktu.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Cek Dokumen Publik Bar */}
      <section className="border-b border-slate-200 bg-gradient-to-r from-orange-50/20 via-white to-blue-50/20">
        <div className="container-page py-8 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start gap-3.5 max-w-xl">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Verifikasi Dokumen Publik</span>
              <h3 className="card-title text-base sm:text-lg font-display text-slate-900 mt-0.5">
                Cek Keaslian Surat Perjanjian
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5 leading-relaxed">
                Punya nomor dokumen Sepakatin? Masukkan nomor atau scan QR Code untuk memastikan surat perjanjian asli dan sah.
              </p>
            </div>
          </div>

          <QuickVerifyForm demoContractId={DEMO_CONTRACT_ID} />
        </div>
      </section>

      {/* 9. Perbandingan Solusi (Konvensional vs Standar Sepakatin) */}
      <section className="border-b border-slate-200 bg-white py-14 sm:py-16">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs uppercase tracking-wider font-bold text-orange-600">Perbandingan Solusi</span>
            <h2 className="section-title text-2xl sm:text-3xl mt-1 text-slate-900">
              Tinggalkan Pola Kerja Berisiko
            </h2>
            <p className="text-sm text-slate-600 mt-1.5">
              Bandingkan kesepakatan chat tidak terstruktur dengan standar perlindungan profesional di Sepakatin.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {/* Box Kiri: Cara Konvensional */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-rose-700 font-bold text-sm mb-3.5">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  Pola Kesepakatan Informal (Chat)
                </div>
                <ul className="space-y-2.5">
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
              <div className="mt-5 pt-3 border-t border-slate-200 text-xs font-semibold text-rose-700">
                Risiko: Ketidakjelasan hak kerja, sengketa revisi tanpa akhir, dan risiko gagal bayar.
              </div>
            </div>

            {/* Box Kanan: Standar Sepakatin */}
            <div className="rounded-2xl border-2 border-blue-600 bg-white p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-bl-lg tracking-wider">
                Standar Sepakatin
              </div>
              <div>
                <div className="flex items-center gap-2 text-blue-700 font-bold text-sm mb-3.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  Standar Platform Terpadu
                </div>
                <ul className="space-y-2.5">
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
              <div className="mt-5 pt-3 border-t border-slate-100 text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Dampak: Kolaborasi transparan, kepastian ruang lingkup, dan perlindungan pembayaran sah.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Pengalaman Pengguna (Testimoni Kredibel) */}
      <section className="border-b border-slate-200 bg-[#F8FAFC] py-14 sm:py-16">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs uppercase tracking-wider font-bold text-blue-600">
              Kisah Pengguna
            </span>
            <h2 className="section-title text-2xl sm:text-3xl mt-1 text-slate-900">
              Dipercaya oleh Praktisi Profesional & Studio Kreatif
            </h2>
            <p className="text-sm text-slate-600 mt-1.5">
              Pengalaman nyata meningkatkan ketertiban kerja sama dan kepastian pembayaran proyek.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {customerStories.map((story, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 flex flex-col justify-between"
              >
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic mb-5">
                  &ldquo;{story.quote}&rdquo;
                </p>
                <div className="border-t border-slate-100 pt-3.5">
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
      <section id="harga" className="border-b border-slate-200 bg-white py-14 sm:py-16 scroll-mt-16">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs uppercase tracking-wider font-bold text-orange-600">
              Pilihan Paket
            </span>
            <h2 className="section-title text-2xl sm:text-3xl mt-1 text-slate-900">
              Mulai Gratis. Bayar Fleksibel Sesuai Kebutuhan.
            </h2>
            <p className="text-sm text-slate-600 mt-1.5">
              Gunakan kuota gratis untuk proyek pertama Anda. Upgrade kapan saja dengan pembayaran instan QRIS. Klien Anda selalu gratis.
            </p>
          </div>

          <PricingCards />
        </div>
      </section>

      {/* 12. Tanya Jawab (Dropdown Accordion Interaktif) */}
      <section id="faq" className="border-b border-slate-200 bg-[#F8FAFC] py-14 sm:py-16 scroll-mt-16">
        <div className="container-page max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs uppercase tracking-wider font-bold text-blue-600">
              Pusat Informasi & Regulasi
            </span>
            <h2 className="section-title text-2xl sm:text-3xl mt-1 text-slate-900">
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="text-sm text-slate-600 mt-1.5">
              Penjelasan seputar kekuatan hukum, kemudahan tanda tangan klien, batas revisi, dan regulasi e-meterai.
            </p>
          </div>

          <FaqAccordion items={faqs} />
        </div>
      </section>

      {/* 13. Banner Penutup */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white py-14 sm:py-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-orange-500/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -left-20 w-80 h-80 rounded-full bg-blue-500/15 blur-3xl"
        />

        <div className="container-page relative z-10 max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-400/30 text-orange-300 text-xs font-semibold mb-3.5">
            <FileCheck className="w-3.5 h-3.5 text-orange-400" />
            Mulai dalam 3 Menit
          </span>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-display tracking-tight text-white leading-tight mb-2.5">
            Amankan Proyek & Hak Pembayaran Anda Hari Ini
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-7 max-w-md mx-auto">
            Tinggalkan cara kerja lama yang berisiko. Susun surat kesepakatan kerja resmi pertama Anda secara gratis.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/agreements/new"
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm transition-all shadow-[0_4px_16px_rgba(249,115,22,0.4)] flex items-center justify-center gap-2"
            >
              <span>Buat Kesepakatan Gratis</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/verify"
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-slate-500 hover:border-slate-300 text-slate-100 font-semibold text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Verifikasi Dokumen</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
