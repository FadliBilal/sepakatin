"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, MailCheck, UserPlus } from "lucide-react";
import { Logo } from "@/components/Logo";
import { register } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Kata sandi minimal 6 karakter.");
      return;
    }
    setIsSubmitting(true);
    const result = await register({ fullName, email, password });
    setIsSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.needsConfirmation) {
      setNeedsConfirmation(true);
      return;
    }
    router.push("/dashboard");
  };

  if (needsConfirmation) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-16">
        <div className="card p-8 space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
            <MailCheck className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Cek email Anda</h1>
          <p className="text-sm text-slate-500">
            Kami mengirim link konfirmasi ke <strong className="text-slate-900">{email}</strong>. Klik link tersebut,
            lalu masuk ke akun Anda.
          </p>
          <Link href="/auth/login" className="btn btn-primary">
            Ke Halaman Masuk
          </Link>
        </div>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Buat akun gratis</h1>
            <p className="text-sm text-slate-500 mt-1">
              Mulai amankan proyek Anda. Gratis untuk 2 kesepakatan aktif, tanpa kartu kredit.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="fullName">Nama Lengkap</label>
            <input
              id="fullName"
              type="text"
              required
              placeholder="Contoh: Rina Hartono"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="label" htmlFor="password">Kata Sandi</label>
            <input
              id="password"
              type="password"
              required
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
            />
          </div>

          {error && (
            <p className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3.5 py-2.5">{error}</p>
          )}

          <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">
            <UserPlus className="w-4 h-4" />
            {isSubmitting ? "Mendaftarkan..." : "Daftar Sekarang"}
          </button>
        </form>

        <p className="text-sm text-slate-500 text-center">
          Sudah punya akun?{" "}
          <Link href="/auth/login" className="font-semibold text-brand-600 hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}
