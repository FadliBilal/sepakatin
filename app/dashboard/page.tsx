"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  FileText,
  Copy,
  Check,
  ShieldCheck,
  Printer,
  ChevronRight,
  Wallet,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { errorMessage, getAccountUsage, getAgreements } from "@/lib/store";
import { AgreementRecord } from "@/lib/types";
import { AccountUsage } from "@/lib/plans";
import { StatusBadge } from "@/components/StatusBadge";
import { RequireAuth } from "@/components/RequireAuth";
import { formatCurrencyIDR, formatDateID } from "@/lib/crypto";
import { SessionUser } from "@/lib/auth";

export default function DashboardPage() {
  return <RequireAuth>{(user) => <Dashboard user={user} />}</RequireAuth>;
}

function Dashboard({ user }: { user: SessionUser }) {
  const [agreements, setAgreements] = useState<AgreementRecord[]>([]);
  const [usage, setUsage] = useState<AccountUsage | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [list, u] = await Promise.all([getAgreements(), getAccountUsage()]);
        setAgreements(list);
        setUsage(u);
      } catch (err) {
        setLoadError(errorMessage(err));
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const copyReviewLink = (token: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/review/${token}`);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const agreedCount = agreements.filter((a) => a.status === "AGREED").length;
  const pendingCount = agreements.filter(
    (a) => a.status === "PENDING_CLIENT" || a.status === "CHANGES_REQUESTED" || a.status === "PENDING_APPROVAL"
  ).length;
  const counted = agreements.filter((a) => a.status !== "CANCELLED");
  const totalValue = counted.reduce((sum, a) => sum + (Number(a.currentVersion.contentJson.payment.totalValue) || 0), 0);
  const firstName = (user.fullName || user.email).split(" ")[0];

  const isPro = usage?.plan === "pro";
  const freeLimitReached = !!usage && !isPro && usage.activeFreeAgreements >= usage.maxActiveFreeAgreements;
  const planNote = !usage
    ? "Memuat..."
    : isPro
    ? usage.planExpiresAt
      ? `Aktif sampai ${formatDateID(usage.planExpiresAt)}`
      : "Kesepakatan tanpa batas"
    : `${usage.activeFreeAgreements}/${usage.maxActiveFreeAgreements} kesepakatan Gratis aktif · ${usage.credits} kredit`;

  const stats = [
    { icon: Wallet, label: "Total nilai proyek", value: formatCurrencyIDR(totalValue), note: `${counted.length} proyek tercatat`, color: "text-brand-600 bg-brand-50" },
    { icon: CheckCircle2, label: "Sudah disepakati", value: String(agreedCount), note: "Disetujui kedua pihak", color: "text-emerald-600 bg-emerald-50" },
    { icon: Clock, label: "Menunggu tindakan", value: String(pendingCount), note: "Menunggu klien atau revisi", color: "text-amber-600 bg-amber-50" },
    { icon: Sparkles, label: "Paket Anda", value: usage ? (isPro ? "Pro" : "Gratis") : "…", note: planNote, color: "text-indigo-600 bg-indigo-50" },
  ];

  return (
    <div className="container-page py-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-slate-200">
        <div>
          <p className="kicker">Halo, {firstName}!</p>
          <h1 className="page-title mt-1">Kesepakatan Saya</h1>
          <p className="text-sm text-slate-500 mt-1">Pantau semua proyek dan status persetujuannya di sini.</p>
        </div>
        <Link href="/agreements/new" className="btn btn-primary">
          <Plus className="w-4 h-4" />
          Buat Kesepakatan Baru
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-8">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon className="w-4 h-4" />
              </span>
              <span className="text-sm font-medium text-slate-500">{s.label}</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-400 mt-1">{s.note}</p>
          </div>
        ))}
      </div>

      {freeLimitReached && (
        <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-sm text-amber-900">
            <strong>Kuota paket Gratis penuh.</strong> Tandai selesai atau batalkan kesepakatan lama
            {usage && usage.credits > 0 ? `, atau pakai 1 dari ${usage.credits} kredit Per Proyek Anda` : ", atau tambah kredit Per Proyek / upgrade ke Pro"}.
          </p>
          <Link href="/#harga" className="btn btn-secondary btn-sm self-start sm:self-auto">
            Lihat Paket
          </Link>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="card-title flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-600" />
            Daftar Kesepakatan
          </h2>
          <span className="text-sm text-slate-500">{agreements.length} kesepakatan</span>
        </div>

        {isLoading ? (
          <div className="card p-12 text-center text-sm text-slate-400 animate-pulse">Memuat kesepakatan...</div>
        ) : loadError ? (
          <div className="card p-12 text-center text-sm text-rose-700">{loadError}</div>
        ) : agreements.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
            <p className="card-title mb-2">Belum ada kesepakatan</p>
            <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
              Buat kesepakatan pertama Anda untuk mencatat pekerjaan, pembayaran, dan jatah revisi.
            </p>
            <Link href="/agreements/new" className="btn btn-primary">
              <Plus className="w-4 h-4" />
              Buat Kesepakatan Baru
            </Link>
          </div>
        ) : (
          <div className="card divide-y divide-slate-100 overflow-hidden">
            {agreements.map((agr) => {
              const content = agr.currentVersion.contentJson;
              const approvalsCount = agr.approvals.filter(
                (a) => a.versionId === agr.currentVersion.id && a.status === "APPROVED"
              ).length;

              return (
                <div
                  key={agr.id}
                  className="p-5 sm:p-6 hover:bg-slate-50/70 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={agr.status} />
                      <span className="text-xs font-medium text-slate-500">
                        {agr.contractId} · Versi {agr.currentVersionNumber}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {agr.plan === "pro" ? "Pro" : agr.plan === "per-proyek" ? "Per Proyek" : "Gratis"}
                      </span>
                    </div>

                    <Link href={`/agreements/${agr.id}`} className="block text-base font-semibold text-slate-900 hover:text-brand-600 transition-colors">
                      {content.projectName}
                    </Link>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                      <span>
                        Klien: <strong className="font-medium text-slate-700">{content.client.name}</strong>
                        {content.client.company ? ` (${content.client.company})` : ""}
                      </span>
                      <span>
                        Nilai: <strong className="font-semibold text-slate-900">{formatCurrencyIDR(content.payment.totalValue)}</strong>
                      </span>
                      <span>
                        Tenggat: <strong className="font-medium text-slate-700">{formatDateID(content.timeline.deadline)}</strong>
                      </span>
                      <span>
                        Disetujui: <strong className="font-semibold text-emerald-700">{approvalsCount}/2 pihak</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => copyReviewLink(agr.reviewToken)}
                      className="btn btn-secondary btn-sm"
                      title="Salin link untuk dikirim ke klien"
                    >
                      {copiedToken === agr.reviewToken ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Salin Link Klien
                        </>
                      )}
                    </button>
                    <Link href={`/agreements/${agr.id}/print`} className="btn btn-secondary btn-sm px-2.5" title="Cetak / simpan PDF">
                      <Printer className="w-4 h-4" />
                    </Link>
                    <Link href={`/verify/${agr.contractId}`} className="btn btn-secondary btn-sm px-2.5" title="Cek keaslian dokumen">
                      <ShieldCheck className="w-4 h-4" />
                    </Link>
                    <Link href={`/agreements/${agr.id}`} className="btn btn-primary btn-sm">
                      Buka
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
