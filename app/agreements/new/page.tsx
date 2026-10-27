"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
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
  CheckCircle2,
  ShieldCheck,
  Check,
  Layers,
  DollarSign,
  Clock,
  UserCheck,
} from "lucide-react";
import { createAgreement, errorMessage, getAccountUsage, getAgreement } from "@/lib/store";
import { AccountUsage } from "@/lib/plans";
import { AgreementRecord, ContractContentJSON, MilestoneItem } from "@/lib/types";
import { formatCurrencyIDR, generateContractId } from "@/lib/crypto";
import { RequireAuth } from "@/components/RequireAuth";
import { SessionUser } from "@/lib/auth";
import { ModalDialog, ModalType } from "@/components/ModalDialog";

export default function NewAgreementPage() {
  return (
    <RequireAuth>
      {(user) => (
        <Suspense fallback={<div className="container-page py-16 text-center text-sm text-slate-500">Memuat formulir kesepakatan...</div>}>
          <NewAgreementForm user={user} />
        </Suspense>
      )}
    </RequireAuth>
  );
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

const WIZARD_STEPS = [
  { id: 1, title: "Pihak", subtitle: "Identitas Proyek & Kontak", icon: UserCheck },
  { id: 2, title: "Lingkup", subtitle: "Pekerjaan & Luaran", icon: Layers },
  { id: 3, title: "Biaya", subtitle: "Total Nilai & Termin", icon: DollarSign },
  { id: 4, title: "Ketentuan", subtitle: "Jadwal & Hak Cipta", icon: Clock },
  { id: 5, title: "Tinjau", subtitle: "Ringkasan & Terbitkan", icon: ShieldCheck },
];

function NewAgreementForm({ user }: { user: SessionUser }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const addendumToId = searchParams?.get("addendum_to");
  const [parentAgreement, setParentAgreement] = useState<AgreementRecord | null>(null);

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [focusedInputKey, setFocusedInputKey] = useState<string | null>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    if (focusedInputKey && inputRefs.current[focusedInputKey]) {
      inputRefs.current[focusedInputKey]?.focus();
      setFocusedInputKey(null);
    }
  }, [focusedInputKey]);

  const handleAddListItem = (listKey: string, list: string[], setList: (v: string[]) => void) => {
    const nextIdx = list.length;
    setList([...list, ""]);
    setFocusedInputKey(`${listKey}-${nextIdx}`);
  };

  const handleCurrencyChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (n: number) => void
  ) => {
    const raw = e.target.value.replace(/\D/g, "");
    const num = raw ? parseInt(raw, 10) : 0;
    setter(num);
  };

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
        // Kuota Gratis penuh tapi masih punya kredit: otomatis pilih gunakan kredit
        if (u.plan !== "pro" && u.activeFreeAgreements >= u.maxActiveFreeAgreements && u.credits > 0) {
          setUseCredit(true);
        }
      })
      .catch(() => setUsage(null));
  }, []);

  useEffect(() => {
    if (!addendumToId) return;
    getAgreement(addendumToId).then((agr) => {
      if (!agr) return;
      setParentAgreement(agr);
      const parent = agr.currentVersion.contentJson;
      const cleanParentName = parent.projectName.replace(/^(Addendum:\s*)+/i, "");
      setProjectName(`Addendum: ${cleanParentName}`);
      setClientName(parent.client.name || "");
      setClientEmail(parent.client.email || "");
      setClientPhone(parent.client.phone || "");
      setClientCompany(parent.client.company || "");
      if (parent.freelancer.name) setFreelancerName(parent.freelancer.name);
      if (parent.freelancer.email) setFreelancerEmail(parent.freelancer.email);
      if (parent.freelancer.phone) setFreelancerPhone(parent.freelancer.phone);
      if (parent.freelancer.role) setFreelancerRole(parent.freelancer.role);
      setScopeDesc(
        `Pekerjaan tambahan atau penyesuaian ruang lingkup untuk melengkapi kesepakatan induk ${agr.contractId}.`
      );
      setDeliverables(["", ""]);
      setExclusions(["Pekerjaan di luar lingkup addendum ini"]);
      setTotalValue(1500000);
      setDpSelection("50");
      setCustomDpPercent(50);
      setCustomDpAmount(750000);
      setRevisionCount(2);
      setExtraRevisionRate(300000);
    });
  }, [addendumToId]);

  const isPro = usage?.plan === "pro";
  const freeFull = !!usage && !isPro && usage.activeFreeAgreements >= usage.maxActiveFreeAgreements;
  const blocked = !!usage && !isPro && (useCredit ? usage.credits < 1 : freeFull);

  const [projectName, setProjectName] = useState("");

  const [freelancerName, setFreelancerName] = useState(user.fullName || "");
  const [freelancerEmail, setFreelancerEmail] = useState(user.email || "");
  const [freelancerPhone, setFreelancerPhone] = useState(user.phone || "");
  const [freelancerRole, setFreelancerRole] = useState(user.role || "");

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientCompany, setClientCompany] = useState("");

  const [scopeDesc, setScopeDesc] = useState("");
  const [deliverables, setDeliverables] = useState<string[]>(["", "", ""]);
  const [exclusions, setExclusions] = useState<string[]>(["", ""]);
  const acceptanceCriteria = [
    "Semua fitur utama berjalan sesuai kesepakatan",
    "Sudah dicoba tanpa kendala di komputer dan ponsel",
  ];

  const [totalValue, setTotalValue] = useState<number>(5000000);
  const [dpSelection, setDpSelection] = useState<string>("50");
  const [customDpMode, setCustomDpMode] = useState<"percent" | "amount">("percent");
  const [customDpPercent, setCustomDpPercent] = useState<number>(50);
  const [customDpAmount, setCustomDpAmount] = useState<number>(2500000);

  const [dueDaysSelection, setDueDaysSelection] = useState<string>("7");
  const [customDueDays, setCustomDueDays] = useState<number>(7);
  const [paymentMethod, setPaymentMethod] = useState("");

  const [revisionCount, setRevisionCount] = useState<number>(3);
  const [revisionTerms, setRevisionTerms] = useState("");
  const [extraRevisionRate, setExtraRevisionRate] = useState<number>(300000);

  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );

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

  // Perhitungan batas hari pelunasan
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
    setCurrentStep(1);
  };

  // Validasi per tahap sebelum melangkah ke tahap selanjutnya
  const validateStep = (stepNumber: number): boolean => {
    if (stepNumber === 1) {
      const trimmedProjectName = projectName.trim();
      const trimmedClientName = clientName.trim();
      const trimmedClientEmail = clientEmail.trim();

      if (!trimmedProjectName) {
        showAlert({
          title: "Nama Proyek Wajib Diisi",
          description: "Mohon tuliskan nama proyek agar kedua pihak memiliki acuan kerja sama yang jelas.",
          type: "warning",
        });
        return false;
      }
      if (!trimmedClientName) {
        showAlert({
          title: "Nama Klien Wajib Diisi",
          description: "Mohon tuliskan nama klien atau penanggung jawab dari pihak pemberi kerja.",
          type: "warning",
        });
        return false;
      }
      if (!trimmedClientEmail) {
        showAlert({
          title: "Email Klien Wajib Diisi",
          description: "Mohon tuliskan email klien untuk pengiriman tautan peninjauan dan persetujuan resmi.",
          type: "warning",
        });
        return false;
      }
      return true;
    }

    if (stepNumber === 2) {
      const cleanDeliverables = deliverables.map((d) => d.trim()).filter((d) => d.length > 0);
      if (cleanDeliverables.length === 0) {
        showAlert({
          title: "Hasil Kerja Wajib Diisi",
          description: "Mohon isi minimal satu butir hasil kerja (deliverable) yang akan diserahkan kepada klien.",
          type: "warning",
        });
        return false;
      }
      return true;
    }

    if (stepNumber === 3) {
      if (safeTotalValue <= 0) {
        showAlert({
          title: "Total Biaya Belum Diisi",
          description: "Mohon masukkan total nilai proyek yang disepakati (minimal Rp1 atau sesuai tarif Anda).",
          type: "warning",
        });
        return false;
      }
      return true;
    }

    if (stepNumber === 4) {
      if (!startDate || !deadline) {
        showAlert({
          title: "Jadwal Belum Lengkap",
          description: "Mohon tentukan tanggal mulai pekerjaan dan tenggat waktu penyelesaian proyek.",
          type: "warning",
        });
        return false;
      }
      if (new Date(deadline) < new Date(startDate)) {
        showAlert({
          title: "Tenggat Waktu Tidak Valid",
          description: "Tenggat selesai tidak boleh lebih awal dari tanggal mulai pekerjaan.",
          type: "warning",
        });
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(5, prev + 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent, sendDirectly: boolean) => {
    e.preventDefault();

    // Validasi seluruh bagian
    for (let s = 1; s <= 4; s++) {
      if (!validateStep(s)) {
        setCurrentStep(s);
        return;
      }
    }

    const trimmedProjectName = projectName.trim();
    const trimmedClientName = clientName.trim();
    const trimmedClientEmail = clientEmail.trim();

    const cleanDeliverables = deliverables.map((d) => d.trim()).filter((d) => d.length > 0);
    const cleanExclusions = exclusions.map((x) => x.trim()).filter((x) => x.length > 0);

    // Fallback klausul standar jika dibiarkan kosong
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
        parentAgreementId: parentAgreement?.id,
        parentContractId: parentAgreement?.contractId,
      };

      const created = await createAgreement(content, {
        sendDirectly,
        useCredit: !isPro && useCredit,
        parentAgreementId: parentAgreement?.id,
        parentContractId: parentAgreement?.contractId,
      });
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
    listKey: string,
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
        <button
          type="button"
          onClick={() => handleAddListItem(listKey, list, setList)}
          className="btn btn-secondary btn-sm text-xs font-semibold"
        >
          <Plus className="w-4 h-4" />
          Tambah Baris
        </button>
      </div>
      <div className="space-y-2">
        {list.map((item, idx) => {
          const itemKey = `${listKey}-${idx}`;
          return (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-400 w-5 text-right">{bullet(idx)}</span>
              <input
                ref={(el) => {
                  inputRefs.current[itemKey] = el;
                }}
                type="text"
                value={item}
                onChange={(e) => updateList(list, setList, idx, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddListItem(listKey, list, setList);
                  }
                }}
                placeholder={typeof placeholder === "function" ? placeholder(idx) : placeholder}
                className="input"
              />
              {list.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    delete inputRefs.current[itemKey];
                    setList(list.filter((_, i) => i !== idx));
                  }}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  aria-label="Hapus baris"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <Link href="/dashboard" className="back-link mb-6">
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Dashboard
      </Link>

      {/* Header Utama Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-6 mb-8 border-b border-[#E8E8EC]">
        <div>
          <p className="kicker">Penyusunan Kesepakatan Kerja</p>
          <h1 className="page-title mt-1 font-display">Buat Kesepakatan Kerja</h1>
          <p className="text-sm text-[#6B6B6B] mt-1 leading-relaxed">
            Susun hak, kewajiban, rincian biaya, dan jadwal dalam 5 tahap terstruktur. Dokumen mengikat secara sah dan dapat ditandatangani online.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={fillExampleTemplate}
            className="btn btn-secondary btn-sm text-xs font-semibold"
            title="Isi formulir dengan contoh realistis"
          >
            <Wand2 className="w-3.5 h-3.5 text-[#6366F1]" />
            Contoh Cepat
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="btn btn-ghost btn-sm text-xs text-[#6B6B6B] hover:text-[#0A0A0A]"
            title="Kosongkan formulir"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Kosongkan
          </button>
        </div>
      </div>

      {/* Banner Khusus Dokumen Addendum */}
      {parentAgreement && (
        <div className="mb-6 p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-100 text-[#6366F1] flex items-center justify-center flex-shrink-0 font-bold font-mono text-xs">
            ADD
          </div>
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold font-display text-indigo-950">
              Dokumen Addendum untuk Kesepakatan {parentAgreement.contractId}
            </h3>
            <p className="text-xs text-indigo-800 leading-relaxed">
              Data klien dan freelancer terhubung langsung dengan kontrak induk &ldquo;{parentAgreement.currentVersion.contentJson.projectName}&rdquo;. Tuliskan luaran tambahan dan nilai addendum di bawah ini.
            </p>
          </div>
        </div>
      )}

      {/* Stepper Progress Bar */}
      <nav aria-label="Tahapan formulir" className="mb-8">
        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {WIZARD_STEPS.map((step) => {
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;
            const isFuture = step.id > currentStep;
            const Icon = step.icon;

            return (
              <button
                key={step.id}
                type="button"
                disabled={isFuture}
                onClick={() => {
                  if (step.id < currentStep) {
                    setCurrentStep(step.id);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
                aria-current={isCurrent ? "step" : undefined}
                className={`relative flex flex-col items-center sm:items-start p-2.5 sm:p-3 rounded-xl border text-left transition-all ${
                  isCurrent
                    ? "border-[#6366F1] bg-indigo-50/40 ring-2 ring-[#6366F1]/20 shadow-xs cursor-default"
                    : isCompleted
                    ? "border-emerald-200 bg-emerald-50/30 hover:border-emerald-300 cursor-pointer"
                    : "border-[#E8E8EC] bg-slate-50/60 opacity-60 cursor-not-allowed"
                }`}
                title={isFuture ? "Selesaikan tahap saat ini terlebih dahulu dan tekan 'Lanjut'" : isCompleted ? `Kembali ke Tahap ${step.id}` : undefined}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                      isCurrent
                        ? "bg-[#6366F1] text-white"
                        : isCompleted
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                  </span>
                  <span
                    className={`hidden sm:inline text-xs font-bold ${
                      isCurrent ? "text-[#6366F1]" : isCompleted ? "text-emerald-900" : "text-slate-600"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                <p className="hidden md:block text-[11px] text-slate-500 truncate w-full">
                  {step.subtitle}
                </p>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Form Body - Terbagi ke dalam 5 Tahap */}
      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
        {/* TAHAP 1: PROYEK & PARA PIHAK */}
        {currentStep === 1 && (
          <section className="card p-6 sm:p-7 space-y-6 animate-in fade-in duration-150">
            <div className="flex items-start gap-3 pb-4 border-b border-[#E8E8EC]">
              <span className="w-8 h-8 rounded-lg bg-[#6366F1] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                1
              </span>
              <div>
                <p className="kicker">Tahap 1 dari 5</p>
                <h2 className="card-title font-display text-lg text-[#0A0A0A]">Proyek & Para Pihak</h2>
                <p className="text-xs sm:text-sm text-[#6B6B6B] mt-0.5">
                  Tentukan judul proyek dan identitas pihak yang mengadakan kesepakatan kerja.
                </p>
              </div>
            </div>

            <div>
              <label className="label">Nama Proyek *</label>
              <input
                type="text"
                required
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Contoh: Pembuatan Website E-Commerce & Desain Identitas Brand"
                className="input"
              />
              <p className="hint">Gunakan nama yang mudah dikenali oleh Anda dan klien saat meninjau dokumen.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
              <div className="doc-box space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <p className="text-sm font-bold text-slate-900">Pihak Pertama (Penyedia Jasa)</p>
                  <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                    Anda
                  </span>
                </div>
                <div>
                  <label className="label">Nama Lengkap</label>
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
                  <label className="label">Email Resmi</label>
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
                  <label className="label">Peran / Keahlian</label>
                  <input
                    type="text"
                    value={freelancerRole}
                    onChange={(e) => setFreelancerRole(e.target.value)}
                    placeholder="Contoh: UI/UX Designer & Web Developer"
                    className="input"
                  />
                </div>
              </div>

              <div className="doc-box space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <p className="text-sm font-bold text-slate-900">Pihak Kedua (Reviewer / Klien)</p>
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                    Reviewer
                  </span>
                </div>
                <div>
                  <label className="label">Nama Klien / Penanggung Jawab *</label>
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
                  <label className="label">Email Klien *</label>
                  <input
                    type="email"
                    required
                    placeholder="Contoh: rina.hartono@perusahaan.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="input"
                  />
                  <p className="hint">Tautan tinjauan kesepakatan akan ditujukan ke alamat email ini.</p>
                </div>
                <div>
                  <label className="label">No. WhatsApp Klien</label>
                  <input
                    type="text"
                    placeholder="Contoh: 081298765432"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Nama Perusahaan / Bisnis (Opsional)</label>
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
          </section>
        )}

        {/* TAHAP 2: RUANG LINGKUP PEKERJAAN */}
        {currentStep === 2 && (
          <section className="card p-6 sm:p-7 space-y-6 animate-in fade-in duration-150">
            <div className="flex items-start gap-3 pb-4 border-b border-[#E8E8EC]">
              <span className="w-8 h-8 rounded-lg bg-[#6366F1] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                2
              </span>
              <div>
                <p className="kicker">Tahap 2 dari 5</p>
                <h2 className="card-title font-display text-lg text-[#0A0A0A]">Ruang Lingkup & Hasil Kerja</h2>
                <p className="text-xs sm:text-sm text-[#6B6B6B] mt-0.5">
                  Rincikan secara transparan apa saja yang akan diserahkan dan apa yang di luar cakupan pekerjaan.
                </p>
              </div>
            </div>

            <div>
              <label className="label">Gambaran Umum Proyek</label>
              <textarea
                rows={3}
                value={scopeDesc}
                onChange={(e) => setScopeDesc(e.target.value)}
                placeholder="Contoh: Pembuatan desain antarmuka dan pengembangan sistem website responsif sesuai spesifikasi fitur yang disepakati bersama."
                className="input leading-relaxed"
              />
              <p className="hint">Ringkasan singkat tentang tujuan dan latar belakang pekerjaan.</p>
            </div>

            {listEditor(
              "deliverables",
              "Hasil Kerja yang Diserahkan (Deliverables) *",
              "Daftar konkret apa yang akan diterima klien saat serah terima proyek (minimal 1 butir).",
              deliverables,
              setDeliverables,
              getDeliverablePlaceholder,
              (i) => `${i + 1}.`
            )}

            {listEditor(
              "exclusions",
              "Batasan & Hal yang Tidak Termasuk (Exclusions)",
              "Tuliskan pekerjaan yang berada di luar kesepakatan ini untuk mencegah permintaan tugas tambahan tanpa biaya.",
              exclusions,
              setExclusions,
              getExclusionPlaceholder,
              () => "•"
            )}

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5 leading-relaxed">
              <p className="font-bold text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Kriteria Penerimaan Standar Sepakatin:
              </p>
              <p>
                Hasil kerja dianggap selesai dan dapat diserahterimakan bila seluruh luaran deliverable telah diserahkan dan berjalan normal sesuai deskripsi kesepakatan.
              </p>
            </div>
          </section>
        )}

        {/* TAHAP 3: BIAYA & SKEMA PEMBAYARAN */}
        {currentStep === 3 && (
          <section className="card p-6 sm:p-7 space-y-6 animate-in fade-in duration-150">
            <div className="flex items-start gap-3 pb-4 border-b border-[#E8E8EC]">
              <span className="w-8 h-8 rounded-lg bg-[#6366F1] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                3
              </span>
              <div>
                <p className="kicker">Tahap 3 dari 5</p>
                <h2 className="card-title font-display text-lg text-[#0A0A0A]">Biaya & Tahapan Pembayaran</h2>
                <p className="text-xs sm:text-sm text-[#6B6B6B] mt-0.5">
                  Tentukan nilai total proyek, skema uang muka (DP), dan batas waktu pelunasan setelah serah terima.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="label">Total Biaya Proyek (Rp) *</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-sm font-bold text-slate-400 pointer-events-none">Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={safeTotalValue > 0 ? safeTotalValue.toLocaleString("id-ID") : ""}
                    onChange={(e) => handleCurrencyChange(e, setTotalValue)}
                    placeholder="Contoh: 5.000.000"
                    className="input pl-10 font-bold text-slate-900"
                  />
                </div>
                <p className="hint font-semibold text-[#6366F1]">
                  {safeTotalValue > 0 ? formatCurrencyIDR(safeTotalValue) : "Tentukan nominal total pekerjaan"}
                </p>
              </div>

              <div>
                <label className="label">Uang Muka (DP)</label>
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
                  <option value="50">50% di awal (Standar Industri)</option>
                  <option value="30">30% di awal</option>
                  <option value="20">20% di awal</option>
                  <option value="70">70% di awal</option>
                  <option value="100">100% lunas di awal</option>
                  <option value="0">Tanpa DP (0% di awal)</option>
                  <option value="custom">Kustom (% atau nominal sendiri)</option>
                </select>
                <p className="hint">
                  {dpSelection !== "custom"
                    ? `DP: ${formatCurrencyIDR(effectiveDpAmount)} (${effectiveDpPercent}%)`
                    : "Atur persentase atau nominal kustom"}
                </p>
              </div>

              <div>
                <label className="label">Batas Waktu Pelunasan</label>
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
                <p className="hint">Maksimal {effectiveDueDays} hari kerja setelah deliverables diterima</p>
              </div>
            </div>

            {/* Panel Pengaturan Kustom DP & Batas Pelunasan */}
            {(dpSelection === "custom" || dueDaysSelection === "custom") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-[#FAFAFA] border border-[#E8E8EC]">
                {dpSelection === "custom" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#4B4B4B] flex items-center gap-1.5">
                        <Coins className="w-3.5 h-3.5 text-[#6366F1]" /> Pengaturan DP Kustom
                      </label>
                      <div className="inline-flex rounded-md border border-[#E8E8EC] bg-white p-0.5 text-xs font-semibold">
                        <button
                          type="button"
                          onClick={() => {
                            setCustomDpMode("percent");
                            setCustomDpPercent(effectiveDpPercent);
                          }}
                          className={`px-2.5 py-1 rounded transition-colors ${
                            customDpMode === "percent"
                              ? "bg-[#6366F1] text-white shadow-xs"
                              : "text-[#6B6B6B] hover:text-[#0A0A0A]"
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
                          className={`px-2.5 py-1 rounded transition-colors ${
                            customDpMode === "amount"
                              ? "bg-[#6366F1] text-white shadow-xs"
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
                          Hasil hitung: DP <strong>{formatCurrencyIDR(effectiveDpAmount)}</strong> dan sisa pelunasan{" "}
                          <strong>{formatCurrencyIDR(effectiveRemainingAmount)}</strong>
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div className="relative flex items-center">
                          <span className="absolute left-3.5 text-sm font-bold text-slate-400 pointer-events-none">Rp</span>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={customDpAmount > 0 ? customDpAmount.toLocaleString("id-ID") : ""}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/\D/g, "");
                              const val = raw ? Math.min(safeTotalValue, parseInt(raw, 10)) : 0;
                              setCustomDpAmount(val);
                              if (safeTotalValue > 0) {
                                setCustomDpPercent(Math.min(100, Math.round((val / safeTotalValue) * 100)));
                              }
                            }}
                            placeholder="Contoh: 1.500.000"
                            className="input pl-10 font-bold"
                          />
                        </div>
                        <p className="text-xs text-slate-500 mt-1.5">
                          Hasil hitung: DP <strong>{effectiveDpPercent}%</strong> ({formatCurrencyIDR(effectiveDpAmount)}) dan sisa{" "}
                          <strong>{formatCurrencyIDR(effectiveRemainingAmount)}</strong>
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {dueDaysSelection === "custom" && (
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#6366F1]" /> Batas Pelunasan Kustom
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
                      <span className="text-sm font-semibold text-[#4B4B4B]">hari kerja setelah serah terima</span>
                    </div>
                    {estimatedDueDateStr && (
                      <p className="text-xs text-[#6B6B6B] bg-white border border-[#E8E8EC] rounded-md p-2 mt-1.5">
                        Estimasi jatuh tempo: <strong className="text-[#6366F1]">{estimatedDueDateStr}</strong> (dihitung dari tanggal tenggat proyek).
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="label">Cara Pembayaran & Nomor Rekening</label>
              <input
                type="text"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                placeholder="Contoh: Transfer Bank BCA 123-456-7890 a.n. Fadli Bilal / QRIS"
                className="input"
              />
              <p className="hint">Klien akan mentransfer pembayaran uang muka dan pelunasan ke rekening ini.</p>
            </div>

            {/* Rincian Tahap Pembayaran (Milestones) */}
            {milestones.length > 0 && (
              <div className="rounded-xl border border-[#E8E8EC] divide-y divide-[#E8E8EC] text-sm bg-white overflow-hidden shadow-xs">
                <div className="px-4 py-2.5 bg-[#FAFAFA] flex items-center justify-between">
                  <p className="text-xs font-semibold text-[#4B4B4B] flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5 text-[#6366F1]" />
                    Tahapan Pembayaran Otomatis (Termin)
                  </p>
                  <span className="text-xs font-bold font-display text-[#0A0A0A]">Total: {formatCurrencyIDR(safeTotalValue)}</span>
                </div>
                {milestones.map((m, idx) => (
                  <div key={idx} className="px-4 py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#F4F4F6] text-[#4B4B4B] font-mono font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-[#4B4B4B]">{m.title}</span>
                    </div>
                    <span className="font-bold font-display text-[#0A0A0A]">{formatCurrencyIDR(m.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* TAHAP 4: KETENTUAN, REVISI, JADWAL & HAK CIPTA */}
        {currentStep === 4 && (
          <section className="card p-6 sm:p-7 space-y-6 animate-in fade-in duration-150">
            <div className="flex items-start gap-3 pb-4 border-b border-[#E8E8EC]">
              <span className="w-8 h-8 rounded-lg bg-[#6366F1] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                4
              </span>
              <div>
                <p className="kicker">Tahap 4 dari 5</p>
                <h2 className="card-title font-display text-lg text-[#0A0A0A]">Ketentuan Revisi, Jadwal & Legalitas</h2>
                <p className="text-xs sm:text-sm text-[#6B6B6B] mt-0.5">
                  Batasi jatah revisi, tentukan tenggat waktu penyelesaian, dan tetapkan kepemilikan hak cipta.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="label mb-0">Jatah Revisi Gratis</label>
                  <span className="text-[11px] text-slate-500 font-medium">Bisa mulai dari 0</span>
                </div>

                {/* Preset Tombol Cepat */}
                <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                  {[0, 1, 2, 3, 5].map((val) => {
                    const isSelected = revisionCount === val;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setRevisionCount(val)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          isSelected
                            ? "bg-[#6366F1] text-white shadow-2xs"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {val === 0 ? "0x (Tanpa Revisi)" : `${val}x`}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={revisionCount}
                    onChange={(e) => setRevisionCount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    placeholder="0"
                    className="input w-24 font-bold text-center"
                  />
                  <span className="text-sm font-semibold text-slate-700">kali putaran revisi</span>
                </div>
                <p className="hint">
                  {revisionCount === 0
                    ? "Tanpa revisi gratis. Seluruh perubahan klausul/luaran disepakati lewat tarif tambahan atau Addendum."
                    : `Standar umum: ${revisionCount} kali putaran penyesuaian minor tanpa biaya tambahan.`}
                </p>
              </div>

              <div>
                <label className="label">Tarif Revisi Tambahan (Rp/Revisi)</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-sm font-bold text-slate-400 pointer-events-none">Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={extraRevisionRate > 0 ? extraRevisionRate.toLocaleString("id-ID") : ""}
                    onChange={(e) => handleCurrencyChange(e, setExtraRevisionRate)}
                    placeholder="Contoh: 300.000"
                    className="input pl-10 font-bold"
                  />
                </div>
                <p className="hint">
                  {extraRevisionRate > 0
                    ? `Biaya Rp${extraRevisionRate.toLocaleString("id-ID")}/revisi jika jatah di atas telah habis.`
                    : "Gratis atau disepakati terpisah via Addendum."}
                </p>
              </div>
            </div>

            <div>
              <label className="label">Ketentuan Ruang Lingkup Revisi</label>
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
                <ClipboardList className="w-4 h-4 text-blue-700" /> Prinsip Hukum Batas Revisi Sepakatin
              </p>
              <p>
                {revisionCount === 0
                  ? "Proyek ini tidak memiliki jatah revisi gratis (0x). Setiap permintaan penyesuaian disepakati dengan biaya terpisah."
                  : `Revisi selama masih dalam jatah (${revisionCount}x) dicatat langsung tanpa biaya tambahan.`}
              </p>
              <p className="text-blue-800">
                Jika terjadi permintaan di luar jatah atau ada penambahan deliverables, Anda dapat menerbitkan <strong>Dokumen Addendum</strong> dengan tarif tambahan Rp{(extraRevisionRate || 0).toLocaleString("id-ID")}/revisi.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="label">Tanggal Mulai Proyek *</label>
                <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input" />
              </div>
              <div>
                <label className="label">Tenggat Selesai Proyek *</label>
                <input type="date" required value={deadline} onChange={(e) => setDeadline(e.target.value)} className="input" />
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="label">Kepemilikan Hak Cipta (Hak Kekayaan Intelektual)</label>
                <textarea
                  rows={2}
                  value={ipTerms}
                  onChange={(e) => setIpTerms(e.target.value)}
                  placeholder="Contoh: Hak cipta dan seluruh file master hasil kerja diserahkan penuh kepada Klien setelah pembayaran dilunasi 100%."
                  className="input leading-relaxed"
                />
                <p className="hint">Melindungi Anda dari klaim kepemilikan sebelum pembayaran selesai dilunasi.</p>
              </div>

              <div>
                <label className="label">Ketentuan Pembatalan Sepihak</label>
                <textarea
                  rows={2}
                  value={terminationTerms}
                  onChange={(e) => setTerminationTerms(e.target.value)}
                  placeholder="Contoh: Apabila proyek dibatalkan sepihak oleh Klien, Klien wajib membayar kompensasi atas tahapan pekerjaan yang sudah selesai dikerjakan."
                  className="input leading-relaxed"
                />
                <p className="hint">Menjamin kompensasi atas waktu dan hasil kerja yang telah diselesaikan.</p>
              </div>
            </div>

            {/* Opsi Penerbitan Dokumen (Gratis vs Kredit Per Proyek / Pro) */}
            <div className="pt-2">
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
                      Dokumen ini otomatis berfitur resmi lengkap: Tanda Tangan Digital Resmi (gores layar), bersih tanpa watermark, pengunci batas revisi, dan riwayat addendum tanpa batas.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Format Penerbitan Dokumen</h3>
                      <p className="text-xs text-slate-500">Pilih tipe dokumen untuk kesepakatan ini:</p>
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
                              ? "border-[#6366F1] bg-indigo-50/50 ring-2 ring-[#6366F1]/20 shadow-xs"
                              : "border-[#E8E8EC] hover:border-[#6366F1]/40 bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-bold font-display text-[#0A0A0A]">{opt.title}</p>
                            {opt.badge && (
                              <span className="text-[10px] font-semibold text-[#6366F1] bg-indigo-100 px-2 py-0.5 rounded">
                                {opt.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-[#6366F1] mt-1">{opt.note}</p>
                          <ul className="mt-2.5 space-y-1 text-xs text-[#6B6B6B]">
                            {opt.features.map((f, i) => (
                              <li key={i} className="flex items-center gap-1.5">
                                <span className="text-[#6366F1] font-bold">•</span>
                                <span>{f}</span>
                              </li>
                            ))}
                          </ul>
                        </button>
                      ))}
                    </div>
                  )}

                  {blocked && (
                    <p className="text-sm text-amber-900 bg-amber-50/70 border border-amber-200 rounded-xl px-4 py-3">
                      Kuota paket Gratis sudah penuh dan kredit Per Proyek habis. Selesaikan atau batalkan kesepakatan lama di
                      dashboard, atau <Link href="/#harga" className="font-semibold underline text-[#6366F1]">tambah kredit / upgrade ke Pro</Link>.
                    </p>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* TAHAP 5: TINJAU RINGKASAN & SIMPAN (REVIEW STEP) */}
        {currentStep === 5 && (
          <section className="space-y-6 animate-in fade-in duration-150">
            <div className="card p-6 sm:p-7 space-y-6">
              <div className="flex items-start gap-3 pb-4 border-b border-[#E8E8EC]">
                <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                  5
                </span>
                <div>
                  <p className="kicker">Tahap 5 dari 5</p>
                  <h2 className="card-title font-display text-lg text-[#0A0A0A]">Tinjau Ringkasan & Terbitkan</h2>
                  <p className="text-xs sm:text-sm text-[#6B6B6B] mt-0.5">
                    Periksa kembali data kesepakatan sebelum disimpan sebagai draf atau dikirimkan langsung ke klien.
                  </p>
                </div>
              </div>

              {/* Ringkasan Pra-Penerbitan (Pre-Submission Summary) */}
              <div className="space-y-4">
                {/* Bagian 1: Proyek & Kontak */}
                <div className="doc-box space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">1. Nama Proyek & Para Pihak</span>
                    <button type="button" onClick={() => setCurrentStep(1)} className="text-xs font-semibold text-[#6366F1] hover:underline">
                      Edit
                    </button>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{projectName || "(Nama proyek belum diisi)"}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 pt-1 border-t border-slate-200">
                    <div>
                      <p className="font-bold text-slate-900">Penyedia Jasa (Anda):</p>
                      <p>{freelancerName || user.fullName} {freelancerRole ? `(${freelancerRole})` : ""}</p>
                      <p>{freelancerEmail || user.email} {freelancerPhone ? `• ${freelancerPhone}` : ""}</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Reviewer / Klien:</p>
                      <p>{clientName || "(Nama klien belum diisi)"} {clientCompany ? `(${clientCompany})` : ""}</p>
                      <p>{clientEmail || "(Email belum diisi)"} {clientPhone ? `• ${clientPhone}` : ""}</p>
                    </div>
                  </div>
                </div>

                {/* Bagian 2: Ruang Lingkup & Luaran */}
                <div className="doc-box space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">2. Ruang Lingkup & Hasil Kerja</span>
                    <button type="button" onClick={() => setCurrentStep(2)} className="text-xs font-semibold text-[#6366F1] hover:underline">
                      Edit
                    </button>
                  </div>
                  {scopeDesc && <p className="text-xs text-slate-700 italic leading-relaxed">&ldquo;{scopeDesc}&rdquo;</p>}
                  <div>
                    <p className="text-xs font-bold text-slate-900 mb-1.5">Hasil Kerja yang Diserahkan (Deliverables):</p>
                    <ul className="space-y-1 text-xs text-slate-700">
                      {deliverables.filter((d) => d.trim().length > 0).map((d, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="font-bold text-emerald-600">{i + 1}.</span>
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {exclusions.filter((x) => x.trim().length > 0).length > 0 && (
                    <div className="pt-2 border-t border-slate-200">
                      <p className="text-xs font-bold text-slate-900 mb-1">Di Luar Kesepakatan (Exclusions):</p>
                      <ul className="space-y-0.5 text-xs text-slate-600">
                        {exclusions.filter((x) => x.trim().length > 0).map((x, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-slate-400">•</span>
                            <span>{x}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Bagian 3: Biaya & Termin */}
                <div className="doc-box space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">3. Biaya & Skema Pembayaran</span>
                    <button type="button" onClick={() => setCurrentStep(3)} className="text-xs font-semibold text-[#6366F1] hover:underline">
                      Edit
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-xs text-slate-500">Total Biaya Kesepakatan</p>
                      <p className="text-lg font-bold font-display text-slate-900">{formatCurrencyIDR(safeTotalValue)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Uang Muka (DP)</p>
                      <p className="text-sm font-bold text-indigo-700">
                        {formatCurrencyIDR(effectiveDpAmount)} ({effectiveDpPercent}%)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Sisa Pelunasan</p>
                      <p className="text-sm font-bold text-slate-900">
                        {formatCurrencyIDR(effectiveRemainingAmount)} ({remainingPercent}%)
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 pt-2 border-t border-slate-200">
                    <strong>Cara Pembayaran:</strong> {paymentMethod || "Transfer Bank / Rekening Resmi Penyedia Jasa"}
                  </p>
                </div>

                {/* Bagian 4: Ketentuan & Jadwal */}
                <div className="doc-box space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">4. Jadwal & Ketentuan Revisi</span>
                    <button type="button" onClick={() => setCurrentStep(4)} className="text-xs font-semibold text-[#6366F1] hover:underline">
                      Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                    <div>
                      <p><strong>Periode Pekerjaan:</strong> {startDate} s.d. {deadline}</p>
                      <p><strong>Batas Pelunasan:</strong> Maksimal {effectiveDueDays} hari kerja setelah serah terima</p>
                    </div>
                    <div>
                      <p>
                        <strong>Jatah Revisi Gratis:</strong>{" "}
                        {revisionCount === 0 ? "0 kali (Tanpa revisi gratis)" : `${revisionCount} kali putaran`}
                      </p>
                      <p><strong>Tarif Revisi Tambahan:</strong> {formatCurrencyIDR(extraRevisionRate || 0)} / revisi</p>
                    </div>
                  </div>
                </div>

                {/* Format Dokumen yang Diterbitkan */}
                <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <FileCheck className="w-4 h-4 text-[#6366F1]" />
                    <div>
                      <p className="font-bold text-indigo-950">
                        {isPro
                          ? "Dokumen Berfitur Resmi Penuh (Langganan Pro)"
                          : useCredit
                          ? "Dokumen Berfitur Resmi Penuh (Pakai 1 Kredit Proyek)"
                          : "Dokumen Paket Gratis (Watermark Sepakatin)"}
                      </p>
                      <p className="text-indigo-800">
                        {isPro || useCredit
                          ? "Termasuk Tanda Tangan Digital Resmi (gores layar), tanpa watermark, dan verifikasi SHA-256."
                          : "Termasuk draf standar dan persetujuan online."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Petunjuk Langkah Selanjutnya */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed space-y-1">
              <p className="font-bold text-slate-900">Langkah Setelah Penyimpanan:</p>
              <p>
                - <strong>Simpan Draf:</strong> Disimpan di dashboard Anda tanpa mengirim notifikasi ke klien. Anda masih bisa mengeditnya kapan saja.
              </p>
              <p>
                - <strong>Simpan & Kirim ke Klien:</strong> Nomor dokumen langsung diterbitkan dan tautan persetujuan siap Anda bagikan kepada klien melalui WhatsApp atau email.
              </p>
            </div>
          </section>
        )}

        {submitError && (
          <p className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">{submitError}</p>
        )}

        {/* Action Bar Navigasi Tahap */}
        <div className="card p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={isSubmitting}
                className="btn btn-secondary flex-1 sm:flex-none"
              >
                <ArrowLeft className="w-4 h-4" />
                Sebelumnya
              </button>
            )}

            {currentStep < 5 && (
              <button
                type="button"
                onClick={(e) => handleSubmit(e, false)}
                disabled={isSubmitting || blocked}
                className="btn border border-slate-300 bg-white hover:bg-slate-50 text-slate-900 font-semibold text-xs px-3.5 py-2 rounded-lg shadow-2xs flex items-center gap-2 transition-all"
                title="Simpan draf sekarang tanpa harus sampai tahap akhir"
              >
                <Save className="w-3.5 h-3.5 text-slate-700" />
                <span>Simpan Draf Sekarang</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="btn btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <span>Lanjut ke Tahap {currentStep + 1}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="submit"
                  disabled={isSubmitting || blocked}
                  className="btn border border-slate-300 bg-white hover:bg-slate-100 text-slate-900 font-bold px-4 py-2.5 rounded-lg shadow-2xs flex-1 sm:flex-none flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4 text-slate-700" />
                  <span>{isSubmitting ? "Menyimpan..." : "Simpan sebagai Draf"}</span>
                </button>
                <button
                  type="button"
                  disabled={isSubmitting || blocked}
                  onClick={(e) => handleSubmit(e, true)}
                  className="btn btn-primary flex-1 sm:flex-none"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? "Menerbitkan..." : "Simpan & Kirim ke Klien"}
                </button>
              </div>
            )}
          </div>
        </div>
      </form>

      <ModalDialog onClose={closeDialog} {...dialogState} />
    </div>
  );
}
