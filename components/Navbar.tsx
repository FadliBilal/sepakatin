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
  const { user, ready } = useSession();
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
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 no-print">
      <div className="container-page h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Link href="/" aria-label="Beranda Sepakatin">
            <Logo />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isCurrent(item.href)
                    ? "text-brand-600 bg-brand-50"
                    : "text-slate-600 hover:text-brand-600 hover:bg-slate-50"
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
              <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
                <span className="w-9 h-9 rounded-full bg-brand-50 text-brand-700 text-xs font-bold flex items-center justify-center">
                  {initials}
                </span>
                <div className="leading-tight hidden lg:block">
                  <p className="text-sm font-semibold text-slate-900">{user.fullName}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
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
          className="md:hidden p-2 rounded-lg text-slate-600 hover:text-brand-600 hover:bg-slate-100"
          aria-label="Buka menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Menu ponsel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4">
          {user && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
              <span className="w-10 h-10 rounded-full bg-brand-50 text-brand-700 text-sm font-bold flex items-center justify-center">
                {initials}
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-slate-900">{user.fullName}</p>
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
                className={`block px-3 py-2.5 text-sm font-medium rounded-lg ${
                  isCurrent(item.href) ? "text-brand-600 bg-brand-50" : "text-slate-700"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-200 grid gap-2">
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
