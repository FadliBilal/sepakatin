"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Search, FileCheck2, Lock, BadgeCheck } from "lucide-react";

const DEMO_CONTRACT_ID = "SPK-2026-00124";

export default function VerifyIndexPage() {
  const router = useRouter();
  const [contractId, setContractId] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (contractId.trim()) router.push(`/verify/${contractId.trim().toUpperCase()}`);
  };

  const steps = [
    { icon: FileCheck2, title: "Kedua pihak setuju", desc: "Freelancer dan klien menyetujui isi dokumen yang sama." },
    { icon: Lock, title: "Dokumen dikunci", desc: "Isi dokumen disegel sehingga tidak bisa diubah sepihak." },
    { icon: BadgeCheck, title: "Siapa pun bisa cek", desc: "Cukup masukkan nomor dokumen atau pindai kode QR-nya." },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-10">
        <span className="eyebrow mb-4">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          Cek keaslian dokumen
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold font-display tracking-tight text-slate-900 mb-3">
          Pastikan kesepakatan Anda asli
        </h1>
        <p className="text-slate-600 leading-relaxed max-w-xl mx-auto text-sm sm:text-base">
          Masukkan nomor dokumen yang tertera di surat kesepakatan untuk melihat status persetujuan
          dan memastikan isinya tidak pernah diubah.
        </p>
      </div>

      <div className="card p-6 sm:p-8 max-w-xl mx-auto mb-10">
        <form onSubmit={handleSearch}>
          <label className="label" htmlFor="contractId">Nomor dokumen</label>
          <div className="flex gap-2">
            <input
              id="contractId"
              type="text"
              required
              placeholder={`Contoh: ${DEMO_CONTRACT_ID}`}
              value={contractId}
              onChange={(e) => setContractId(e.target.value)}
              className="input uppercase font-mono placeholder:normal-case placeholder:font-sans"
            />
            <button type="submit" className="btn btn-primary">
              <Search className="w-4 h-4" />
              Cek
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-xl border border-[#E8E8EC] bg-[#FAFAFA] p-6 sm:p-8">
        <h3 className="card-title font-display mb-2">Bagaimana cara kerjanya?</h3>
        <p className="text-xs sm:text-sm text-[#6B6B6B] leading-relaxed mb-6">
          Begitu kedua pihak setuju, Sepakatin memberi segel pada dokumen. Jika ada isi, nominal, atau
          tanggal yang diubah tanpa persetujuan, pengecekan ini akan langsung memberi tahu bahwa dokumen tidak asli.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {steps.map((s, idx) => (
            <div key={s.title} className="bg-white rounded-lg border border-[#E8E8EC] p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <s.icon className="w-4 h-4" />
                </span>
                <span className="font-mono text-xs font-bold text-[#8E8E93]">0{idx + 1}</span>
              </div>
              <p className="text-sm font-semibold font-display text-[#0A0A0A]">{s.title}</p>
              <p className="text-xs text-[#6B6B6B] mt-1 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
