import React from "react";
import Image from "next/image";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  PenLine,
  Send,
  Handshake,
  Stamp,
  Printer,
  Users,
} from "lucide-react";
import { PricingCards } from "@/components/PricingCards";
import { HomeHeroCta } from "@/components/home/HomeHeroCta";
import { QuickVerifyForm } from "@/components/home/QuickVerifyForm";

const DEMO_CONTRACT_ID = "SPK-2026-00124";

export default function HomePage() {
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
    "Revisi diminta terus-menerus dengan alasan “masih kurang”.",
    "Pelunasan molor karena tanggal dan termin pembayaran tidak pernah disepakati resmi.",
    "Saat ada selisih paham, tidak ada bukti tertulis yang kuat.",
  ];

  const solutions = [
    { title: "Lingkup terkunci", desc: "Deliverables dan batas pekerjaan tertulis gamblang." },
    { title: "Jatah revisi pasti", desc: "Batas revisi dan tarif tambahan disepakati di awal." },
    { title: "Pembayaran jelas", desc: "Nominal DP, termin, dan tenggat pelunasan hitam di atas putih." },
    { title: "Bukti sah", desc: "Tanda tangan digital, stempel SHA-256, dan riwayat revisi resmi." },
  ];

  const steps = [
    { icon: PenLine, title: "Isi kesepakatan", desc: "Tulis rincian tugas, nominal, DP, jatah revisi, dan tenggat waktu." },
    { icon: Send, title: "Kirim ke klien", desc: "Bagikan link lewat WhatsApp. Klien review langsung tanpa perlu daftar akun." },
    { icon: Handshake, title: "Tanda tangan digital", desc: "Kedua pihak tanda tangan online, lalu dokumen otomatis dikunci resmi." },
    { icon: Stamp, title: "e-Meterai (opsional)", desc: "Untuk proyek di atas Rp5 juta, bubuhkan e-Meterai resmi dengan mudah." },
    { icon: Printer, title: "Simpan & unduh PDF", desc: "Dokumen sah berstempel SHA-256 tersimpan aman dan siap diunduh kapan saja." },
  ];

  const teamMembers = [
    {
      name: "Dwi Hendra",
      role: "Bisnis & Kemitraan",
      subrole: "Pengembangan Bisnis & Operasional",
      image: "/team/team-1.png",
    },
    {
      name: "Fadli Bilal",
      role: "Engineer & System Architect",
      subrole: "Arsitektur Sistem & Developer Platform",
      image: "/team/team-3.png",
    },
    {
      name: "Bima Putra",
      role: "UI/UX Designer & Technical Support",
      subrole: "Desain Antarmuka & Dukungan Teknis",
      image: "/team/team-2.png",
    },
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
              Ubah obrolan kerja menjadi surat kesepakatan resmi. Kunci rincian deliverables,
              kuota revisi, dan tanggal pembayaran lengkap dengan{" "}
              <strong className="text-slate-900">tanda tangan digital sah dan verifikasi resmi</strong>.
            </p>

            <HomeHeroCta />
          </div>

          {/* Animasi 3D SepakatIn */}
          <div className="lg:col-span-5 flex justify-center items-center relative py-4">
            <div
              className="absolute inset-0 max-w-[500px] max-h-[500px] m-auto rounded-full pointer-events-none -z-0"
              style={{
                background:
                  "radial-gradient(circle at 50% 50%, rgba(251, 146, 60, 0.24) 0%, rgba(245, 158, 11, 0.12) 38%, rgba(254, 215, 170, 0.04) 62%, transparent 75%)",
              }}
              aria-hidden="true"
            />

            <div
              className="absolute bottom-4 sm:bottom-6 w-56 sm:w-72 h-10 rounded-full bg-gradient-to-r from-amber-400/25 via-orange-400/35 to-amber-400/25 blur-xl pointer-events-none -z-0"
              aria-hidden="true"
            />

            <Image
              src="/SepakatIn_3D.gif"
              alt="Animasi 3D Sepakatin: Kesepakatan Kerja Aman dan Jelas"
              width={440}
              height={440}
              priority
              unoptimized
              className="w-full max-w-[440px] h-auto object-contain select-none relative z-10 transition-transform duration-300 hover:scale-[1.02]"
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
                  <span className="text-slate-500 select-none text-xs">•</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SUPPORTED BY / DUKUNGAN EKOSISTEM */}
      <section className="border-b border-slate-200/80 bg-gradient-to-b from-slate-50/70 to-white py-12 sm:py-14">
        <div className="container-page">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-10 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-center lg:text-left max-w-lg">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Didukung oleh Ekosistem Inovasi Digital
              </h2>
              <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">
                Sepakatin lahir dari program inkubasi inovasi digital dan didukung oleh jejaring kolaborasi teknologi lokal.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 w-full lg:w-auto">
              {/* Garuda Spark Innovation Hub by KOMDIGI */}
              <div className="flex items-center justify-center px-6 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-brand-300 hover:shadow-md transition-all duration-200">
                <Image
                  src="/garuda-spark.png"
                  alt="Garuda Spark Innovation Hub by KOMDIGI"
                  width={180}
                  height={50}
                  className="h-12 sm:h-14 w-auto object-contain max-w-[210px] select-none"
                />
              </div>

              {/* Ngalup.co */}
              <div className="flex items-center gap-3.5 px-6 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-brand-300 hover:shadow-md transition-all duration-200">
                <Image
                  src="/ngalup.png"
                  alt="Ngalup.co Collaborative Hub"
                  width={56}
                  height={56}
                  className="w-12 h-12 sm:w-14 sm:h-14 object-contain rounded-full shadow-sm select-none"
                />
                <div className="text-left">
                  <span className="block text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                    Ngalup.co
                  </span>
                  <span className="block text-xs font-medium text-slate-600">
                    Collaborative Hub
                  </span>
                </div>
              </div>
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
              <p className="text-sm text-slate-600 mt-0.5">
                Masukkan nomor dokumen untuk memastikan isinya asli dan sudah disetujui.
              </p>
            </div>
          </div>

          <QuickVerifyForm demoContractId={DEMO_CONTRACT_ID} />
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
                    <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
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
                  <span className="text-sm font-bold text-slate-400">0{idx + 1}</span>
                </div>
                <h4 className="text-sm font-semibold text-slate-900 mb-1.5">{step.title}</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TIM PENGEMBANG */}
      <section id="tim" className="border-b border-slate-200 bg-white scroll-mt-16">
        <div className="container-page py-20">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-xs font-semibold text-brand-700 uppercase tracking-wider mb-3">
              <Users className="w-3.5 h-3.5 text-brand-600" />
              Tim Inovator Sepakatin
            </div>
            <h2 className="section-title">Di Balik Layar Sepakatin</h2>
            <p className="text-slate-600 mt-3 text-base leading-relaxed">
              Dibangun oleh praktisi digital untuk membantu freelancer dan klien bekerja sama dengan batasan yang transparan.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {teamMembers.map((member, idx) => (
              <div
                key={idx}
                className="group card p-5 flex flex-col items-center text-center hover:border-brand-300 hover:shadow-lg transition-all duration-300"
              >
                {/* Frame Foto Studio */}
                <div className="relative aspect-[3/4] w-full max-w-[280px] rounded-2xl overflow-hidden bg-gradient-to-b from-slate-100 via-slate-100 to-slate-200/90 border border-slate-200 shadow-inner mb-5">
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={280}
                    height={373}
                    className="w-full h-full object-cover object-top select-none transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  {member.name}
                </h3>
                <p className="text-sm font-semibold text-brand-600 mt-1">
                  {member.role}
                </p>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {member.subrole}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HARGA */}
      <section id="harga" className="scroll-mt-16">
        <div className="container-page py-20">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="kicker mb-2">Harga</p>
            <h2 className="section-title">Mulai gratis. Klien tidak pernah dikenai biaya.</h2>
            <p className="text-slate-600 mt-3">Mulai gratis untuk proyek pertama. Upgrade kapan saja dengan pembayaran instan QRIS.</p>
          </div>
          <PricingCards />
        </div>
      </section>
    </div>
  );
}
