"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useSession } from "@/lib/auth";

export function HomeHeroCta() {
  const { user } = useSession();
  const startHref = user ? "/agreements/new" : "/auth/register";

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Link href={startHref} className="btn btn-primary btn-lg">
        {user ? "Buat Kesepakatan" : "Coba Gratis Sekarang"}
        <ArrowRight className="w-5 h-5 ml-1" />
      </Link>
    </div>
  );
}
