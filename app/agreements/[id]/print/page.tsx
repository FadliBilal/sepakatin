"use client";

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getAgreement, getAgreementByReviewToken } from "@/lib/store";
import { AgreementRecord } from "@/lib/types";
import { useSession } from "@/lib/auth";
import { PrintableAgreement } from "@/components/PrintableAgreement";
import { buildSealedDemoAgreement } from "@/lib/demo-data";

/**
 * Versi cetak. Pemilik membuka lewat akunnya; klien membuka lewat `?token=<link undangan>`;
 * Dokumen contoh default (`agr_default_001`) bisa dibuka langsung oleh siapa saja.
 */
export default function AgreementPrintPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const token = searchParams.get("token");
  const { user, ready } = useSession();

  const [agreement, setAgreement] = useState<AgreementRecord | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing">("loading");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let data: AgreementRecord | null = null;
        if (token) {
          data = await getAgreementByReviewToken(token);
        } else if (user) {
          data = await getAgreement(id);
        }

        // Fallback untuk contoh dokumen publik default
        if (!data && (id === "agr_default_001" || id === "demo")) {
          data = await buildSealedDemoAgreement("usr_freelancer_fadli");
        }

        if (cancelled) return;
        const valid = data && (data.id === id || id === "agr_default_001" || id === "demo") ? data : null;
        setAgreement(valid);
        setState(valid ? "ready" : "missing");
      } catch {
        if (!cancelled) setState("missing");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, token, user, ready]);

  if (state === "loading") {
    return <div className="p-12 text-center text-xs text-slate-500 animate-pulse">Menyiapkan dokumen...</div>;
  }

  if (!agreement) {
    return (
      <div className="w-full max-w-lg mx-auto px-4 py-20">
        <div className="card p-8 text-center space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Dokumen tidak bisa dibuka</h2>
          <p className="text-sm text-slate-500">
            {user || token
              ? "Dokumen tidak ditemukan atau Anda tidak punya akses ke dokumen ini."
              : "Silakan masuk dengan akun pemilik dokumen, atau buka lewat link dari freelancer."}
          </p>
          <Link href={user || token ? "/" : `/auth/login?next=/agreements/${id}/print`} className="btn btn-primary">
            {user || token ? "Ke Beranda" : "Masuk"}
          </Link>
        </div>
      </div>
    );
  }

  const copyParam = searchParams.get("copy");
  const initialCopyType =
    copyParam === "client_copy" || copyParam === "freelancer_copy" ? copyParam : undefined;

  return (
    <PrintableAgreement
      agreement={agreement}
      initialCopyType={initialCopyType}
      backHref={token ? `/review/${token}` : user ? `/agreements/${agreement.id}` : "/"}
      backLabel={token ? "Kembali ke Halaman Persetujuan" : user ? "Kembali ke Kesepakatan" : "Kembali ke Beranda"}
    />
  );
}
