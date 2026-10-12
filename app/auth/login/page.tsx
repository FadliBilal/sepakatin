"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  LogIn,
  Mail,
  ShieldCheck,
  Star,
  UserCheck,
} from "lucide-react";
import { isAdmin, login, useSession } from "@/lib/auth";

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
  const { user, ready } = useSession();

  useEffect(() => {
    if (ready && user) router.replace(nextPath(isAdmin(user)));
  }, [ready, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const result = await login(identifier, password);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push(nextPath(isAdmin(result.user || null)));
    } catch {
      setError("Tidak bisa terhubung ke server. Periksa koneksi internet Anda lalu coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillCredentials = (userValue: string, passValue: string) => {
    setIdentifier(userValue);
    setPassword(passValue);
    setError("");
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-10 px-4 sm:px-6 bg-slate-50/60">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-brand-600 transition mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Kembali ke Beranda
        </Link>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7 sm:p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Masuk ke Akun Anda
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
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
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1"
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 w-3.5 h-3.5"
                />
                <span>Ingat saya di perangkat ini</span>
              </label>
            </div>

            {error && (
              <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3.5 py-2.5 leading-relaxed">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full py-2.5 text-sm font-semibold shadow-sm"
            >
              <LogIn className="w-4 h-4" />
              {isSubmitting ? "Memverifikasi..." : "Masuk ke Akun"}
            </button>
          </form>

          {/* Opsi Akses Cepat Akun Demo untuk Penilaian / Pengujian */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-brand-600" />
                Uji Coba Cepat (Akun Demo)
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Klik untuk isi otomatis</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials("admin@sepakatin.id", "Admin12345!")}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-brand-50 hover:border-brand-300 transition text-left group"
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800 group-hover:text-brand-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
                  <span className="truncate">Admin</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">Akses Penuh</p>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials("fadli@sepakatin.id", "Admin12345!")}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-brand-50 hover:border-brand-300 transition text-left group"
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800 group-hover:text-brand-700">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />
                  <span className="truncate">Pro</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">Ada Dokumen</p>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials("demo@sepakatin.id", "Admin12345!")}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-brand-50 hover:border-brand-300 transition text-left group"
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800 group-hover:text-brand-700">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span className="truncate">Gratis</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">Kredit Baru</p>
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-xs sm:text-sm text-slate-600">
              Belum memiliki akun?{" "}
              <Link href="/auth/register" className="font-semibold text-brand-600 hover:underline">
                Daftar gratis sekarang
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center text-[11px] text-slate-400">
          Perlindungan hukum sah KUHPerdata 1320 &middot; Tanda tangan digital UU ITE
        </div>
      </div>
    </div>
  );
}
