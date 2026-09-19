"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Copy,
  Check,
  Printer,
  ShieldCheck,
  Send,
  CheckCircle2,
  Lock,
  ExternalLink,
  PlusCircle,
  Stamp,
  MessageSquare,
  Trash2,
  AlertTriangle,
  Clock,
  X,
} from "lucide-react";
import {
  getAgreement,
  approveVersion,
  sendAgreementToClient,
  createNewVersion,
  uploadEMaterai,
  removeEMaterai,
  submitVisualSignature,
} from "@/lib/store";
import { ActivityLogItem, AgreementRecord, ContractContentJSON, CopyType } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";
import { SignaturePad } from "@/components/SignaturePad";
import { AgreementDocument } from "@/components/AgreementDocument";
import { RequireAuth } from "@/components/RequireAuth";
import { generateSampleEMateraiDataUrl } from "@/lib/ematerai-sample";
import { formatDateID, formatDateTimeID } from "@/lib/crypto";

type TabId = "document" | "ematerai" | "approvals" | "changes" | "audit";

const EVENT_LABELS: Record<ActivityLogItem["eventType"], string> = {
  CREATED: "Dibuat",
  SENT_TO_CLIENT: "Dikirim ke klien",
  VIEWED_BY_CLIENT: "Dibuka klien",
  CHANGE_REQUESTED: "Minta perubahan",
  VERSION_BUMPED: "Pembaruan",
  FREELANCER_APPROVED: "Freelancer",
  CLIENT_APPROVED: "Klien",
  AGREED_LOCKED: "Disepakati",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

const CHANGE_STATUS: Record<string, { label: string; style: string }> = {
  OPEN: { label: "Menunggu ditindaklanjuti", style: "bg-amber-50 text-amber-800 border-amber-200" },
  APPLIED: { label: "Sudah diterapkan", style: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  REJECTED: { label: "Ditolak", style: "bg-rose-50 text-rose-700 border-rose-200" },
};

export default function AgreementDetailPage() {
  return <RequireAuth>{() => <AgreementDetail />}</RequireAuth>;
}

function AgreementDetail() {
  const params = useParams();
  const id = params.id as string;

  const [agreement, setAgreement] = useState<AgreementRecord | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [selectedVersionNum, setSelectedVersionNum] = useState<number>(1);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("document");
  const [origin, setOrigin] = useState("");

  // e-Materai
  const [targetCopy, setTargetCopy] = useState<CopyType>("freelancer_copy");
  const [serialNumberInput, setSerialNumberInput] = useState("SN-2026-99824-EMTR");
  const [copiedWaText, setCopiedWaText] = useState(false);
  const [isUploadingMaterai, setIsUploadingMaterai] = useState(false);

  // Perbarui kesepakatan (versi baru)
  const [showNewVersionModal, setShowNewVersionModal] = useState(false);
  const [revisedScopeDesc, setRevisedScopeDesc] = useState("");
  const [revisedTotalValue, setRevisedTotalValue] = useState<number>(0);
  const [revisedDeadline, setRevisedDeadline] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
    async function load() {
      const data = await getAgreement(id);
      if (data) {
        setAgreement(data);
        setSelectedVersionNum(data.currentVersionNumber);
        setRevisedScopeDesc(data.currentVersion.contentJson.scope.description);
        setRevisedTotalValue(data.currentVersion.contentJson.payment.totalValue);
        setRevisedDeadline(data.currentVersion.contentJson.timeline.deadline);
      } else {
        setNotFound(true);
      }
    }
    load();
  }, [id]);

  if (notFound) {
    return (
      <div className="w-full max-w-lg mx-auto px-4 py-20">
        <div className="card p-8 text-center space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Kesepakatan tidak ditemukan</h2>
          <p className="text-sm text-slate-500">Mungkin sudah dihapus atau link-nya salah.</p>
          <Link href="/dashboard" className="btn btn-primary">Kembali ke Dashboard</Link>
        </div>
      </div>
    );
  }

  if (!agreement) {
    return <div className="container-page py-24 text-center text-sm text-slate-500 animate-pulse">Memuat kesepakatan...</div>;
  }

  const displayVersion =
    agreement.versions.find((v) => v.versionNumber === selectedVersionNum) || agreement.currentVersion;
  const content = displayVersion.contentJson;
  const clientReviewUrl = `${origin}/review/${agreement.reviewToken}`;

  const copyReviewUrl = () => {
    navigator.clipboard.writeText(clientReviewUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const currentApprovals = agreement.approvals.filter(
    (ap) => ap.versionId === agreement.currentVersion.id && ap.status === "APPROVED"
  );
  const freelancerApproval = currentApprovals.find((ap) => ap.role === "freelancer");
  const clientApproval = currentApprovals.find((ap) => ap.role === "client");

  const handleFreelancerApproval = async () => {
    if (freelancerApproval) return;
    if (!confirm(`Setujui versi ${agreement.currentVersionNumber} kesepakatan ini sebagai acuan kerja?`)) return;

    setIsApproving(true);
    try {
      const updated = await approveVersion(agreement.id, "freelancer", content.freelancer.name, content.freelancer.email);
      if (updated) setAgreement({ ...updated });
    } catch (err) {
      console.error("Error approving:", err);
      alert("Gagal menyimpan persetujuan. Coba lagi.");
    } finally {
      setIsApproving(false);
    }
  };

  const handleSendToClient = async () => {
    const updated = await sendAgreementToClient(agreement.id);
    if (updated) {
      setAgreement({ ...updated });
      copyReviewUrl();
      alert("Kesepakatan siap dikirim! Link untuk klien sudah disalin, tinggal tempel di WhatsApp.");
    }
  };

  const handleCreateNewVersionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const base = agreement.currentVersion.contentJson;
    const updatedContent: ContractContentJSON = {
      ...base,
      scope: { ...base.scope, description: revisedScopeDesc },
      payment: { ...base.payment, totalValue: Number(revisedTotalValue) || base.payment.totalValue },
      timeline: { ...base.timeline, deadline: revisedDeadline || base.timeline.deadline },
    };

    const updated = await createNewVersion(agreement.id, updatedContent, base.freelancer.name);
    if (updated) {
      setAgreement({ ...updated });
      setSelectedVersionNum(updated.currentVersionNumber);
      setShowNewVersionModal(false);
      alert(`Kesepakatan diperbarui ke versi ${updated.currentVersionNumber}. Minta klien menyetujui ulang.`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingMaterai(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const updated = await uploadEMaterai(agreement.id, {
          imageUrl: reader.result as string,
          serialNumber: serialNumberInput.trim() || undefined,
          targetCopy,
          uploadedBy: content.freelancer.name,
        });
        if (updated) {
          setAgreement({ ...updated });
          alert("e-Materai berhasil ditempel ke dokumen!");
        }
      } catch (err) {
        console.error("Gagal unggah e-Materai:", err);
        alert(err instanceof Error ? err.message : "Gagal mengunggah e-Materai. Coba lagi.");
      } finally {
        setIsUploadingMaterai(false);
      }
    };
    reader.onerror = () => {
      setIsUploadingMaterai(false);
      alert("Gagal membaca file gambar.");
    };
    reader.readAsDataURL(file);
  };

  const handleUseSampleMaterai = async () => {
    setIsUploadingMaterai(true);
    try {
      const serial = serialNumberInput.trim() || "SN-2026-99824-EMTR";
      const updated = await uploadEMaterai(agreement.id, {
        imageUrl: generateSampleEMateraiDataUrl(serial),
        serialNumber: serial,
        targetCopy,
        uploadedBy: content.freelancer.name,
      });
      if (updated) {
        setAgreement({ ...updated });
        alert("Contoh e-Materai berhasil ditempel!");
      }
    } catch (err) {
      console.error("Gagal pakai contoh e-Materai:", err);
      alert(err instanceof Error ? err.message : "Gagal menempelkan contoh e-Materai. Coba lagi.");
    } finally {
      setIsUploadingMaterai(false);
    }
  };

  const handleRemoveMaterai = async () => {
    if (!confirm("Lepas e-Materai dari dokumen ini?")) return;
    try {
      const updated = await removeEMaterai(agreement.id);
      if (updated) {
        setAgreement({ ...updated });
        alert("e-Materai berhasil dilepas dari dokumen.");
      }
    } catch (err) {
      console.error("Gagal melepas e-Materai:", err);
      alert(err instanceof Error ? err.message : "Gagal melepas e-Materai. Coba lagi.");
    }
  };

  const handleSaveFreelancerSignature = async (sigDataUrl: string) => {
    const updated = await submitVisualSignature(agreement.id, "freelancer", content.freelancer.name, sigDataUrl);
    if (updated) setAgreement({ ...updated });
  };

  const waMessage = `Halo Pak/Bu ${content.client.name}, kesepakatan proyek "${content.projectName}" sudah disetujui dan e-Materai Rp10.000 sudah saya tempel.\n\nSilakan buka link berikut untuk menandatangani:\n${clientReviewUrl}\n\nPenting: mohon tanda tangan di sebelah kanan e-Materai dan jangan sampai menutupi e-Materai, supaya tetap sah. Terima kasih!`;

  const copyWhatsAppMessage = () => {
    navigator.clipboard.writeText(waMessage);
    setCopiedWaText(true);
    setTimeout(() => setCopiedWaText(false), 3000);
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: "document", label: "Isi Kesepakatan" },
    { id: "ematerai", label: agreement.ematerai ? "Materai & TTD ✓" : "Materai & Tanda Tangan" },
    { id: "approvals", label: `Persetujuan (${currentApprovals.length}/2)` },
    { id: "changes", label: `Permintaan Perubahan (${agreement.changeRequests.length})` },
    { id: "audit", label: "Riwayat" },
  ];

  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <Link href="/dashboard" className="back-link">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Dashboard
        </Link>
        <span className="text-sm text-slate-500">
          Nomor dokumen <strong className="text-brand-600">{agreement.contractId}</strong>
        </span>
      </div>

      {/* Ringkasan */}
      <div className="card p-6 sm:p-8 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={agreement.status} />
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                Versi {agreement.currentVersionNumber}
              </span>
              {agreement.status === "AGREED" && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                  <Lock className="w-3 h-3" />
                  Terkunci
                </span>
              )}
            </div>
            <h1 className="page-title">{agreement.currentVersion.contentJson.projectName}</h1>
            <p className="text-sm text-slate-500">
              Dibuat {formatDateID(agreement.createdAt)} · Tenggat {formatDateID(agreement.currentVersion.contentJson.timeline.deadline)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {agreement.status === "DRAFT" && (
              <button onClick={handleSendToClient} className="btn btn-primary btn-sm">
                <Send className="w-4 h-4" />
                Kirim ke Klien
              </button>
            )}
            {!freelancerApproval && (
              <button onClick={handleFreelancerApproval} disabled={isApproving} className="btn btn-primary btn-sm">
                <CheckCircle2 className="w-4 h-4" />
                Setujui
              </button>
            )}
            <Link href={`/agreements/${agreement.id}/print`} className="btn btn-secondary btn-sm">
              <Printer className="w-4 h-4" />
              Cetak / PDF
            </Link>
            <Link href={`/verify/${agreement.contractId}`} className="btn btn-secondary btn-sm">
              <ShieldCheck className="w-4 h-4" />
              Cek Keaslian
            </Link>
          </div>
        </div>

        {/* Link untuk klien */}
        <div className="mt-6 p-4 rounded-xl bg-brand-50/60 border border-brand-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-brand-700">Link untuk klien</p>
            <p className="text-sm text-slate-600 truncate">{clientReviewUrl}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={copyReviewUrl} className="btn btn-primary btn-sm">
              {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedLink ? "Tersalin!" : "Salin Link"}
            </button>
            <Link href={`/review/${agreement.reviewToken}`} target="_blank" className="btn btn-secondary btn-sm">
              Lihat sebagai Klien
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Tab */}
      <div className="flex gap-1 overflow-x-auto p-1 mb-6 rounded-xl bg-slate-100">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab ${activeTab === tab.id ? "tab-active" : "tab-idle"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: ISI KESEPAKATAN */}
      {activeTab === "document" && (
        <div className="space-y-4">
          <div className="card p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500 pl-1">Lihat versi:</span>
              {agreement.versions.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVersionNum(v.versionNumber)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedVersionNum === v.versionNumber
                      ? "bg-brand-600 text-white"
                      : "text-slate-600 bg-slate-100 hover:bg-slate-200"
                  }`}
                >
                  {v.versionNumber}
                </button>
              ))}
            </div>
            <button onClick={() => setShowNewVersionModal(true)} className="btn btn-secondary btn-sm">
              <PlusCircle className="w-4 h-4" />
              Ubah Kesepakatan
            </button>
          </div>

          <AgreementDocument content={content} versionNumber={displayVersion.versionNumber} status={agreement.status}>
            {displayVersion.versionNumber !== agreement.currentVersionNumber && (
              <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                Anda sedang melihat versi lama ({displayVersion.versionNumber}). Versi terbaru adalah versi {agreement.currentVersionNumber}.
              </p>
            )}
          </AgreementDocument>
        </div>
      )}

      {/* TAB: MATERAI & TANDA TANGAN */}
      {activeTab === "ematerai" && (
        <div className="space-y-6">
          <div className="card p-6 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="kicker">Pengesahan dokumen</p>
                <h2 className="text-lg font-bold text-slate-900 mt-0.5">Tempel e-Materai Rp10.000</h2>
              </div>
              {agreement.ematerai ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 self-start">
                  <Stamp className="w-3.5 h-3.5" />
                  e-Materai sudah ditempel
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 self-start">
                  Belum ada e-Materai
                </span>
              )}
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Setelah kedua pihak setuju, Anda bisa menempelkan e-Materai resmi. Klien lalu menandatangani di
              sebelah kanan e-Materai tersebut.
            </p>
          </div>

          <div className="rounded-2xl border border-brand-100 bg-brand-50/60 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="card-title">Belum punya e-Materai?</h3>
              <p className="text-sm text-slate-600 mt-1 max-w-xl">
                Beli e-Materai Rp10.000 di situs resmi <strong>e-meterai.co.id</strong>, unduh gambarnya, lalu unggah di bawah.
              </p>
            </div>
            <a href="https://e-meterai.co.id/" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              Beli e-Materai
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <div className="card p-6 space-y-5">
            <h3 className="card-title">Tempel e-Materai</h3>

            <div>
              <p className="label">Ditempel di salinan milik siapa?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {([
                  {
                    id: "freelancer_copy" as CopyType,
                    title: "Salinan untuk Freelancer",
                    tag: "Di kolom klien",
                    desc: "e-Materai ditempel di kolom tanda tangan klien. Salinan ini Anda simpan.",
                  },
                  {
                    id: "client_copy" as CopyType,
                    title: "Salinan untuk Klien",
                    tag: "Di kolom freelancer",
                    desc: "e-Materai ditempel di kolom tanda tangan Anda. Salinan ini disimpan klien.",
                  },
                ]).map((opt) => (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => setTargetCopy(opt.id)}
                    className={`text-left p-4 rounded-xl border transition-colors ${
                      targetCopy === opt.id ? "border-brand-600 bg-brand-50/60 ring-4 ring-brand-600/10" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-sm font-semibold text-slate-900">{opt.title}</span>
                      <span className="text-[11px] font-semibold text-brand-700 bg-brand-100 px-2 py-0.5 rounded-full">{opt.tag}</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="label">Nomor seri e-Materai</label>
                <input
                  type="text"
                  value={serialNumberInput}
                  onChange={(e) => setSerialNumberInput(e.target.value)}
                  placeholder="Tertera di gambar e-Materai"
                  className="input uppercase"
                />
              </div>
              <div>
                <label className="label">Gambar e-Materai (PNG/JPG)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-brand-600 file:text-white file:rounded-lg hover:file:bg-brand-700 cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-sm text-slate-500">Sedang demo dan belum punya file e-Materai?</span>
              <button type="button" onClick={handleUseSampleMaterai} disabled={isUploadingMaterai} className="btn btn-secondary btn-sm">
                <Stamp className="w-4 h-4" />
                Pakai Contoh e-Materai
              </button>
            </div>
          </div>

          <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-6 space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-amber-900">Tanda tangan tidak boleh menutupi e-Materai</h4>
                <p className="text-sm text-amber-800 leading-relaxed mt-1">
                  Sesuai aturan resmi e-Materai, tanda tangan klien harus di <strong>sebelah kanan</strong> e-Materai dan
                  <strong> tidak boleh menimpanya</strong>, supaya e-Materai tetap bisa dicek keasliannya.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-amber-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  Pesan WhatsApp siap kirim ke klien
                </span>
                <button type="button" onClick={copyWhatsAppMessage} className="btn btn-whatsapp btn-sm">
                  {copiedWaText ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedWaText ? "Pesan Tersalin!" : "Salin Pesan"}
                </button>
              </div>
              <div className="p-4 bg-white border border-amber-200 rounded-xl text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {waMessage}
              </div>
            </div>
          </div>

          {agreement.ematerai && (
            <div className="card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="card-title">e-Materai yang sedang dipakai</h3>
                <button type="button" onClick={handleRemoveMaterai} className="btn btn-ghost btn-sm text-rose-600 hover:text-rose-700 hover:bg-rose-50">
                  <Trash2 className="w-4 h-4" />
                  Lepas
                </button>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-6 doc-box">
                <div className="w-32 h-32 flex-shrink-0 bg-white border border-slate-200 rounded-lg p-1 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={agreement.ematerai.imageUrl} alt="e-Materai" className="max-w-full max-h-full object-contain" />
                </div>
                <div className="text-sm space-y-1 text-slate-700">
                  <p><span className="text-slate-500">Ditempel di:</span> {agreement.ematerai.targetCopy === "freelancer_copy" ? "Salinan freelancer (kolom klien)" : "Salinan klien (kolom freelancer)"}</p>
                  <p><span className="text-slate-500">Nomor seri:</span> {agreement.ematerai.serialNumber || "-"}</p>
                  <p><span className="text-slate-500">Waktu:</span> {formatDateTimeID(agreement.ematerai.uploadedAt)}</p>
                  <p className="text-xs text-slate-500 pt-1">e-Materai ini sudah tampil di dokumen cetak dan di halaman klien.</p>
                </div>
              </div>
            </div>
          )}

          <div className="card p-6 space-y-3">
            <h3 className="card-title">Tanda tangan Anda (Freelancer)</h3>
            <p className="text-sm text-slate-500">Tanda tangan di kotak ini. Tanda tangan akan otomatis tersimpan dan muncul di surat kesepakatan.</p>
            <div className="max-w-sm">
              <SignaturePad signerName={content.freelancer.name} onSave={handleSaveFreelancerSignature} />
            </div>
          </div>
        </div>
      )}

      {/* TAB: PERSETUJUAN */}
      {activeTab === "approvals" && (
        <div className="card p-6 space-y-6">
          <div>
            <h2 className="card-title">Persetujuan kedua pihak</h2>
            <p className="text-sm text-slate-500 mt-1">
              Kesepakatan dianggap sah dan dikunci setelah freelancer dan klien menyetujui versi yang sama.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { title: "Pihak pertama (Freelancer)", party: content.freelancer, approval: freelancerApproval, isClient: false },
              { title: "Pihak kedua (Klien)", party: content.client, approval: clientApproval, isClient: true },
            ].map((p) => (
              <div key={p.title} className="rounded-xl border border-slate-200 p-5 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-900">{p.title}</span>
                  {p.approval ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Sudah setuju
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                      <Clock className="w-3.5 h-3.5" /> Belum setuju
                    </span>
                  )}
                </div>
                <div className="text-sm space-y-1 text-slate-700">
                  <p>{p.party.name}</p>
                  <p className="text-slate-500">{p.party.email}</p>
                  {p.approval ? (
                    <p className="text-emerald-700 pt-1">Disetujui pada {formatDateTimeID(p.approval.approvedAt)}</p>
                  ) : (
                    <p className="text-slate-400 pt-1">
                      {p.isClient ? "Klien belum membuka atau menyetujui versi ini." : "Menunggu persetujuan Anda."}
                    </p>
                  )}
                </div>
                {!p.approval &&
                  (p.isClient ? (
                    <button onClick={copyReviewUrl} className="btn btn-secondary w-full">
                      {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copiedLink ? "Link Tersalin!" : "Salin Link untuk Klien"}
                    </button>
                  ) : (
                    <button onClick={handleFreelancerApproval} disabled={isApproving} className="btn btn-primary w-full">
                      <CheckCircle2 className="w-4 h-4" />
                      Setujui Sekarang
                    </button>
                  ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: PERMINTAAN PERUBAHAN */}
      {activeTab === "changes" && (
        <div className="card p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="card-title">Permintaan perubahan dari klien</h2>
              <p className="text-sm text-slate-500 mt-1">Semua permintaan tercatat, jadi tidak ada lagi “kok beda dengan yang kemarin?”.</p>
            </div>
            <button onClick={() => setShowNewVersionModal(true)} className="btn btn-primary btn-sm">
              <PlusCircle className="w-4 h-4" />
              Ubah Kesepakatan
            </button>
          </div>

          {agreement.changeRequests.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-slate-200 p-10 text-center text-sm text-slate-500">
              Belum ada permintaan perubahan dari klien.
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 divide-y divide-slate-100">
              {agreement.changeRequests.map((cr) => {
                const st = CHANGE_STATUS[cr.status] ?? CHANGE_STATUS.OPEN;
                return (
                  <div key={cr.id} className="p-4 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="text-sm font-semibold text-slate-900">{cr.title}</h4>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${st.style}`}>{st.label}</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{cr.description}</p>
                    <p className="text-xs text-slate-400">
                      Dari {cr.requestedBy} · {formatDateTimeID(cr.createdAt)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB: RIWAYAT */}
      {activeTab === "audit" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card p-6">
            <h2 className="card-title mb-4">Versi dokumen</h2>
            <div className="space-y-2">
              {agreement.versions.map((v) => (
                <div key={v.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Versi {v.versionNumber}</p>
                    <p className="text-xs text-slate-500">{formatDateID(v.createdAt)}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                    <ShieldCheck className="w-4 h-4" />
                    Tersimpan
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6 lg:col-span-2">
            <h2 className="card-title mb-4">Catatan aktivitas</h2>
            <ol className="relative border-l-2 border-slate-100 ml-2 space-y-5">
              {[...agreement.activityLogs].reverse().map((log) => (
                <li key={log.id} className="pl-5 relative">
                  <span className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-brand-600 ring-4 ring-white" />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full self-start">
                      {EVENT_LABELS[log.eventType] ?? "Aktivitas"}
                    </span>
                    <span className="text-xs text-slate-400">{formatDateTimeID(log.createdAt)}</span>
                  </div>
                  <p className="text-sm text-slate-700 mt-1.5">{log.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {/* MODAL: UBAH KESEPAKATAN */}
      {showNewVersionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="kicker">Ubah kesepakatan</p>
                <h3 className="text-lg font-bold text-slate-900">Buat versi {agreement.currentVersionNumber + 1}</h3>
                <p className="text-sm text-slate-500 mt-1">Versi lama tetap tersimpan. Klien perlu menyetujui ulang versi baru ini.</p>
              </div>
              <button onClick={() => setShowNewVersionModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100" aria-label="Tutup">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewVersionSubmit} className="space-y-4">
              <div>
                <label className="label">Gambaran pekerjaan</label>
                <textarea rows={3} required value={revisedScopeDesc} onChange={(e) => setRevisedScopeDesc(e.target.value)} className="input leading-relaxed" />
              </div>
              <div>
                <label className="label">Total harga (Rp)</label>
                <input type="number" required value={revisedTotalValue} onChange={(e) => setRevisedTotalValue(Number(e.target.value))} className="input" />
              </div>
              <div>
                <label className="label">Tenggat selesai</label>
                <input type="date" required value={revisedDeadline} onChange={(e) => setRevisedDeadline(e.target.value)} className="input" />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowNewVersionModal(false)} className="btn btn-secondary">
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Simpan Versi {agreement.currentVersionNumber + 1}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
