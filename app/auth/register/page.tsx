"use client";

import React, { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MailCheck,
  Phone,
  ShieldCheck,
  User,
  UserPlus,
} from "lucide-react";
import { isValidIndonesianPhone, register } from "@/lib/auth";
import { TurnstileWidget, type TurnstileWidgetHandle } from "@/components/TurnstileWidget";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  const handleTurnstileReset = useCallback(() => {
    setTurnstileToken("");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isValidIndonesianPhone(phone)) {
      setError("Nomor WhatsApp tidak valid. Masukkan nomor seluler aktif di Indonesia (contoh: 081234567890).");
      return;
    }

    if (password.length < 6) {
      setError("Kata sandi harus terdiri dari minimal 6 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi kata sandi tidak cocok. Harap periksa kembali.");
      return;
    }

    if (!agreedToTerms) {
      setError("Anda wajib menyetujui Ketentuan Layanan & Kebijakan Privasi.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (turnstileToken && turnstileToken !== "turnstile_unconfigured_bypass") {
        const verifyRes = await fetch("/api/auth/verify-turnstile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: turnstileToken, action: "register" }),
        });
        const verifyData = await verifyRes.json();
        if (!verifyRes.ok || !verifyData.success) {
          setError(verifyData.error || "Verifikasi keamanan Turnstile gagal. Silakan coba lagi.");
          turnstileRef.current?.reset();
          setTurnstileToken("");
          return;
        }
      }

      const result = await register({
        fullName,
        email,
        phone,
        password,
        captchaToken: turnstileToken,
      });
      if (result.error) {
        setError(result.error);
        turnstileRef.current?.reset();
        return;
      }
      if (result.needsConfirmation) {
        setNeedsConfirmation(true);
        return;
      }
      router.push("/dashboard");
    } catch {
      setError("Tidak bisa terhubung ke server. Periksa koneksi internet Anda lalu coba lagi.");
      turnstileRef.current?.reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (needsConfirmation) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-10 px-4 sm:px-6 bg-[#FAFAFA]">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl border border-[#E8E8EC] p-7 sm:p-9 text-center space-y-5">
            <div className="w-12 h-12 rounded-lg bg-indigo-50 text-[#6366F1] flex items-center justify-center mx-auto">
              <MailCheck className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-bold font-display text-[#0A0A0A]">Periksa Email Anda</h1>
              <p className="text-xs sm:text-sm text-[#6B6B6B] leading-relaxed">
                Tautan konfirmasi pendaftaran telah dikirim ke{" "}
                <strong className="text-[#0A0A0A] font-semibold">{email}</strong>.
              </p>
            </div>
            <p className="text-xs text-[#6B6B6B] bg-[#FAFAFA] p-3.5 rounded-lg border border-[#E8E8EC] leading-relaxed">
              Silakan periksa kotak masuk atau folder spam Anda, lalu klik tautan verifikasi untuk mulai menggunakan Sepakatin.
            </p>
            <Link href="/auth/login" className="btn btn-primary w-full">
              Lanjut ke Halaman Masuk
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isPasswordMatch =
    password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;

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
              Buat Akun Sepakatin
            </h1>
            <p className="text-xs sm:text-sm text-[#6B6B6B] mt-1.5 leading-relaxed">
              Mulai amankan proyek kerja Anda dengan kontrak hukum digital yang sah dan mengikat.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="fullName">
                Nama Lengkap
              </label>
              <div className="relative">
                <input
                  id="fullName"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Contoh: Budi Santoso"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input pl-10"
                />
                <User className="w-4 h-4 text-[#8E8E93] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="email">
                Alamat Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                />
                <Mail className="w-4 h-4 text-[#8E8E93] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="label" htmlFor="phone">
                  Nomor WhatsApp Aktif
                </label>
                <span className="text-[11px] text-[#8E8E93]">Untuk verifikasi kontrak</span>
              </div>
              <div className="relative">
                <input
                  id="phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  placeholder="Contoh: 081234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input pl-10"
                />
                <Phone className="w-4 h-4 text-[#8E8E93] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <p className="text-[11px] text-[#6B6B6B] mt-1">
                Wajib nomor aktif. 1 nomor hanya berlaku untuk 1 akun demi keamanan hukum.
              </p>
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
                  autoComplete="new-password"
                  placeholder="Minimal 6 karakter"
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

            <div>
              <label className="label" htmlFor="confirmPassword">
                Konfirmasi Kata Sandi
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  placeholder="Ketik ulang kata sandi"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input pl-10 pr-10"
                />
                <Lock className="w-4 h-4 text-[#8E8E93] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E8E93] hover:text-[#0A0A0A] transition p-1"
                  aria-label={showConfirmPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword.length > 0 && (
                <p
                  className={`text-[11px] mt-1.5 flex items-center gap-1 ${
                    isPasswordMatch ? "text-emerald-600 font-medium" : "text-rose-500"
                  }`}
                >
                  {isPasswordMatch ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Kata sandi cocok
                    </>
                  ) : (
                    "Kata sandi belum cocok"
                  )}
                </p>
              )}
            </div>

            <div className="pt-1">
              <label className="flex items-start gap-2.5 text-xs text-[#4B4B4B] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 rounded border-[#E8E8EC] text-[#6366F1] focus:ring-[#6366F1] w-3.5 h-3.5"
                />
                <span className="leading-relaxed">
                  Saya menyetujui <span className="text-[#0A0A0A] font-medium">Ketentuan Layanan</span> dan{" "}
                  <span className="text-[#0A0A0A] font-medium">Kebijakan Privasi</span> Sepakatin.
                </span>
              </label>
            </div>

            {error && (
              <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-md px-3.5 py-2.5 leading-relaxed">
                {error}
              </div>
            )}

            <TurnstileWidget
              ref={turnstileRef}
              action="register"
              onVerify={handleTurnstileVerify}
              onExpire={handleTurnstileReset}
              onError={handleTurnstileReset}
            />

            <div className="p-3 bg-[#FAFAFA] border border-[#E8E8EC] rounded-lg flex items-start gap-2.5 text-xs text-[#6B6B6B] leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-[#6366F1] shrink-0 mt-0.5" />
              <span>
                1 akun resmi terikat pada nomor WhatsApp Anda untuk integritas bukti hukum dan pencegahan penyalahgunaan kuota.
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full py-2.5 text-sm font-semibold"
            >
              <UserPlus className="w-4 h-4" />
              {isSubmitting ? "Mendaftarkan Akun..." : "Daftar Akun Baru"}
            </button>
          </form>

          <div className="pt-4 border-t border-[#E8E8EC] text-center">
            <p className="text-xs sm:text-sm text-[#6B6B6B]">
              Sudah memiliki akun?{" "}
              <Link href="/auth/login" className="font-semibold text-[#6366F1] hover:underline">
                Masuk ke akun Anda
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
