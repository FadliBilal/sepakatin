// ==============================================================================
// Sepakatin — Akun & sesi login
// Mode Supabase: Supabase Auth (dipakai saat NEXT_PUBLIC_SUPABASE_* diisi).
// Mode lokal   : akun disimpan di browser, untuk demo tanpa server.
// ==============================================================================

"use client";

import { useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "./supabase";
import { DEMO_ACCOUNTS } from "./demo-accounts";
import type { AccountUsage } from "./plans";

export { DEMO_ACCOUNTS };

export interface SessionUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  phone: string;
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

const USERS_KEY = "sepakatin_users_v2";
const SESSION_KEY = "sepakatin_session_v2";
const AUTH_EVENT = "sepakatin-auth-change";

function emit() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(AUTH_EVENT));
}

// ------------------------------------------------------------------------------
// Mode lokal
// ------------------------------------------------------------------------------

function readRegisteredUsers(): LocalAccount[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as LocalAccount[]) : [];
  } catch {
    return [];
  }
}

export function localAccounts(): LocalAccount[] {
  const demos: LocalAccount[] = DEMO_ACCOUNTS.map((a) => ({
    id: a.id,
    username: a.username,
    email: a.email,
    password: a.password,
    fullName: a.fullName,
    role: a.role,
    phone: a.phone,
    plan: a.plan,
    credits: a.credits,
  }));
  return [...demos, ...readRegisteredUsers()];
}

function toSession(account: LocalAccount): SessionUser {
  const { id, username, email, fullName, role, phone } = account;
  return { id, username, email, fullName, role, phone };
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

// ------------------------------------------------------------------------------
// Mode Supabase
// ------------------------------------------------------------------------------

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
        phone: "",
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

// ------------------------------------------------------------------------------
// API publik
// ------------------------------------------------------------------------------

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
export async function login(identifier: string, password: string): Promise<AuthResult> {
  const email = resolveIdentifier(identifier);

  if (supabase) {
    if (!email.includes("@")) return { error: "Masukkan email yang terdaftar." };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (/confirm/i.test(error.message)) {
        return { error: "Email Anda belum dikonfirmasi. Cek kotak masuk (atau folder spam) lalu klik link konfirmasi." };
      }
      return { error: "Email atau kata sandi salah. Coba periksa lagi." };
    }
    await refreshRemote();
    return remoteUser ? { user: remoteUser } : { error: "Gagal memuat profil akun. Coba lagi." };
  }

  const account = localAccounts().find((a) => a.email.toLowerCase() === email && a.password === password);
  if (!account) return { error: "Username/email atau kata sandi salah. Coba periksa lagi." };
  const session = toSession(account);
  saveLocalSession(session);
  return { user: session };
}

export async function register(data: { fullName: string; email: string; password: string }): Promise<AuthResult> {
  const email = data.email.trim().toLowerCase();
  const fullName = data.fullName.trim();

  if (supabase) {
    const { data: result, error } = await supabase.auth.signUp({
      email,
      password: data.password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) {
      if (/registered|exists/i.test(error.message)) return { error: "Email ini sudah terdaftar. Silakan masuk." };
      if (/password/i.test(error.message)) return { error: "Kata sandi terlalu lemah. Gunakan minimal 6 karakter." };
      return { error: "Pendaftaran gagal. Coba lagi sebentar lagi." };
    }
    // Supabase mengembalikan user tanpa identitas jika email sudah dipakai
    if (result.user && result.user.identities && result.user.identities.length === 0) {
      return { error: "Email ini sudah terdaftar. Silakan masuk." };
    }
    if (!result.session) return { needsConfirmation: true };
    await refreshRemote();
    return remoteUser ? { user: remoteUser } : { error: "Akun dibuat, tapi gagal memuat profil. Silakan masuk." };
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
    phone: "",
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
export function useSession(): { user: SessionUser | null; ready: boolean } {
  const [state, setState] = useState<{ user: SessionUser | null; ready: boolean }>({ user: null, ready: false });

  useEffect(() => {
    const sync = () => {
      if (isSupabaseConfigured) setState({ user: remoteUser, ready: remoteReady });
      else setState({ user: getLocalSession(), ready: true });
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
