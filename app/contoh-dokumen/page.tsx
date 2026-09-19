"use client";

import React, { useEffect, useState } from "react";
import { buildSealedDemoAgreement } from "@/lib/demo-data";
import { AgreementRecord } from "@/lib/types";
import { PrintableAgreement } from "@/components/PrintableAgreement";

/** Contoh surat kesepakatan yang bisa dilihat siapa saja tanpa akun. */
export default function SampleDocumentPage() {
  const [agreement, setAgreement] = useState<AgreementRecord | null>(null);

  useEffect(() => {
    buildSealedDemoAgreement("demo").then(setAgreement);
  }, []);

  if (!agreement) {
    return <div className="p-12 text-center text-xs text-slate-500 animate-pulse">Menyiapkan contoh dokumen...</div>;
  }
  return <PrintableAgreement agreement={agreement} backHref="/" backLabel="Kembali ke Beranda" />;
}
