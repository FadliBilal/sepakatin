"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, KeyRound, LogIn } from "lucide-react";
import { Logo } from "@/components/Logo";
import { DEMO_ACCOUNTS, isAdmin, login, useSession } from "@/lib/auth";

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
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, ready } = useSession();

  // Sudah masuk? Langsung ke dashboard / admin
  useEffect(() => {
    if (ready && user) router.replace(nextPath(isAdmin(user)));
  }, [ready, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    const result = await login(identifier, password);
    setIsSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push(nextPath(isAdmin(result.user || null)));
  };

  const fillDemo = (idx: number) => {
    setIdentifier(DEMO_ACCOUNTS[idx].email);
    setPassword(DEMO_ACCOUNTS[idx].password);
    setError("");
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-16">
      <Link href="/" className="back-link mb-8">
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Beranda
      </Link>

      <div className="card p-8 space-y-6">
        <div className="space-y-3">
          <Logo />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Masuk ke akun Anda</h1>
            <p className="text-sm text-slate-500 mt-1">Kelola semua kesepakatan kerja Anda di satu tempat.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="identifier">Username atau Email</label>
            <input
              id="identifier"
              type="text"
              required
              autoComplete="username"
              placeholder="contoh: fadli atau fadli@sepakatin.id"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="label" htmlFor="password">Kata Sandi</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="Masukkan kata sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3.5 py-2.5">{error}</p>
          )}

          <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">
            <LogIn className="w-4 h-4" />
            {isSubmitting ? "Memeriksa..." : "Masuk"}
          </button>
        </form>

        {/* Akun demo */}
        <div className="rounded-xl border border-brand-100 bg-brand-50/60 p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-brand-700">
            <KeyRound className="w-4 h-4" />
            Akun demo
          </div>
          <div className="space-y-2">
            {DEMO_ACCOUNTS.map((acc, idx) => (
              <div key={acc.id} className="flex items-center justify-between gap-3 bg-white rounded-lg border border-brand-100 px-3 py-2">
                <div className="text-xs leading-relaxed text-slate-600 min-w-0">
                  <p className="font-semibold text-slate-900">
                    {acc.fullName}{" "}
                    <span className="font-medium text-brand-600">
                      · {acc.hasSampleAgreement
                          ? "Pro, ada contoh dokumen"
                          : acc.role === "admin"
                          ? "Admin Platform (Akses Penuh)"
                          : `Gratis + ${acc.credits} kredit, masih kosong`}
                    </span>
                  </p>
                  <p className="break-all">{acc.email}</p>
                  <p>Kata sandi: <strong className="text-slate-900">{acc.password}</strong></p>
                </div>
                <button type="button" onClick={() => fillDemo(idx)} className="btn btn-secondary btn-sm">
                  Pakai
                </button>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-slate-500 text-center">
          Belum punya akun?{" "}
          <Link href="/auth/register" className="font-semibold text-brand-600 hover:underline">
            Daftar gratis
          </Link>
        </p>
      </div>
    </div>
  );
}
