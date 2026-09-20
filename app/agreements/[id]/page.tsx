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
  FileText,
  Download,
  UploadCloud,
} from "lucide-react";
import {
  getAgreement,
  approveVersion,
  sendAgreementToClient,
  createNewVersion,
  uploadStampedDocument,
  removeStampedDocument,
  submitVisualSignature,
} from "@/lib/store";
import { ActivityLogItem, AgreementRecord, ContractContentJSON, StampedDocumentRecord } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";
import { SignaturePad } from "@/components/SignaturePad";
import { AgreementDocument } from "@/components/AgreementDocument";
import { RequireAuth } from "@/components/RequireAuth";
import { generateSampleStampedPdfDataUrl } from "@/lib/ematerai-sample";
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

  // Dokumen Bermeterai
  const [isUploadingDoc, setIsUploadingDoc] = useState<string | null>(null);
  const [copiedWaText, setCopiedWaText] = useState(false);

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

  const freelancerStampedDoc = agreement.stampedDocuments?.find((d) => d.copyType === "freelancer_copy");
  const clientStampedDoc = agreement.stampedDocuments?.find((d) => d.copyType === "client_copy");
  const stampedCount = (freelancerStampedDoc ? 1 : 0) + (clientStampedDoc ? 1 : 0);

  const handleDocumentPdfUpload = (copyType: "freelancer_copy" | "client_copy", e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      alert("Mohon pilih file berkas berformat PDF.");
      return;
    }

    if (file.size > 7 * 1024 * 1024) {
      alert("Ukuran file PDF terlalu besar (maksimal 7 MB).");
      return;
    }

    setIsUploadingDoc(copyType);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const updated = await uploadStampedDocument(agreement.id, {
          copyType,
          fileName: file.name,
          fileUrl: reader.result as string,
          fileSize: file.size,
        });
        if (updated) {
          setAgreement({ ...updated });
          const copyLabel = copyType === "freelancer_copy" ? "Salinan Freelancer" : "Salinan Klien";
          alert(`File ${copyLabel} bermeterai resmi berhasil diunggah!`);
        }
      } catch (err) {
        console.error("Gagal unggah dokumen bermeterai:", err);
        alert(err instanceof Error ? err.message : "Gagal mengunggah dokumen. Coba lagi.");
      } finally {
        setIsUploadingDoc(null);
        e.target.value = "";
      }
    };
    reader.onerror = () => {
      setIsUploadingDoc(null);
      alert("Gagal membaca file PDF.");
    };
    reader.readAsDataURL(file);
  };

  const handleUseSampleDocumentPdf = async (copyType: "freelancer_copy" | "client_copy") => {
    setIsUploadingDoc(copyType);
    try {
      const fileName = `${agreement.contractId}-${copyType === "freelancer_copy" ? "Salinan-Freelancer" : "Salinan-Klien"}-Bermeterai.pdf`;
      const pdfDataUrl = generateSampleStampedPdfDataUrl(agreement.contractId, copyType, content.projectName);
      const updated = await uploadStampedDocument(agreement.id, {
        copyType,
        fileName,
        fileUrl: pdfDataUrl,
        fileSize: 42500,
        notes: "Contoh dokumen resmi bermeterai elektronik Peruri",
      });
      if (updated) {
        setAgreement({ ...updated });
        const copyLabel = copyType === "freelancer_copy" ? "Salinan Freelancer" : "Salinan Klien";
        alert(`Contoh berkas ${copyLabel} bermeterai berhasil dipasang!`);
      }
    } catch (err) {
      console.error("Gagal memasang contoh dokumen:", err);
      alert(err instanceof Error ? err.message : "Gagal memasang contoh dokumen.");
    } finally {
      setIsUploadingDoc(null);
    }
  };

  const handleRemoveStampedDoc = async (copyType: "freelancer_copy" | "client_copy") => {
    const copyLabel = copyType === "freelancer_copy" ? "Salinan Freelancer" : "Salinan Klien";
    if (!confirm(`Hapus berkas ${copyLabel} bermeterai ini dari sistem?`)) return;
    setIsUploadingDoc(copyType);
    try {
      const updated = await removeStampedDocument(agreement.id, copyType);
      if (updated) {
        setAgreement({ ...updated });
        alert(`Berkas ${copyLabel} berhasil dihapus.`);
      }
    } catch (err) {
      console.error("Gagal menghapus dokumen:", err);
      alert(err instanceof Error ? err.message : "Gagal menghapus dokumen.");
    } finally {
      setIsUploadingDoc(null);
    }
  };

  const handleDownloadDoc = (doc: StampedDocumentRecord) => {
    const link = document.createElement("a");
    link.href = doc.fileUrl;
    link.download = doc.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const handleSaveFreelancerSignature = async (sigDataUrl: string) => {
    const updated = await submitVisualSignature(agreement.id, "freelancer", content.freelancer.name, sigDataUrl);
    if (updated) setAgreement({ ...updated });
  };

  const waMessage = `Halo Pak/Bu ${content.client.name}, kesepakatan proyek "${content.projectName}" (${agreement.contractId}) telah selesai dibubuhi e-Meterai resmi Rp10.000.\n\nSalinan Klien yang sudah bermeterai resmi dapat Anda unduh langsung melalui tautan review berikut:\n${clientReviewUrl}\n\nTerima kasih!`;

  const copyWhatsAppMessage = () => {
    navigator.clipboard.writeText(waMessage);
    setCopiedWaText(true);
    setTimeout(() => setCopiedWaText(false), 3000);
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: "document", label: "Isi Kesepakatan" },
    {
      id: "ematerai",
      label:
        stampedCount === 2
          ? "Dokumen Bermeterai (2/2) ✓"
          : stampedCount > 0
          ? `Dokumen Bermeterai (${stampedCount}/2)`
          : agreement.ematerai
          ? "Dokumen Bermeterai ✓"
          : "Dokumen Bermeterai",
    },
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

      {/* TAB: DOKUMEN BERMETERAI */}
      {activeTab === "ematerai" && (
        <div className="space-y-6">
          {/* Header Kartu */}
          <div className="card p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="kicker">Pengesahan dokumen resmi</p>
                <h2 className="text-lg font-bold text-slate-900 mt-0.5">Dokumen Bermeterai Resmi (Upload PDF Rangkap 2)</h2>
              </div>
              {stampedCount === 2 ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 self-start">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  2/2 Salinan Bermeterai Lengkap
                </span>
              ) : stampedCount === 1 ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300 self-start">
                  <Clock className="w-3.5 h-3.5" />
                  1/2 Salinan Diunggah
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 self-start">
                  0/2 Salinan Diunggah
                </span>
              )}
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Sesuai ketentuan hukum <strong>UU Bea Meterai No. 10 Tahun 2020</strong> dan aturan Peruri, e-meterai resmi dibubuhkan melalui
              portal resmi distributor e-meterai. Dokumen kesepakatan dibuat <strong>rangkap 2 (dua)</strong>:
              Salinan Freelancer dan Salinan Klien, yang kemudian diunggah kembali ke Sepakatin agar tersimpan aman dan dapat diunduh masing-masing pihak.
            </p>
          </div>

          {/* Panduan Alur 3 Langkah */}
          <div className="rounded-2xl border border-brand-100 bg-brand-50/50 p-6 space-y-4">
            <h3 className="text-sm font-bold text-brand-950 uppercase tracking-wide">
              Alur Pembubuhan Dokumen Bermeterai Resmi
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white border border-brand-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-brand-100 text-brand-800">Langkah 1</span>
                  <FileText className="w-4 h-4 text-brand-600" />
                </div>
                <h4 className="text-sm font-semibold text-slate-900">Unduh Draf Final</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Unduh draf kesepakatan bersih (format standar A4) yang sudah disetujui kedua pihak.
                </p>
                <Link
                  href={`/agreements/${agreement.id}/print`}
                  target="_blank"
                  className="btn btn-secondary btn-sm w-full mt-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  Unduh PDF Draf
                </Link>
              </div>

              <div className="p-4 rounded-xl bg-white border border-brand-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-brand-100 text-brand-800">Langkah 2</span>
                  <ExternalLink className="w-4 h-4 text-brand-600" />
                </div>
                <h4 className="text-sm font-semibold text-slate-900">Bubuhkan e-Meterai</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Beli &amp; bubuhkan e-Meterai Rp10.000 di portal distributor resmi (PosFin, Peruri, Privy, dll).
                </p>
                <a
                  href="https://e-meterai.co.id/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm w-full mt-1"
                >
                  Buka e-meterai.co.id
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="p-4 rounded-xl bg-white border border-brand-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-brand-100 text-brand-800">Langkah 3</span>
                  <UploadCloud className="w-4 h-4 text-brand-600" />
                </div>
                <h4 className="text-sm font-semibold text-slate-900">Unggah ke Sepakatin</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Unggah file PDF Salinan Freelancer &amp; Salinan Klien di bawah agar klien dapat mengunduhnya.
                </p>
                <span className="block text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded text-center">
                  Tersimpan aman &amp; siap unduh
                </span>
              </div>
            </div>
          </div>

          {/* Aturan Hukum Salinan 2 Pihak */}
          <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-950 leading-relaxed space-y-1">
            <p className="font-semibold flex items-center gap-1.5 text-blue-900">
              <span>⚖️</span> Penempatan e-Meterai Menurut Aturan Hukum (UU No. 10 Tahun 2020)
            </p>
            <ul className="list-disc list-inside pl-1 text-blue-800 space-y-0.5">
              <li>
                <strong>Salinan Freelancer (Pihak Pertama):</strong> e-Meterai dibubuhkan pada kolom tanda tangan <strong>Klien</strong> (disimpan oleh Freelancer).
              </li>
              <li>
                <strong>Salinan Klien (Pihak Kedua):</strong> e-Meterai dibubuhkan pada kolom tanda tangan <strong>Freelancer</strong> (disimpan dan diunduh oleh Klien).
              </li>
            </ul>
          </div>

          {/* Grid 2 Kartu Berkas Salinan */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Salinan Freelancer */}
            <div className="card p-6 space-y-4 border-2 border-slate-200">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Salinan Pihak Pertama</span>
                  <h3 className="text-base font-bold text-slate-900">Salinan Freelancer</h3>
                </div>
                <span className="text-[10px] font-semibold text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-full">
                  Disimpan Freelancer
                </span>
              </div>
              <p className="text-xs text-slate-600">
                e-Meterai dibubuhkan pada kolom tanda tangan <strong>Klien (Pihak Kedua)</strong>.
              </p>

              {freelancerStampedDoc ? (
                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900 truncate" title={freelancerStampedDoc.fileName}>
                        {freelancerStampedDoc.fileName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {freelancerStampedDoc.fileSize ? `${Math.round(freelancerStampedDoc.fileSize / 1024)} KB · ` : ""}
                        Diunggah {formatDateTimeID(freelancerStampedDoc.uploadedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-emerald-200/60">
                    <button
                      type="button"
                      onClick={() => handleDownloadDoc(freelancerStampedDoc)}
                      className="btn btn-primary btn-sm flex-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Unduh PDF
                    </button>
                    <Link
                      href={`/agreements/${agreement.id}/print?copy=freelancer_copy`}
                      target="_blank"
                      className="btn btn-secondary btn-sm"
                      title="Buka tampilan cetak surat perjanjian Salinan Freelancer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Versi Cetak A4
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleRemoveStampedDoc("freelancer_copy")}
                      disabled={isUploadingDoc === "freelancer_copy"}
                      className="btn btn-ghost btn-sm text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Hapus
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 space-y-4">
                  <div className="text-center space-y-1">
                    <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs font-semibold text-slate-700">Pilih Berkas PDF yang Sudah Bermeterai</p>
                    <p className="text-[11px] text-slate-400">Maksimal 7 MB (.pdf)</p>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(e) => handleDocumentPdfUpload("freelancer_copy", e)}
                    disabled={isUploadingDoc === "freelancer_copy"}
                    className="block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:border-0 file:text-xs file:font-semibold file:bg-brand-600 file:text-white file:rounded-lg hover:file:bg-brand-700 cursor-pointer"
                  />
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-500">Perlu dokumen cepat untuk demo?</span>
                    <button
                      type="button"
                      onClick={() => handleUseSampleDocumentPdf("freelancer_copy")}
                      disabled={isUploadingDoc === "freelancer_copy"}
                      className="btn btn-secondary btn-xs"
                    >
                      <Stamp className="w-3 h-3" />
                      Pakai Contoh PDF
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Salinan Klien */}
            <div className="card p-6 space-y-4 border-2 border-slate-200">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Salinan Pihak Kedua</span>
                  <h3 className="text-base font-bold text-slate-900">Salinan Klien</h3>
                </div>
                <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                  Diunduh oleh Klien
                </span>
              </div>
              <p className="text-xs text-slate-600">
                e-Meterai dibubuhkan pada kolom tanda tangan <strong>Freelancer (Pihak Pertama)</strong>.
              </p>

              {clientStampedDoc ? (
                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900 truncate" title={clientStampedDoc.fileName}>
                        {clientStampedDoc.fileName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {clientStampedDoc.fileSize ? `${Math.round(clientStampedDoc.fileSize / 1024)} KB · ` : ""}
                        Diunggah {formatDateTimeID(clientStampedDoc.uploadedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-blue-200/60">
                    <button
                      type="button"
                      onClick={() => handleDownloadDoc(clientStampedDoc)}
                      className="btn btn-primary btn-sm flex-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Unduh PDF
                    </button>
                    <Link
                      href={`/agreements/${agreement.id}/print?copy=client_copy`}
                      target="_blank"
                      className="btn btn-secondary btn-sm"
                      title="Buka tampilan cetak surat perjanjian Salinan Klien"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Versi Cetak A4
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleRemoveStampedDoc("client_copy")}
                      disabled={isUploadingDoc === "client_copy"}
                      className="btn btn-ghost btn-sm text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Hapus
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 space-y-4">
                  <div className="text-center space-y-1">
                    <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs font-semibold text-slate-700">Pilih Berkas PDF yang Sudah Bermeterai</p>
                    <p className="text-[11px] text-slate-400">Maksimal 7 MB (.pdf)</p>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(e) => handleDocumentPdfUpload("client_copy", e)}
                    disabled={isUploadingDoc === "client_copy"}
                    className="block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:border-0 file:text-xs file:font-semibold file:bg-brand-600 file:text-white file:rounded-lg hover:file:bg-brand-700 cursor-pointer"
                  />
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-500">Perlu dokumen cepat untuk demo?</span>
                    <button
                      type="button"
                      onClick={() => handleUseSampleDocumentPdf("client_copy")}
                      disabled={isUploadingDoc === "client_copy"}
                      className="btn btn-secondary btn-xs"
                    >
                      <Stamp className="w-3 h-3" />
                      Pakai Contoh PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* WhatsApp Pesan Siap Kirim */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-6 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                Pesan WhatsApp siap kirim ke klien
              </span>
              <button type="button" onClick={copyWhatsAppMessage} className="btn btn-whatsapp btn-sm">
                {copiedWaText ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedWaText ? "Pesan Tersalin!" : "Salin Pesan"}
              </button>
            </div>
            <div className="p-4 bg-white border border-emerald-200 rounded-xl text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {waMessage}
            </div>
          </div>

          {/* Tanda tangan Freelancer */}
          <div className="card p-6 space-y-3">
            <h3 className="card-title">Tanda tangan Anda (Freelancer)</h3>
            <p className="text-sm text-slate-500">Tanda tangan di kotak ini. Tanda tangan akan otomatis tersimpan dan muncul di draf kesepakatan.</p>
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
              {agreement.changeRequests.length > content.revision.count
                ? "Buat Dokumen Addendum Bermaterai"
                : "Ubah Kesepakatan"}
            </button>
          </div>

          {/* Tracker Jatah Revisi & Aturan Hukum */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pemantauan Jatah Revisi</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-2xl font-extrabold text-slate-900">
                    {agreement.changeRequests.length} / {content.revision.count}
                  </span>
                  <span className="text-sm text-slate-600">revisi diajukan</span>
                </div>
              </div>
              <div>
                {agreement.changeRequests.length <= content.revision.count ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Dalam Jatah Kesepakatan (Dicatat Mandiri)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Melebihi Jatah ({agreement.changeRequests.length - content.revision.count}x di luar batas)
                  </span>
                )}
              </div>
            </div>

            <div className="text-xs leading-relaxed p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
              {agreement.changeRequests.length <= content.revision.count ? (
                <p className="text-slate-600">
                  <strong className="text-slate-900">Aturan:</strong> Revisi yang masih dalam jatah <strong>{content.revision.count} kali</strong> cukup dicatat &amp; dikerjakan mandiri oleh freelancer <em>tanpa perlu menerbitkan dokumen baru bermaterai</em>.
                </p>
              ) : (
                <div className="space-y-1 text-amber-900">
                  <p className="font-semibold text-amber-950">
                    ⚠️ Revisi di Tengah Jalan Melebihi Batas Kesepakatan Awal:
                  </p>
                  <p>
                    Karena revisi melebihi batas <strong>{content.revision.count} kali</strong>, revisi tambahan dikenakan biaya <strong>Rp{(content.revision.extraRevisionRate || 0).toLocaleString("id-ID")}</strong>/revisi.
                  </p>
                  <p className="text-amber-800">
                    Freelancer perlu membuat <strong>Dokumen Kesepakatan Baru (Addendum)</strong> yang memuat penambahan tersebut dan disahkan kembali dengan e-Materai agar memiliki kekuatan hukum sah.
                  </p>
                </div>
              )}
            </div>
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
