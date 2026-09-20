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

/**
 * Menghasilkan Data URL PDF (application/pdf;base64,...) resmi untuk keperluan demo.
 * Dokumen ini DIBUAT DENGAN DESAIN RESMI PENUH (Vector Graphics, Logo Sepakatin,
 * Kotak Para Pihak, Tabel Pembayaran, Checkmark, Tanda Tangan, dan e-Meterai Peruri)
 * persis seperti tampilan template resmi Sepakatin.
 */
export function generateSampleStampedPdfDataUrl(
  contractId: string = "SPK-2026-00124",
  copyType: CopyType = "freelancer_copy",
  title: string = "Website Profil Perusahaan Bilingual, Portal Berita, Karir & SEO PT Solusi Digital"
): string {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const isFreelancerCopy = copyType !== "client_copy";
  const copyTitle = isFreelancerCopy
    ? "Salinan pihak pertama (Freelancer)"
    : "Salinan pihak kedua (Klien)";
  const serialNumber = isFreelancerCopy ? "SN-2026-99824-EMTR" : "SN-2026-99825-EMTR";

  function drawCheckmark(x: number, y: number) {
    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(1.4);
    doc.line(x, y + 2, x + 2.5, y + 5);
    doc.line(x + 2.5, y + 5, x + 6.5, y - 2);
  }

  function drawBullet(x: number, y: number) {
    doc.setFillColor(148, 163, 184);
    doc.circle(x + 3, y + 1, 1.8, "F");
  }

  function drawSignature(x: number, y: number, color: [number, number, number]) {
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setLineWidth(1.6);
    doc.line(x, y + 8, x + 10, y - 6);
    doc.line(x + 10, y - 6, x + 22, y + 12);
    doc.line(x + 22, y + 12, x + 35, y - 8);
    doc.line(x + 35, y - 8, x + 48, y + 8);
    doc.line(x + 48, y + 8, x + 65, y - 2);
    doc.line(x + 5, y + 3, x + 72, y + 3);
  }

  function drawEMaterai(x: number, y: number, serial: string) {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(1.1);
    doc.rect(x, y, 68, 68, "FD");

    doc.setLineWidth(0.6);
    doc.setLineDashPattern([2, 1.5], 0);
    doc.rect(x + 2, y + 2, 64, 64);
    doc.setLineDashPattern([], 0);

    doc.setTextColor(15, 23, 42);
    doc.setFont("courier", "bold");
    doc.setFontSize(5);
    doc.text("METERAI ELEKTRONIK", x + 34, y + 9, { align: "center" });

    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.5);
    doc.line(x + 6, y + 11, x + 62, y + 11);

    doc.setFont("courier", "bold");
    doc.setFontSize(11);
    doc.text("10000", x + 34, y + 21, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(4.2);
    doc.text("SEPULUH RIBU RUPIAH", x + 34, y + 27, { align: "center" });

    // simulated QR
    doc.setFillColor(15, 23, 42);
    doc.rect(x + 21, y + 31, 26, 26);
    doc.setFillColor(255, 255, 255);
    doc.rect(x + 24, y + 34, 7, 7);
    doc.rect(x + 37, y + 34, 7, 7);
    doc.rect(x + 24, y + 47, 7, 7);
    doc.setFillColor(15, 23, 42);
    doc.rect(x + 26, y + 36, 3, 3);
    doc.rect(x + 39, y + 36, 3, 3);
    doc.rect(x + 26, y + 49, 3, 3);

    doc.setFont("courier", "normal");
    doc.setFontSize(3.8);
    doc.text(serial, x + 34, y + 61, { align: "center" });
    doc.setFont("helvetica", "italic");
    doc.setFontSize(3.5);
    doc.text("PERURI - DJP RI", x + 34, y + 65.5, { align: "center" });
  }

  // ========================== HALAMAN 1 ==========================
  // Header Logo
  doc.setFillColor(249, 115, 22);
  doc.roundedRect(36, 36, 26, 26, 6, 6, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("S", 44.5, 54.5);

  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42);
  doc.text("Sepakat", 70, 49);
  doc.setTextColor(249, 115, 22);
  doc.text("In", 128, 49);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Solusi Adil Sekarang", 70, 59);

  // Status Badge
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(167, 243, 208);
  doc.setLineWidth(0.8);
  doc.roundedRect(440, 36, 119, 18, 9, 9, "FD");
  doc.setFillColor(16, 185, 129);
  doc.circle(452, 45, 2.5, "F");
  doc.setTextColor(4, 120, 87);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("Sudah Disepakati", 460, 48);

  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text("Tanggal: 20 September 2026", 440, 64);

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text("Surat Kesepakatan Kerja", 36, 82);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Nomor dokumen: ", 36, 96);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(37, 99, 235);
  doc.text(contractId, 105, 96);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(" · Versi ", 166, 96);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("5", 195, 96);

  // Copy pill
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.8);
  doc.roundedRect(36, 104, 175, 14, 7, 7, "S");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(copyTitle, 45, 114);

  // Heavy divider
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(1.6);
  doc.line(36, 126, 559, 126);

  // Pasal 1
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Pasal 1 · Para Pihak", 36, 140);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.6);
  doc.line(36, 144, 559, 144);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text("Surat kesepakatan ini dibuat dan disetujui secara sadar oleh kedua pihak berikut:", 36, 155);

  // Party cards
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.7);
  doc.roundedRect(36, 162, 256, 62, 4, 4, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("Pihak Pertama (Freelancer)", 44, 173);
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Nama: Fadli Bilal", 44, 184);
  doc.text("Email: fadli@sepakatin.id", 44, 194);
  doc.text("Keahlian: Fullstack Web Developer", 44, 204);
  doc.text("WhatsApp: +62 812-3456-7890", 44, 214);

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(303, 162, 256, 62, 4, 4, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("Pihak Kedua (Klien)", 311, 173);
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Nama: Budi Santoso", 311, 184);
  doc.text("Email: budi@solusidigital.id", 311, 194);
  doc.text("Perusahaan: PT Solusi Digital Nusantara", 311, 204);
  doc.text("WhatsApp: +62 811-9876-5432", 311, 214);

  // Pasal 2
  let y = 236;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Pasal 2 · Pekerjaan yang Disepakati", 36, y);
  doc.setDrawColor(203, 213, 225);
  doc.line(36, y + 4, 559, y + 4);

  y += 15;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text('Pihak Pertama sepakat mengerjakan proyek "' + title + '" dengan gambaran berikut:', 36, y);

  y += 9;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(36, y, 523, 30, 4, 4, "FD");
  doc.setFont("helvetica", "italic");
  doc.setFontSize(6.8);
  doc.setTextColor(71, 85, 105);
  const quote = '"Pengembangan menyeluruh website profil perusahaan bilingual (Indonesia & English), portal berita/artikel dinamis CMS, portal rekrutmen karir terhubung notifikasi WhatsApp HRD, integrasi analitik (GA4 & Meta Pixel), optimasi Core Web Vitals (SEO On-Page), serta garansi pemeliharaan 60 hari."';
  const splitQuote = doc.splitTextToSize(quote, 505);
  doc.text(splitQuote, 45, y + 10);

  y += 40;
  // Two columns deliverables & exclusions
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.8);
  doc.setTextColor(15, 23, 42);
  doc.text("A. Hasil kerja yang diserahkan", 36, y);
  doc.text("B. Tidak termasuk", 310, y);

  y += 10;
  const deliverables = [
    "Desain mockup UI/UX untuk desktop dan mobile yang elegan & profesional (Figma)",
    "Pengembangan 5 halaman utama bilingual (ID & EN) dengan switcher bahasa instan",
    "Modul CMS Admin Berita multi-bahasa: input terpisah Bahasa Indonesia dan English",
    "Halaman Karir/Lowongan Kerja & formulir lamaran kerja upload CV/Resume (PDF)",
    "Integrasi webhook notifikasi otomatis data pelamar baru langsung ke WhatsApp HRD",
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
    drawCheckmark(36, dy1 + 2);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(51, 65, 85);
    doc.text(d, 48, dy1 + 7);
    dy1 += 12;
  });

  let dy2 = y;
  exclusions.forEach((e) => {
    drawBullet(310, dy2 + 5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(e, 320, dy2 + 7);
    dy2 += 13;
  });

  // Pasal 3
  y = 422;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Pasal 3 · Harga & Pembayaran", 36, y);
  doc.setDrawColor(203, 213, 225);
  doc.line(36, y + 4, 559, y + 4);

  y += 12;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(1.4);
  doc.rect(36, y, 523, 44, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text("Total nilai proyek", 48, y + 14);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text("Rp 15.000.000", 48, y + 34);

  doc.setFontSize(7.2);
  doc.setTextColor(51, 65, 85);
  doc.setFont("helvetica", "normal");
  doc.text("Uang Muka (DP):", 390, y + 14);
  doc.setFont("helvetica", "bold");
  doc.text("40%", 460, y + 14);

  doc.setFont("helvetica", "normal");
  doc.text("Pelunasan:", 390, y + 25);
  doc.setFont("helvetica", "bold");
  doc.text("7 hari setelah serah terima", 440, y + 25);

  doc.setFont("helvetica", "normal");
  doc.text("Cara bayar:", 390, y + 36);
  doc.setFont("helvetica", "bold");
  doc.text("Transfer Bank BCA / Mandiri", 440, y + 36);

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

  // Pasal 4
  y += 14;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Pasal 4 · Revisi & Jadwal", 36, y);
  doc.setDrawColor(203, 213, 225);
  doc.line(36, y + 4, 559, y + 4);

  y += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.2);
  doc.setTextColor(51, 65, 85);
  doc.text("Jatah revisi gratis: ", 36, y);
  doc.setFont("helvetica", "bold");
  doc.text("4 kali", 105, y);

  doc.setFont("helvetica", "normal");
  doc.text("Mulai: ", 320, y);
  doc.setFont("helvetica", "bold");
  doc.text("20 September 2026", 350, y);

  y += 11;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Revisi mencakup penyesuaian tata letak minor & teks. Melebihi kuota wajib dibuatkan addendum bermeterai.", 36, y);
  doc.setTextColor(51, 65, 85);
  doc.text("Tenggat selesai: ", 320, y);
  doc.setFont("helvetica", "bold");
  doc.text("20 November 2026", 382, y);

  y += 11;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Biaya revisi tambahan: Rp 400.000 per revisi di luar kuota.", 36, y);

  // Pasal 5
  y += 18;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Pasal 5 · Hak Cipta & Pembatalan", 36, y);
  doc.setDrawColor(203, 213, 225);
  doc.line(36, y + 4, 559, y + 4);

  y += 13;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(15, 23, 42);
  doc.text("1. Kepemilikan hasil kerja:", 36, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(" Hak cipta & kode sumber diserahkan 100% setelah lunas. Freelancer berhak memajang karya di portofolio.", 122, y);

  y += 11;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("2. Jika dibatalkan:", 36, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(" Jika dibatalkan di awal, DP dipotong 15%. Di tengah pengerjaan, Klien membayar proporsional tahap selesai.", 95, y);

  // Footer Page 1
  doc.setFontSize(6.8);
  doc.setTextColor(148, 163, 184);
  doc.text("Sepakatin · Dokumen Sah Dilindungi Kriptografi SHA-256", 36, 815);
  doc.text("Halaman 1 dari 2", 500, 815);

  // ========================== HALAMAN 2 ==========================
  doc.addPage();

  // Mini Header Logo
  doc.setFillColor(249, 115, 22);
  doc.roundedRect(36, 36, 18, 18, 4, 4, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("S", 42, 49);

  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("Sepakat", 60, 48);
  doc.setTextColor(249, 115, 22);
  doc.text("In", 103, 48);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(" · Lembar Pengesahan & Bukti Keabsahan", 113, 48);

  doc.text("Nomor Dokumen: " + contractId + " · Halaman 2 dari 2", 380, 48);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.6);
  doc.line(36, 60, 559, 60);

  // Pengesahan Section Title
  y = 88;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text("Pengesahan & Tanda Tangan", 297.64, y, { align: "center" });

  y += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Kesepakatan ini telah disetujui secara sadar dan sukarela oleh kedua belah pihak di bawah ini:", 297.64, y, { align: "center" });

  // Two Signature Boxes
  y += 20;
  const boxW = 256;
  const boxH = 195;

  // Box 1: Freelancer
  doc.setFillColor(250, 251, 253);
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.8);
  doc.roundedRect(36, y, boxW, boxH, 4, 4, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text("Pihak Pertama (Freelancer)", 46, y + 15);
  doc.setDrawColor(226, 232, 240);
  doc.line(36, y + 22, 36 + boxW, y + 22);

  // Box 2: Klien
  doc.setFillColor(250, 251, 253);
  doc.setDrawColor(148, 163, 184);
  doc.roundedRect(303, y, boxW, boxH, 4, 4, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text("Pihak Kedua (Klien)", 313, y + 15);
  doc.setDrawColor(226, 232, 240);
  doc.line(303, y + 22, 303 + boxW, y + 22);

  // Signatures and e-Meterai placement
  if (isFreelancerCopy) {
    // Freelancer Copy: e-Materai on Client Box
    // Freelancer Box: single signature
    drawSignature(120, y + 65, [37, 99, 235]); // blue signature
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text("Tanda Tangan Freelancer", 164, y + 95, { align: "center" });

    // Client Box: e-Meterai on left, signature on right
    drawEMaterai(315, y + 35, serialNumber);
    drawSignature(415, y + 65, [15, 23, 42]); // dark slate signature
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text("Tanda Tangan Klien", 455, y + 95, { align: "center" });
  } else {
    // Client Copy: e-Meterai on Freelancer Box
    // Freelancer Box: e-Meterai on left, signature on right
    drawEMaterai(46, y + 35, serialNumber);
    drawSignature(145, y + 65, [37, 99, 235]);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text("Tanda Tangan Freelancer", 185, y + 95, { align: "center" });

    // Client Box: single signature
    drawSignature(395, y + 65, [15, 23, 42]);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text("Tanda Tangan Klien", 431, y + 95, { align: "center" });
  }

  // Names & timestamps inside Box 1 (Freelancer)
  doc.setDrawColor(203, 213, 225);
  doc.line(46, y + 118, 282, y + 118);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Fadli Bilal", 164, y + 132, { align: "center" });
  doc.setLineWidth(0.6);
  doc.line(138, y + 134, 190, y + 134);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("Fullstack Web Developer", 164, y + 144, { align: "center" });
  doc.text("Studio Kreasi Mandiri", 164, y + 154, { align: "center" });

  doc.setDrawColor(241, 245, 249);
  doc.line(46, y + 162, 282, y + 162);
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  doc.text("Status: Sudah menyetujui", 46, y + 175);
  doc.text("Waktu: 24 September 2026 16:20 WIB", 46, y + 186);

  // Names & timestamps inside Box 2 (Client)
  doc.setDrawColor(203, 213, 225);
  doc.line(313, y + 118, 549, y + 118);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Budi Santoso", 431, y + 132, { align: "center" });
  doc.setLineWidth(0.6);
  doc.line(402, y + 134, 460, y + 134);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("Pemberi Kerja", 431, y + 144, { align: "center" });
  doc.text("PT Solusi Digital Nusantara", 431, y + 154, { align: "center" });

  doc.setDrawColor(241, 245, 249);
  doc.line(313, y + 162, 549, y + 162);
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  doc.text("Status: Sudah menyetujui", 313, y + 175);
  doc.text("Waktu: 24 September 2026 16:30 WIB", 313, y + 186);

  // Legal note below boxes
  y += boxH + 18;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(36, y, 523, 26, 4, 4, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(15, 23, 42);
  doc.text("Catatan Yuridis UU No. 10 Tahun 2020 tentang Bea Meterai:", 46, y + 11);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  if (isFreelancerCopy) {
    doc.text("Salinan ini disimpan Pihak Pertama (Freelancer) dengan e-Meterai dibubuhkan pada kolom tanda tangan Klien.", 46, y + 20);
  } else {
    doc.text("Salinan ini disimpan Pihak Kedua (Klien) dengan e-Meterai dibubuhkan pada kolom tanda tangan Freelancer.", 46, y + 20);
  }

  // SHA-256 Integrity Seal
  y += 38;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(1);
  doc.roundedRect(36, y, 523, 56, 6, 6, "FD");

  doc.setFillColor(16, 185, 129);
  doc.circle(52, y + 18, 5, "F");
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(1.2);
  doc.line(49.5, y + 18, 51.5, y + 20);
  doc.line(51.5, y + 20, 55, y + 16);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(4, 120, 87);
  doc.text("Segel Integritas Kriptografis Tervalidasi (SHA-256)", 64, y + 17);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(51, 65, 85);
  doc.text("Isi dokumen ini telah dikunci dan dicatat secara permanen pada sistem Sepakatin. Setiap perubahan", 64, y + 29);
  doc.text("akan membatalkan keabsahan segel dan ditandai sebagai manipulasi data.", 64, y + 38);

  doc.setFont("courier", "normal");
  doc.setFontSize(6.2);
  doc.setTextColor(71, 85, 105);
  doc.text("Hash: dd38a6d87c99a1dd4f82662fa9b61e2cb0382e707e44ba54d92305a4645da171", 64, y + 49);

  // Footer Page 2
  doc.setFontSize(6.8);
  doc.setTextColor(148, 163, 184);
  doc.text("Sepakatin · Dokumen Sah Dilindungi Kriptografi SHA-256", 36, 815);
  doc.text("Halaman 2 dari 2", 500, 815);

  return doc.output("datauristring");
}
