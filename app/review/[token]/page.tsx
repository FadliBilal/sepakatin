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
} from "lucide-react";
import { getAgreementByReviewToken, approveVersion, requestChange, submitVisualSignature } from "@/lib/store";
import { AgreementRecord } from "@/lib/types";
import { SignaturePad } from "@/components/SignaturePad";
import { AgreementDocument } from "@/components/AgreementDocument";
import { formatDateTimeID } from "@/lib/crypto";

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

  const [showChangeModal, setShowChangeModal] = useState(false);
  const [changeTitle, setChangeTitle] = useState("");
  const [changeDescription, setChangeDescription] = useState("");
  const [isSubmittingChange, setIsSubmittingChange] = useState(false);

  useEffect(() => {
    async function load() {
      if (token) {
        const data = await getAgreementByReviewToken(token);
        if (data) {
          setAgreement(data);
          setClientSignerName(data.currentVersion.contentJson.client.name);
          setClientSignerEmail(data.currentVersion.contentJson.client.email);
        }
      }
      setIsLoading(false);
    }
    load();
  }, [token]);

  if (isLoading) {
    return <div className="container-page py-24 text-center text-sm text-slate-500 animate-pulse">Memuat kesepakatan...</div>;
  }

  if (!agreement) {
    return (
      <div className="w-full max-w-lg mx-auto px-4 py-20">
        <div className="card p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Link tidak berlaku</h2>
          <p className="text-sm text-slate-500">
            Kesepakatan tidak ditemukan. Silakan minta link terbaru kepada freelancer Anda.
          </p>
          <Link href="/" className="btn btn-primary">Ke Beranda Sepakatin</Link>
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
  const materaiOnClientSide = agreement.ematerai?.targetCopy === "freelancer_copy";

  const clientStampedDoc = agreement.stampedDocuments?.find((d) => d.copyType === "client_copy");

  const handleDownloadDoc = (doc: { fileUrl: string; fileName: string }) => {
    const link = document.createElement("a");
    link.href = doc.fileUrl;
    link.download = doc.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      alert("Gagal menyimpan tanda tangan. Coba lagi.");
    } finally {
      setIsSavingPostSignature(false);
    }
  };

  const handleApproveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientSignerName.trim() || !clientSignerEmail.trim()) {
      alert("Mohon isi nama dan email Anda.");
      return;
    }
    if (!hasAgreedTerms) {
      alert("Mohon centang kotak persetujuan terlebih dahulu.");
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
        alert("Terima kasih! Persetujuan dan tanda tangan Anda sudah tersimpan.");
      }
    } catch (err) {
      console.error("Error approving:", err);
      alert(err instanceof Error && err.message ? err.message : "Terjadi kesalahan saat menyimpan persetujuan.");
    } finally {
      setIsSubmittingApproval(false);
    }
  };

  const handleRequestChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!changeTitle.trim() || !changeDescription.trim()) {
      alert("Mohon isi judul dan penjelasan perubahan.");
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
        alert("Permintaan perubahan sudah dikirim ke freelancer.");
      }
    } catch (err) {
      console.error("Error requesting change:", err);
      alert(err instanceof Error && err.message ? err.message : "Terjadi kesalahan saat mengirim permintaan.");
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
        <Link href={`/agreements/${agreement.id}/print`} target="_blank" className="btn btn-secondary btn-sm self-start sm:self-auto">
          <Printer className="w-4 h-4" />
          Versi Cetak
        </Link>
      </div>

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
                    Salinan Klien Bermeterai Resmi Tersedia
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Unduh Berkas Salinan Klien (Sudah Bermeterai Rp10.000)
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                  Freelancer telah membubuhkan e-Meterai resmi pada berkas perjanjian ini melalui portal distributor resmi Peruri dan mengunggahnya ke Sepakatin. Dokumen ini sah dan memiliki kekuatan hukum pembuktian perdata.
                </p>
                <p className="text-[11px] text-slate-500 pt-0.5">
                  Berkas: <strong className="text-slate-700">{clientStampedDoc.fileName}</strong>
                  {clientStampedDoc.fileSize ? ` · ${Math.round(clientStampedDoc.fileSize / 1024)} KB` : ""}
                  {" · "}Diunggah {formatDateTimeID(clientStampedDoc.uploadedAt)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleDownloadDoc(clientStampedDoc)}
              className="btn btn-primary flex-shrink-0 self-start sm:self-auto"
            >
              <Download className="w-4 h-4" />
              Unduh Salinan Klien (PDF)
            </button>
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
        {(() => {
          const isLocked = ["AGREED", "ACTIVE", "COMPLETED", "CANCELLED", "EXPIRED", "REJECTED"].includes(agreement.status);
          return (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {isLocked ? "Dokumen Telah Disepakati" : clientApproval ? "Persetujuan Tersimpan" : "Persetujuan Anda"}
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  {isLocked
                    ? "Kedua pihak sudah menyetujui versi ini. Dokumen telah dikunci secara hukum dan menjadi acuan resmi proyek."
                    : clientApproval
                    ? "Anda telah menyetujui versi ini. Menunggu proses selanjutnya dari freelancer."
                    : "Setujui jika semua sudah sesuai, atau minta perubahan jika ada yang perlu diperbaiki."}
                </p>
              </div>
              {!isLocked && !clientApproval && (
                <button type="button" onClick={() => setShowChangeModal(true)} className="btn btn-secondary">
                  <Edit3 className="w-4 h-4" />
                  Minta Perubahan
                </button>
              )}
            </div>
          );
        })()}

        {clientApproval ? (
          <div className="space-y-6">
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-5 space-y-1.5 text-sm">
              <p className="flex items-center gap-2 font-semibold text-emerald-900">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Anda sudah menyetujui versi ini
              </p>
              <p className="text-emerald-800">
                Oleh <strong>{clientApproval.signerName}</strong> ({clientApproval.signerEmail}) pada {formatDateTimeID(clientApproval.approvedAt)}.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="card-title">Tanda tangan{agreement.ematerai ? " & e-Materai" : ""}</h4>
                {clientVisualSig && !isEditingSignature && (
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
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-slate-500 text-center">
                          {materaiOnClientSide ? "Tanda tangan di sebelah kanan e-Materai:" : "Tanda tangan Anda:"}
                        </p>
                        <SignaturePad signerName={clientSignerName || clientApproval.signerName} onSave={handleSavePostSignature} />
                        {isSavingPostSignature && <p className="text-xs text-slate-500 text-center animate-pulse">Menyimpan...</p>}
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
              <p className="label mb-0">Tanda tangan</p>
              {agreement.ematerai && materaiWarning}
              <div className="doc-box space-y-4">
                <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center gap-6">
                  {materaiOnClientSide && materaiImage("w-28 h-28")}
                  <div className="flex-1 max-w-sm w-full">
                    <SignaturePad signerName={clientSignerName} onSave={(url) => setClientSignatureUrl(url)} />
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

            <button type="submit" disabled={isSubmittingApproval || !hasAgreedTerms} className="btn btn-primary btn-lg w-full sm:w-auto">
              <Check className="w-5 h-5" />
              Setujui & Tanda Tangani
            </button>
          </form>
        )}
      </div>

      {showChangeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="kicker">Minta perubahan</p>
                <h3 className="text-lg font-bold text-slate-900">Apa yang perlu diubah?</h3>
                <p className="text-sm text-slate-500 mt-1">Freelancer akan menerima permintaan ini dan menyiapkan versi baru.</p>
              </div>
              <button onClick={() => setShowChangeModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100" aria-label="Tutup">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRequestChangeSubmit} className="space-y-4">
              <div>
                <label className="label">Judul singkat *</label>
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
    </div>
  );
}
