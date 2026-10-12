"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Printer,
  Edit3,
  Check,
  AlertTriangle,
  X,
  Download,
  FileText,
  Clock,
} from "lucide-react";
import {
  getAgreementByReviewToken,
  approveVersion,
  requestChange,
  submitVisualSignature,
  fetchStampedDocumentUrl,
  errorMessage,
} from "@/lib/store";
import { AgreementRecord } from "@/lib/types";
import { SignaturePad } from "@/components/SignaturePad";
import { AgreementDocument } from "@/components/AgreementDocument";
import { formatDateTimeID } from "@/lib/crypto";
import { ModalDialog, ModalType } from "@/components/ModalDialog";

export default function ClientReviewPage() {
  const params = useParams();
  const token = params.token as string;

  const [agreement, setAgreement] = useState<AgreementRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [clientSignerName, setClientSignerName] = useState("");
  const [clientSignerEmail, setClientSignerEmail] = useState("");
  const [hasAgreedTerms, setHasAgreedTerms] = useState(false);
  const [clientSignatureUrl, setClientSignatureUrl] = useState<string>("");
  const [isSubmittingApproval, setIsSubmittingApproval] = useState(false);
  const [isEditingSignature, setIsEditingSignature] = useState(false);
  const [isSavingPostSignature, setIsSavingPostSignature] = useState(false);
  const [isDownloadingDoc, setIsDownloadingDoc] = useState(false);

  const [showChangeModal, setShowChangeModal] = useState(false);
  const [changeTitle, setChangeTitle] = useState("");
  const [changeDescription, setChangeDescription] = useState("");
  const [isSubmittingChange, setIsSubmittingChange] = useState(false);

  // Modal Dialog Kustom
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
    type = "info",
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

  const [loadError, setLoadError] = useState<{ isExpired?: boolean; message?: string } | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setIsLoading(true);
      setLoadError(null);
      if (token) {
        try {
          const data = await getAgreementByReviewToken(token);
          if (!isMounted) return;
          if (data) {
            setAgreement(data);
            setClientSignerName(data.currentVersion.contentJson.client.name);
            setClientSignerEmail(data.currentVersion.contentJson.client.email);
          } else {
            setLoadError({
              message:
                "Kesepakatan tidak ditemukan. Jika Anda sedang menguji coba secara lokal, pastikan tautan review dibuka pada alamat lokal yang sama (misal http://localhost:3000) tempat kesepakatan dibuat.",
            });
          }
        } catch (err) {
          if (!isMounted) return;
          const msg = errorMessage(err);
          const expired = msg.includes("kedaluwarsa") || msg.includes("TOKEN_EXPIRED");
          setLoadError({ isExpired: expired, message: msg });
        } finally {
          if (isMounted) setIsLoading(false);
        }
      } else {
        if (isMounted) setIsLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [token, retryKey]);

  if (isLoading) {
    return (
      <div className="container-page py-24 text-center space-y-3">
        <div className="animate-spin w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full mx-auto" />
        <p className="text-sm font-medium text-slate-600">Memuat kesepakatan...</p>
        <p className="text-xs text-slate-400">Menghubungkan ke draf kesepakatan resmi</p>
      </div>
    );
  }

  if (loadError?.isExpired) {
    return (
      <div className="w-full max-w-lg mx-auto px-4 py-20">
        <div className="card p-8 text-center space-y-4 border-amber-200 bg-amber-50/50">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Tautan Review Telah Kedaluwarsa</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Demi keamanan para pihak, tautan review kesepakatan ini memiliki masa berlaku 14 hari yang kini telah berakhir.
            Silakan hubungi freelancer Anda untuk menerbitkan tautan baru melalui dashboard mereka.
          </p>
          <div className="pt-2">
            <Link href="/" className="btn btn-secondary">Ke Beranda Sepakatin</Link>
          </div>
        </div>
      </div>
    );
  }

  if (!agreement) {
    return (
      <div className="w-full max-w-lg mx-auto px-4 py-20">
        <div className="card p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Link tidak berlaku</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            {loadError?.message || "Kesepakatan tidak ditemukan. Silakan minta link terbaru kepada freelancer Anda."}
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setRetryKey((k) => k + 1)}
              className="btn btn-secondary"
            >
              Coba Muat Ulang
            </button>
            <Link href="/" className="btn btn-primary">Ke Beranda Sepakatin</Link>
          </div>
        </div>
      </div>
    );
  }

  const currentVersion = agreement.currentVersion;
  const content = currentVersion.contentJson;
  const clientApproval = agreement.approvals.find(
    (a) => a.versionId === currentVersion.id && a.role === "client" && a.status === "APPROVED"
  );
  const clientVisualSig = agreement.signatures?.find((s) => s.signerRole === "client");
  /** Setelah kedua pihak setuju, isi dokumen dan tanda tangan tidak bisa diubah lagi. */
  const isDocumentLocked = ["AGREED", "ACTIVE", "COMPLETED", "CANCELLED", "EXPIRED", "REJECTED"].includes(
    agreement.status
  );
  // Hanya Salinan Klien. Sebelumnya ada fallback ke berkas pertama yang ada,
  // sehingga klien bisa melihat Salinan Freelancer — itu bukan haknya, dan
  // unduhannya pun akan gagal karena server hanya melayani salinan klien.
  const clientStampedDoc = agreement.stampedDocuments?.find((d) => d.copyType === "client_copy");
  const materaiOnClientSide = Boolean(
    agreement.ematerai &&
      (agreement.ematerai.targetCopy === "client_copy" || agreement.ematerai.targetCopy === "both")
  );

  /** Isi berkas diambil saat diunduh, supaya membuka halaman ini tetap ringan di HP. */
  const handleDownloadDoc = async (doc: { fileName: string }) => {
    setIsDownloadingDoc(true);
    try {
      const file = await fetchStampedDocumentUrl(token, "client_copy", true);
      const link = document.createElement("a");
      link.href = file.fileUrl;
      link.download = file.fileName || doc.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      showAlert({
        title: "Gagal Mengunduh Berkas",
        description: errorMessage(err),
        type: "danger",
      });
    } finally {
      setIsDownloadingDoc(false);
    }
  };

  const handleSavePostSignature = async (sigUrl: string) => {
    setIsSavingPostSignature(true);
    try {
      const updated = await submitVisualSignature(token, "client", clientSignerName || clientApproval?.signerName || "Klien", sigUrl);
      if (updated) {
        setAgreement({ ...updated });
        setIsEditingSignature(false);
      }
    } catch (err) {
      console.error("Error saving signature:", err);
      showAlert({
        title: "Gagal Menyimpan",
        description: "Gagal menyimpan tanda tangan. Silakan coba lagi.",
        type: "danger",
      });
    } finally {
      setIsSavingPostSignature(false);
    }
  };

  const handleApproveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientSignerName.trim() || !clientSignerEmail.trim()) {
      showAlert({
        title: "Data Belum Lengkap",
        description: "Mohon isi nama lengkap dan email Anda sebelum menyetujui kesepakatan.",
        type: "warning",
      });
      return;
    }
    if (!clientSignatureUrl) {
      // Persetujuan tanpa goresan tanda tangan menghasilkan dokumen dengan kolom
      // tanda tangan kosong — dan setelah terkunci, itu tidak bisa diperbaiki lagi.
      showAlert({
        title: "Tanda Tangan Belum Diisi",
        description:
          "Mohon bubuhkan tanda tangan Anda di kotak yang tersedia. Bisa digoreskan langsung, atau tekan “Isi otomatis dari nama” jika Anda kesulitan menggambar.",
        type: "warning",
      });
      return;
    }
    if (!hasAgreedTerms) {
      showAlert({
        title: "Persetujuan Diperlukan",
        description: "Mohon centang kotak persetujuan syarat dan ketentuan terlebih dahulu.",
        type: "warning",
      });
      return;
    }

    setIsSubmittingApproval(true);
    try {
      if (clientSignatureUrl) {
        await submitVisualSignature(token, "client", clientSignerName.trim(), clientSignatureUrl);
      }
      const updated = await approveVersion(token, "client", clientSignerName.trim(), clientSignerEmail.trim());
      if (updated) {
        setAgreement({ ...updated });
        showAlert({
          title: "Persetujuan & Tanda Tangan Tersimpan!",
          description: "Terima kasih! Persetujuan dan tanda tangan Anda telah berhasil dicatat secara sah di sistem.",
          type: "success",
        });
      }
    } catch (err) {
      console.error("Error approving:", err);
      showAlert({
        title: "Gagal Menyimpan Persetujuan",
        description: err instanceof Error && err.message ? err.message : "Terjadi kesalahan saat menyimpan persetujuan.",
        type: "danger",
      });
    } finally {
      setIsSubmittingApproval(false);
    }
  };

  const handleRequestChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!changeTitle.trim() || !changeDescription.trim()) {
      showAlert({
        title: "Data Belum Lengkap",
        description: "Mohon isi judul dan penjelasan perubahan yang Anda ajukan.",
        type: "warning",
      });
      return;
    }

    setIsSubmittingChange(true);
    try {
      const updated = await requestChange(token, clientSignerName || "Klien", changeTitle.trim(), changeDescription.trim(), clientSignerEmail);
      if (updated) {
        setAgreement({ ...updated });
        setShowChangeModal(false);
        setChangeTitle("");
        setChangeDescription("");
        showAlert({
          title: "Permintaan Perubahan Terkirim!",
          description: "Permintaan perubahan telah berhasil dikirimkan kepada pihak freelancer.",
          type: "success",
        });
      }
    } catch (err) {
      console.error("Error requesting change:", err);
      showAlert({
        title: "Gagal Mengirim Permintaan",
        description: err instanceof Error && err.message ? err.message : "Terjadi kesalahan saat mengirim permintaan perubahan.",
        type: "danger",
      });
    } finally {
      setIsSubmittingChange(false);
    }
  };

  const materaiImage = (sizeClass: string) =>
    agreement.ematerai && (
      <div className="flex flex-col items-center gap-1 flex-shrink-0">
        <div className={`${sizeClass} border border-slate-200 rounded-lg bg-white p-1 flex items-center justify-center`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={agreement.ematerai.imageUrl} alt="e-Materai Rp10.000" className="max-w-full max-h-full object-contain" />
        </div>
        <span className="text-[11px] font-medium text-slate-500">e-Materai Rp10.000</span>
      </div>
    );

  const materaiWarning = (
    <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-amber-900 leading-relaxed">
        <strong>Penting:</strong> tanda tangan di <strong>sebelah kanan</strong> e-Materai dan jangan sampai menutupinya,
        supaya e-Materai tetap sah.
      </p>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div className="rounded-2xl border border-brand-100 bg-brand-50/60 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="kicker">Undangan meninjau kesepakatan</p>
          <h2 className="text-lg font-bold text-slate-900 mt-0.5">
            {content.freelancer.name} mengajak Anda menyetujui kesepakatan kerja
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Baca isinya dulu. Jika sudah sesuai, setujui di bagian bawah. Gratis, tanpa perlu daftar akun.
          </p>
        </div>
        <Link
          href={`/agreements/${agreement.id}/print?token=${token}&copy=client_copy`}
          target="_blank"
          className="btn btn-secondary btn-sm self-start sm:self-auto"
        >
          <Printer className="w-4 h-4" />
          Versi Cetak
        </Link>
      </div>

      {/* Penanda tahap — supaya klien tahu posisinya dalam proses */}
      <ol className="grid grid-cols-3 gap-2" aria-label="Tahap proses kesepakatan">
        {[
          { label: "1. Baca Dokumen", done: true },
          { label: "2. Setujui & Tanda Tangan", done: Boolean(clientApproval) },
          { label: "3. Sah & Mengikat", done: Boolean(clientApproval && isDocumentLocked) },
        ].map((stage, idx, arr) => {
          const isCurrent = !stage.done && (idx === 0 || arr[idx - 1].done);
          return (
            <li
              key={stage.label}
              aria-current={isCurrent ? "step" : undefined}
              className={`rounded-xl border px-3 py-2.5 ${
                stage.done
                  ? "border-emerald-200 bg-emerald-50"
                  : isCurrent
                  ? "border-brand-300 bg-brand-50"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                    stage.done
                      ? "bg-emerald-600 text-white"
                      : isCurrent
                      ? "bg-brand-600 text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {stage.done ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : idx + 1}
                </span>
                <span
                  className={`text-[11px] sm:text-xs font-semibold leading-tight ${
                    stage.done ? "text-emerald-900" : isCurrent ? "text-brand-800" : "text-slate-500"
                  }`}
                >
                  {stage.label}
                </span>
              </div>
            </li>
          );
        })}
      </ol>

      {/* Banner Salinan Klien Bermeterai Resmi */}
      {clientStampedDoc && (
        <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/90 p-5 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Dokumen Bermeterai Resmi Tersedia
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Unduh Berkas Perjanjian (Sudah Bermeterai Elektronik Rp10.000)
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                  Freelancer telah membubuhkan e-Meterai resmi pada berkas perjanjian ini melalui portal distributor resmi dan mengunggahnya ke Sepakatin. Dokumen ini sah dan memiliki kekuatan hukum pembuktian perdata.
                </p>
                <p className="text-[11px] text-slate-500 pt-0.5">
                  Berkas: <strong className="text-slate-700">{clientStampedDoc.fileName}</strong>
                  {clientStampedDoc.fileSize ? ` · ${Math.round(clientStampedDoc.fileSize / 1024)} KB` : ""}
                  {" · "}Diunggah {formatDateTimeID(clientStampedDoc.uploadedAt)}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 flex-shrink-0 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => handleDownloadDoc(clientStampedDoc)}
                disabled={isDownloadingDoc}
                className="btn btn-primary"
              >
                <Download className="w-4 h-4" />
                {isDownloadingDoc ? "Menyiapkan..." : "Unduh Salinan Klien (PDF)"}
              </button>
              <Link
                href={`/agreements/${agreement.id}/print?token=${token}&copy=client_copy`}
                target="_blank"
                className="btn btn-secondary"
              >
                <Printer className="w-4 h-4" />
                Buka Versi Cetak
              </Link>
            </div>
          </div>
        </div>
      )}

      <AgreementDocument content={content} versionNumber={currentVersion.versionNumber} status={agreement.status}>
        {agreement.status === "AGREED" && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-600 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-semibold text-emerald-900">Kesepakatan ini sudah disetujui kedua pihak</p>
              <p className="text-emerald-700">Dokumen dikunci dan menjadi acuan resmi proyek.</p>
            </div>
          </div>
        )}
        {agreement.status === "CHANGES_REQUESTED" && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-semibold text-amber-900">Permintaan perubahan sedang diproses</p>
              <p className="text-amber-800">Freelancer sedang menyiapkan versi baru berdasarkan permintaan Anda.</p>
            </div>
          </div>
        )}
      </AgreementDocument>

      {/* Tindakan klien */}
      <div className="card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {isDocumentLocked ? "Dokumen Telah Disepakati" : clientApproval ? "Persetujuan Tersimpan" : "Persetujuan Anda"}
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              {isDocumentLocked
                ? "Kedua pihak sudah menyetujui versi ini. Dokumen telah dikunci secara hukum dan menjadi acuan resmi proyek."
                : clientApproval
                ? "Anda telah menyetujui versi ini. Menunggu proses selanjutnya dari freelancer."
                : "Setujui jika semua sudah sesuai, atau minta perubahan jika ada yang perlu diperbaiki."}
            </p>
          </div>
          {!isDocumentLocked && !clientApproval && (
            <button type="button" onClick={() => setShowChangeModal(true)} className="btn btn-secondary">
              <Edit3 className="w-4 h-4" />
              Minta Perubahan
            </button>
          )}
        </div>

        {clientApproval ? (
          <div className="space-y-6">
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-5 space-y-3 text-sm">
              <div className="space-y-1">
                <p className="flex items-center gap-2 font-bold text-emerald-950 text-base">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  {isDocumentLocked
                    ? "Kesepakatan Sah & Mengikat Kedua Pihak!"
                    : "Persetujuan & Tanda Tangan Anda Telah Tercatat"}
                </p>
                <p className="text-emerald-800 leading-relaxed">
                  {isDocumentLocked
                    ? `Terima kasih! Anda dan ${content.freelancer.name} telah menyetujui kesepakatan ini. Sesuai Pasal 1320 KUHPerdata & UU ITE, dokumen ini telah sah mengikat secara hukum dan pengerjaan proyek dapat segera dimulai.`
                    : `Disetujui oleh ${clientApproval.signerName} (${clientApproval.signerEmail}) pada ${formatDateTimeID(clientApproval.approvedAt)}.`}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-emerald-200">
                <Link
                  href={`/agreements/${agreement.id}/print?token=${token}&copy=client_copy`}
                  target="_blank"
                  className="btn btn-primary btn-sm text-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Unduh Salinan Dokumen Bertanda Tangan (PDF)
                </Link>
                <Link
                  href={`/verify/${agreement.contractId}`}
                  target="_blank"
                  className="btn btn-secondary btn-sm text-xs"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Cek Keaslian Kriptografis
                </Link>
              </div>
            </div>

            {/* Opsional e-Meterai jika belum ada */}
            {!clientStampedDoc && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs text-slate-600">
                <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  Pengesahan Tambahan e-Meterai Peruri (Opsional):
                </p>
                <p className="leading-relaxed">
                  Dokumen ini telah sah tanpa meterai. Jika freelancer menambahkan e-Meterai resmi Peruri Rp10.000 untuk arsip formal, berkas bermeterai akan otomatis muncul di halaman ini dan dapat Anda unduh kapan saja menggunakan tautan ini.
                </p>
              </div>
            )}

            <div className="rounded-xl border border-slate-200 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="card-title">Tanda tangan{agreement.ematerai ? " & e-Materai" : ""}</h4>
                {clientVisualSig && !isEditingSignature && !isDocumentLocked && (
                  <button type="button" onClick={() => setIsEditingSignature(true)} className="btn btn-ghost btn-sm">
                    Ubah Tanda Tangan
                  </button>
                )}
              </div>

              {materaiOnClientSide && materaiWarning}

              <div className="doc-box space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  {materaiOnClientSide && materaiImage("w-24 h-24")}
                  <div className="flex-1 max-w-sm w-full">
                    {clientVisualSig && !isEditingSignature ? (
                      <div className="text-center space-y-1">
                        <div className="h-24 border border-slate-200 rounded-lg bg-white p-2 flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={clientVisualSig.signatureDataUrl} alt="Tanda tangan klien" className="max-h-full max-w-full object-contain" />
                        </div>
                        <p className="text-xs text-slate-400">Ditandatangani {formatDateTimeID(clientVisualSig.signedAt)}</p>
                      </div>
                    ) : isDocumentLocked ? (
                      // Dokumen sudah dikunci: menampilkan kotak tanda tangan di sini hanya akan
                      // berujung gagal, jadi jelaskan statusnya saja.
                      <div className="text-center space-y-1 px-2">
                        <p className="text-sm font-semibold text-slate-700">Persetujuan Anda sudah tercatat</p>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Dokumen ini sudah disetujui kedua pihak dan dikunci, sehingga goresan tanda tangan
                          tidak bisa ditambahkan lagi. Persetujuan Anda tetap sah dan tercatat lengkap
                          dengan waktu serta nomor dokumennya.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-slate-500 text-center">
                          {materaiOnClientSide ? "Tanda tangan di sebelah kanan e-Materai:" : "Tanda tangan Anda:"}
                        </p>
                        <SignaturePad
                          signerName={clientSignerName || clientApproval.signerName}
                          onSave={handleSavePostSignature}
                          confirmLabel="Simpan Tanda Tangan"
                          isSaving={isSavingPostSignature}
                        />
                        {isEditingSignature && (
                          <div className="text-center">
                            <button type="button" onClick={() => setIsEditingSignature(false)} className="btn btn-ghost btn-sm">
                              Batal
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-center pt-3 border-t border-slate-200">
                  <p className="text-sm font-bold text-slate-900 underline">{clientSignerName || clientApproval.signerName}</p>
                  <p className="text-xs text-slate-500">Pihak kedua (Klien)</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleApproveSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Nama lengkap Anda *</label>
                <input type="text" required value={clientSignerName} onChange={(e) => setClientSignerName(e.target.value)} className="input" />
              </div>
              <div>
                <label className="label">Email Anda *</label>
                <input type="email" required value={clientSignerEmail} onChange={(e) => setClientSignerEmail(e.target.value)} className="input" />
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="label mb-0">Tanda tangan *</p>
                <p className="hint mt-0">
                  Goreskan dengan jari atau mouse. Kesulitan menggambar? Tekan &ldquo;Isi otomatis dari nama&rdquo;.
                </p>
              </div>
              {agreement.ematerai && materaiWarning}
              <div className="doc-box space-y-4">
                <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center gap-6">
                  {materaiOnClientSide && materaiImage("w-28 h-28")}
                  <div className="flex-1 max-w-sm w-full space-y-2">
                    <SignaturePad
                      signerName={clientSignerName}
                      onSave={(url) => setClientSignatureUrl(url)}
                      onClear={() => setClientSignatureUrl("")}
                    />
                    {clientSignatureUrl && (
                      <p className="text-xs text-emerald-700 font-medium flex items-center justify-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        Tanda tangan siap dikirim
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-center pt-3 border-t border-slate-200">
                  <p className="text-sm font-bold text-slate-900 underline">{clientSignerName || "Nama Anda"}</p>
                  <p className="text-xs text-slate-500">Pihak kedua (Klien)</p>
                </div>
              </div>
            </div>

            <label htmlFor="agreeTermsCheck" className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 cursor-pointer hover:border-brand-300 transition-colors">
              <input
                type="checkbox"
                id="agreeTermsCheck"
                checked={hasAgreedTerms}
                onChange={(e) => setHasAgreedTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-brand-600 cursor-pointer flex-shrink-0"
              />
              <span className="text-sm text-slate-700 leading-relaxed select-none">
                Saya berwenang mewakili pihak klien, sudah membaca, dan <strong>menyetujui seluruh isi kesepakatan versi {currentVersion.versionNumber}</strong> ini,
                termasuk pekerjaan, pembayaran, dan batas revisinya.
              </span>
            </label>

            <div className="space-y-2">
              <button type="submit" disabled={isSubmittingApproval || !hasAgreedTerms} className="btn btn-primary btn-lg w-full sm:w-auto">
                <Check className="w-5 h-5" />
                {isSubmittingApproval ? "Menyimpan..." : "Setujui & Tanda Tangani"}
              </button>
              <p className="text-xs text-slate-500 leading-relaxed">
                Setelah kedua pihak menyetujui, isi dokumen dikunci dan tidak bisa diubah lagi.
                Jika masih ada yang perlu diperbaiki, gunakan <strong>Minta Perubahan</strong> di atas.
              </p>
            </div>
          </form>
        )}
      </div>

      {showChangeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="card-title">Minta Revisi Kesepakatan</h3>
              <button
                type="button"
                onClick={() => setShowChangeModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRequestChangeSubmit} className="space-y-4">
              <div>
                <label className="label">Judul Permintaan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Tenggat dimundurkan & tambah halaman Tentang Kami"
                  value={changeTitle}
                  onChange={(e) => setChangeTitle(e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Penjelasan *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Jelaskan bagian mana yang perlu diubah dan seperti apa..."
                  value={changeDescription}
                  onChange={(e) => setChangeDescription(e.target.value)}
                  className="input leading-relaxed"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowChangeModal(false)} className="btn btn-secondary">
                  Batal
                </button>
                <button type="submit" disabled={isSubmittingChange} className="btn btn-primary">
                  Kirim Permintaan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Modal Card for Alerts & Confirmations */}
      <ModalDialog onClose={closeDialog} {...dialogState} />
    </div>
  );
}
