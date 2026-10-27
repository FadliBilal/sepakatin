"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Printer,
  ShieldCheck,
  Send,
  CheckCircle2,
  Lock,
  PlusCircle,
  Trash2,
  AlertTriangle,
  Clock,
  X,
  FileText,
} from "lucide-react";
import {
  getAgreement,
  approveVersion,
  sendAgreementToClient,
  regenerateReviewToken,
  startWork,
  createNewVersion,
  uploadStampedDocument,
  removeStampedDocument,
  fetchStampedDocumentUrl,
  submitVisualSignature,
  completeAgreement,
  cancelAgreement,
  deleteAgreement,
  rejectChangeRequest,
  errorMessage,
} from "@/lib/store";
import { AgreementRecord, ContractContentJSON, StampedDocumentRecord } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";
import { AgreementDocument } from "@/components/AgreementDocument";
import { RequireAuth } from "@/components/RequireAuth";
import { formatDateID, formatCurrencyIDR } from "@/lib/crypto";
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
import { ClientLinkBanner } from "@/components/agreements/ClientLinkBanner";

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
  const [revisedDeliverables, setRevisedDeliverables] = useState<string[]>([]);
  const [revisedExclusions, setRevisedExclusions] = useState<string[]>([]);
  const [revisedTotalValue, setRevisedTotalValue] = useState<number>(0);
  const [revisedDpPercent, setRevisedDpPercent] = useState<number>(50);
  const [revisedDeadline, setRevisedDeadline] = useState("");
  const [revisedRevisionCount, setRevisedRevisionCount] = useState<number>(2);
  const [revisedExtraRevisionRate, setRevisedExtraRevisionRate] = useState<number>(300000);

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
        const base = data.currentVersion.contentJson;
        setRevisedScopeDesc(base.scope.description);
        setRevisedDeliverables(base.scope.deliverables?.length ? [...base.scope.deliverables] : [""]);
        setRevisedExclusions(base.scope.exclusions?.length ? [...base.scope.exclusions] : [""]);
        setRevisedTotalValue(base.payment.totalValue);
        setRevisedDpPercent(base.payment.dpPercent ?? 50);
        setRevisedDeadline(base.timeline.deadline);
        setRevisedRevisionCount(base.revision?.count ?? 2);
        setRevisedExtraRevisionRate(base.revision?.extraRevisionRate ?? 300000);
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
  const displayContent = displayVersion.contentJson;
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

  const handleStartWork = () => {
    showConfirm({
      title: "Mulai Pengerjaan Proyek?",
      description: "Status kesepakatan akan diubah menjadi ACTIVE (Sedang Berjalan). Ini menandakan kesepakatan telah disepakati kedua belah pihak dan pengerjaan proyek resmi dimulai.",
      type: "success",
      confirmText: "Ya, Mulai Pekerjaan",
      onConfirm: async () => {
        setDialogState((prev) => ({ ...prev, isLoading: true }));
        try {
          const updated = await startWork(agreement.id);
          if (updated) {
            setAgreement({ ...updated });
            closeDialog();
            showAlert({
              title: "Pekerjaan Dimulai!",
              description: "Status proyek kini resmi Berjalan (ACTIVE).",
              type: "success",
            });
          }
        } catch (err) {
          closeDialog();
          showAlert({
            title: "Gagal Memulai Pekerjaan",
            description: err instanceof Error ? err.message : "Gagal memulai pekerjaan.",
            type: "danger",
          });
        }
      },
    });
  };

  const handleRejectChangeRequest = (requestId: string) => {
    showConfirm({
      title: "Tolak Permintaan Perubahan?",
      description: "Permintaan revisi ini akan ditandai ditolak. Jika tidak ada permintaan revisi lain yang terbuka, status kesepakatan akan dikembalikan ke status sebelumnya. Lanjutkan?",
      type: "danger",
      confirmText: "Ya, Tolak Permintaan",
      onConfirm: async () => {
        setDialogState((prev) => ({ ...prev, isLoading: true }));
        try {
          const updated = await rejectChangeRequest(agreement.id, requestId);
          if (updated) {
            setAgreement({ ...updated });
            closeDialog();
            showAlert({
              title: "Permintaan Ditolak",
              description: "Permintaan perubahan berhasil ditandai ditolak.",
              type: "info",
            });
          }
        } catch (err) {
          closeDialog();
          showAlert({
            title: "Gagal Menolak Permintaan",
            description: errorMessage(err),
            type: "danger",
          });
        }
      },
    });
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
    if (agreement.stampedDocuments && agreement.stampedDocuments.length > 0) {
      showConfirm({
        title: "Peringatan Dokumen Bermeterai",
        description: `Versi saat ini sudah memiliki berkas PDF bermeterai resmi. Menerbitkan amandemen baru akan menaikkan versi menjadi v${agreement.currentVersionNumber + 1} dan mewajibkan peninjauan serta konsensus ulang dari kedua pihak. Berkas bermeterai versi ini akan tetap tersimpan di riwayat versi. Lanjutkan?`,
        type: "warning",
        confirmText: "Ya, Lanjutkan Buat Amandemen",
        onConfirm: () => {
          closeDialog();
          launchVersionEditor();
        },
      });
      return;
    }
    launchVersionEditor();
  };

  const launchVersionEditor = () => {
    const base = agreement.currentVersion.contentJson;
    setRevisedScopeDesc(base.scope.description);
    setRevisedDeliverables(base.scope.deliverables?.length ? [...base.scope.deliverables] : [""]);
    setRevisedExclusions(base.scope.exclusions?.length ? [...base.scope.exclusions] : [""]);
    setRevisedTotalValue(base.payment.totalValue);
    setRevisedDpPercent(base.payment.dpPercent ?? 50);
    setRevisedDeadline(base.timeline.deadline);
    setRevisedRevisionCount(base.revision?.count ?? 2);
    setRevisedExtraRevisionRate(base.revision?.extraRevisionRate ?? 300000);
    setNewVersionError("");
    setShowNewVersionModal(true);
  };

  const handleCreateNewVersionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isDraft = agreement.status === "DRAFT";
    const base = agreement.currentVersion.contentJson;
    const newTotal = Number(revisedTotalValue) || base.payment.totalValue;
    const dpPercent = Math.min(100, Math.max(0, Number(revisedDpPercent) || 0));
    const dpAmount = Math.round((newTotal * dpPercent) / 100);
    const remainingAmount = Math.max(0, newTotal - dpAmount);
    const updatedMilestones = [
      ...(dpAmount > 0 ? [{ title: `Uang muka (DP) ${dpPercent}% sebelum pekerjaan dimulai`, amount: dpAmount }] : []),
      ...(remainingAmount > 0 ? [{ title: "Pelunasan saat hasil kerja diserahkan", amount: remainingAmount }] : []),
    ];

    const cleanDeliverables = revisedDeliverables.map((s) => s.trim()).filter(Boolean);
    const cleanExclusions = revisedExclusions.map((s) => s.trim()).filter(Boolean);

    const updatedContent: ContractContentJSON = {
      ...base,
      scope: {
        ...base.scope,
        description: revisedScopeDesc.trim(),
        deliverables: cleanDeliverables.length ? cleanDeliverables : base.scope.deliverables,
        exclusions: cleanExclusions,
      },
      payment: {
        ...base.payment,
        totalValue: newTotal,
        dpPercent,
        milestones: updatedMilestones,
      },
      timeline: { ...base.timeline, deadline: revisedDeadline || base.timeline.deadline },
      revision: {
        ...base.revision,
        count: Number(revisedRevisionCount) || base.revision.count,
        extraRevisionRate: Number(revisedExtraRevisionRate) || base.revision.extraRevisionRate,
      },
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
        // Otomatis catat persetujuan resmi freelancer secara sat-set
        let finalAgreement = updated;
        try {
          const approved = await approveVersion(agreement.id, "freelancer");
          if (approved) finalAgreement = approved;
        } catch {
          // Abaikan jika sudah disetujui sebelumnya
        }
        setAgreement({ ...finalAgreement });
        setIsEditingSignature(false);
        showAlert({
          title: "Tanda Tangan & Persetujuan Sah",
          description: "Tanda tangan dan persetujuan resmi Anda telah menempel pada dokumen kesepakatan.",
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
            {agreement.status === "AGREED" && (
              <button
                onClick={handleStartWork}
                className="btn btn-primary btn-sm bg-blue-600 hover:bg-blue-700 text-white"
                title="Tandai bahwa pekerjaan proyek telah resmi dimulai"
              >
                <Clock className="w-4 h-4" />
                Mulai Pengerjaan
              </button>
            )}
            {agreement.status === "ACTIVE" && (
              <button
                onClick={handleCompleteAgreement}
                className="btn btn-primary btn-sm bg-emerald-600 hover:bg-emerald-700 text-white"
                title="Tandai proyek telah selesai dan bebaskan kuota aktif"
              >
                <CheckCircle2 className="w-4 h-4" />
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

        {/* Link untuk klien - aktif setelah kesepakatan dikirim */}
        {isSentToClient ? (
          <ClientLinkBanner
            clientReviewUrl={clientReviewUrl}
            reviewToken={agreement.reviewToken}
            reviewTokenExpiresAt={agreement.reviewTokenExpiresAt}
            status={agreement.status}
            copiedLink={copiedLink}
            isRegeneratingToken={isRegeneratingToken}
            onCopyReviewUrl={copyReviewUrl}
            onRegenerateToken={handleRegenerateReviewToken}
          />
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

        {/* Banner Edukasi & Aksi Amandemen / Addendum jika sudah Deal */}
        {(agreement.status === "AGREED" || agreement.status === "ACTIVE") && (
          <div className="mt-6 p-5 rounded-xl bg-[#FAFAFA] border border-[#E8E8EC] space-y-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-[#0A0A0A]">
                  Dokumen Sah &amp; Terkunci Permanen
                </p>
                <p className="text-xs text-[#6B6B6B] leading-relaxed mt-0.5">
                  Isi versi ini telah dikunci demi kepastian hukum. Jika terjadi perubahan lingkup atau penambahan pekerjaan di tengah jalan, Anda memiliki 2 opsi resmi:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-lg bg-white border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-brand-700 mb-1">
                    <PlusCircle className="w-3.5 h-3.5" />
                    Opsi 1: Buat Amandemen (Versi {agreement.currentVersionNumber + 1})
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Revisi naskah dokumen ini langsung. Menaikkan versi dokumen ke v{agreement.currentVersionNumber + 1} dan memerlukan konsensus serta tanda tangan ulang dari kedua belah pihak.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openNewVersionModal}
                  className="btn btn-primary btn-sm mt-3 self-start text-xs"
                >
                  Buat Amandemen
                </button>
              </div>

              <div className="p-3.5 rounded-lg bg-white border border-amber-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-amber-800 mb-1">
                    <FileText className="w-3.5 h-3.5" />
                    Opsi 2: Buat Addendum Proyek
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Menerbitkan dokumen perjanjian pelengkap baru yang terikat pada Kontrak Induk ini ({agreement.contractId}), cocok untuk pekerjaan tambahan atau termin fase berikutnya.
                  </p>
                </div>
                <Link
                  href={`/agreements/new?addendum_to=${agreement.id}`}
                  className="btn btn-secondary btn-sm mt-3 self-start text-xs border-amber-300 text-amber-900 hover:bg-amber-50"
                >
                  Buat Dokumen Addendum
                </Link>
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

      {activeTab === "document" && (
        <div className="space-y-4">
          <div className="card p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="font-semibold text-[#6B6B6B] pr-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-[#6B6B6B]" />
                Versi:
              </span>
              {agreement.versions.map((v) => {
                const isCurrent = v.versionNumber === agreement.currentVersionNumber;
                const isSelected = selectedVersionNum === v.versionNumber;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVersionNum(v.versionNumber)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-[#6366F1] text-white shadow-sm ring-1 ring-brand-400"
                        : "text-[#0A0A0A] bg-white hover:bg-slate-50 border border-[#E8E8EC]"
                    }`}
                  >
                    <span>v{v.versionNumber}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isSelected
                          ? "bg-brand-700 text-white"
                          : isCurrent
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {isCurrent ? "Aktif" : "Riwayat"}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2">
              {agreement.status === "DRAFT" && (
                <button onClick={handleSendToClient} className="btn btn-primary btn-sm">
                  <Send className="w-3.5 h-3.5" />
                  Kirim ke Klien
                </button>
              )}
              {!["COMPLETED", "CANCELLED", "EXPIRED", "REJECTED"].includes(agreement.status) && (
                <button onClick={openNewVersionModal} className="btn btn-secondary btn-sm">
                  <PlusCircle className="w-4 h-4" />
                  {agreement.status === "DRAFT"
                    ? "Edit Draf"
                    : agreement.status === "AGREED" || agreement.status === "ACTIVE"
                    ? `Buat Amandemen (Versi ${agreement.currentVersionNumber + 1})`
                    : `Ubah Kesepakatan (Versi ${agreement.currentVersionNumber + 1})`}
                </button>
              )}
            </div>
          </div>

          {agreement.status === "DRAFT" && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-950">Status: Draf Baru</p>
                  <p className="mt-0.5 text-amber-800">
                    Periksa rincian di bawah. Jika sudah pas, klik <strong>Kirim ke Klien</strong> agar klien bisa membaca dan tanda tangan.
                  </p>
                </div>
              </div>
              <button onClick={handleSendToClient} className="btn btn-primary btn-sm flex-shrink-0 self-start sm:self-center">
                <Send className="w-3.5 h-3.5" />
                Kirim ke Klien
              </button>
            </div>
          )}

          {/* Ringkasan Parameter */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-slate-500 font-medium">Proyek:</span>
              <p className="font-bold text-slate-900 text-sm">{displayContent.projectName}</p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Nilai Total:</span>
              <p className="font-bold text-brand-700 text-sm">{formatCurrencyIDR(displayContent.payment.totalValue)}</p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Tenggat Waktu:</span>
              <p className="font-bold text-slate-900 text-sm">{formatDateID(displayContent.timeline.deadline)}</p>
            </div>
          </div>

          {displayVersion.versionNumber !== agreement.currentVersionNumber && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-amber-900">
              <div className="flex items-start gap-2.5">
                <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-950">
                    Anda sedang melihat arsip Versi {displayVersion.versionNumber}
                  </p>
                  <p className="text-xs text-amber-800 mt-0.5">
                    Dibuat pada {formatDateID(displayVersion.createdAt)}. Versi aktif saat ini adalah <strong>Versi {agreement.currentVersionNumber}</strong>.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVersionNum(agreement.currentVersionNumber)}
                className="btn btn-secondary btn-sm flex-shrink-0 self-start sm:self-center text-xs"
              >
                Lihat Versi {agreement.currentVersionNumber} (Aktif)
              </button>
            </div>
          )}

          <AgreementDocument content={displayContent} versionNumber={displayVersion.versionNumber} status={agreement.status} />
        </div>
      )}

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
          copiedLink={copiedLink}
          copiedWaText={copiedWaText}
          onSaveFreelancerSignature={handleSaveFreelancerSignature}
          onSendToClient={handleSendToClient}
          onCopyReviewUrl={copyReviewUrl}
          onCopyWhatsAppMessage={copyWhatsAppMessage}
          onSwitchToMeteraiTab={() => setActiveTab("meterai")}
        />
      )}

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

      {activeTab === "changes" && (
        <ChangeRequestsTab
          changeRequests={agreement.changeRequests}
          revisionContent={content.revision}
          onOpenNewVersionModal={openNewVersionModal}
          onRejectChangeRequest={handleRejectChangeRequest}
          agreementId={agreement.id}
          isLocked={isLocked}
        />
      )}

      {activeTab === "audit" && (
        <ActivityTimelineTab
          versions={agreement.versions}
          activityLogs={agreement.activityLogs}
          selectedVersionNum={selectedVersionNum}
          onSelectVersion={setSelectedVersionNum}
        />
      )}

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
        revisedDeliverables={revisedDeliverables}
        setRevisedDeliverables={setRevisedDeliverables}
        revisedExclusions={revisedExclusions}
        setRevisedExclusions={setRevisedExclusions}
        revisedTotalValue={revisedTotalValue}
        setRevisedTotalValue={setRevisedTotalValue}
        revisedDpPercent={revisedDpPercent}
        setRevisedDpPercent={setRevisedDpPercent}
        revisedDeadline={revisedDeadline}
        setRevisedDeadline={setRevisedDeadline}
        revisedRevisionCount={revisedRevisionCount}
        setRevisedRevisionCount={setRevisedRevisionCount}
        revisedExtraRevisionRate={revisedExtraRevisionRate}
        setRevisedExtraRevisionRate={setRevisedExtraRevisionRate}
        isSavingVersion={isSavingVersion}
        newVersionError={newVersionError}
        onSubmit={handleCreateNewVersionSubmit}
      />

      <ModalDialog onClose={closeDialog} {...dialogState} />
    </div>
  );
}
