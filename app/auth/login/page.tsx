"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  LogIn,
  Mail,
} from "lucide-react";
import { isAdmin, login, useSession } from "@/lib/auth";
import { TurnstileWidget, type TurnstileWidgetHandle } from "@/components/TurnstileWidget";

function nextPath(isAdminUser = false): string {
  if (typeof window === "undefined") return isAdminUser ? "/admin" : "/dashboard";
  const next = new URLSearchParams(window.location.search).get("next");
  return next && next.startsWith("/") ? next : isAdminUser ? "/admin" : "/dashboard";
}

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);
  const { user, ready } = useSession();

  useEffect(() => {
    if (ready && user) router.replace(nextPath(isAdmin(user)));
  }, [ready, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      if (turnstileToken && turnstileToken !== "turnstile_unconfigured_bypass") {
        const verifyRes = await fetch("/api/auth/verify-turnstile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: turnstileToken, action: "login" }),
        });
        const verifyData = await verifyRes.json();
        if (!verifyRes.ok || !verifyData.success) {
          setError(verifyData.error || "Verifikasi keamanan Turnstile gagal. Silakan coba lagi.");
          turnstileRef.current?.reset();
          setTurnstileToken("");
          return;
        }
      }

      const result = await login(identifier, password, turnstileToken);
      if (result.error) {
        setError(result.error);
        turnstileRef.current?.reset();
        return;
      }
      router.push(nextPath(isAdmin(result.user || null)));
    } catch {
      setError("Tidak bisa terhubung ke server. Periksa koneksi internet Anda lalu coba lagi.");
      turnstileRef.current?.reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-10 px-4 sm:px-6 bg-[#FAFAFA]">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6B6B6B] hover:text-[#6366F1] transition mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Kembali ke Beranda
        </Link>

        <div className="bg-white rounded-xl border border-[#E8E8EC] p-7 sm:p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold font-display tracking-tight text-[#0A0A0A]">
              Masuk ke Akun Anda
            </h1>
            <p className="text-xs sm:text-sm text-[#6B6B6B] mt-1.5 leading-relaxed">
              Kelola kesepakatan kerja dan amankan hak proyek Anda di satu tempat.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="identifier">
                Email atau Username
              </label>
              <div className="relative">
                <input
                  id="identifier"
                  type="text"
                  required
                  autoComplete="username"
                  placeholder="nama@email.com atau username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="input pl-10"
                />
                <Mail className="w-4 h-4 text-[#8E8E93] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="password">
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="Masukkan kata sandi"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10 pr-10"
                />
                <Lock className="w-4 h-4 text-[#8E8E93] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E8E93] hover:text-[#0A0A0A] transition p-1"
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-[#4B4B4B]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#E8E8EC] text-[#6366F1] focus:ring-[#6366F1] w-3.5 h-3.5"
                />
                <span>Ingat saya di perangkat ini</span>
              </label>
            </div>

            {error && (
              <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-md px-3.5 py-2.5 leading-relaxed">
                {error}
              </div>
            )}

            <TurnstileWidget
              ref={turnstileRef}
              action="login"
              onVerify={(token) => setTurnstileToken(token)}
              onExpire={() => setTurnstileToken("")}
              onError={() => setTurnstileToken("")}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full py-2.5 text-sm font-semibold"
            >
              <LogIn className="w-4 h-4" />
              {isSubmitting ? "Memverifikasi..." : "Masuk ke Akun"}
            </button>
          </form>

          <div className="pt-4 border-t border-[#E8E8EC] text-center">
            <p className="text-xs sm:text-sm text-[#6B6B6B]">
              Belum memiliki akun?{" "}
              <Link href="/auth/register" className="font-semibold text-[#6366F1] hover:underline">
                Daftar gratis sekarang
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center text-[11px] text-[#8E8E93]">
          Perlindungan hukum sah KUHPerdata 1320 &middot; Tanda tangan digital UU ITE
        </div>
      </div>
    </div>
  );
}
