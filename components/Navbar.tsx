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
    <header className="sticky top-0 z-50 w-full bg-white/85 backdrop-blur-md border-b border-[#E8E8EC] no-print">
      <div className="container-page h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Link href="/" aria-label="Beranda Sepakatin" className="transition-opacity hover:opacity-90">
            <Logo size="sm" />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  isCurrent(item.href)
                    ? "text-[#0A0A0A] bg-slate-100 font-semibold"
                    : "text-[#6B6B6B] hover:text-[#0A0A0A] hover:bg-slate-50"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Tombol kanan (desktop) */}
        <div className="hidden md:flex items-center gap-3 min-h-[40px]">
          {ready && user && (
            <>
              <Link href="/agreements/new" className="btn btn-primary btn-sm">
                <Plus className="w-4 h-4" />
                Buat Kesepakatan
              </Link>
              <div className="flex items-center gap-2.5 pl-3 border-l border-[#E8E8EC]">
                <span className="w-8 h-8 rounded-full bg-brand-50 text-brand-700 text-xs font-bold flex items-center justify-center">
                  {initials}
                </span>
                <div className="leading-tight hidden lg:block">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold text-[#0A0A0A]">{user.fullName}</p>
                    {usage && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          usage.plan === "pro"
                            ? "bg-brand-50 text-brand-700 border border-brand-200"
                            : "bg-slate-100 text-[#6B6B6B] border border-[#E8E8EC]"
                        }`}
                      >
                        {usage.plan === "pro" ? "PRO" : `${usage.credits} Kredit`}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#6B6B6B]">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-md text-[#6B6B6B] hover:text-rose-600 hover:bg-rose-50 transition-colors"
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
              <Link href="/auth/login" className="btn btn-ghost btn-sm">
                Masuk
              </Link>
              <Link href="/auth/register" className="btn btn-primary btn-sm">
                Coba Gratis
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-md text-[#6B6B6B] hover:text-[#0A0A0A] hover:bg-[#F4F4F6]"
          aria-label="Buka menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Menu ponsel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E8E8EC] bg-white px-4 pt-3 pb-6 space-y-4">
          {user && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#FAFAFA] border border-[#E8E8EC]">
              <span className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 text-xs font-bold flex items-center justify-center">
                {initials}
              </span>
              <div className="leading-tight">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold font-display text-[#0A0A0A]">{user.fullName}</p>
                  {usage && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        usage.plan === "pro"
                          ? "bg-orange-50 text-orange-600 border border-orange-200"
                          : "bg-[#F4F4F6] text-[#6B6B6B] border border-[#E8E8EC]"
                      }`}
                    >
                      {usage.plan === "pro" ? "PRO" : `${usage.credits} Kredit`}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#8E8E93]">{user.email}</p>
              </div>
            </div>
          )}

          <div className="space-y-1">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 text-sm font-medium rounded-md ${
                  isCurrent(item.href) ? "text-[#6366F1] bg-indigo-50/70 font-semibold" : "text-[#4B4B4B]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-[#E8E8EC] grid gap-2">
            {user ? (
              <>
                <Link href="/agreements/new" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary">
                  <Plus className="w-4 h-4" />
                  Buat Kesepakatan
                </Link>
                <button onClick={handleLogout} className="btn btn-secondary">
                  <LogOut className="w-4 h-4" />
                  Keluar
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary">
                  Coba Gratis
                </Link>
                <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-secondary">
                  Masuk
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
