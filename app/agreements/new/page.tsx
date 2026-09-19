"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Save, Send, Sparkles } from "lucide-react";
import { createAgreement, errorMessage, getAccountUsage } from "@/lib/store";
import { AccountUsage } from "@/lib/plans";
import { ContractContentJSON, MilestoneItem } from "@/lib/types";
import { formatCurrencyIDR, generateContractId } from "@/lib/crypto";
import { RequireAuth } from "@/components/RequireAuth";
import { SessionUser } from "@/lib/auth";

export default function NewAgreementPage() {
  return <RequireAuth>{(user) => <NewAgreementForm user={user} />}</RequireAuth>;
}

function FormSection({ number, title, desc, children }: { number: number; title: string; desc: string; children: React.ReactNode }) {
  return (
    <section className="card p-6 sm:p-7 space-y-5">
      <div className="flex items-start gap-3 pb-4 border-b border-slate-100">
        <span className="w-8 h-8 rounded-lg bg-brand-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
          {number}
        </span>
        <div>
          <h2 className="card-title">{title}</h2>
          <p className="text-sm text-slate-500 mt-0.5">{desc}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function NewAgreementForm({ user }: { user: SessionUser }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usage, setUsage] = useState<AccountUsage | null>(null);
  const [useCredit, setUseCredit] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    getAccountUsage()
      .then((u) => {
        setUsage(u);
        // Kuota Gratis penuh tapi masih punya kredit → otomatis pakai kredit
        if (u.plan !== "pro" && u.activeFreeAgreements >= u.maxActiveFreeAgreements && u.credits > 0) setUseCredit(true);
      })
      .catch(() => setUsage(null));
  }, []);

  const isPro = usage?.plan === "pro";
  const freeFull = !!usage && !isPro && usage.activeFreeAgreements >= usage.maxActiveFreeAgreements;
  const blocked = !!usage && !isPro && (useCredit ? usage.credits < 1 : freeFull);

  const [projectName, setProjectName] = useState("Pembuatan Website & Branding Klien");

  // Para pihak — data freelancer diambil dari akun yang sedang masuk
  const [freelancerName, setFreelancerName] = useState(user.fullName);
  const [freelancerEmail, setFreelancerEmail] = useState(user.email);
  const [freelancerPhone, setFreelancerPhone] = useState(user.phone);
  const [freelancerRole, setFreelancerRole] = useState(user.role);

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientCompany, setClientCompany] = useState("");

  // Pekerjaan
  const [scopeDesc, setScopeDesc] = useState(
    "Pembuatan desain dan website sesuai kebutuhan yang sudah dibicarakan bersama."
  );
  const [deliverables, setDeliverables] = useState<string[]>([
    "Desain tampilan website (versi komputer & HP)",
    "Website jadi yang bisa diakses online",
    "Panduan penggunaan & penyerahan semua file",
  ]);
  const [exclusions, setExclusions] = useState<string[]>([
    "Penulisan isi teks dan foto produk",
    "Biaya domain, hosting, atau layanan pihak lain",
    "Fitur tambahan di luar daftar pekerjaan di atas",
  ]);
  const acceptanceCriteria = [
    "Semua fitur utama berjalan sesuai kesepakatan",
    "Sudah dicoba tanpa kendala di komputer dan HP",
  ];

  // Pembayaran
  const [totalValue, setTotalValue] = useState<number>(5000000);
  const [dpPercent, setDpPercent] = useState<number>(50);
  const [paymentMethod, setPaymentMethod] = useState("Transfer Bank BCA / Mandiri");
  const [finalPaymentDueDays, setFinalPaymentDueDays] = useState<number>(7);

  const dpAmount = Math.round(((Number(totalValue) || 0) * dpPercent) / 100);
  const remainingAmount = (Number(totalValue) || 0) - dpAmount;
  const milestones: MilestoneItem[] = [
    ...(dpAmount > 0 ? [{ title: `Uang muka (DP) ${dpPercent}% sebelum pekerjaan dimulai`, amount: dpAmount }] : []),
    ...(remainingAmount > 0 ? [{ title: "Pelunasan saat hasil kerja diserahkan", amount: remainingAmount }] : []),
  ];

  // Revisi & jadwal
  const [revisionCount, setRevisionCount] = useState<number>(3);
  const [revisionTerms, setRevisionTerms] = useState(
    "Revisi kecil meliputi perbaikan teks, warna, dan posisi elemen tanpa mengubah konsep dasar."
  );
  const [extraRevisionRate, setExtraRevisionRate] = useState<number>(300000);

  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );

  // Hak cipta & pembatalan
  const [ipTerms, setIpTerms] = useState(
    "Hak cipta dan seluruh file hasil kerja diserahkan penuh kepada Klien setelah pembayaran lunas 100%."
  );
  const [terminationTerms, setTerminationTerms] = useState(
    "Jika dibatalkan sepihak, Klien membayar pekerjaan yang sudah berjalan sesuai tahap yang selesai."
  );

  const updateList = (list: string[], setList: (v: string[]) => void, idx: number, val: string) => {
    const updated = [...list];
    updated[idx] = val;
    setList(updated);
  };

  const handleSubmit = async (e: React.FormEvent, sendDirectly: boolean) => {
    e.preventDefault();
    if (!projectName.trim() || !clientName.trim() || !clientEmail.trim()) {
      alert("Mohon isi Nama Proyek, Nama Klien, dan Email Klien terlebih dahulu.");
      return;
    }

    setSubmitError("");
    setIsSubmitting(true);
    try {
      const content: ContractContentJSON = {
        contractId: generateContractId(),
        projectName: projectName.trim(),
        freelancer: {
          name: freelancerName.trim(),
          email: freelancerEmail.trim(),
          phone: freelancerPhone.trim(),
          role: freelancerRole.trim(),
        },
        client: {
          name: clientName.trim(),
          email: clientEmail.trim(),
          phone: clientPhone.trim(),
          company: clientCompany.trim(),
        },
        scope: {
          description: scopeDesc.trim(),
          deliverables: deliverables.filter((d) => d.trim().length > 0),
          exclusions: exclusions.filter((x) => x.trim().length > 0),
          acceptanceCriteria,
        },
        payment: {
          totalValue: Number(totalValue) || 0,
          currency: "IDR",
          paymentMethod: paymentMethod.trim(),
          dpPercent: Number(dpPercent) || 0,
          milestones,
          finalPaymentDueDays: Number(finalPaymentDueDays) || 7,
        },
        revision: {
          count: Number(revisionCount) || 0,
          terms: revisionTerms.trim(),
          extraRevisionRate: Number(extraRevisionRate) || 0,
        },
        timeline: { startDate, deadline },
        ip: { ownershipClause: ipTerms.trim() },
        termination: {
          cancellationCondition: terminationTerms.trim(),
          noticePeriodDays: 7,
          outstandingPaymentTerms: "Wajib diselesaikan dalam 7 hari kerja.",
        },
        validFrom: startDate,
        validUntil: deadline,
      };

      const created = await createAgreement(content, { sendDirectly, useCredit: !isPro && useCredit });
      router.push(`/agreements/${created.id}`);
    } catch (err) {
      setSubmitError(errorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const listEditor = (
    label: string,
    hint: string,
    list: string[],
    setList: (v: string[]) => void,
    placeholder: string,
    bullet: (i: number) => string
  ) => (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="label mb-0">{label}</p>
          <p className="hint mt-0">{hint}</p>
        </div>
        <button type="button" onClick={() => setList([...list, ""])} className="btn btn-ghost btn-sm">
          <Plus className="w-4 h-4" />
          Tambah
        </button>
      </div>
      <div className="space-y-2">
        {list.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-400 w-5 text-right">{bullet(idx)}</span>
            <input
              type="text"
              value={item}
              onChange={(e) => updateList(list, setList, idx, e.target.value)}
              placeholder={placeholder}
              className="input"
            />
            {list.length > 1 && (
              <button
                type="button"
                onClick={() => setList(list.filter((_, i) => i !== idx))}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                aria-label="Hapus baris"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <Link href="/dashboard" className="back-link mb-6">
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Dashboard
      </Link>

      <div className="pb-6 mb-8 border-b border-slate-200">
        <p className="kicker">Kesepakatan baru</p>
        <h1 className="page-title mt-1">Buat Kesepakatan Kerja</h1>
        <p className="text-sm text-slate-500 mt-1">
          Tuliskan apa yang dikerjakan, berapa bayarannya, dan kapan selesai. Klien akan membaca dan menyetujuinya lewat link.
        </p>
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
        <FormSection number={1} title="Proyek & para pihak" desc="Siapa yang bekerja sama dan untuk proyek apa.">
          <div>
            <label className="label">Nama proyek *</label>
            <input
              type="text"
              required
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Contoh: Desain ulang aplikasi toko online"
              className="input"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="doc-box space-y-3">
              <p className="text-sm font-semibold text-slate-900">Anda (Freelancer)</p>
              <div>
                <label className="label">Nama lengkap</label>
                <input type="text" required value={freelancerName} onChange={(e) => setFreelancerName(e.target.value)} className="input" />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" required value={freelancerEmail} onChange={(e) => setFreelancerEmail(e.target.value)} className="input" />
              </div>
              <div>
                <label className="label">No. WhatsApp</label>
                <input type="text" value={freelancerPhone} onChange={(e) => setFreelancerPhone(e.target.value)} placeholder="+62 812..." className="input" />
              </div>
              <div>
                <label className="label">Keahlian</label>
                <input type="text" value={freelancerRole} onChange={(e) => setFreelancerRole(e.target.value)} placeholder="Contoh: Desainer Grafis" className="input" />
              </div>
            </div>

            <div className="doc-box space-y-3">
              <p className="text-sm font-semibold text-slate-900">Klien (Pemberi kerja)</p>
              <div>
                <label className="label">Nama klien *</label>
                <input type="text" required placeholder="Contoh: Ibu Rina Hartono" value={clientName} onChange={(e) => setClientName(e.target.value)} className="input" />
              </div>
              <div>
                <label className="label">Email klien *</label>
                <input type="email" required placeholder="rina@perusahaan.com" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} className="input" />
              </div>
              <div>
                <label className="label">No. WhatsApp klien</label>
                <input type="text" placeholder="+62 811..." value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} className="input" />
              </div>
              <div>
                <label className="label">Nama perusahaan / usaha (opsional)</label>
                <input type="text" placeholder="PT Maju Karya Sejahtera" value={clientCompany} onChange={(e) => setClientCompany(e.target.value)} className="input" />
              </div>
            </div>
          </div>
        </FormSection>

        <FormSection number={2} title="Pekerjaan yang disepakati" desc="Semakin jelas, semakin kecil kemungkinan salah paham.">
          <div>
            <label className="label">Gambaran umum proyek</label>
            <textarea rows={3} value={scopeDesc} onChange={(e) => setScopeDesc(e.target.value)} className="input leading-relaxed" />
          </div>
          {listEditor(
            "Hasil kerja yang diserahkan",
            "Apa saja yang akan klien terima di akhir proyek.",
            deliverables,
            setDeliverables,
            "Contoh: 3 pilihan desain logo dalam format PNG & PDF",
            (i) => `${i + 1}.`
          )}
          {listEditor(
            "Yang tidak termasuk",
            "Pekerjaan di luar kesepakatan ini (bisa dikenai biaya tambahan).",
            exclusions,
            setExclusions,
            "Contoh: Penulisan artikel blog",
            () => "•"
          )}
        </FormSection>

        <FormSection number={3} title="Harga & pembayaran" desc="Berapa nilai proyeknya dan bagaimana cara bayarnya.">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="label">Total harga (Rp) *</label>
              <input
                type="number"
                required
                min={0}
                step={50000}
                value={totalValue}
                onChange={(e) => setTotalValue(Number(e.target.value))}
                className="input"
              />
              <p className="hint">{formatCurrencyIDR(Number(totalValue) || 0)}</p>
            </div>
            <div>
              <label className="label">Uang muka (DP)</label>
              <select value={dpPercent} onChange={(e) => setDpPercent(Number(e.target.value))} className="input">
                <option value={0}>Tanpa DP</option>
                <option value={30}>30% di awal</option>
                <option value={50}>50% di awal (umum)</option>
                <option value={100}>Bayar penuh di awal</option>
              </select>
            </div>
            <div>
              <label className="label">Batas pelunasan</label>
              <select value={finalPaymentDueDays} onChange={(e) => setFinalPaymentDueDays(Number(e.target.value))} className="input">
                <option value={3}>3 hari setelah serah terima</option>
                <option value={7}>7 hari setelah serah terima (disarankan)</option>
                <option value={14}>14 hari setelah serah terima</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">Cara pembayaran</label>
            <input
              type="text"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              placeholder="Contoh: Transfer BCA 1234567890 a.n. Fadli Bilal"
              className="input"
            />
          </div>

          {milestones.length > 0 && (
            <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 text-sm">
              <p className="px-4 py-2.5 text-xs font-semibold text-slate-500 bg-slate-50 rounded-t-xl">Rincian tahap pembayaran (otomatis)</p>
              {milestones.map((m, idx) => (
                <div key={idx} className="px-4 py-2.5 flex items-center justify-between gap-4">
                  <span className="text-slate-600">{idx + 1}. {m.title}</span>
                  <span className="font-semibold text-slate-900">{formatCurrencyIDR(m.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </FormSection>

        <FormSection number={4} title="Revisi & jadwal" desc="Batasi jumlah revisi dan tentukan tenggat waktunya.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="label">Jatah revisi gratis</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={revisionCount}
                  onChange={(e) => setRevisionCount(Number(e.target.value))}
                  className="input w-24"
                />
                <span className="text-sm text-slate-500">kali revisi</span>
              </div>
            </div>
            <div>
              <label className="label">Biaya revisi tambahan (Rp)</label>
              <input
                type="number"
                min={0}
                step={50000}
                value={extraRevisionRate}
                onChange={(e) => setExtraRevisionRate(Number(e.target.value))}
                className="input"
              />
              <p className="hint">Per revisi, jika jatah gratis sudah habis.</p>
            </div>
          </div>

          <div>
            <label className="label">Ketentuan revisi</label>
            <textarea rows={2} value={revisionTerms} onChange={(e) => setRevisionTerms(e.target.value)} className="input leading-relaxed" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="label">Tanggal mulai</label>
              <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input" />
            </div>
            <div>
              <label className="label">Tenggat selesai *</label>
              <input type="date" required value={deadline} onChange={(e) => setDeadline(e.target.value)} className="input" />
            </div>
          </div>
        </FormSection>

        <FormSection number={5} title="Hak cipta & pembatalan" desc="Siapa pemilik hasil kerja dan apa yang terjadi jika proyek batal.">
          <div>
            <label className="label">Kepemilikan hasil kerja</label>
            <textarea rows={2} value={ipTerms} onChange={(e) => setIpTerms(e.target.value)} className="input leading-relaxed" />
          </div>
          <div>
            <label className="label">Jika proyek dibatalkan</label>
            <textarea rows={2} value={terminationTerms} onChange={(e) => setTerminationTerms(e.target.value)} className="input leading-relaxed" />
          </div>
        </FormSection>

        <section className="card p-6 sm:p-7 space-y-4">
          <div className="flex items-start gap-3">
            <span className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h2 className="card-title">Paket untuk kesepakatan ini</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {!usage
                  ? "Memeriksa kuota akun Anda..."
                  : isPro
                  ? "Akun Anda Pro: semua fitur aktif dan tanpa batas jumlah kesepakatan."
                  : "e-Materai, tanda tangan online, dan permintaan perubahan dari klien hanya tersedia di kesepakatan Per Proyek."}
              </p>
            </div>
          </div>

          {usage && !isPro && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  credit: false,
                  title: "Gratis",
                  note: `${usage.activeFreeAgreements}/${usage.maxActiveFreeAgreements} kesepakatan Gratis aktif`,
                  disabled: freeFull,
                },
                {
                  credit: true,
                  title: "Per Proyek (1 kredit)",
                  note: `Sisa ${usage.credits} kredit · fitur lengkap`,
                  disabled: usage.credits < 1,
                },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.title}
                  disabled={opt.disabled}
                  onClick={() => setUseCredit(opt.credit)}
                  className={`text-left p-4 rounded-xl border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    useCredit === opt.credit ? "border-brand-600 bg-brand-50/60 ring-4 ring-brand-600/10" : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <p className="text-sm font-semibold text-slate-900">{opt.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{opt.note}</p>
                </button>
              ))}
            </div>
          )}

          {blocked && (
            <p className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              Kuota paket Gratis sudah penuh dan kredit Per Proyek habis. Selesaikan atau batalkan kesepakatan lama di
              dashboard, atau <Link href="/#harga" className="font-semibold underline">tambah kredit / upgrade ke Pro</Link>.
            </p>
          )}
        </section>

        {submitError && (
          <p className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">{submitError}</p>
        )}

        <div className="card p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            Setelah disimpan, kesepakatan mendapat nomor dokumen sendiri dan bisa dikirim ke klien.
          </p>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button type="submit" disabled={isSubmitting || blocked} className="btn btn-secondary flex-1 sm:flex-none">
              <Save className="w-4 h-4" />
              Simpan Draf
            </button>
            <button type="button" disabled={isSubmitting || blocked} onClick={(e) => handleSubmit(e, true)} className="btn btn-primary flex-1 sm:flex-none">
              <Send className="w-4 h-4" />
              Simpan & Kirim ke Klien
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
