// ==============================================================================
// Sepakatin — Akun demo (dipakai halaman login, mode lokal, dan seed Supabase)
// ==============================================================================

export interface DemoAccount {
  id: string; // id untuk mode lokal
  username: string;
  email: string;
  password: string;
  fullName: string;
  role: string;
  phone: string;
  /** Paket akun demo. Fadli = Pro (sudah ada contoh dokumen), Demo = Gratis + kredit (kosong, untuk mencoba membuat). */
  plan: "gratis" | "pro";
  credits: number;
  hasSampleAgreement: boolean;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: "usr_freelancer_fadli",
    username: "fadli",
    email: "fadli@sepakatin.id",
    password: "sepakatin123",
    fullName: "Fadli Bilal",
    role: "Fullstack Web Developer",
    phone: "+62 812-3456-7890",
    plan: "pro",
    credits: 0,
    hasSampleAgreement: true,
  },
  {
    id: "usr_demo",
    username: "demo",
    email: "demo@sepakatin.id",
    password: "demo1234",
    fullName: "Pengguna Demo",
    role: "Desainer Grafis",
    phone: "+62 811-0000-1234",
    plan: "gratis",
    credits: 3,
    hasSampleAgreement: false,
  },
  {
    id: "usr_admin_sepakatin",
    username: "admin",
    email: "admin@sepakatin.id",
    password: "admin123",
    fullName: "Admin Sepakatin",
    role: "admin",
    phone: "+62 853-3933-3616",
    plan: "pro",
    credits: 999,
    hasSampleAgreement: false,
  },
];
