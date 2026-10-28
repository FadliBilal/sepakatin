// Sepakatin — Akun & sesi login (Supabase Auth / Mode lokal)

"use client";

import { useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "./supabase";
import { DEMO_ACCOUNTS } from "./demo-accounts";
import type { AccountUsage } from "./plans";
import { appUrl } from "./app-url";

export { DEMO_ACCOUNTS };

export interface SessionUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  phone: string;
  /**
   * Ditentukan server lewat /api/me, bukan dihitung di browser.
   * Hanya dipakai untuk menampilkan/menyembunyikan menu — semua endpoint admin
   * tetap memeriksa ulang sendiri di server.
   */
  isAdmin?: boolean;
}

interface LocalAccount extends SessionUser {
  password: string;
  plan: "gratis" | "pro";
  credits: number;
}

export interface AuthResult {
  user?: SessionUser;
  error?: string;
  /** Supabase meminta konfirmasi email sebelum bisa masuk. */
  needsConfirmation?: boolean;
}

export function normalizePhone(raw: string): string {
  let cleaned = (raw || "").trim().replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+62")) {
    cleaned = cleaned.slice(3);
  } else if (cleaned.startsWith("62")) {
    cleaned = cleaned.slice(2);
  } else if (cleaned.startsWith("0")) {
    cleaned = cleaned.slice(1);
  }
  cleaned = cleaned.replace(/\D/g, "");
  return cleaned ? `+62${cleaned}` : "";
}

export function isValidIndonesianPhone(raw: string): boolean {
  const norm = normalizePhone(raw);
  return /^\+628[1-9][0-9]{7,11}$/.test(norm);
}

const USERS_KEY = "sepakatin_users_v2";
const SESSION_KEY = "sepakatin_session_v2";
const AUTH_EVENT = "sepakatin-auth-change";

function emit() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(AUTH_EVENT));
}

// Mode lokal
function readRegisteredUsers(): LocalAccount[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as LocalAccount[]) : [];
  } catch {
    return [];
  }
}

// Status admin dari server (/api/me) untuk kontrol visibilitas menu.
export function isAdmin(user: SessionUser | null): boolean {
  return Boolean(user?.isAdmin);
}

export function updateLocalAccount(userId: string, updates: { plan?: "gratis" | "pro"; credits?: number }): void {
  try {
    const raw = localStorage.getItem("sepakatin_plan_overrides_v2");
    const overrides = raw ? JSON.parse(raw) : {};
    overrides[userId] = { ...(overrides[userId] || {}), ...updates };
    localStorage.setItem("sepakatin_plan_overrides_v2", JSON.stringify(overrides));
  } catch {}

  try {
    const users = readRegisteredUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx !== -1) {
      if (updates.plan) users[idx].plan = updates.plan;
      if (typeof updates.credits === "number") users[idx].credits = updates.credits;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  } catch {}

  emit();
}

// Password akun demo lokal dari environment variable.
const LOCAL_DEMO_PASSWORD = (process.env.NEXT_PUBLIC_LOCAL_DEMO_PASSWORD || "Admin12345!").trim();

export function localAccounts(): LocalAccount[] {
  let overrides: Record<string, { plan?: "gratis" | "pro"; credits?: number }> = {};
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem("sepakatin_plan_overrides_v2") : null;
    if (raw) overrides = JSON.parse(raw);
  } catch {}

  const adminAccount: LocalAccount = {
    id: "usr_admin",
    username: "admin",
    email: "admin@sepakatin.id",
    password: LOCAL_DEMO_PASSWORD,
    fullName: "Admin Sepakatin",
    role: "Administrator",
    phone: "+62 853-3933-3616",
    plan: "pro",
    credits: 999,
  };

  const demos: LocalAccount[] = (LOCAL_DEMO_PASSWORD ? DEMO_ACCOUNTS : []).map((a) => {
    const o = overrides[a.id];
    return {
      id: a.id,
      username: a.username,
      email: a.email,
      password: LOCAL_DEMO_PASSWORD,
      fullName: a.fullName,
      role: a.role,
      phone: a.phone,
      plan: o?.plan ?? a.plan,
      credits: typeof o?.credits === "number" ? o.credits : a.credits,
    };
  });

  const registered = readRegisteredUsers().map((u) => {
    const o = overrides[u.id];
    return {
      ...u,
      plan: o?.plan ?? u.plan,
      credits: typeof o?.credits === "number" ? o.credits : u.credits,
    };
  });

  return [adminAccount, ...demos, ...registered];
}

function toSession(account: LocalAccount): SessionUser {
  const { id, username, email, fullName, role, phone } = account;
  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "admin@sepakatin.id").split(",").map((e) => e.trim().toLowerCase());
  const isAdm = adminEmails.includes(email.toLowerCase());
  return { id, username, email, fullName, role, phone, isAdmin: isAdm };
}

function saveLocalSession(user: SessionUser | null) {
  try {
    if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    // Browser menolak penyimpanan — sesi hanya bertahan di halaman ini
  }
  emit();
}

function getLocalSession(): SessionUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

// Mode Supabase
let remoteUser: SessionUser | null = null;
let remoteUsage: AccountUsage | null = null;
let remoteReady = false;
let remoteInitStarted = false;
let refreshing: Promise<void> | null = null;

export async function getAccessToken(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

async function refreshRemote(): Promise<void> {
  if (!supabase) return;
  if (refreshing) return refreshing;
  refreshing = (async () => {
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    if (!session) {
      remoteUser = null;
      remoteUsage = null;
    } else {
      const fallback: SessionUser = {
        id: session.user.id,
        username: (session.user.email ?? "").split("@")[0],
        email: session.user.email ?? "",
        fullName: (session.user.user_metadata?.full_name as string) || (session.user.email ?? "").split("@")[0],
        role: "Freelancer",
        phone: (session.user.user_metadata?.phone as string) || "",
      };
      try {
        const res = await fetch("/api/me", { headers: { Authorization: `Bearer ${session.access_token}` } });
        if (res.ok) {
          const body = (await res.json()) as { user: SessionUser; usage: AccountUsage };
          remoteUser = body.user;
          remoteUsage = body.usage;
        } else if (res.status === 401) {
          remoteUser = null;
          remoteUsage = null;
          await supabase.auth.signOut();
        } else {
          remoteUser = fallback;
        }
      } catch {
        remoteUser = fallback;
      }
    }
    remoteReady = true;
    emit();
  })().finally(() => {
    refreshing = null;
  });
  return refreshing;
}

function initRemote() {
  if (!supabase || remoteInitStarted) return;
  remoteInitStarted = true;
  refreshRemote();
  supabase.auth.onAuthStateChange((event) => {
    // Jangan memanggil Supabase langsung di dalam callback ini (bisa macet) — tunda sebentar
    if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
      setTimeout(() => refreshRemote(), 0);
    }
  });
}

/** Paket & sisa kuota akun Supabase dari pemanggilan /api/me terakhir. */
export function getCachedRemoteUsage(): AccountUsage | null {
  return remoteUsage;
}

/** Muat ulang profil & kuota (misalnya setelah membuat kesepakatan). */
export async function refreshAccount(): Promise<void> {
  if (isSupabaseConfigured) await refreshRemote();
  else emit();
}

// API publik sesi & login
export function getSession(): SessionUser | null {
  if (typeof window === "undefined") return null;
  return isSupabaseConfigured ? remoteUser : getLocalSession();
}

function resolveIdentifier(identifier: string): string {
  const id = identifier.trim().toLowerCase();
  if (id.includes("@")) return id;
  const byUsername = localAccounts().find((a) => a.username.toLowerCase() === id);
  return byUsername ? byUsername.email : id;
}

/** Masuk memakai email (atau username akun demo). */
export async function login(identifier: string, password: string, captchaToken?: string): Promise<AuthResult> {
  const email = resolveIdentifier(identifier);

  if (supabase) {
    if (!email.includes("@")) {
      const localAcc = localAccounts().find(
        (a) => (a.username.toLowerCase() === identifier.trim().toLowerCase() || a.email.toLowerCase() === email) && a.password === password
      );
      if (localAcc) {
        const session = toSession(localAcc);
        saveLocalSession(session);
        return { user: session };
      }
      return { error: "Masukkan email yang terdaftar atau username akun demo." };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: captchaToken ? { captchaToken } : undefined,
      });
      if (!error) {
        await refreshRemote();
        return remoteUser ? { user: remoteUser } : { error: "Gagal memuat profil akun. Coba lagi." };
      }
      if (/confirm/i.test(error.message)) {
        return { error: "Email Anda belum dikonfirmasi. Cek kotak masuk (atau folder spam) lalu klik link konfirmasi." };
      }
    } catch {
      // Jika jaringan gagal / offline, lanjutkan ke verifikasi akun lokal
    }
  }

  const account = localAccounts().find(
    (a) => (a.email.toLowerCase() === email || a.username.toLowerCase() === identifier.trim().toLowerCase()) && a.password === password
  );
  if (!account) return { error: "Username/email atau kata sandi salah. Coba periksa lagi." };
  const session = toSession(account);
  saveLocalSession(session);
  return { user: session };
}

export async function register(data: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  captchaToken?: string;
}): Promise<AuthResult> {
  const email = data.email.trim().toLowerCase();
  const fullName = data.fullName.trim();
  const phone = normalizePhone(data.phone);

  if (!data.phone || !isValidIndonesianPhone(data.phone)) {
    return {
      error: "Nomor WhatsApp tidak valid. Masukkan nomor seluler aktif di Indonesia (contoh: 081234567890).",
    };
  }

  // Cek duplikasi nomor WhatsApp di akun terdaftar (mencegah eksploitasi multi-akun)
  if (localAccounts().some((a) => normalizePhone(a.phone) === phone)) {
    return {
      error: "Nomor WhatsApp ini sudah terdaftar di Sepakatin. Setiap nomor hanya berhak atas 1 akun dengan kuota resmi. Silakan masuk.",
    };
  }

  if (supabase) {
    try {
      const redirectBase = appUrl() || (typeof window !== "undefined" ? window.location.origin : "");
      const { data: result, error } = await supabase.auth.signUp({
        email,
        password: data.password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
          },
          emailRedirectTo: `${redirectBase}/auth/callback?next=/dashboard`,
          captchaToken: data.captchaToken,
        },
      });
      if (error) {
        if (/registered|exists/i.test(error.message)) return { error: "Email ini sudah terdaftar. Silakan masuk." };
        if (/password/i.test(error.message)) return { error: "Kata sandi terlalu lemah. Gunakan minimal 6 karakter." };
        if (!/fetch/i.test(error.message)) {
          return { error: "Pendaftaran gagal. Coba lagi sebentar lagi." };
        }
        // Jika error jaringan / unreachable host, fallback ke penyimpanan lokal
      } else {
        // Supabase mengembalikan user tanpa identitas jika email sudah dipakai
        if (result.user && result.user.identities && result.user.identities.length === 0) {
          return { error: "Email ini sudah terdaftar. Silakan masuk." };
        }
        if (!result.session) return { needsConfirmation: true };
        await refreshRemote();
        return remoteUser ? { user: remoteUser } : { error: "Akun dibuat, tapi gagal memuat profil. Silakan masuk." };
      }
    } catch {
      // Offline fallback
    }
  }

  if (localAccounts().some((a) => a.email.toLowerCase() === email)) {
    return { error: "Email ini sudah terdaftar. Silakan masuk." };
  }
  const account: LocalAccount = {
    id: `usr_${Date.now()}`,
    username: email.split("@")[0],
    email,
    password: data.password,
    fullName,
    role: "Freelancer",
    phone,
    plan: "gratis",
    credits: 0,
  };
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify([...readRegisteredUsers(), account]));
  } catch {
    return { error: "Browser tidak mengizinkan penyimpanan data. Coba browser lain." };
  }
  const session = toSession(account);
  saveLocalSession(session);
  return { user: session };
}

export async function signInWithGoogle(nextUrl = "/dashboard"): Promise<{ error?: string }> {
  if (!supabase) {
    return { error: "Login Google memerlukan konfigurasi Supabase (NEXT_PUBLIC_SUPABASE_*)." };
  }
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(nextUrl)}`,
    },
  });
  if (error) return { error: error.message };
  return {};
}

export async function logout() {
  if (supabase) {
    await supabase.auth.signOut();
    remoteUser = null;
    remoteUsage = null;
    emit();
    return;
  }
  saveLocalSession(null);
}

/** Hook untuk membaca pengguna yang sedang masuk. `ready` = sudah selesai dicek. */
export function useSession(): { user: SessionUser | null; ready: boolean; usage?: AccountUsage | null } {
  const [state, setState] = useState<{ user: SessionUser | null; ready: boolean; usage?: AccountUsage | null }>({
    user: null,
    ready: false,
    usage: null,
  });

  useEffect(() => {
    const sync = () => {
      if (isSupabaseConfigured) setState({ user: remoteUser, ready: remoteReady, usage: remoteUsage });
      else setState({ user: getLocalSession(), ready: true, usage: null });
    };
    initRemote();
    sync();
    window.addEventListener(AUTH_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(AUTH_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return state;
}
