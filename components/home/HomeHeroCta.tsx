"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { useSession } from "@/lib/auth";

export function HomeHeroCta() {
  const { user } = useSession();
  const startHref = user ? "/agreements/new" : "/auth/register";

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto">
      <Link
        href={startHref}
        className="btn btn-lg w-full sm:w-auto bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold shadow-[0_4px_16px_rgba(249,115,22,0.35)] border-0"
      >
        {user ? "Buat Kesepakatan" : "Coba Gratis Sekarang"}
        <ArrowRight className="w-4 h-4 ml-1" />
      </Link>
      <a
        href="#cara-kerja"
        className="btn btn-lg w-full sm:w-auto bg-white border border-blue-200 text-blue-700 hover:bg-blue-50/80 font-medium shadow-sm"
      >
        <BookOpen className="w-4 h-4 mr-1.5 text-blue-600" />
        Pelajari Cara Kerja
      </a>
    </div>
  );
}
