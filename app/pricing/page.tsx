import { redirect } from "next/navigation";

// Harga tidak punya halaman sendiri lagi; tampil sebagai bagian di beranda.
export default function PricingPage() {
  redirect("/#harga");
}
