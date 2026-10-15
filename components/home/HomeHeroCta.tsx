"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { useSession } from "@/lib/auth";

export function HomeHeroCta() {
  const { user } = useSession();
  const startHref = user ? "/agreements/new" : "/auth/register";

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Link href={startHref} className="btn btn-primary btn-lg">
        {user ? "Buat Kesepakatan" : "Coba Gratis Sekarang"}
        <ArrowRight className="w-5 h-5" />
      </Link>
      <Link href="/agreements/agr_default_001/print" className="btn btn-secondary btn-lg">
        <FileText className="w-5 h-5" />
        Lihat Contoh Dokumen
      </Link>
    </div>
  );
}
