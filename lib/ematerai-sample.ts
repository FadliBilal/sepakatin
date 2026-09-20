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

/**
 * Menghasilkan Data URL PDF (application/pdf;base64,...) resmi untuk keperluan demo.
 * Berisi draf kesepakatan lengkap (Pasal 1 s.d. 5) sesuai template Sepakatin,
 * lengkap dengan penempatan e-Meterai resmi dan tanda tangan untuk kedua belah pihak:
 * - Salinan Freelancer: e-Meterai pada kolom Klien + Tanda tangan Freelancer
 * - Salinan Klien: e-Meterai pada kolom Freelancer + Tanda tangan Klien
 */
export function generateSampleStampedPdfDataUrl(
  contractId: string = "SPK-2026-00124",
  copyType: "freelancer_copy" | "client_copy" = "freelancer_copy",
  title: string = "Website Profil Perusahaan Bilingual, Portal Berita, Karir & SEO PT Solusi Digital"
): string {
  const isFreelancerCopy = copyType === "freelancer_copy";
  const copyTitle = isFreelancerCopy
    ? "SALINAN PIHAK PERTAMA (FREELANCER)"
    : "SALINAN PIHAK KEDUA (KLIEN)";
  const serialNumber = isFreelancerCopy ? "SN-2026-99824-EMTR" : "SN-2026-99825-EMTR";
  const stampPlacement = isFreelancerCopy
    ? "e-Meterai dibubuhkan pada kolom tanda tangan Klien (Pihak Kedua)"
    : "e-Meterai dibubuhkan pada kolom tanda tangan Freelancer (Pihak Pertama)";

  // Halaman 1: Header, Pasal 1 (Para Pihak), Pasal 2 (Ruang Lingkup), Pasal 3 (Harga & Pembayaran)
  const page1Lines: string[] = [
    "SEPAKATIN - SURAT KESEPAKATAN KERJA (SPK)",
    "Platform Kesepakatan Kerja Freelancer Indonesia Berintegritas Kriptografis",
    "================================================================================",
    `Nomor Dokumen : ${contractId} (Versi 5 - Final Terkunci)`,
    `Jenis Salinan : ${copyTitle}`,
    `Status Bea    : METERAI ELEKTRONIK Rp10.000 LUNAS (UU No. 10 Tahun 2020)`,
    `Nomor Seri    : ${serialNumber} | Distributor: PERURI - DJP RI`,
    `Penempatan    : ${stampPlacement}`,
    "--------------------------------------------------------------------------------",
    "PASAL 1 - PARA PIHAK",
    "1. Pihak Pertama (Freelancer):",
    "   Nama       : Fadli Bilal",
    "   Keahlian   : Fullstack Web Developer (Studio Kreasi Mandiri)",
    "   Kontak     : fadli@sepakatin.id | +62 812-3456-7890",
    "2. Pihak Kedua (Klien):",
    "   Nama       : Budi Santoso",
    "   Perusahaan : PT Solusi Digital Nusantara",
    "   Alamat     : Jl. Sudirman Kav. 24, Jakarta Selatan",
    "   Kontak     : budi@solusidigital.id | +62 811-9876-5432",
    "--------------------------------------------------------------------------------",
    "PASAL 2 - RUANG LINGKUP & DELIVERABLES PROYEK",
    `Judul Proyek: ${title}`,
    "Deskripsi: Pengembangan menyeluruh website profil perusahaan bilingual (ID & EN),",
    "CMS berita dinamis, portal karir + webhook WhatsApp HRD, GA4 & Meta Pixel, SEO,",
    "serta garansi pemeliharaan 60 hari kalender.",
    "Hasil Kerja (Deliverables):",
    "[V] 1. Desain Mockup UI/UX Desktop & Mobile (Figma)",
    "[V] 2. 5 Halaman Utama Bilingual (ID & EN) dengan switcher bahasa instan",
    "[V] 3. Modul CMS Admin Berita / Artikel mandiri multi-bahasa",
    "[V] 4. Halaman Karir/Lowongan Kerja & formulir lamaran upload CV/Resume (PDF)",
    "[V] 5. Integrasi webhook notifikasi otomatis pelamar ke WhatsApp HRD",
    "[V] 6. Pemasangan Google Analytics 4, Tag Manager, dan Meta Pixel tracking",
    "[V] 7. Optimasi SEO On-Page (JSON-LD schema, Open Graph, Core Web Vitals > 90)",
    "[V] 8. Garansi pemeliharaan dan perbaikan bug selama 60 hari kalender",
    "[V] 9. Konfigurasi domain kustom, SSL certificate, CDN & cloud hosting",
    "--------------------------------------------------------------------------------",
    "PASAL 3 - HARGA KONTRAK & TATA CARA PEMBAYARAN",
    "Total Nilai Kontrak : Rp 15.000.000,- (Lima Belas Juta Rupiah)",
    "Metode Pembayaran   : Transfer Bank BCA / Bank Mandiri",
    "- Termin 1 (DP 40%) : Rp 6.000.000,- (Jatuh tempo saat mulai pengerjaan)",
    "- Termin 2 (35%)    : Rp 5.250.000,- (Setelah demo bilingual, CMS & karir)",
    "- Termin 3 (25%)    : Rp 3.750.000,- (Pelunasan setelah go-live & serah terima)",
    "Batas Pelunasan     : 7 (tujuh) hari kerja setelah serah terima sistem.",
  ];

  // Halaman 2: Pasal 4 (Revisi & Jadwal), Pasal 5 (Hak Cipta), Lembar Pengesahan & Meterai, Segel Integritas
  const signatureBoxLines: string[] = isFreelancerCopy
    ? [
        "+------------------------------------+------------------------------------+",
        "| PIHAK PERTAMA (FREELANCER)         | PIHAK KEDUA (KLIEN)                |",
        "| Status: Disetujui & Sah            | Status: Disetujui & Sah            |",
        "|                                    | [METERAI ELEKTRONIK LUNAS Rp10.000]|",
        `|                                    | [SN: ${serialNumber} | PERURI]|`,
        "|                                    |                                    |",
        "|        /s/ Fadli Bilal             |        /s/ Budi Santoso            |",
        "| ---------------------------------- | ---------------------------------- |",
        "| Fadli Bilal                        | Budi Santoso                       |",
        "| Fullstack Web Developer            | PT Solusi Digital Nusantara        |",
        "| Tgl: 24/09/2026 16:20 WIB          | Tgl: 24/09/2026 16:30 WIB          |",
        "+------------------------------------+------------------------------------+",
        "* Salinan Freelancer: e-Meterai dibubuhkan pada kolom tanda tangan Klien.",
      ]
    : [
        "+------------------------------------+------------------------------------+",
        "| PIHAK PERTAMA (FREELANCER)         | PIHAK KEDUA (KLIEN)                |",
        "| Status: Disetujui & Sah            | Status: Disetujui & Sah            |",
        "| [METERAI ELEKTRONIK LUNAS Rp10.000]|                                    |",
        `| [SN: ${serialNumber} | PERURI]|                                    |`,
        "|                                    |                                    |",
        "|        /s/ Fadli Bilal             |        /s/ Budi Santoso            |",
        "| ---------------------------------- | ---------------------------------- |",
        "| Fadli Bilal                        | Budi Santoso                       |",
        "| Fullstack Web Developer            | PT Solusi Digital Nusantara        |",
        "| Tgl: 24/09/2026 16:20 WIB          | Tgl: 24/09/2026 16:30 WIB          |",
        "+------------------------------------+------------------------------------+",
        "* Salinan Klien: e-Meterai dibubuhkan pada kolom tanda tangan Freelancer.",
      ];

  const page2Lines: string[] = [
    "SEPAKATIN - SURAT KESEPAKATAN KERJA (Lanjutan Halaman 2)",
    `Nomor Dokumen: ${contractId} | ${copyTitle}`,
    "================================================================================",
    "PASAL 4 - KETENTUAN REVISI & JADWAL PELAKSANAAN",
    "- Jatah Revisi Wajar  : Maksimal 4 (empat) kali revisi sesuai lingkup kerja.",
    "- Revisi Melebihi Batas: Wajib dibuatkan Addendum Baru bermeterai elektronik.",
    "- Tarif Revisi Ekstra : Rp 400.000,- per revisi tambahan di luar kuota.",
    "- Jadwal Pelaksanaan  : 20 September 2026 s.d. 20 November 2026 (Go-live).",
    "--------------------------------------------------------------------------------",
    "PASAL 5 - HAK CIPTA & KETENTUAN PEMBATALAN",
    "- Hak Cipta           : Dialihkan 100% kepada Klien setelah pembayaran lunas.",
    "- Hak Portofolio      : Freelancer berhak mencantumkan karya dalam portofolio.",
    "- Pembatalan Kontrak  : Pekerjaan yang selesai wajib dibayar secara proporsional.",
    "--------------------------------------------------------------------------------",
    "LEMBAR PENGESAHAN & PENEMPATAN E-METERAI (UU NO. 10 TAHUN 2020)",
    "Kedua belah pihak menyetujui seluruh isi kesepakatan secara sadar dan sukarela:",
    "",
    ...signatureBoxLines,
    "--------------------------------------------------------------------------------",
    "SEGEL INTEGRITAS KRIPTOGRAFIS SEPAKATIN",
    "SHA-256 Digest : 7a829e102f9bc48950d2e8b15d263a4ef7579124a9e2d312bc87042a98f7e2d1",
    `Verifikasi URL : https://sepakatin.id/verify/${contractId}`,
    "Status Berkas  : RESMI, TERKUNCI & MEMILIKI KEKUATAN PEMBUKTIAN HUKUM",
  ];

  const buildStream = (lines: string[]): string => {
    let s = "BT\n/F1 9 Tf\n38 805 Td\n13.5 TL\n";
    lines.forEach((line) => {
      const escaped = line.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
      s += `(${escaped}) '\n`;
    });
    s += "ET\n";
    return s;
  };

  const stream1 = buildStream(page1Lines);
  const stream2 = buildStream(page2Lines);

  const objects = [
    `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`,
    `2 0 obj\n<< /Type /Pages /Kids [3 0 R 6 0 R] /Count 2 >>\nendobj\n`,
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n`,
    `4 0 obj\n<< /Length ${stream1.length} >>\nstream\n${stream1}endstream\nendobj\n`,
    `5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>\nendobj\n`,
    `6 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Contents 7 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n`,
    `7 0 obj\n<< /Length ${stream2.length} >>\nstream\n${stream2}endstream\nendobj\n`,
  ];

  let offset = 9; // "%PDF-1.4\n"
  const offsets = [offset];

  let body = "%PDF-1.4\n";
  for (let i = 0; i < objects.length; i++) {
    offsets.push(offset);
    body += objects[i];
    offset += objects[i].length;
  }

  const startXref = offset;
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) {
    const offStr = String(offsets[i]).padStart(10, "0");
    body += `${offStr} 00000 n \n`;
  }

  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;

  let base64 = "";
  if (typeof btoa !== "undefined") {
    base64 = btoa(unescape(encodeURIComponent(body)));
  } else if (typeof Buffer !== "undefined") {
    base64 = Buffer.from(body, "utf-8").toString("base64");
  }

  return `data:application/pdf;base64,${base64}`;
}
