"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Plus, LogOut } from "lucide-react";
import { Logo } from "@/components/Logo";
import { isAdmin, logout, useSession } from "@/lib/auth";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, ready, usage } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const admin = isAdmin(user);
  const navLinks = [
    ...(user ? [{ href: "/dashboard", label: "Dashboard" }] : []),
    ...(admin ? [{ href: "/admin", label: "Admin Panel" }] : []),
    { href: "/verify", label: "Cek Dokumen" },
  ];

  const isCurrent = (path: string) => !path.includes("#") && pathname.startsWith(path);

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    await logout();
    router.push("/");
  };

  const initials = (user?.fullName || user?.email || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-3 sm:top-4 z-50 w-full px-3 sm:px-6 pointer-events-none no-print">
      <div className="max-w-6xl mx-auto">
        {/* Bubble Pill Navbar */}
        <div className="pointer-events-auto flex items-center justify-between gap-4 h-14 sm:h-16 px-4 sm:px-6 rounded-full bg-white/85 backdrop-blur-xl border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.05)] hover:border-slate-300 transition-all">
          <div className="flex items-center gap-6 lg:gap-8">
            <Link href="/" aria-label="Beranda Sepakatin" className="transition-opacity hover:opacity-90 flex items-center">
              <Logo size="sm" />
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all ${
                    isCurrent(item.href)
                      ? "text-slate-900 bg-slate-100 shadow-2xs font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Tombol kanan (desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {ready && user && (
              <>
                <Link href="/agreements/new" className="btn btn-primary btn-sm rounded-full px-4 py-1.5 text-xs">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Buat Kesepakatan</span>
                </Link>
                <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
                  <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200/60 flex items-center justify-center">
                    {initials}
                  </span>
                  <div className="leading-tight hidden lg:block text-left">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-semibold text-slate-900">{user.fullName}</p>
                      {usage && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            usage.plan === "pro"
                              ? "bg-orange-50 text-orange-600 border border-orange-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {usage.plan === "pro" ? "PRO" : `${usage.credits} Kredit`}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">{user.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1"
                    title="Keluar"
                    aria-label="Keluar"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
            {ready && !user && (
              <>
                <Link href="/auth/login" className="btn btn-ghost btn-sm rounded-full px-3.5 py-1.5 text-xs font-semibold">
                  Masuk
                </Link>
                <Link href="/auth/register" className="btn btn-primary btn-sm rounded-full px-4 py-1.5 text-xs font-semibold">
                  Coba Gratis
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Buka menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Menu ponsel (Floating Card) */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 p-4 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200 shadow-xl pointer-events-auto space-y-3">
            {user && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-200 flex items-center justify-center">
                  {initials}
                </span>
                <div className="leading-tight">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold font-display text-slate-900">{user.fullName}</p>
                    {usage && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          usage.plan === "pro"
                            ? "bg-orange-50 text-orange-600 border border-orange-200"
                            : "bg-white text-slate-600 border border-slate-200"
                        }`}
                      >
                        {usage.plan === "pro" ? "PRO" : `${usage.credits} Kredit`}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </div>
            )}

            <div className="space-y-1">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3.5 py-2 text-sm font-medium rounded-xl transition-colors ${
                    isCurrent(item.href)
                      ? "text-blue-600 bg-blue-50/80 font-semibold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 grid gap-2">
              {user ? (
                <>
                  <Link href="/agreements/new" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary rounded-xl">
                    <Plus className="w-4 h-4" />
                    Buat Kesepakatan
                  </Link>
                  <button onClick={handleLogout} className="btn btn-secondary rounded-xl">
                    <LogOut className="w-4 h-4" />
                    Keluar
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary rounded-xl">
                    Coba Gratis
                  </Link>
                  <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-secondary rounded-xl">
                    Masuk
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
