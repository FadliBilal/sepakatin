// ==============================================================================
// Helper to generate a realistic official Indonesian e-Materai Stamp (Monochrome)
// Allows immediate instant local testing if user hasn't bought one yet from e-meterai.co.id
// ==============================================================================

export function generateSampleEMateraiDataUrl(serialNumber: string = "SN-2026-99824-EMTR"): string {
  if (typeof window === "undefined") return "";

  const canvas = document.createElement("canvas");
  canvas.width = 180;
  canvas.height = 180;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 180, 180);

  // Outer border with security dashed frame
  ctx.strokeStyle = "#09090b";
  ctx.lineWidth = 2.5;
  ctx.strokeRect(4, 4, 172, 172);

  ctx.lineWidth = 1;
  ctx.setLineDash([3, 2]);
  ctx.strokeRect(8, 8, 164, 164);
  ctx.setLineDash([]);

  // Header: METERAI ELEKTRONIK
  ctx.fillStyle = "#09090b";
  ctx.font = "bold 10px monospace";
  ctx.textAlign = "center";
  ctx.fillText("METERAI ELEKTRONIK", 90, 24);

  // Divider line
  ctx.beginPath();
  ctx.moveTo(14, 29);
  ctx.lineTo(166, 29);
  ctx.stroke();

  // Value: 10000
  ctx.font = "900 24px monospace";
  ctx.fillText("10000", 90, 56);
  ctx.font = "bold 9px sans-serif";
  ctx.fillText("SEPULUH RIBU RUPIAH", 90, 68);

  // Central decorative security grid / simulated QR box
  ctx.strokeRect(55, 76, 70, 70);
  // draw mini QR matrix pattern
  ctx.fillStyle = "#09090b";
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      if ((r + c) % 2 === 0 || (r === 0 && c === 0) || (r === 6 && c === 6)) {
        ctx.fillRect(60 + c * 9, 81 + r * 9, 7, 7);
      }
    }
  }

  // Serial Number footer
  ctx.fillStyle = "#09090b";
  ctx.font = "8px monospace";
  ctx.fillText(serialNumber, 90, 158);
  ctx.font = "italic 7px sans-serif";
  ctx.fillText("PERURI - DJP RI", 90, 168);

  return canvas.toDataURL("image/png");
}

import { jsPDF } from "jspdf";
import { CopyType } from "./types";
import {
  PDF_LOGO_SEPAKATIN_BASE64,
  PDF_SIG_FADLI_BASE64,
  PDF_SIG_BUDI_BASE64,
  PDF_EMATERAI_FREELANCER_COPY_BASE64,
  PDF_EMATERAI_CLIENT_COPY_BASE64,
} from "./pdf-assets";

/**
 * Menghasilkan Data URL PDF (application/pdf;base64,...) resmi untuk dokumen kontrak demo.
 * Didesain dengan presisi tinggi: Logo resmi Sepakatin, Tipografi rapi dan proporsional,
 * Tampilan tanggal & waktu terstruktur (metadata box/audit badge), Tanda tangan kaligrafi halus,
 * dan stempel e-Meterai resmi Peruri 10000.
 */
export function generateSampleStampedPdfDataUrl(
  contractId: string = "SPK-2026-00124",
  copyType: CopyType = "freelancer_copy",
  title: string = "Website Profil Perusahaan Bilingual, Portal Berita, Karir & SEO PT Solusi Digital"
): string {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const isFreelancerCopy = copyType !== "client_copy";
  const copyTitle = isFreelancerCopy
    ? "Salinan Pihak Pertama (Freelancer)"
    : "Salinan Pihak Kedua (Klien)";

  function drawCheckmark(x: number, y: number) {
    doc.setFillColor(16, 185, 129);
    doc.circle(x + 4, y + 4, 3.8, "F");
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(1.1);
    doc.line(x + 2, y + 4, x + 3.5, y + 5.8);
    doc.line(x + 3.5, y + 5.8, x + 6.2, y + 2.2);
  }

  function drawBullet(x: number, y: number) {
    doc.setFillColor(148, 163, 184);
    doc.circle(x + 3, y + 4, 2, "F");
  }

  function drawSectionHeader(x: number, y: number, text: string) {
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(x, y - 9, 3, 11, 1, 1, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(text, x + 8, y);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.6);
    doc.line(x, y + 5, 559, y + 5);
  }

  // ========================== HALAMAN 1 ==========================
  // 1. Header: Logo Resmi Sepakatin (Kiri)
  doc.addImage(PDF_LOGO_SEPAKATIN_BASE64, "PNG", 36, 32, 115, 37.7);

  // 2. Header: Status & Tanggal (Kanan - Tampilan Rapi & Terstruktur)
  const statusBoxX = 422;
  const statusBoxY = 32;
  const statusBoxW = 137;
  const statusBoxH = 38;

  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.setLineWidth(0.8);
  doc.roundedRect(statusBoxX, statusBoxY, statusBoxW, statusBoxH, 5, 5, "FD");

  // Baris status
  doc.setFillColor(16, 185, 129);
  doc.circle(statusBoxX + 11, statusBoxY + 13, 3, "F");
  doc.setTextColor(4, 120, 87);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.8);
  doc.text("Sudah Disepakati", statusBoxX + 19, statusBoxY + 16);

  // Garis pemisah halus
  doc.setDrawColor(220, 252, 231);
  doc.setLineWidth(0.6);
  doc.line(statusBoxX + 8, statusBoxY + 23, statusBoxX + statusBoxW - 8, statusBoxY + 23);

  // Baris tanggal dibuat
  doc.setTextColor(71, 85, 105);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.8);
  doc.text("Tanggal: 20 September 2026", statusBoxX + 10, statusBoxY + 32);

  // 3. Judul Dokumen
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text("Surat Kesepakatan Kerja", 36, 88);

  // Meta baris: Nomor dokumen, versi, dan badge salinan
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Nomor Dokumen: ", 36, 103);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(37, 99, 235);
  doc.text(contractId, 106, 103);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(" · Versi ", 168, 103);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("5 (Final)", 196, 103);

  // Copy Pill
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.6);
  doc.roundedRect(36, 112, 175, 15, 7.5, 7.5, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.2);
  doc.setTextColor(30, 41, 59);
  doc.text(copyTitle, 46, 122.5);

  // Garis pemisah utama dokumen
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(1);
  doc.line(36, 135, 559, 135);

  // ========================== PASAL 1 ==========================
  drawSectionHeader(36, 151, "Pasal 1 · Para Pihak");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.3);
  doc.setTextColor(71, 85, 105);
  doc.text("Surat kesepakatan ini dibuat dan disetujui secara sadar oleh kedua pihak berikut:", 36, 168);

  // Kartu Para Pihak (Sleek card design dengan header bar)
  const partyCardY = 175;
  const partyCardH = 60;
  const partyCardW = 256;

  // Kartu Pihak Pertama (Freelancer)
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.7);
  doc.roundedRect(36, partyCardY, partyCardW, partyCardH, 4, 4, "FD");

  // Subheader kartu
  doc.setFillColor(241, 245, 249);
  doc.rect(36, partyCardY, partyCardW, 14, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text("PIHAK PERTAMA (FREELANCER)", 44, partyCardY + 10);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.8);
  doc.setTextColor(15, 23, 42);
  doc.text("Fadli Bilal", 44, partyCardY + 26);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text("Keahlian: Fullstack Web Developer", 44, partyCardY + 37);
  doc.text("Email: fadli@sepakatin.id · WA: +62 812-3456-7890", 44, partyCardY + 48);

  // Kartu Pihak Kedua (Klien)
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(303, partyCardY, partyCardW, partyCardH, 4, 4, "FD");

  doc.setFillColor(241, 245, 249);
  doc.rect(303, partyCardY, partyCardW, 14, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text("PIHAK KEDUA (KLIEN)", 311, partyCardY + 10);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.8);
  doc.setTextColor(15, 23, 42);
  doc.text("Budi Santoso", 311, partyCardY + 26);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text("Perusahaan: PT Solusi Digital Nusantara", 311, partyCardY + 37);
  doc.text("Email: budi@solusidigital.id · WA: +62 811-9876-5432", 311, partyCardY + 48);

  // ========================== PASAL 2 ==========================
  let y = 247;
  drawSectionHeader(36, y, "Pasal 2 · Pekerjaan yang Disepakati");

  y += 15;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.3);
  doc.setTextColor(71, 85, 105);
  doc.text('Pihak Pertama sepakat mengerjakan proyek "' + title + '" dengan rincian berikut:', 36, y);

  y += 8;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.7);
  doc.roundedRect(36, y, 523, 30, 4, 4, "FD");
  // Blue accent bar di kiri kotak quote
  doc.setFillColor(59, 130, 246);
  doc.roundedRect(36, y, 3, 30, 1.5, 1.5, "F");

  doc.setFont("helvetica", "italic");
  doc.setFontSize(6.8);
  doc.setTextColor(71, 85, 105);
  const quote =
    '"Pengembangan menyeluruh website profil perusahaan bilingual (Indonesia & English), portal berita CMS dinamis, portal rekrutmen karir terhubung notifikasi WhatsApp HRD, integrasi analitik (GA4 & Meta Pixel), optimasi SEO Core Web Vitals, serta garansi pemeliharaan 60 hari."';
  const splitQuote = doc.splitTextToSize(quote, 505);
  doc.text(splitQuote, 46, y + 11);

  y += 38;
  // Dua kolom: Hasil Kerja & Batasan
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.8);
  doc.setTextColor(15, 23, 42);
  doc.text("A. Hasil kerja yang diserahkan (Deliverables)", 36, y);
  doc.text("B. Tidak termasuk (Exclusions)", 310, y);

  y += 10;
  const deliverables = [
    "Desain mockup UI/UX desktop & mobile yang elegan & profesional (Figma)",
    "Pengembangan 5 halaman utama bilingual (ID & EN) dengan switcher bahasa instan",
    "Modul CMS Admin Berita multi-bahasa: input terpisah Bahasa Indonesia & English",
    "Halaman Karir & formulir lamaran kerja upload dokumen CV/Resume (PDF)",
    "Integrasi webhook notifikasi otomatis data pelamar baru langsung ke WA HRD",
    "Pemasangan Google Analytics 4 (GA4), Tag Manager, dan Meta Pixel tracking",
    "Optimasi SEO On-Page (JSON-LD schema, Open Graph, Core Web Vitals score > 90)",
    "Garansi pemeliharaan dan perbaikan bug selama 60 hari kalender pasca go-live",
    "Konfigurasi domain kustom, SSL certificate, CDN & cloud hosting hingga siap pakai",
  ];
  const exclusions = [
    "Biaya langganan bulanan pihak ketiga berbayar di luar paket hosting awal",
    "Biaya belanja iklan berbayar (Google Ads / Meta Ads spend)",
    "Pembuatan materi video promosi perusahaan profesional",
  ];

  let dy1 = y;
  deliverables.forEach((d) => {
    drawCheckmark(36, dy1);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(51, 65, 85);
    doc.text(d, 48, dy1 + 6.5);
    dy1 += 12;
  });

  let dy2 = y;
  exclusions.forEach((e) => {
    drawBullet(310, dy2);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(e, 320, dy2 + 6.5);
    dy2 += 13;
  });

  // ========================== PASAL 3 ==========================
  y = 422;
  drawSectionHeader(36, y, "Pasal 3 · Harga & Tata Cara Pembayaran");

  y += 12;
  // Total card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(1.2);
  doc.rect(36, y, 523, 44, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text("TOTAL NILAI KONTRAK", 48, y + 14);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42);
  doc.text("Rp 15.000.000", 48, y + 33);

  doc.setFontSize(7.2);
  doc.setTextColor(51, 65, 85);
  doc.setFont("helvetica", "normal");
  doc.text("Uang Muka (DP 40%):", 380, y + 14);
  doc.setFont("helvetica", "bold");
  doc.text("Rp 6.000.000", 465, y + 14);

  doc.setFont("helvetica", "normal");
  doc.text("Pelunasan:", 380, y + 25);
  doc.setFont("helvetica", "bold");
  doc.text("7 hari setelah serah terima", 435, y + 25);

  doc.setFont("helvetica", "normal");
  doc.text("Metode Pembayaran:", 380, y + 36);
  doc.setFont("helvetica", "bold");
  doc.text("Transfer Bank BCA / Mandiri", 460, y + 36);

  y += 50;
  // Milestone table
  const milestones = [
    { title: "Tahap 1: Uang muka (DP 40%) & kick-off proyek", amount: "Rp 6.000.000" },
    { title: "Tahap 2: Demo fitur bilingual, CMS & portal karir (35%)", amount: "Rp 5.250.000" },
    { title: "Tahap 3: Pelunasan (25%) setelah go-live & serah terima", amount: "Rp 3.750.000" },
  ];
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.6);
  milestones.forEach((m, idx) => {
    doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
    doc.rect(36, y, 523, 16, "FD");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.2);
    doc.setTextColor(51, 65, 85);
    doc.text(m.title, 46, y + 11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(m.amount, 545, y + 11, { align: "right" });
    y += 16;
  });

  // ========================== PASAL 4 ==========================
  y += 14;
  drawSectionHeader(36, y, "Pasal 4 · Ketentuan Revisi & Jadwal");

  y += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.2);
  doc.setTextColor(51, 65, 85);
  doc.text("Jatah revisi gratis: ", 36, y);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(37, 99, 235);
  doc.text("4 kali", 106, y);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);
  doc.text("Mulai Pengerjaan: ", 320, y);
  doc.setFont("helvetica", "bold");
  doc.text("20 September 2026", 395, y);

  y += 11;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(
    "Revisi mencakup penyesuaian tata letak minor & teks. Melebihi kuota wajib dibuatkan adendum bermeterai.",
    36,
    y
  );
  doc.setTextColor(51, 65, 85);
  doc.text("Target Selesai: ", 320, y);
  doc.setFont("helvetica", "bold");
  doc.text("20 November 2026", 382, y);

  y += 11;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Biaya revisi di luar kuota: Rp 400.000 per revisi tambahan.", 36, y);

  // ========================== PASAL 5 ==========================
  y += 17;
  drawSectionHeader(36, y, "Pasal 5 · Hak Cipta & Pembatalan");

  y += 13;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(15, 23, 42);
  doc.text("1. Kepemilikan hasil kerja:", 36, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(
    " Hak cipta & kode sumber diserahkan 100% setelah lunas. Freelancer berhak memajang karya di portofolio.",
    124,
    y
  );

  y += 11;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("2. Jika dibatalkan:", 36, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(
    " Jika dibatalkan di awal, DP dipotong 15%. Di tengah pengerjaan, Klien membayar proporsional tahap selesai.",
    98,
    y
  );

  // Footer Page 1
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.6);
  doc.line(36, 796, 559, 796);
  doc.setFontSize(6.8);
  doc.setTextColor(148, 163, 184);
  doc.text("Sepakatin · Dokumen Kontrak Digital Sah Dilindungi Kriptografi SHA-256", 36, 810);
  doc.text("Halaman 1 dari 2", 559, 810, { align: "right" });

  // ========================== HALAMAN 2 ==========================
  doc.addPage();

  // Header Halaman 2: Logo Resmi Sepakatin (Compact)
  doc.addImage(PDF_LOGO_SEPAKATIN_BASE64, "PNG", 36, 30, 92, 30.1);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Lembar Pengesahan & Bukti Keabsahan", 136, 43);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("Nomor Dokumen: " + contractId + " · Versi 5", 136, 53);

  doc.text("Halaman 2 dari 2", 559, 45, { align: "right" });
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.6);
  doc.line(36, 66, 559, 66);

  // Pengesahan Section Title
  y = 88;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Pengesahan & Tanda Tangan Para Pihak", 297.64, y, { align: "center" });

  y += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.3);
  doc.setTextColor(100, 116, 139);
  doc.text(
    "Kesepakatan ini telah disetujui secara sadar, sukarela, dan berkekuatan hukum penuh oleh kedua belah pihak:",
    297.64,
    y,
    { align: "center" }
  );

  // ========================== DUA KOTAK TANDA TANGAN ==========================
  y += 18;
  const sigBoxW = 256;
  const sigBoxH = 216;

  // Box 1: Freelancer (Kiri)
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.8);
  doc.roundedRect(36, y, sigBoxW, sigBoxH, 6, 6, "FD");

  // Header Box 1
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(36, y, sigBoxW, 22, 6, 6, "F");
  doc.rect(36, y + 16, sigBoxW, 6, "F"); // Menutup kurva bawah header
  doc.setDrawColor(226, 232, 240);
  doc.line(36, y + 22, 36 + sigBoxW, y + 22);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text("PIHAK PERTAMA (FREELANCER)", 46, y + 15);

  // Box 2: Klien (Kanan)
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(303, y, sigBoxW, sigBoxH, 6, 6, "FD");

  // Header Box 2
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(303, y, sigBoxW, 22, 6, 6, "F");
  doc.rect(303, y + 16, sigBoxW, 6, "F");
  doc.setDrawColor(226, 232, 240);
  doc.line(303, y + 22, 303 + sigBoxW, y + 22);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text("PIHAK KEDUA (KLIEN)", 313, y + 15);

  // ========================== PENEMPATAN E-METERAI & TTD ==========================
  // Aturan Bea Meterai:
  // Salinan Freelancer: e-Meterai dibubuhkan pada kolom tanda tangan Klien (Pihak Kedua)
  // Salinan Klien: e-Meterai dibubuhkan pada kolom tanda tangan Freelancer (Pihak Pertama)
  const sigY = y + 36;
  const sigImgW = 104;
  const sigImgH = 36;
  const emateraiSize = 64;

  if (isFreelancerCopy) {
    // SALINAN FREELANCER:
    // Kolom Freelancer: Tanda tangan kaligrafi Fadli di tengah
    doc.addImage(PDF_SIG_FADLI_BASE64, "PNG", 112, sigY + 6, sigImgW, sigImgH);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text("Tanda Tangan Digital Freelancer", 164, sigY + 54, { align: "center" });

    // Kolom Klien: e-Meterai Peruri di kiri, Tanda tangan Budi di kanan (menumpuk sedikit secara legal)
    doc.addImage(PDF_EMATERAI_CLIENT_COPY_BASE64, "PNG", 314, sigY - 4, emateraiSize, emateraiSize);
    doc.addImage(PDF_SIG_BUDI_BASE64, "PNG", 368, sigY + 6, sigImgW, sigImgH);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text("Tanda Tangan Klien & e-Meterai", 442, sigY + 54, { align: "center" });
  } else {
    // SALINAN KLIEN:
    // Kolom Freelancer: e-Meterai Peruri di kiri, Tanda tangan Fadli di kanan
    doc.addImage(PDF_EMATERAI_FREELANCER_COPY_BASE64, "PNG", 46, sigY - 4, emateraiSize, emateraiSize);
    doc.addImage(PDF_SIG_FADLI_BASE64, "PNG", 100, sigY + 6, sigImgW, sigImgH);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text("Tanda Tangan Freelancer & e-Meterai", 175, sigY + 54, { align: "center" });

    // Kolom Klien: Tanda tangan kaligrafi Budi di tengah
    doc.addImage(PDF_SIG_BUDI_BASE64, "PNG", 379, sigY + 6, sigImgW, sigImgH);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text("Tanda Tangan Digital Klien", 431, sigY + 54, { align: "center" });
  }

  // ========================== IDENTITAS PENANDATANGAN ==========================
  // Pihak Pertama (Freelancer)
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.6);
  doc.line(48, y + 104, 280, y + 104);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Fadli Bilal", 164, y + 118, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text("Fullstack Web Developer · Studio Kreasi Mandiri", 164, y + 128, { align: "center" });

  // Pihak Kedua (Klien)
  doc.line(315, y + 104, 547, y + 104);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Budi Santoso", 431, y + 118, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text("Pemberi Kerja · PT Solusi Digital Nusantara", 431, y + 128, { align: "center" });

  // ========================== SUBPANEL WAKTU & VERIFIKASI (RAPIH & ELEGAN) ==========================
  // Dirombak dari teks polos menjadi kartu verifikasi audit profesional dengan background lembut
  const timePanelY = y + 140;
  const timePanelH = 64;
  const timePanelW = 236;

  // Subpanel Box 1 (Freelancer)
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.6);
  doc.roundedRect(46, timePanelY, timePanelW, timePanelH, 4, 4, "FD");

  // Status Approval Freelancer
  doc.setFillColor(16, 185, 129);
  doc.circle(56, timePanelY + 12, 3, "F");
  doc.setTextColor(4, 120, 87);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.2);
  doc.text("Status: Disetujui & Sah", 64, timePanelY + 15);

  // Badge pill ID Verified
  doc.setFillColor(220, 252, 231);
  doc.roundedRect(210, timePanelY + 6, 64, 12, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  doc.setTextColor(4, 120, 87);
  doc.text("ID TERVERIFIKASI", 242, timePanelY + 14.5, { align: "center" });

  // Garis pemisah dalam subpanel
  doc.setDrawColor(241, 245, 249);
  doc.line(54, timePanelY + 23, 274, timePanelY + 23);

  // Baris Waktu Pengesahan
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Waktu Pengesahan:", 54, timePanelY + 34);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("24 September 2026 · 16:20:14 WIB", 120, timePanelY + 34);

  // Baris Audit Trail
  doc.setFont("courier", "normal");
  doc.setFontSize(5.8);
  doc.setTextColor(100, 116, 139);
  doc.text("Audit ID : V5-FADLI-8924 · IP: 180.252.**.**", 54, timePanelY + 46);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(5.8);
  doc.setTextColor(16, 185, 129);
  doc.text("Tervalidasi Sistem Kriptografis Sepakatin", 54, timePanelY + 56);

  // Subpanel Box 2 (Klien)
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(313, timePanelY, timePanelW, timePanelH, 4, 4, "FD");

  // Status Approval Klien
  doc.setFillColor(16, 185, 129);
  doc.circle(323, timePanelY + 12, 3, "F");
  doc.setTextColor(4, 120, 87);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.2);
  doc.text("Status: Disetujui & Sah", 331, timePanelY + 15);

  // Badge pill e-Meterai Valid
  doc.setFillColor(219, 234, 254);
  doc.roundedRect(477, timePanelY + 6, 64, 12, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  doc.setTextColor(30, 64, 175);
  doc.text("METERAI VALID", 509, timePanelY + 14.5, { align: "center" });

  // Garis pemisah dalam subpanel
  doc.setDrawColor(241, 245, 249);
  doc.line(321, timePanelY + 23, 541, timePanelY + 23);

  // Baris Waktu Pengesahan
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Waktu Pengesahan:", 321, timePanelY + 34);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("24 September 2026 · 16:30:28 WIB", 387, timePanelY + 34);

  // Baris Audit Trail
  doc.setFont("courier", "normal");
  doc.setFontSize(5.8);
  doc.setTextColor(100, 116, 139);
  doc.text("Audit ID : V5-BUDI-8925 · SN: SN-2026-99824", 321, timePanelY + 46);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(5.8);
  doc.setTextColor(37, 99, 235);
  doc.text("Tervalidasi e-Meterai Peruri DJP RI", 321, timePanelY + 56);

  // ========================== CATATAN YURIDIS ==========================
  y += sigBoxH + 14;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.6);
  doc.roundedRect(36, y, 523, 26, 4, 4, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.8);
  doc.setTextColor(15, 23, 42);
  doc.text("Catatan Yuridis UU No. 10 Tahun 2020 tentang Bea Meterai:", 46, y + 10.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.4);
  doc.setTextColor(71, 85, 105);
  if (isFreelancerCopy) {
    doc.text(
      "Salinan ini disimpan Pihak Pertama (Freelancer) dengan e-Meterai dibubuhkan pada kolom tanda tangan Klien.",
      46,
      y + 19.5
    );
  } else {
    doc.text(
      "Salinan ini disimpan Pihak Kedua (Klien) dengan e-Meterai dibubuhkan pada kolom tanda tangan Freelancer.",
      46,
      y + 19.5
    );
  }

  // ========================== SEGEL INTEGRITAS SHA-256 ==========================
  y += 36;
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(1);
  doc.roundedRect(36, y, 523, 52, 6, 6, "FD");

  // Icon Centang Segel Hijau
  doc.setFillColor(16, 185, 129);
  doc.circle(52, y + 17, 5.5, "F");
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(1.2);
  doc.line(49.2, y + 17, 51.5, y + 19.3);
  doc.line(51.5, y + 19.3, 55.2, y + 14.8);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(4, 120, 87);
  doc.text("Segel Integritas Kriptografis Tervalidasi (SHA-256)", 64, y + 16.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.8);
  doc.setTextColor(51, 65, 85);
  doc.text(
    "Isi dokumen ini telah dikunci dan dicatat permanen pada sistem Sepakatin. Setiap perubahan data",
    64,
    y + 27.5
  );
  doc.text(
    "akan membatalkan keabsahan segel ini dan secara otomatis ditandai sebagai manipulasi data.",
    64,
    y + 36.5
  );

  doc.setFont("courier", "normal");
  doc.setFontSize(6);
  doc.setTextColor(71, 85, 105);
  doc.text("Hash: dd38a6d87c99a1dd4f82662fa9b61e2cb0382e707e44ba54d92305a4645da171", 64, y + 46);

  // Footer Page 2
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.6);
  doc.line(36, 796, 559, 796);
  doc.setFontSize(6.8);
  doc.setTextColor(148, 163, 184);
  doc.text("Sepakatin · Dokumen Kontrak Digital Sah Dilindungi Kriptografi SHA-256", 36, 810);
  doc.text("Halaman 2 dari 2", 559, 810, { align: "right" });

  return doc.output("datauristring");
}
