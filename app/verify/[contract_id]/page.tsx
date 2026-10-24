"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, ShieldAlert, XCircle, ArrowLeft, CheckCircle2, Clock, Check, AlertTriangle } from "lucide-react";
import { getVerificationData } from "@/lib/store";
import { PublicVerificationData } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";
import { QRCodeViewer } from "@/components/QRCodeViewer";
import { formatDateID, formatDateTimeID } from "@/lib/crypto";

export default function PublicContractVerificationPage() {
  const params = useParams();
  const contractIdParam = decodeURIComponent((params.contract_id as string) || "");

  const [verifyData, setVerifyData] = useState<PublicVerificationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    async function load() {
      if (contractIdParam) {
        setVerifyData(await getVerificationData(contractIdParam));
      }
      setCurrentUrl(window.location.href);
      setIsLoading(false);
    }
    load();
  }, [contractIdParam]);

  if (isLoading) {
    return (
      <div className="container-page py-24 text-center text-sm text-slate-500 animate-pulse">
        Sedang memeriksa keaslian dokumen...
      </div>
    );
  }

  if (!verifyData) {
    return (
      <div className="w-full max-w-lg mx-auto px-4 py-20">
        <div className="card p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <XCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Dokumen tidak ditemukan</h2>
          <p className="text-sm text-slate-500">
            Tidak ada kesepakatan dengan nomor <strong className="text-slate-900">{contractIdParam}</strong>.
            Periksa lagi penulisan nomornya.
          </p>
          <Link href="/verify" className="btn btn-secondary">
            Cari nomor lain
          </Link>
        </div>
      </div>
    );
  }

  const isOriginal = verifyData.isIntegrityMatched;
  const isAgreed = verifyData.status === "AGREED";

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <Link href="/verify" className="back-link mb-6">
        <ArrowLeft className="w-4 h-4" />
        Cek nomor lain
      </Link>

      <div className="card overflow-hidden">
        {/* Hasil pengecekan */}
        <div
          className={`p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            isOriginal ? "bg-[#6366F1]" : "bg-rose-600"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg bg-white/15 flex items-center justify-center border border-white/20 flex-shrink-0">
              {isOriginal ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
            </div>
            <div>
              <p className="text-xs text-white/80 uppercase tracking-wider font-semibold">Hasil pengecekan Sepakatin</p>
              <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight">
                {!isOriginal
                  ? "Isi dokumen tidak cocok"
                  : isAgreed
                  ? "Dokumen asli & sudah disepakati"
                  : "Dokumen asli & terdaftar"}
              </h1>
            </div>
          </div>
          <span className="self-start sm:self-auto px-3 py-1 bg-white/20 rounded-md text-xs font-semibold inline-flex items-center gap-1.5">
            {isOriginal ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" /> Asli, tidak diubah
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-amber-300" /> Ada perubahan
              </>
            )}
          </span>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pb-6 border-b border-[#E8E8EC]">
            <div>
              <p className="text-xs font-medium text-[#6B6B6B]">Nomor dokumen</p>
              <p className="text-lg font-bold font-mono text-[#6366F1]">{verifyData.contractId}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#6B6B6B] mb-1">Status</p>
              <StatusBadge status={verifyData.status} />
            </div>
            <div>
              <p className="text-xs font-medium text-[#6B6B6B]">Versi dokumen</p>
              <p className="text-sm font-semibold font-mono text-[#0A0A0A]">Versi {verifyData.versionNumber}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#6B6B6B]">Persetujuan</p>
              <p className="text-sm font-semibold text-[#0A0A0A]">
                {verifyData.partiesApprovedCount} dari {verifyData.totalPartiesRequired} pihak sudah setuju
              </p>
            </div>
          </div>

          <div className="space-y-4 pb-6 border-b border-[#E8E8EC]">
            <div>
              <p className="text-xs font-medium text-[#6B6B6B]">Nama proyek</p>
              <p className="text-base font-bold font-display text-[#0A0A0A] mt-0.5">{verifyData.projectName}</p>
              <p className="text-xs text-[#6B6B6B] mt-1">
                Berlaku {formatDateID(verifyData.validFrom)} s.d. {formatDateID(verifyData.validUntil)}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { role: "Pihak pertama (Freelancer)", name: verifyData.freelancerName, at: verifyData.freelancerApprovedAt },
                { role: "Pihak kedua (Klien)", name: verifyData.clientName, at: verifyData.clientApprovedAt },
              ].map((p) => (
                <div key={p.role} className="p-4 rounded-lg border border-[#E8E8EC] bg-[#FAFAFA]">
                  <p className="text-xs font-medium text-[#6B6B6B]">{p.role}</p>
                  <p className="text-sm font-bold text-[#0A0A0A] mt-1">{p.name}</p>
                  {p.at ? (
                    <p className="text-xs text-emerald-700 font-medium mt-1.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Setuju pada {formatDateTimeID(p.at)}
                    </p>
                  ) : (
                    <p className="text-xs text-amber-700 font-medium mt-1.5 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Belum menyetujui
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-sm text-[#6B6B6B] space-y-1">
              <p className="font-semibold text-[#0A0A0A]">Dicek pada</p>
              <p>{formatDateTimeID(verifyData.verifiedAt)}</p>
              <p className="text-xs text-[#8E8E93] max-w-xs">
                Pindai kode QR ini dengan kamera HP untuk membuka halaman pengecekan ini.
              </p>
            </div>
            <div className="p-3 bg-white border border-[#E8E8EC] rounded-lg flex-shrink-0">
              {currentUrl && <QRCodeViewer value={currentUrl} size={110} />}
            </div>
          </div>
        </div>

        <div className="bg-[#FAFAFA] px-6 sm:px-8 py-3.5 border-t border-[#E8E8EC] flex flex-wrap items-center justify-between gap-3">
          {verifyData.hasStampedDocuments ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {verifyData.stampedDocumentsCount === 2
                ? "2/2 Salinan Berkas Bermeterai Resmi Tersedia"
                : "Berkas Bermeterai Resmi Tersedia"}
            </span>
          ) : (
            <span className="text-xs text-[#6B6B6B] font-mono">
              Integritas kriptografis SHA-256
            </span>
          )}
          <span className="text-xs text-[#8E8E93]">
            Terverifikasi oleh Sepakatin Trust Network
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-400 text-center max-w-xl mx-auto leading-relaxed mt-8">
        Pengecekan ini memastikan isi kesepakatan tidak pernah diubah sejak disetujui bersama.
        Sepakatin bukan kantor hukum atau notaris.
      </p>
    </div>
  );
}
