"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, ShieldAlert, XCircle, ArrowLeft, CheckCircle2, Clock, Printer } from "lucide-react";
import { getVerificationData, getAgreementByContractId } from "@/lib/store";
import { PublicVerificationData, AgreementRecord } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";
import { QRCodeViewer } from "@/components/QRCodeViewer";
import { formatDateID, formatDateTimeID } from "@/lib/crypto";

export default function PublicContractVerificationPage() {
  const params = useParams();
  const contractIdParam = decodeURIComponent((params.contract_id as string) || "");

  const [verifyData, setVerifyData] = useState<PublicVerificationData | null>(null);
  const [agreementRecord, setAgreementRecord] = useState<AgreementRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    async function load() {
      if (contractIdParam) {
        setVerifyData(await getVerificationData(contractIdParam));
        setAgreementRecord(await getAgreementByContractId(contractIdParam));
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
            isOriginal ? "bg-gradient-to-r from-brand-600 to-brand-700" : "bg-gradient-to-r from-rose-600 to-rose-700"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center border border-white/20 flex-shrink-0">
              {isOriginal ? <ShieldCheck className="w-7 h-7" /> : <ShieldAlert className="w-7 h-7" />}
            </div>
            <div>
              <p className="text-sm text-white/80">Hasil pengecekan Sepakatin</p>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                {!isOriginal
                  ? "Isi dokumen tidak cocok"
                  : isAgreed
                  ? "Dokumen asli & sudah disepakati"
                  : "Dokumen asli & terdaftar"}
              </h1>
            </div>
          </div>
          <span className="self-start sm:self-auto px-3 py-1.5 bg-white/20 rounded-lg text-sm font-semibold">
            {isOriginal ? "✓ Asli, tidak diubah" : "⚠ Ada perubahan"}
          </span>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pb-6 border-b border-slate-100">
            <div>
              <p className="text-xs font-medium text-slate-500">Nomor dokumen</p>
              <p className="text-lg font-bold text-brand-600">{verifyData.contractId}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">Status</p>
              <StatusBadge status={verifyData.status} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Versi dokumen</p>
              <p className="text-sm font-semibold text-slate-900">Versi {verifyData.versionNumber}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Persetujuan</p>
              <p className="text-sm font-semibold text-slate-900">
                {verifyData.partiesApprovedCount} dari {verifyData.totalPartiesRequired} pihak sudah setuju
              </p>
            </div>
          </div>

          <div className="space-y-4 pb-6 border-b border-slate-100">
            <div>
              <p className="text-xs font-medium text-slate-500">Nama proyek</p>
              <p className="text-base font-bold text-slate-900 mt-0.5">{verifyData.projectName}</p>
              <p className="text-xs text-slate-500 mt-1">
                Berlaku {formatDateID(verifyData.validFrom)} s.d. {formatDateID(verifyData.validUntil)}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { role: "Pihak pertama (Freelancer)", name: verifyData.freelancerName, at: verifyData.freelancerApprovedAt },
                { role: "Pihak kedua (Klien)", name: verifyData.clientName, at: verifyData.clientApprovedAt },
              ].map((p) => (
                <div key={p.role} className="doc-box">
                  <p className="text-xs font-medium text-slate-500">{p.role}</p>
                  <p className="text-sm font-bold text-slate-900 mt-1">{p.name}</p>
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
            <div className="text-sm text-slate-500 space-y-1">
              <p className="font-semibold text-slate-900">Dicek pada</p>
              <p>{formatDateTimeID(verifyData.verifiedAt)}</p>
              <p className="text-xs text-slate-400 max-w-xs">
                Pindai kode QR ini dengan kamera HP untuk membuka halaman pengecekan ini.
              </p>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-xl flex-shrink-0">
              {currentUrl && <QRCodeViewer value={currentUrl} size={110} />}
            </div>
          </div>
        </div>

        {agreementRecord && (
          <div className="bg-slate-50 px-6 sm:px-8 py-4 border-t border-slate-100 flex flex-wrap items-center justify-end gap-3">
            <Link href={`/agreements/${agreementRecord.id}/print`} className="btn btn-secondary btn-sm">
              <Printer className="w-4 h-4" />
              Lihat Dokumen
            </Link>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400 text-center max-w-xl mx-auto leading-relaxed mt-8">
        Pengecekan ini memastikan isi kesepakatan tidak pernah diubah sejak disetujui bersama.
        Sepakatin bukan kantor hukum atau notaris.
      </p>
    </div>
  );
}
