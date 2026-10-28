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
  Zap,
} from "lucide-react";
import { errorMessage, getAccountUsage, getAgreements } from "@/lib/store";
import { AgreementRecord } from "@/lib/types";
import { AccountUsage } from "@/lib/plans";
import { StatusBadge } from "@/components/StatusBadge";
import { RequireAuth } from "@/components/RequireAuth";
import { formatCurrencyIDR, formatDateID, formatDateTimeLongID, formatDateTimeShortID } from "@/lib/crypto";
import { refreshAccount, SessionUser } from "@/lib/auth";
import { copyText } from "@/lib/clipboard";
import { reviewUrlFor } from "@/lib/app-url";
import { ModalDialog } from "@/components/ModalDialog";
import { PaymentModal } from "@/components/PaymentModal";
import { PaymentPackageType } from "@/lib/types";

export default function DashboardPage() {
  return <RequireAuth>{(user) => <Dashboard user={user} />}</RequireAuth>;
}

function Dashboard({ user }: { user: SessionUser }) {
  const [agreements, setAgreements] = useState<AgreementRecord[]>([]);
  const [usage, setUsage] = useState<AccountUsage | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [copyFailedUrl, setCopyFailedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [buyPlanModal, setBuyPlanModal] = useState<PaymentPackageType | null>(null);

  async function loadData() {
    setIsLoading(true);
    try {
      await refreshAccount();
      const [list, u] = await Promise.all([getAgreements(), getAccountUsage()]);
      setAgreements(list);
      setUsage(u);
    } catch (err) {
      setLoadError(errorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const copyReviewLink = async (token: string) => {
    const url = reviewUrlFor(token);
    const ok = await copyText(url);
    if (!ok) {
      // Pastikan tautan berhasil disalin ke clipboard
      // Simpan fallback URL jika browser menolak clipboard otomatis
      setCopyFailedUrl(url);
      return;
    }
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
  const proExpiryDate =
    usage?.planExpiresAt ||
    user.proExpiresAt ||
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const freeLimitReached = !!usage && !isPro && usage.activeFreeAgreements >= usage.maxActiveFreeAgreements;
  const planNote = !usage
    ? "Memuat..."
    : isPro
    ? `Aktif sampai ${formatDateTimeShortID(proExpiryDate)} · ${usage.credits} kredit proyek`
    : `${usage.activeFreeAgreements}/${usage.maxActiveFreeAgreements} kesepakatan aktif · ${usage.credits} kredit proyek`;

  const stats = [
    { icon: Wallet, label: "Total nilai proyek", value: formatCurrencyIDR(totalValue), note: `${counted.length} proyek tercatat`, color: "text-blue-600 bg-blue-50" },
    { icon: CheckCircle2, label: "Sudah disepakati", value: String(agreedCount), note: "Disetujui kedua pihak", color: "text-emerald-600 bg-emerald-50" },
    { icon: Clock, label: "Menunggu tindakan", value: String(pendingCount), note: "Menunggu klien atau revisi", color: "text-amber-600 bg-amber-50" },
    { icon: Zap, label: "Paket Anda", value: usage ? (isPro ? "Paket Pro" : "Paket Gratis") : "…", note: planNote, color: "text-[#6366F1] bg-indigo-50" },
  ];

  return (
    <div className="container-page py-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-[#E8E8EC]">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <p className="kicker">Halo, {firstName}!</p>
            {usage && (
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded inline-flex items-center gap-1 ${
                    isPro
                      ? "bg-orange-50 text-orange-600 border border-orange-200"
                      : "bg-[#F4F4F6] text-[#4B4B4B] border border-[#E8E8EC]"
                  }`}
                >
                  <Zap className="w-3 h-3 text-orange-600" />
                  {isPro ? "Paket Pro" : "Paket Gratis"}
                </span>
                {isPro && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-600" />
                    Aktif hingga {formatDateTimeShortID(proExpiryDate)}
                  </span>
                )}
                <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#F4F4F6] text-[#6B6B6B] border border-[#E8E8EC]">
                  {usage.credits} Kredit Proyek
                </span>
              </div>
            )}
          </div>
          <h1 className="page-title mt-1 font-display">Kesepakatan Saya</h1>
          <p className="text-sm text-[#6B6B6B] mt-1">Pantau semua proyek dan status persetujuannya di sini.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/agreements/new"
            className="btn btn-primary text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 px-4 py-2.5"
          >
            <Plus className="w-4 h-4" />
            Buat Kesepakatan Baru
          </Link>
        </div>
      </div>

      {isPro && usage && (
        <div className="mt-6 rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 via-white to-purple-50/30 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#6366F1]/10 text-[#6366F1] flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 fill-[#6366F1]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold font-display text-[#0A0A0A]">
                  Langganan Paket Pro Aktif
                </h3>
                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-700" />
                  Aktif hingga {formatDateTimeShortID(proExpiryDate)}
                </span>
              </div>
              <p className="text-xs text-[#6B6B6B] mt-1 leading-relaxed">
                Masa aktif akun Pro Anda berlaku sampai tanggal{" "}
                <strong className="text-[#0A0A0A] font-semibold">{formatDateTimeLongID(proExpiryDate)}</strong>.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setBuyPlanModal("pro_monthly")}
            className="btn btn-secondary btn-sm text-xs shrink-0 self-start sm:self-auto border-indigo-200 text-[#6366F1] hover:bg-indigo-50"
          >
            Perpanjang Paket Pro
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-8">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon className="w-4 h-4" />
              </span>
              <span className="text-xs font-medium text-[#6B6B6B]">{s.label}</span>
            </div>
            <p className="text-2xl font-bold font-display text-[#0A0A0A]">{s.value}</p>
            <p className="text-xs text-[#8E8E93] mt-1">{s.note}</p>
          </div>
        ))}
      </div>

      {freeLimitReached && (
        <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50/70 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <p className="text-sm text-amber-900 leading-relaxed">
            <strong>Kuota paket Gratis penuh.</strong> Tandai selesai atau batalkan kesepakatan lama
            {usage && usage.credits > 0 ? `, atau pakai 1 dari ${usage.credits} kredit Per Proyek Anda` : ", atau tambah kredit Per Proyek / upgrade ke Pro instan via QRIS"}.
          </p>
          <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => setBuyPlanModal("credit_1")}
              className="btn btn-primary btn-sm text-xs"
            >
              + 1 Kredit (Rp19.000)
            </button>
            <button
              type="button"
              onClick={() => setBuyPlanModal("pro_monthly")}
              className="btn btn-secondary btn-sm text-xs"
            >
              Upgrade Pro (Rp49.000)
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="card-title flex items-center gap-2 font-display">
            <FileText className="w-4 h-4 text-blue-600" />
            Daftar Kesepakatan
          </h2>
          <span className="text-xs text-[#8E8E93]">{agreements.length} kesepakatan</span>
        </div>

        {isLoading ? (
          <div className="card p-12 text-center text-sm text-[#8E8E93] animate-pulse">Memuat kesepakatan...</div>
        ) : loadError ? (
          <div className="card p-12 text-center text-sm text-rose-600 border-rose-200 bg-rose-50/50">{loadError}</div>
        ) : agreements.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#E8E8EC] bg-white p-12 text-center">
            <p className="card-title mb-2 font-display">Belum ada kesepakatan</p>
            <p className="text-sm text-[#6B6B6B] mb-6 max-w-sm mx-auto">
              Buat kesepakatan pertama Anda untuk mencatat pekerjaan, pembayaran, dan jatah revisi.
            </p>
            <Link href="/agreements/new" className="btn btn-primary">
              <Plus className="w-4 h-4" />
              Buat Kesepakatan Baru
            </Link>
          </div>
        ) : (
          <div className="card divide-y divide-[#E8E8EC] overflow-hidden">
            {agreements.map((agr) => {
              const content = agr.currentVersion.contentJson;
              const approvalsCount = agr.approvals.filter(
                (a) => a.versionId === agr.currentVersion.id && a.status === "APPROVED"
              ).length;

              return (
                <div
                  key={agr.id}
                  className="p-5 sm:p-6 hover:bg-[#FAFAFA] transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={agr.status} />
                      <span className="font-mono text-xs font-semibold text-[#8E8E93]">
                        {agr.contractId} · v{agr.currentVersionNumber}
                      </span>
                      <span className="text-[11px] font-semibold text-[#4B4B4B] bg-[#F4F4F6] border border-[#E8E8EC] px-2 py-0.5 rounded">
                        {agr.plan === "pro" ? "Pro" : agr.plan === "per-proyek" ? "Per Proyek" : "Gratis"}
                      </span>
                    </div>

                    <Link href={`/agreements/${agr.id}`} className="block text-base font-semibold font-display text-[#0A0A0A] hover:text-blue-600 transition-colors">
                      {content.projectName}
                    </Link>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-[#6B6B6B]">
                      <span>
                        Klien: <strong className="font-medium text-[#0A0A0A]">{content.client.name}</strong>
                        {content.client.company ? ` (${content.client.company})` : ""}
                      </span>
                      <span>
                        Nilai: <strong className="font-semibold text-[#0A0A0A]">{formatCurrencyIDR(content.payment.totalValue)}</strong>
                      </span>
                      <span>
                        Tenggat: <strong className="font-medium text-[#0A0A0A]">{formatDateID(content.timeline.deadline)}</strong>
                      </span>
                      <span>
                        Disetujui: <strong className="font-semibold text-emerald-600">{approvalsCount}/2 pihak</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {agr.status === "DRAFT" ? (
                      <Link
                        href={`/agreements/${agr.id}`}
                        className="btn btn-secondary btn-sm text-[#4B4B4B]"
                        title="Buka kesepakatan untuk ditinjau dan dikirim ke klien"
                      >
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        Draf (Kirim Dulu)
                      </Link>
                    ) : (
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
                    )}
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

      <ModalDialog
        isOpen={Boolean(copyFailedUrl)}
        onClose={() => setCopyFailedUrl(null)}
        title="Link Tidak Bisa Disalin Otomatis"
        type="warning"
        description={
          <>
            Browser Anda memblokir penyalinan otomatis. Silakan salin link ini secara manual:
            <span className="block mt-2 p-2.5 rounded-lg bg-slate-100 border border-slate-200 break-all text-slate-800 text-xs">
              {copyFailedUrl}
            </span>
          </>
        }
      />

      {buyPlanModal && (
        <PaymentModal
          isOpen={true}
          onClose={() => setBuyPlanModal(null)}
          packageType={buyPlanModal}
          onSuccess={() => {
            setBuyPlanModal(null);
            getAccountUsage().then((u) => setUsage(u));
          }}
        />
      )}
    </div>
  );
}
