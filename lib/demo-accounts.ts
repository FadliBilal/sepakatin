// Sepakatin - Akun contoh untuk mode lokal (tanpa Supabase) & dokumen contoh publik
//
// PENTING: JANGAN menambahkan akun administrator di sini.
// Berkas ini ikut terbaca bila repositori dibuka, dan dipakai oleh `npm run seed:demo`.
// Akun admin ditentukan lewat env `ADMIN_EMAILS` di server.
//
// Berkas ini TIDAK memuat kata sandi. Isinya ikut terbundel ke JavaScript browser.
//
// Untuk mode lokal, kata sandi diambil dari `NEXT_PUBLIC_LOCAL_DEMO_PASSWORD`
// yang hanya diisi di berkas .env.local pengembang. Bila kosong, akun contoh
// ini tidak bisa dipakai masuk sama sekali.

export interface DemoAccount {
  id: string; // id untuk mode lokal
  username: string;
  email: string;
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
    fullName: "Pengguna Demo",
    role: "Desainer Grafis",
    phone: "+62 811-0000-1234",
    plan: "gratis",
    credits: 3,
    hasSampleAgreement: false,
  },
];
