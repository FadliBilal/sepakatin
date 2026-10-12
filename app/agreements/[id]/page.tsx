"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  Trash2,
  AlertTriangle,
  Clock,
  X,
  RefreshCw,
} from "lucide-react";
import {
  getAgreement,
  approveVersion,
  sendAgreementToClient,
  regenerateReviewToken,
  createNewVersion,
  uploadStampedDocument,
  removeStampedDocument,
  fetchStampedDocumentUrl,
  submitVisualSignature,
  completeAgreement,
  cancelAgreement,
  deleteAgreement,
  errorMessage,
} from "@/lib/store";
import { AgreementRecord, ContractContentJSON, StampedDocumentRecord } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";
import { AgreementDocument } from "@/components/AgreementDocument";
import { RequireAuth } from "@/components/RequireAuth";
import { formatDateID, formatDateTimeID, formatCurrencyIDR } from "@/lib/crypto";
import { ModalDialog, ModalType } from "@/components/ModalDialog";
import { copyText } from "@/lib/clipboard";
import { FREE_RULES, isPremiumPlan } from "@/lib/plans";
import { reviewUrlFor } from "@/lib/app-url";

// Modul-modul Terpisah (Sprint 4: UI Modularization)
import { MilestoneStepper, AgreementTabId } from "@/components/agreements/MilestoneStepper";
import { SignatureTab } from "@/components/agreements/SignatureTab";
import { OfficialEmateraiGuideTab } from "@/components/agreements/OfficialEmateraiGuideTab";
import { FinalConsensusTab } from "@/components/agreements/FinalConsensusTab";
import { ChangeRequestsTab } from "@/components/agreements/ChangeRequestsTab";
import { ActivityTimelineTab } from "@/components/agreements/ActivityTimelineTab";
import { VersionHistoryModal } from "@/components/agreements/VersionHistoryModal";

export default function AgreementDetailPage() {
  return <RequireAuth>{() => <AgreementDetail />}</RequireAuth>;
}

function AgreementDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [agreement, setAgreement] = useState<AgreementRecord | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [selectedVersionNum, setSelectedVersionNum] = useState<number>(1);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [activeTab, setActiveTab] = useState<AgreementTabId>("document");

  // Dokumen Bermeterai
  const [isUploadingDoc, setIsUploadingDoc] = useState<string | null>(null);
  const [isDownloadingDoc, setIsDownloadingDoc] = useState<string | null>(null);
  const [copiedWaText, setCopiedWaText] = useState(false);
  const [isRegeneratingToken, setIsRegeneratingToken] = useState(false);

  // Tanda Tangan
  const [isEditingSignature, setIsEditingSignature] = useState(false);
  const [isSavingSignature, setIsSavingSignature] = useState(false);

  // Perbarui kesepakatan (versi baru)
  const [showNewVersionModal, setShowNewVersionModal] = useState(false);
  const [isSavingVersion, setIsSavingVersion] = useState(false);
  const [newVersionError, setNewVersionError] = useState("");
  const [revisedScopeDesc, setRevisedScopeDesc] = useState("");
  const [revisedTotalValue, setRevisedTotalValue] = useState<number>(0);
  const [revisedDeadline, setRevisedDeadline] = useState("");

  // Modal Dialog Validasi & Konfirmasi Profesional
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    title: string;
    description: React.ReactNode;
    type?: ModalType;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => Promise<void> | void;
    isLoading?: boolean;
  }>({
    isOpen: false,
    title: "",
    description: "",
  });

  const closeDialog = () => setDialogState((prev) => ({ ...prev, isOpen: false }));

  const showConfirm = ({
    title,
    description,
    type = "warning",
    confirmText = "Lanjutkan",
    cancelText = "Batal",
    onConfirm,
  }: {
    title: string;
    description: React.ReactNode;
    type?: ModalType;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => Promise<void> | void;
  }) => {
    setDialogState({
      isOpen: true,
      title,
      description,
      type,
      confirmText,
      cancelText,
      onConfirm,
      isLoading: false,
    });
  };

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
      onConfirm: undefined,
      isLoading: false,
    });
  };

  useEffect(() => {
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
      <div className="container-page py-16 text-center">
        <h1 className="page-title mb-2">Kesepakatan tidak ditemukan</h1>
        <p className="text-slate-600 mb-6">Dokumen mungkin sudah dihapus atau Anda tidak memiliki akses.</p>
        <Link href="/dashboard" className="btn btn-primary">
          Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  if (!agreement) {
    return (
      <div className="container-page py-16 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-slate-500">Memuat kesepakatan...</p>
      </div>
    );
  }

  const content = agreement.currentVersion.contentJson;
  const clientReviewUrl = reviewUrlFor(agreement.reviewToken);
  const displayVersion = agreement.versions.find((v) => v.versionNumber === selectedVersionNum) ?? agreement.currentVersion;
  const currentApprovals = agreement.approvals.filter(
    (ap) => ap.versionId === agreement.currentVersion.id && ap.status === "APPROVED"
  );
  const freelancerApproval = currentApprovals.find((ap) => ap.role === "freelancer");
  const clientApproval = currentApprovals.find((ap) => ap.role === "client");

  const copyReviewUrl = async () => {
    const ok = await copyText(clientReviewUrl);
    if (!ok) {
      showAlert({
        title: "Link Tidak Bisa Disalin Otomatis",
        description: (
          <>
            Browser Anda memblokir penyalinan otomatis. Silakan salin link ini secara manual:
            <span className="block mt-2 p-2.5 rounded-lg bg-slate-100 border border-slate-200 break-all text-slate-800 text-xs">
              {clientReviewUrl}
            </span>
          </>
        ),
        type: "warning",
      });
      return;
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSendToClient = async () => {
    try {
      const updated = await sendAgreementToClient(agreement.id);
      if (updated) {
        setAgreement({ ...updated });
        showAlert({
          title: "Kesepakatan Berhasil Dikirim!",
          description: "Tautan peninjauan klien kini telah aktif. Silakan bagikan tautan atau kirimkan via WhatsApp ke klien Anda.",
          type: "success",
        });
      }
    } catch (err) {
      showAlert({
        title: "Gagal Mengirim",
        description: err instanceof Error ? err.message : "Gagal mengirim kesepakatan.",
        type: "danger",
      });
    }
  };

  const handleRegenerateReviewToken = () => {
    showConfirm({
      title: "Terbitkan Ulang Tautan Klien?",
      description: (
        <span>
          Tautan lama akan <strong>segera tidak berlaku</strong> dan digantikan dengan tautan baru yang berlaku selama 14 hari ke depan. Pastikan untuk mengirimkan tautan baru kepada klien Anda setelahnya.
        </span>
      ),
      type: "warning",
      confirmText: "Ya, Terbitkan Ulang",
      onConfirm: async () => {
        setIsRegeneratingToken(true);
        try {
          const updated = await regenerateReviewToken(agreement.id);
          if (updated) {
            setAgreement({ ...updated });
            showAlert({
              title: "Tautan Berhasil Diterbitkan Ulang!",
              description: "Tautan review baru telah aktif dengan masa berlaku 14 hari. Silakan salin dan bagikan ke klien.",
              type: "success",
            });
          }
        } catch (err) {
          showAlert({
            title: "Gagal Menerbitkan Ulang Tautan",
            description: errorMessage(err),
            type: "danger",
          });
        } finally {
          setIsRegeneratingToken(false);
        }
      },
    });
  };

  const handleApproveClick = () => {
    const hasVisualSignature = Boolean(agreement.signatures?.some((s) => s.signerRole === "freelancer"));
    if (hasVisualSignature) {
      void runFreelancerApproval();
      return;
    }
    setActiveTab("signatures");
    showConfirm({
      title: "Tanda Tangan Anda Belum Ada",
      description: (
        <>
          Begitu kedua pihak menyetujui, dokumen langsung <strong>dikunci</strong> dan tanda tangan
          tidak bisa dibubuhkan lagi. Sebaiknya tanda tangani dulu di tab Tanda Tangan &amp; Persetujuan, baru menyetujui.
        </>
      ),
      type: "warning",
      confirmText: "Setujui Tanpa Tanda Tangan",
      cancelText: "Tanda Tangan Dulu",
      onConfirm: async () => {
        closeDialog();
        await runFreelancerApproval();
      },
    });
  };

  const runFreelancerApproval = async () => {
    setIsApproving(true);
    try {
      const updated = await approveVersion(agreement.id, "freelancer");
      if (updated) {
        setAgreement({ ...updated });
        showAlert({
          title: "Persetujuan Dicatat",
          description: "Persetujuan dan tanda tangan digital Anda berhasil dicatat secara resmi.",
          type: "success",
        });
      }
    } catch (err) {
      showAlert({
        title: "Gagal Menyetujui",
        description: err instanceof Error ? err.message : "Gagal menyetujui kesepakatan.",
        type: "danger",
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleCompleteAgreement = () => {
    showConfirm({
      title: "Tandai Proyek Selesai?",
      description: "Status kesepakatan akan diubah menjadi COMPLETED. Kuota kesepakatan aktif Anda akan otomatis dibebaskan kembali untuk proyek baru.",
      type: "success",
      confirmText: "Ya, Tandai Selesai",
      onConfirm: async () => {
        setDialogState((prev) => ({ ...prev, isLoading: true }));
        try {
          const updated = await completeAgreement(agreement.id);
          if (updated) {
            setAgreement({ ...updated });
            closeDialog();
            showAlert({
              title: "Proyek Selesai!",
              description: "Proyek berhasil diselesaikan dan kuota aktif telah dibebaskan.",
              type: "success",
            });
          }
        } catch (err) {
          closeDialog();
          showAlert({
            title: "Gagal Menyelesaikan",
            description: err instanceof Error ? err.message : "Gagal menyelesaikan proyek.",
            type: "danger",
          });
        }
      },
    });
  };

  const handleCancelAgreement = () => {
    showConfirm({
      title: "Batalkan Kesepakatan?",
      description: "Status kesepakatan akan diubah menjadi CANCELLED. Tindakan ini akan menghentikan seluruh proses kerja sama untuk kesepakatan ini.",
      type: "danger",
      confirmText: "Ya, Batalkan",
      onConfirm: async () => {
        setDialogState((prev) => ({ ...prev, isLoading: true }));
        try {
          const updated = await cancelAgreement(agreement.id);
          if (updated) {
            setAgreement({ ...updated });
            closeDialog();
            showAlert({
              title: "Kesepakatan Dibatalkan",
              description: "Status kesepakatan berhasil diubah menjadi CANCELLED.",
              type: "info",
            });
          }
        } catch (err) {
          closeDialog();
          showAlert({
            title: "Gagal Membatalkan",
            description: err instanceof Error ? err.message : "Gagal membatalkan kesepakatan.",
            type: "danger",
          });
        }
      },
    });
  };

  const handleDeleteDraft = () => {
    showConfirm({
      title: "Hapus Draf Kesepakatan?",
      description: "Apakah Anda yakin ingin menghapus draf ini secara permanen? Data draf yang telah dihapus tidak dapat dipulihkan kembali.",
      type: "danger",
      confirmText: "Ya, Hapus Permanen",
      onConfirm: async () => {
        setDialogState((prev) => ({ ...prev, isLoading: true }));
        try {
          await deleteAgreement(agreement.id);
          closeDialog();
          router.push("/dashboard");
        } catch (err) {
          closeDialog();
          showAlert({
            title: "Gagal Menghapus Draf",
            description: err instanceof Error ? err.message : "Gagal menghapus draf.",
            type: "danger",
          });
        }
      },
    });
  };

  const openNewVersionModal = () => {
    const base = agreement.currentVersion.contentJson;
    setRevisedScopeDesc(base.scope.description);
    setRevisedTotalValue(base.payment.totalValue);
    setRevisedDeadline(base.timeline.deadline);
    setNewVersionError("");
    setShowNewVersionModal(true);
  };

  const handleCreateNewVersionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isDraft = agreement.status === "DRAFT";
    const base = agreement.currentVersion.contentJson;
    const newTotal = Number(revisedTotalValue) || base.payment.totalValue;
    const dpPercent = base.payment.dpPercent ?? 50;
    const dpAmount = Math.round((newTotal * dpPercent) / 100);
    const remainingAmount = newTotal - dpAmount;
    const updatedMilestones = [
      ...(dpAmount > 0 ? [{ title: `Uang muka (DP) ${dpPercent}% sebelum pekerjaan dimulai`, amount: dpAmount }] : []),
      ...(remainingAmount > 0 ? [{ title: "Pelunasan saat hasil kerja diserahkan", amount: remainingAmount }] : []),
    ];

    const updatedContent: ContractContentJSON = {
      ...base,
      scope: { ...base.scope, description: revisedScopeDesc },
      payment: {
        ...base.payment,
        totalValue: newTotal,
        milestones: updatedMilestones,
      },
      timeline: { ...base.timeline, deadline: revisedDeadline || base.timeline.deadline },
    };

    setNewVersionError("");
    setIsSavingVersion(true);
    try {
      const updated = await createNewVersion(agreement.id, updatedContent, base.freelancer.name);
      if (updated) {
        setAgreement({ ...updated });
        setSelectedVersionNum(updated.currentVersionNumber);
        setShowNewVersionModal(false);
        if (isDraft) {
          showAlert({
            title: "Draf Diperbarui",
            description: "Perubahan isi draf kesepakatan berhasil disimpan.",
            type: "success",
          });
        } else {
          showAlert({
            title: `Versi ${updated.currentVersionNumber} Dibuat`,
            description: `Kesepakatan diperbarui ke versi ${updated.currentVersionNumber}. Tanda tangan kedua pihak direset dan klien perlu menyetujui ulang versi baru ini.`,
            type: "info",
          });
        }
      }
    } catch (err) {
      setNewVersionError(errorMessage(err));
    } finally {
      setIsSavingVersion(false);
    }
  };

  const freelancerStampedDoc = agreement.stampedDocuments?.find((d) => d.copyType === "freelancer_copy");
  const clientStampedDoc = agreement.stampedDocuments?.find((d) => d.copyType === "client_copy");
  const stampedCount = (freelancerStampedDoc ? 1 : 0) + (clientStampedDoc ? 1 : 0);
  const isUnder5Million = (agreement.currentVersion.contentJson.payment?.totalValue ?? 0) <= 5000000;

  const handleDocumentPdfUpload = async (copyType: "freelancer_copy" | "client_copy", e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      showAlert({
        title: "Format Berkas Tidak Sesuai",
        description: "Mohon pilih berkas dengan format PDF (.pdf).",
        type: "warning",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showAlert({
        title: "Ukuran Berkas Terlalu Besar",
        description: "Ukuran berkas PDF melebihi batas maksimal 10 MB.",
        type: "warning",
      });
      return;
    }

    setIsUploadingDoc(copyType);
    try {
      const updated = await uploadStampedDocument(agreement.id, {
        copyType,
        fileName: file.name,
        file,
        fileSize: file.size,
      });
      if (updated) {
        setAgreement({ ...updated });
        const copyLabel = copyType === "freelancer_copy" ? "Salinan Freelancer" : "Salinan Klien";
        showAlert({
          title: "Berkas Berhasil Diunggah!",
          description: `Berkas ${copyLabel} bermeterai resmi berhasil disimpan di sistem Sepakatin.`,
          type: "success",
        });
      }
    } catch (err) {
      console.error("Gagal unggah dokumen bermeterai:", err);
      showAlert({
        title: "Gagal Mengunggah Berkas",
        description: err instanceof Error ? err.message : "Gagal mengunggah dokumen. Silakan coba lagi.",
        type: "danger",
      });
    } finally {
      setIsUploadingDoc(null);
      e.target.value = "";
    }
  };

  const handleRemoveStampedDoc = (copyType: "freelancer_copy" | "client_copy") => {
    const copyLabel = copyType === "freelancer_copy" ? "Salinan Freelancer" : "Salinan Klien";
    showConfirm({
      title: `Hapus Berkas ${copyLabel}?`,
      description: `Berkas PDF ${copyLabel} bermeterai ini akan dihapus dari sistem. Anda dapat mengunggah kembali berkas baru setelahnya.`,
      type: "danger",
      confirmText: "Ya, Hapus Berkas",
      onConfirm: async () => {
        closeDialog();
        setIsUploadingDoc(copyType);
        try {
          const updated = await removeStampedDocument(agreement.id, copyType);
          if (updated) {
            setAgreement({ ...updated });
            showAlert({
              title: "Berkas Berhasil Dihapus",
              description: `Berkas ${copyLabel} berhasil dihapus dari sistem.`,
              type: "info",
            });
          }
        } catch (err) {
          console.error("Gagal menghapus dokumen:", err);
          showAlert({
            title: "Gagal Menghapus Berkas",
            description: err instanceof Error ? err.message : "Gagal menghapus dokumen.",
            type: "danger",
          });
        } finally {
          setIsUploadingDoc(null);
        }
      },
    });
  };

  const handleDownloadDoc = async (doc: StampedDocumentRecord) => {
    setIsDownloadingDoc(doc.copyType);
    try {
      const file = await fetchStampedDocumentUrl(agreement.id, doc.copyType);
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
      setIsDownloadingDoc(null);
    }
  };

  const handleSaveFreelancerSignature = async (sigDataUrl: string) => {
    setIsSavingSignature(true);
    try {
      const updated = await submitVisualSignature(agreement.id, "freelancer", content.freelancer.name, sigDataUrl);
      if (updated) {
        setAgreement({ ...updated });
        setIsEditingSignature(false);
        showAlert({
          title: "Tanda Tangan Tersimpan",
          description: "Tanda tangan Anda sudah menempel pada kedua salinan dokumen.",
          type: "success",
        });
      }
    } catch (err) {
      showAlert({
        title: "Tanda Tangan Gagal Disimpan",
        description: err instanceof Error ? err.message : "Tanda tangan tidak dapat disimpan. Silakan coba lagi.",
        type: "danger",
      });
    } finally {
      setIsSavingSignature(false);
    }
  };

  const waMessage = `Halo Pak/Bu ${content.client.name}, kesepakatan proyek "${content.projectName}" (${agreement.contractId}) telah selesai dibubuhi e-Meterai resmi Rp10.000.\n\nSalinan Klien yang sudah bermeterai resmi dapat Anda unduh langsung melalui tautan review berikut:\n${clientReviewUrl}\n\nTerima kasih!`;

  const copyWhatsAppMessage = async () => {
    const ok = await copyText(waMessage);
    if (!ok) {
      showAlert({
        title: "Pesan Tidak Bisa Disalin Otomatis",
        description: "Browser Anda memblokir penyalinan otomatis. Silakan blok dan salin teks pesan yang tampil di layar secara manual.",
        type: "warning",
      });
      return;
    }
    setCopiedWaText(true);
    setTimeout(() => setCopiedWaText(false), 3000);
  };

  const freelancerSig = agreement.signatures?.find((s) => s.signerRole === "freelancer");
  const clientSig = agreement.signatures?.find((s) => s.signerRole === "client");
  const isFreelancerSigned = Boolean(freelancerSig || freelancerApproval);
  const isClientSigned = Boolean(clientSig || clientApproval || agreement.status === "AGREED" || agreement.status === "COMPLETED" || agreement.status === "ACTIVE");
  const isSentToClient = agreement.status !== "DRAFT";
  const bothSigned = isFreelancerSigned && isClientSigned;
  const signedCount = (isFreelancerSigned ? 1 : 0) + (isClientSigned ? 1 : 0);

  const isDraftEdit = agreement.status === "DRAFT";
  const freeVersionLimitReached =
    !isDraftEdit && !isPremiumPlan(agreement.plan) && agreement.currentVersionNumber >= FREE_RULES.maxVersions;
  const isLastFreeVersion =
    !isDraftEdit && !isPremiumPlan(agreement.plan) && agreement.currentVersionNumber === FREE_RULES.maxVersions - 1;

  const isLocked = ["AGREED", "ACTIVE", "COMPLETED", "CANCELLED", "EXPIRED", "REJECTED"].includes(agreement.status);
  const canSign = !isLocked;

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

      {/* Ringkasan Kesepakatan & Aksi Cepat */}
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
            {isSentToClient && !freelancerApproval && !["COMPLETED", "CANCELLED", "EXPIRED", "REJECTED"].includes(agreement.status) && (
              <button onClick={handleApproveClick} disabled={isApproving} className="btn btn-primary btn-sm">
                <CheckCircle2 className="w-4 h-4" />
                {isApproving ? "Menyimpan..." : "Setujui"}
              </button>
            )}
            {(agreement.status === "AGREED" || agreement.status === "ACTIVE") && (
              <button
                onClick={handleCompleteAgreement}
                className="btn btn-secondary btn-sm text-emerald-700 hover:bg-emerald-50 border-emerald-300"
                title="Tandai proyek telah selesai dan bebaskan kuota aktif"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Tandai Selesai
              </button>
            )}
            {agreement.status === "DRAFT" ? (
              <button
                onClick={handleDeleteDraft}
                className="btn btn-ghost btn-sm text-rose-600 hover:bg-rose-50"
                title="Hapus draf kesepakatan ini secara permanen"
              >
                <Trash2 className="w-4 h-4" />
                Hapus Draf
              </button>
            ) : !["COMPLETED", "CANCELLED", "EXPIRED", "REJECTED"].includes(agreement.status) ? (
              <button
                onClick={handleCancelAgreement}
                className="btn btn-ghost btn-sm text-rose-600 hover:bg-rose-50"
                title="Batalkan kesepakatan ini"
              >
                <X className="w-4 h-4" />
                Batalkan
              </button>
            ) : null}
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

        {/* Link untuk klien — aktif setelah kesepakatan dikirim */}
        {isSentToClient ? (
          <div className="mt-6 p-4 rounded-xl bg-brand-50/60 border border-brand-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <p className="text-sm font-semibold text-brand-700">Link untuk klien</p>
                {agreement.reviewTokenExpiresAt && (
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                      new Date(agreement.reviewTokenExpiresAt) < new Date() &&
                      !["AGREED", "ACTIVE", "COMPLETED"].includes(agreement.status)
                        ? "bg-rose-100 text-rose-700 border border-rose-200"
                        : "bg-amber-100/70 text-amber-800 border border-amber-200"
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    {new Date(agreement.reviewTokenExpiresAt) < new Date() &&
                    !["AGREED", "ACTIVE", "COMPLETED"].includes(agreement.status)
                      ? "Tautan Kedaluwarsa (14 Hari)"
                      : `Berlaku s/d ${formatDateTimeID(agreement.reviewTokenExpiresAt)}`}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-600 truncate">{clientReviewUrl}</p>
              <p className="text-xs text-amber-800 mt-1.5 flex items-start gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>
                  Siapa pun yang memegang link ini bisa menyetujui dan menandatangani atas nama klien.
                  Kirim secara privat ke klien Anda — hindari membagikan ke grup publik.
                </span>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
              <button onClick={copyReviewUrl} className="btn btn-primary btn-sm">
                {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedLink ? "Tersalin!" : "Salin Link"}
              </button>
              <button
                onClick={handleRegenerateReviewToken}
                disabled={isRegeneratingToken}
                className="btn btn-secondary btn-sm"
                title="Terbitkan ulang tautan baru jika tautan lama kedaluwarsa atau bocor"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRegeneratingToken ? "animate-spin" : ""}`} />
                Terbitkan Ulang
              </button>
              <Link href={`/review/${agreement.reviewToken}`} target="_blank" className="btn btn-secondary btn-sm">
                Lihat sebagai Klien
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5 min-w-0">
              <Clock className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-slate-700">Link klien belum aktif</p>
                <p className="text-sm text-slate-500">
                  Kesepakatan ini masih draf. Kirim dulu ke klien lewat tab &lsquo;1. Draf Dokumen&rsquo; di bawah,
                  baru linknya dapat diakses.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ribbon Milestone Kemajuan Dokumen (Modul Komponen) */}
      <MilestoneStepper
        agreement={agreement}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        bothSigned={bothSigned}
        signedCount={signedCount}
        stampedCount={stampedCount}
        isUnder5Million={isUnder5Million}
        isSentToClient={isSentToClient}
      />

      {/* TAB 1: ISI DOKUMEN */}
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
            <div className="flex items-center gap-2">
              {agreement.status === "DRAFT" && (
                <button onClick={handleSendToClient} className="btn btn-primary btn-sm">
                  <Send className="w-3.5 h-3.5" />
                  Kirim ke Klien
                </button>
              )}
              <button onClick={openNewVersionModal} className="btn btn-secondary btn-sm">
                <PlusCircle className="w-4 h-4" />
                {agreement.status === "DRAFT" ? "Edit Draf" : "Ubah Kesepakatan"}
              </button>
            </div>
          </div>

          {agreement.status === "DRAFT" && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-950">Status Kesepakatan: Draf Baru</p>
                  <p className="mt-0.5 text-amber-800">
                    Periksa seluruh klausul di bawah ini. Setelah detail disetujui, klik <strong>Kirim ke Klien</strong> agar link peninjauan aktif dan kedua pihak dapat menandatangani dokumen.
                  </p>
                </div>
              </div>
              <button onClick={handleSendToClient} className="btn btn-primary btn-sm flex-shrink-0 self-start sm:self-center">
                <Send className="w-3.5 h-3.5" />
                Kirim ke Klien Sekarang
              </button>
            </div>
          )}

          {/* Ringkasan Parameter */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-slate-500 font-medium">Proyek:</span>
              <p className="font-bold text-slate-900 text-sm">{content.projectName}</p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Nilai Total:</span>
              <p className="font-bold text-brand-700 text-sm">{formatCurrencyIDR(content.payment.totalValue)}</p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Tenggat Waktu:</span>
              <p className="font-bold text-slate-900 text-sm">{formatDateID(content.timeline.deadline)}</p>
            </div>
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

      {/* TAB 2: TANDA TANGAN & PERSETUJUAN (Modul Komponen) */}
      {activeTab === "signatures" && (
        <SignatureTab
          agreement={agreement}
          content={content}
          bothSigned={bothSigned}
          signedCount={signedCount}
          isUnder5Million={isUnder5Million}
          isSentToClient={isSentToClient}
          canSign={canSign}
          freelancerSig={freelancerSig}
          clientSig={clientSig}
          freelancerApproval={freelancerApproval}
          clientApproval={clientApproval}
          isClientSigned={isClientSigned}
          isEditingSignature={isEditingSignature}
          setIsEditingSignature={setIsEditingSignature}
          isSavingSignature={isSavingSignature}
          isApproving={isApproving}
          copiedLink={copiedLink}
          copiedWaText={copiedWaText}
          onSaveFreelancerSignature={handleSaveFreelancerSignature}
          onSendToClient={handleSendToClient}
          onApproveClick={handleApproveClick}
          onCopyReviewUrl={copyReviewUrl}
          onCopyWhatsAppMessage={copyWhatsAppMessage}
          onSwitchToMeteraiTab={() => setActiveTab("meterai")}
        />
      )}

      {/* TAB 3: E-METERAI & SALINAN SAH (Modul Komponen) */}
      {activeTab === "meterai" && (
        <OfficialEmateraiGuideTab
          agreement={agreement}
          content={content}
          bothSigned={bothSigned}
          stampedCount={stampedCount}
          isUnder5Million={isUnder5Million}
          freelancerStampedDoc={freelancerStampedDoc}
          clientStampedDoc={clientStampedDoc}
          isUploadingDoc={isUploadingDoc}
          isDownloadingDoc={isDownloadingDoc}
          copiedWaText={copiedWaText}
          copiedLink={copiedLink}
          waMessage={waMessage}
          onDocumentPdfUpload={handleDocumentPdfUpload}
          onRemoveStampedDoc={handleRemoveStampedDoc}
          onDownloadDoc={handleDownloadDoc}
          onCompleteAgreement={handleCompleteAgreement}
          onCopyWhatsAppMessage={copyWhatsAppMessage}
          onCopyReviewUrl={copyReviewUrl}
          onSwitchToFinalTab={() => setActiveTab("final")}
        />
      )}

      {/* TAB 4: SAH & MENGIKAT PENUH (Modul Komponen) */}
      {activeTab === "final" && (
        <FinalConsensusTab
          agreement={agreement}
          content={content}
          bothSigned={bothSigned}
          stampedCount={stampedCount}
          isUnder5Million={isUnder5Million}
          onCompleteAgreement={handleCompleteAgreement}
          onCopyWhatsAppMessage={copyWhatsAppMessage}
          onCopyReviewUrl={copyReviewUrl}
          copiedWaText={copiedWaText}
          copiedLink={copiedLink}
          waMessage={waMessage}
        />
      )}

      {/* TAB 4: PERMINTAAN PERUBAHAN (Modul Komponen) */}
      {activeTab === "changes" && (
        <ChangeRequestsTab
          changeRequests={agreement.changeRequests}
          revisionContent={content.revision}
          onOpenNewVersionModal={openNewVersionModal}
        />
      )}

      {/* TAB 5: RIWAYAT & AUDIT (Modul Komponen) */}
      {activeTab === "audit" && (
        <ActivityTimelineTab
          versions={agreement.versions}
          activityLogs={agreement.activityLogs}
          selectedVersionNum={selectedVersionNum}
          onSelectVersion={setSelectedVersionNum}
        />
      )}

      {/* MODAL: UBAH KESEPAKATAN / EDIT DRAF (Modul Komponen) */}
      <VersionHistoryModal
        isOpen={showNewVersionModal}
        onClose={() => setShowNewVersionModal(false)}
        status={agreement.status}
        currentVersionNumber={agreement.currentVersionNumber}
        freeVersionLimitReached={freeVersionLimitReached}
        isLastFreeVersion={isLastFreeVersion}
        hasSignatures={Boolean(freelancerSig || clientSig)}
        revisedScopeDesc={revisedScopeDesc}
        setRevisedScopeDesc={setRevisedScopeDesc}
        revisedTotalValue={revisedTotalValue}
        setRevisedTotalValue={setRevisedTotalValue}
        revisedDeadline={revisedDeadline}
        setRevisedDeadline={setRevisedDeadline}
        isSavingVersion={isSavingVersion}
        newVersionError={newVersionError}
        onSubmit={handleCreateNewVersionSubmit}
      />

      {/* MODAL DIALOG KONFIRMASI & VALIDASI */}
      <ModalDialog onClose={closeDialog} {...dialogState} />
    </div>
  );
}
