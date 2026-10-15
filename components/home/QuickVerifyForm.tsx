"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export interface QuickVerifyFormProps {
  demoContractId: string;
}

export function QuickVerifyForm({ demoContractId }: QuickVerifyFormProps) {
  const router = useRouter();
  const [quickVerifyId, setQuickVerifyId] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (quickVerifyId.trim()) {
          router.push(`/verify/${quickVerifyId.trim().toUpperCase()}`);
        }
      }}
      className="flex gap-2 w-full md:w-auto"
    >
      <input
        type="text"
        placeholder={`Contoh: ${demoContractId}`}
        value={quickVerifyId}
        onChange={(e) => setQuickVerifyId(e.target.value)}
        className="input md:w-72 uppercase placeholder:normal-case"
        aria-label="Nomor dokumen untuk verifikasi keaslian"
      />
      <button type="submit" className="btn btn-primary">
        <Search className="w-4 h-4" />
        Cek
      </button>
    </form>
  );
}
