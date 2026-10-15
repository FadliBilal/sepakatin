"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Send,
  Wand2,
  Crown,
  FileCheck,
  ClipboardList,
  Calculator,
  Calendar,
  Coins,
  RotateCcw,
} from "lucide-react";
import { createAgreement, errorMessage, getAccountUsage } from "@/lib/store";
import { AccountUsage } from "@/lib/plans";
import { ContractContentJSON, MilestoneItem } from "@/lib/types";
import { formatCurrencyIDR, generateContractId } from "@/lib/crypto";
import { RequireAuth } from "@/components/RequireAuth";
import { SessionUser } from "@/lib/auth";
import { ModalDialog, ModalType } from "@/components/ModalDialog";

export default function NewAgreementPage() {
  return <RequireAuth>{(user) => <NewAgreementForm user={user} />}</RequireAuth>;
}

function formatEstimatedDueDate(dateStr: string, addDays: number): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    d.setDate(d.getDate() + addDays);
    return d.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function FormSection({
  number,
  title,
  desc,
  children,
}: {
  number: number;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
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
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    title: string;
    description: React.ReactNode;
    type?: ModalType;
  }>({
    isOpen: false,
    title: "",
    description: "",
  });

  const closeDialog = () => setDialogState((prev) => ({ ...prev, isOpen: false }));

  const showAlert = ({
    title,
    description,
    type = "warning",
  }: {
    title: string;
    description: React.ReactNode;
    type?: ModalType;
  }) => {
    setDialogState({
      isOpen: true,
      title,
      description,
      type,
    });
  };

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

  // Bagian 1: Proyek & Para Pihak (Nilai awal kosong agar contoh placeholder tampil)
  const [projectName, setProjectName] = useState("");

  const [freelancerName, setFreelancerName] = useState(user.fullName || "");
  const [freelancerEmail, setFreelancerEmail] = useState(user.email || "");
  const [freelancerPhone, setFreelancerPhone] = useState(user.phone || "");
  const [freelancerRole, setFreelancerRole] = useState(user.role || "");

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientCompany, setClientCompany] = useState("");

  // Bagian 2: Pekerjaan
  const [scopeDesc, setScopeDesc] = useState("");
  const [deliverables, setDeliverables] = useState<string[]>(["", "", ""]);
  const [exclusions, setExclusions] = useState<string[]>(["", ""]);
  const acceptanceCriteria = [
    "Semua fitur utama berjalan sesuai kesepakatan",
    "Sudah dicoba tanpa kendala di komputer dan HP",
  ];

  // Bagian 3: Pembayaran & DP
  const [totalValue, setTotalValue] = useState<number>(5000000);
  const [dpSelection, setDpSelection] = useState<string>("50"); // "0" | "20" | "30" | "50" | "70" | "100" | "custom"
  const [customDpMode, setCustomDpMode] = useState<"percent" | "amount">("percent");
  const [customDpPercent, setCustomDpPercent] = useState<number>(50);
  const [customDpAmount, setCustomDpAmount] = useState<number>(2500000);

  const [dueDaysSelection, setDueDaysSelection] = useState<string>("7"); // "1" | "3" | "7" | "14" | "30" | "custom"
  const [customDueDays, setCustomDueDays] = useState<number>(7);
  const [paymentMethod, setPaymentMethod] = useState("");

  // Bagian 4: Revisi & Jadwal
  const [revisionCount, setRevisionCount] = useState<number>(3);
  const [revisionTerms, setRevisionTerms] = useState("");
  const [extraRevisionRate, setExtraRevisionRate] = useState<number>(300000);

  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );

  // Bagian 5: Hak Cipta & Pembatalan
  const [ipTerms, setIpTerms] = useState("");
  const [terminationTerms, setTerminationTerms] = useState("");

  // Perhitungan otomatis DP & sisa pelunasan
  const safeTotalValue = Math.max(0, Number(totalValue) || 0);

  let effectiveDpPercent = 0;
  let effectiveDpAmount = 0;

  if (dpSelection !== "custom") {
    effectiveDpPercent = Math.min(100, Math.max(0, Number(dpSelection) || 0));
    effectiveDpAmount = Math.round((safeTotalValue * effectiveDpPercent) / 100);
  } else {
    if (customDpMode === "percent") {
      effectiveDpPercent = Math.min(100, Math.max(0, Number(customDpPercent) || 0));
      effectiveDpAmount = Math.round((safeTotalValue * effectiveDpPercent) / 100);
    } else {
      const clampedAmount = Math.min(safeTotalValue, Math.max(0, Number(customDpAmount) || 0));
      effectiveDpAmount = clampedAmount;
      effectiveDpPercent = safeTotalValue > 0 ? Math.min(100, Math.round((clampedAmount / safeTotalValue) * 100)) : 0;
    }
  }

  const effectiveRemainingAmount = Math.max(0, safeTotalValue - effectiveDpAmount);
  const remainingPercent = 100 - effectiveDpPercent;

  // Perhitungan otomatis batas pelunasan
  let effectiveDueDays = 7;
  if (dueDaysSelection !== "custom") {
    effectiveDueDays = Math.max(1, Number(dueDaysSelection) || 7);
  } else {
    effectiveDueDays = Math.max(1, Number(customDueDays) || 1);
  }

  const estimatedDueDateStr = formatEstimatedDueDate(deadline, effectiveDueDays);

  const milestones: MilestoneItem[] = [
    ...(effectiveDpAmount > 0
      ? [
          {
            title: `Uang muka (DP) ${effectiveDpPercent}% sebelum pekerjaan dimulai`,
            amount: effectiveDpAmount,
          },
        ]
      : []),
    ...(effectiveRemainingAmount > 0
      ? [
          {
            title: `Pelunasan ${remainingPercent}% maksimal ${effectiveDueDays} hari kerja setelah serah terima`,
            amount: effectiveRemainingAmount,
          },
        ]
      : []),
  ];

  const updateList = (list: string[], setList: (v: string[]) => void, idx: number, val: string) => {
    const updated = [...list];
    updated[idx] = val;
    setList(updated);
  };

  const fillExampleTemplate = () => {
    setProjectName("Pembuatan Website Perusahaan & Desain Identitas Brand");
    setClientName("Ibu Rina Hartono");
    setClientEmail("rina.hartono@perusahaan.com");
    setClientPhone("081298765432");
    setClientCompany("PT Maju Karya Sejahtera");
    setScopeDesc(
      "Pembuatan desain antarmuka responsif (UI/UX) dan pengembangan website profil perusahaan berbasis Next.js hingga siap go-live."
    );
    setDeliverables([
      "Desain antarmuka 5 halaman utama (Figma & aset visual)",
      "Website responsif yang sudah di-deploy online dan siap pakai",
      "Panduan operasional sistem & penyerahan source code lengkap",
    ]);
    setExclusions([
      "Penulisan materi konten (copywriting) dan foto produk",
      "Biaya langganan domain, server cloud, & lisensi pihak ketiga",
      "Fitur tambahan di luar daftar pekerjaan yang disepakati",
    ]);
    setTotalValue(5000000);
    setDpSelection("50");
    setCustomDpPercent(50);
    setCustomDpAmount(2500000);
    setDueDaysSelection("7");
    setCustomDueDays(7);
    setPaymentMethod(`Transfer Bank BCA 123-456-7890 a.n. ${user.fullName || "Penyedia Jasa"}`);
    setRevisionCount(3);
    setExtraRevisionRate(300000);
    setRevisionTerms(
      "Revisi kecil meliputi perbaikan teks, warna, dan posisi elemen tanpa mengubah konsep dasar yang disepakati."
    );
    setIpTerms(
      "Hak cipta dan seluruh file master hasil kerja diserahkan penuh kepada Klien setelah pembayaran lunas 100%."
    );
    setTerminationTerms(
      "Jika dibatalkan sepihak oleh Klien, Klien wajib membayar kompensasi pekerjaan yang sudah berjalan sesuai tahapan yang selesai."
    );
  };

  const resetForm = () => {
    setProjectName("");
    setClientName("");
    setClientEmail("");
    setClientPhone("");
    setClientCompany("");
    setScopeDesc("");
    setDeliverables(["", "", ""]);
    setExclusions(["", ""]);
    setTotalValue(5000000);
    setDpSelection("50");
    setCustomDpPercent(50);
    setCustomDpAmount(2500000);
    setDueDaysSelection("7");
    setCustomDueDays(7);
    setPaymentMethod("");
    setRevisionTerms("");
    setIpTerms("");
    setTerminationTerms("");
  };

  const handleSubmit = async (e: React.FormEvent, sendDirectly: boolean) => {
    e.preventDefault();

    const trimmedProjectName = projectName.trim();
    const trimmedClientName = clientName.trim();
    const trimmedClientEmail = clientEmail.trim();

    if (!trimmedProjectName || !trimmedClientName || !trimmedClientEmail) {
      showAlert({
        title: "Lengkapi Data Wajib",
        description: "Mohon isi Nama Proyek, Nama Klien, dan Email Klien terlebih dahulu sebelum menyimpan.",
        type: "warning",
      });
      return;
    }

    const cleanDeliverables = deliverables.map((d) => d.trim()).filter((d) => d.length > 0);
    if (cleanDeliverables.length === 0) {
      showAlert({
        title: "Lengkapi Hasil Kerja",
        description: "Mohon isi minimal satu hasil kerja (deliverable) yang akan diserahkan kepada klien.",
        type: "warning",
      });
      return;
    }

    const cleanExclusions = exclusions.map((x) => x.trim()).filter((x) => x.length > 0);

    // Fallback teks sah secara hukum jika opsional dibiarkan kosong
    const finalScopeDesc =
      scopeDesc.trim() ||
      "Pekerjaan dilaksanakan sesuai dengan rincian hasil kerja yang disepakati oleh kedua belah pihak.";
    const finalPaymentMethod =
      paymentMethod.trim() || "Transfer Bank / Rekening Resmi Penyedia Jasa";
    const finalRevisionTerms =
      revisionTerms.trim() ||
      "Revisi minor meliputi perbaikan konten dan penyesuaian visual tanpa mengubah konsep dasar yang disepakati.";
    const finalIpTerms =
      ipTerms.trim() ||
      "Hak cipta dan seluruh file hasil kerja diserahkan penuh kepada Klien setelah pembayaran lunas 100%.";
    const finalTerminationTerms =
      terminationTerms.trim() ||
      "Jika dibatalkan sepihak oleh Klien, Klien wajib melunasi pembayaran pekerjaan yang sudah berjalan sesuai tahapan yang selesai.";

    setSubmitError("");
    setIsSubmitting(true);
    try {
      const content: ContractContentJSON = {
        contractId: generateContractId(),
        projectName: trimmedProjectName,
        freelancer: {
          name: freelancerName.trim(),
          email: freelancerEmail.trim(),
          phone: freelancerPhone.trim(),
          role: freelancerRole.trim(),
        },
        client: {
          name: trimmedClientName,
          email: trimmedClientEmail,
          phone: clientPhone.trim(),
          company: clientCompany.trim(),
        },
        scope: {
          description: finalScopeDesc,
          deliverables: cleanDeliverables,
          exclusions:
            cleanExclusions.length > 0
              ? cleanExclusions
              : ["Fitur atau pekerjaan di luar rincian hasil kerja yang disepakati"],
          acceptanceCriteria,
        },
        payment: {
          totalValue: safeTotalValue,
          currency: "IDR",
          paymentMethod: finalPaymentMethod,
          dpPercent: effectiveDpPercent,
          milestones,
          finalPaymentDueDays: effectiveDueDays,
        },
        revision: {
          count: Number(revisionCount) || 0,
          terms: finalRevisionTerms,
          extraRevisionRate: Number(extraRevisionRate) || 0,
        },
        timeline: { startDate, deadline },
        ip: { ownershipClause: finalIpTerms },
        termination: {
          cancellationCondition: finalTerminationTerms,
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

  const getDeliverablePlaceholder = (idx: number) => {
    switch (idx) {
      case 0:
        return "Contoh: Desain antarmuka 5 halaman utama (Figma & aset visual)";
      case 1:
        return "Contoh: Pengembangan website responsif (Next.js & Tailwind CSS)";
      case 2:
        return "Contoh: Dokumentasi teknis & panduan operasional sistem";
      default:
        return `Contoh: Hasil serah terima ke-${idx + 1}...`;
    }
  };

  const getExclusionPlaceholder = (idx: number) => {
    switch (idx) {
      case 0:
        return "Contoh: Penyediaan materi konten, copywriting, dan foto produk";
      case 1:
        return "Contoh: Biaya langganan domain, server cloud, & lisensi pihak ketiga";
      default:
        return `Contoh: Batasan pekerjaan di luar kesepakatan...`;
    }
  };

  const listEditor = (
    label: string,
    hint: string,
    list: string[],
    setList: (v: string[]) => void,
    placeholder: string | ((idx: number) => string),
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
              placeholder={typeof placeholder === "function" ? placeholder(idx) : placeholder}
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

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-6 mb-8 border-b border-slate-200">
        <div>
          <p className="kicker">Kesepakatan baru</p>
          <h1 className="page-title mt-1">Buat Kesepakatan Kerja</h1>
          <p className="text-sm text-slate-500 mt-1">
            Tuliskan apa yang dikerjakan, berapa bayarannya, dan kapan selesai. Klien akan membaca dan menyetujuinya lewat link.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fillExampleTemplate}
            className="btn btn-secondary btn-sm text-xs font-semibold"
            title="Isi formulir dengan contoh realistis"
          >
            <Wand2 className="w-3.5 h-3.5 text-brand-600" />
            Contoh Cepat
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="btn btn-ghost btn-sm text-xs text-slate-500 hover:text-slate-800"
            title="Kosongkan formulir"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Kosongkan
          </button>
        </div>
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
              placeholder="Contoh: Pembuatan Website E-Commerce & Desain Identitas Brand"
              className="input"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="doc-box space-y-3">
              <p className="text-sm font-semibold text-slate-900">Anda (Freelancer)</p>
              <div>
                <label className="label">Nama lengkap</label>
                <input
                  type="text"
                  required
                  value={freelancerName}
                  onChange={(e) => setFreelancerName(e.target.value)}
                  placeholder="Contoh: Fadli Bilal"
                  className="input"
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  required
                  value={freelancerEmail}
                  onChange={(e) => setFreelancerEmail(e.target.value)}
                  placeholder="Contoh: fadli@example.com"
                  className="input"
                />
              </div>
              <div>
                <label className="label">No. WhatsApp</label>
                <input
                  type="text"
                  value={freelancerPhone}
                  onChange={(e) => setFreelancerPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="input"
                />
              </div>
              <div>
                <label className="label">Keahlian</label>
                <input
                  type="text"
                  value={freelancerRole}
                  onChange={(e) => setFreelancerRole(e.target.value)}
                  placeholder="Contoh: UI/UX Designer & Web Developer"
                  className="input"
                />
              </div>
            </div>

            <div className="doc-box space-y-3">
              <p className="text-sm font-semibold text-slate-900">Klien (Pemberi kerja)</p>
              <div>
                <label className="label">Nama klien *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ibu Rina Hartono"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Email klien *</label>
                <input
                  type="email"
                  required
                  placeholder="Contoh: rina.hartono@perusahaan.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">No. WhatsApp klien</label>
                <input
                  type="text"
                  placeholder="Contoh: 081298765432"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Nama perusahaan / usaha (opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: PT Maju Karya Sejahtera"
                  value={clientCompany}
                  onChange={(e) => setClientCompany(e.target.value)}
                  className="input"
                />
              </div>
            </div>
          </div>
        </FormSection>

        <FormSection number={2} title="Pekerjaan yang disepakati" desc="Semakin jelas, semakin kecil kemungkinan salah paham.">
          <div>
            <label className="label">Gambaran umum proyek</label>
            <textarea
              rows={3}
              value={scopeDesc}
              onChange={(e) => setScopeDesc(e.target.value)}
              placeholder="Contoh: Pembuatan desain antarmuka dan pengembangan sistem website responsif sesuai spesifikasi fitur yang disepakati bersama."
              className="input leading-relaxed"
            />
          </div>
          {listEditor(
            "Hasil kerja yang diserahkan",
            "Apa saja yang akan klien terima di akhir proyek (minimal 1 baris).",
            deliverables,
            setDeliverables,
            getDeliverablePlaceholder,
            (i) => `${i + 1}.`
          )}
          {listEditor(
            "Yang tidak termasuk",
            "Pekerjaan di luar kesepakatan ini (bisa dikenai biaya tambahan).",
            exclusions,
            setExclusions,
            getExclusionPlaceholder,
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
                placeholder="Contoh: 5000000"
                className="input"
              />
              <p className="hint">{formatCurrencyIDR(safeTotalValue)}</p>
            </div>
            <div>
              <label className="label">Uang muka (DP)</label>
              <select
                value={dpSelection}
                onChange={(e) => {
                  const val = e.target.value;
                  setDpSelection(val);
                  if (val !== "custom") {
                    const pct = Number(val) || 0;
                    setCustomDpPercent(pct);
                    setCustomDpAmount(Math.round((safeTotalValue * pct) / 100));
                  }
                }}
                className="input"
              >
                <option value="50">50% di awal (Standar)</option>
                <option value="30">30% di awal</option>
                <option value="20">20% di awal</option>
                <option value="70">70% di awal</option>
                <option value="100">Bayar penuh 100% di awal</option>
                <option value="0">Tanpa DP (0% di awal)</option>
                <option value="custom">Kustom (% atau Rp sendiri)</option>
              </select>
              <p className="hint">
                {dpSelection !== "custom"
                  ? `DP: ${formatCurrencyIDR(effectiveDpAmount)} (${effectiveDpPercent}%)`
                  : "Tentukan persentase atau nominal sendiri"}
              </p>
            </div>
            <div>
              <label className="label">Batas pelunasan</label>
              <select
                value={dueDaysSelection}
                onChange={(e) => {
                  const val = e.target.value;
                  setDueDaysSelection(val);
                  if (val !== "custom") {
                    setCustomDueDays(Number(val) || 7);
                  }
                }}
                className="input"
              >
                <option value="7">7 hari kerja setelah serah terima (Standar)</option>
                <option value="3">3 hari kerja setelah serah terima</option>
                <option value="1">1 hari kerja setelah serah terima (H+1)</option>
                <option value="14">14 hari kerja setelah serah terima (2 minggu)</option>
                <option value="30">30 hari kerja setelah serah terima (1 bulan)</option>
                <option value="custom">Kustom (Tentukan jumlah hari)</option>
              </select>
              <p className="hint">
                {dueDaysSelection !== "custom"
                  ? `Maksimal ${effectiveDueDays} hari kerja setelah serah terima`
                  : "Tentukan tenggat hari pelunasan sendiri"}
              </p>
            </div>
          </div>

          {(dpSelection === "custom" || dueDaysSelection === "custom") && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              {dpSelection === "custom" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Coins className="w-3.5 h-3.5 text-brand-600" /> Pengaturan DP Kustom
                    </label>
                    <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => {
                          setCustomDpMode("percent");
                          setCustomDpPercent(effectiveDpPercent);
                        }}
                        className={`px-2.5 py-1 rounded-md transition-colors ${
                          customDpMode === "percent"
                            ? "bg-brand-600 text-white shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Persen (%)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomDpMode("amount");
                          setCustomDpAmount(effectiveDpAmount);
                        }}
                        className={`px-2.5 py-1 rounded-md transition-colors ${
                          customDpMode === "amount"
                            ? "bg-brand-600 text-white shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Rupiah (Rp)
                      </button>
                    </div>
                  </div>

                  {customDpMode === "percent" ? (
                    <div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step={1}
                          value={customDpPercent}
                          onChange={(e) => {
                            const val = Math.min(100, Math.max(0, Number(e.target.value) || 0));
                            setCustomDpPercent(val);
                            setCustomDpAmount(Math.round((safeTotalValue * val) / 100));
                          }}
                          placeholder="Contoh: 35"
                          className="input w-28 font-semibold"
                        />
                        <span className="text-sm font-semibold text-slate-700">% dari total harga</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1.5">
                        Otomatis dihitung: DP <strong>{formatCurrencyIDR(effectiveDpAmount)}</strong> • Sisa pelunasan{" "}
                        <strong>{formatCurrencyIDR(effectiveRemainingAmount)}</strong>
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-500">Rp</span>
                        <input
                          type="number"
                          min={0}
                          max={safeTotalValue}
                          step={50000}
                          value={customDpAmount}
                          onChange={(e) => {
                            const val = Math.max(0, Number(e.target.value) || 0);
                            setCustomDpAmount(val);
                            if (safeTotalValue > 0) {
                              setCustomDpPercent(Math.min(100, Math.round((val / safeTotalValue) * 100)));
                            }
                          }}
                          placeholder="Contoh: 1500000"
                          className="input font-semibold"
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1.5">
                        Otomatis dihitung: DP <strong>{effectiveDpPercent}%</strong> ({formatCurrencyIDR(effectiveDpAmount)}) • Sisa{" "}
                        <strong>{formatCurrencyIDR(effectiveRemainingAmount)}</strong>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {dueDaysSelection === "custom" && (
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-brand-600" /> Pengaturan Batas Pelunasan Kustom
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={365}
                      step={1}
                      value={customDueDays}
                      onChange={(e) => setCustomDueDays(Math.max(1, Number(e.target.value) || 1))}
                      placeholder="Contoh: 10"
                      className="input w-28 font-semibold"
                    />
                    <span className="text-sm font-semibold text-slate-700">hari kerja setelah serah terima</span>
                  </div>
                  {estimatedDueDateStr && (
                    <p className="text-xs text-slate-600 bg-white border border-slate-200 rounded-lg p-2 mt-1.5">
                      Estimasi jatuh tempo pembayaran: <strong className="text-brand-700">{estimatedDueDateStr}</strong>{" "}
                      (dihitung dari tenggat selesai proyek).
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="label">Cara pembayaran</label>
            <input
              type="text"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              placeholder="Contoh: Transfer Bank BCA 123-456-7890 a.n. Fadli Bilal / QRIS"
              className="input"
            />
          </div>

          {milestones.length > 0 && (
            <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 text-sm bg-white overflow-hidden shadow-xs">
              <div className="px-4 py-2.5 bg-slate-50 flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-brand-600" />
                  Rincian Tahap Pembayaran (Otomatis Dihitung)
                </p>
                <span className="text-xs font-bold text-slate-900">Total: {formatCurrencyIDR(safeTotalValue)}</span>
              </div>
              {milestones.map((m, idx) => (
                <div key={idx} className="px-4 py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-slate-700">{m.title}</span>
                  </div>
                  <span className="font-bold text-slate-900">{formatCurrencyIDR(m.amount)}</span>
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
                  placeholder="Contoh: 3"
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
                placeholder="Contoh: 300000"
                className="input"
              />
              <p className="hint">Per revisi, jika jatah gratis sudah habis.</p>
            </div>
          </div>

          <div>
            <label className="label">Ketentuan revisi</label>
            <textarea
              rows={2}
              value={revisionTerms}
              onChange={(e) => setRevisionTerms(e.target.value)}
              placeholder="Contoh: Revisi mencakup perbaikan tata letak, teks, dan penyesuaian visual tanpa mengubah konsep dasar yang disepakati."
              className="input leading-relaxed"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-900 leading-relaxed space-y-1">
            <p className="font-semibold text-blue-950 flex items-center gap-1.5">
              <ClipboardList className="w-4 h-4 text-blue-700" /> Prinsip Hukum Revisi di Sepakatin
            </p>
            <p>
              Revisi selama masih dalam jatah (<strong>{revisionCount}x</strong>) cukup dicatat mandiri tanpa biaya &amp; tanpa perlu dokumen baru bermaterai.
            </p>
            <p className="text-blue-800">
              Jika terjadi revisi di tengah jalan yang <strong>melebihi jatah {revisionCount}x</strong> atau ada penambahan ruang lingkup pekerjaan, freelancer dapat menerbitkan <strong>Dokumen Kesepakatan Baru (Addendum) bermaterai</strong> dengan biaya tambahan Rp{(extraRevisionRate || 0).toLocaleString("id-ID")}/revisi.
            </p>
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
            <textarea
              rows={2}
              value={ipTerms}
              onChange={(e) => setIpTerms(e.target.value)}
              placeholder="Contoh: Hak cipta dan seluruh file master hasil kerja diserahkan penuh kepada Klien setelah pembayaran dilunasi 100%."
              className="input leading-relaxed"
            />
          </div>
          <div>
            <label className="label">Jika proyek dibatalkan</label>
            <textarea
              rows={2}
              value={terminationTerms}
              onChange={(e) => setTerminationTerms(e.target.value)}
              placeholder="Contoh: Apabila proyek dibatalkan sepihak oleh Klien, Klien wajib membayar kompensasi atas tahapan pekerjaan yang sudah selesai dikerjakan."
              className="input leading-relaxed"
            />
          </div>
        </FormSection>

        {isPro ? (
          <div className="card p-5 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 border border-emerald-200 flex items-center gap-3.5">
            <span className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <Crown className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-emerald-950">Status: Langganan Pro Aktif</h3>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Fitur Resmi Penuh
                </span>
              </div>
              <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                Dokumen ini otomatis berfitur resmi lengkap: Tanda Tangan Digital Resmi, bersih tanpa watermark, pengunci batas revisi, dan riwayat addendum tanpa batas.
              </p>
            </div>
          </div>
        ) : (
          <section className="card p-6 sm:p-7 space-y-4">
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
                <FileCheck className="w-4 h-4" />
              </span>
              <div>
                <h2 className="card-title">Tipe Penerbitan Kesepakatan</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Pilih apakah kesepakatan ini diterbitkan dengan kuota Gratis atau menggunakan saldo kredit Per Proyek berfitur resmi:
                </p>
              </div>
            </div>

            {usage && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {[
                  {
                    credit: false,
                    title: "Paket Gratis (Rp0)",
                    badge: null,
                    note: `${usage.activeFreeAgreements}/${usage.maxActiveFreeAgreements} kesepakatan aktif`,
                    features: [
                      "Draf standar & konfirmasi centang online",
                      "Maksimal 1 kali revisi draf",
                      "PDF memuat watermark Sepakatin",
                    ],
                    disabled: freeFull,
                  },
                  {
                    credit: true,
                    title: "Per Proyek (Pakai 1 Kredit)",
                    badge: "Fitur Resmi Penuh",
                    note: `Sisa saldo: ${usage.credits} kredit proyek`,
                    features: [
                      "Tanda Tangan Digital Resmi (gores layar)",
                      "Dokumen bersih 100% tanpa watermark",
                      "Pengunci batas revisi & anti-revisi liar",
                      "Format 2 salinan resmi & verifikasi SHA-256",
                    ],
                    disabled: usage.credits < 1,
                  },
                ].map((opt) => (
                  <button
                    type="button"
                    key={opt.title}
                    disabled={opt.disabled}
                    onClick={() => setUseCredit(opt.credit)}
                    className={`text-left p-4 rounded-xl border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      useCredit === opt.credit
                        ? "border-brand-600 bg-brand-50/60 ring-4 ring-brand-600/10 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-slate-900">{opt.title}</p>
                      {opt.badge && (
                        <span className="text-[10px] font-semibold text-brand-700 bg-brand-100 px-2 py-0.5 rounded-full">
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-brand-700 mt-1">{opt.note}</p>
                    <ul className="mt-2.5 space-y-1 text-xs text-slate-600">
                      {opt.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <span className="text-brand-600 font-bold">•</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
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
        )}

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

      <ModalDialog onClose={closeDialog} {...dialogState} />
    </div>
  );
}
