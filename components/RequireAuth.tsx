"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession, SessionUser } from "@/lib/auth";

interface RequireAuthProps {
  children: (user: SessionUser) => React.ReactNode;
}

/** Membungkus halaman yang hanya boleh dibuka setelah masuk akun. */
export function RequireAuth({ children }: RequireAuthProps) {
  const { user, ready } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (ready && !user) {
      router.replace(`/auth/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [ready, user, router, pathname]);

  if (!ready || !user) {
    return (
      <div className="container-page py-24 text-center text-sm text-slate-500 animate-pulse">
        Memeriksa akun Anda...
      </div>
    );
  }

  return <>{children(user)}</>;
}
