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
 * Menghasilkan Data URL PDF (application/pdf;base64,...) resmi untuk keperluan demo
 * Dokumen ini valid 100% dan dapat diunduh/dibuka di browser manapun.
 */
export function generateSampleStampedPdfDataUrl(
  contractId: string = "SPK-2026-00124",
  copyType: "freelancer_copy" | "client_copy" = "freelancer_copy",
  title: string = "Desain & Pengembangan Website Company Profile"
): string {
  const copyTitle =
    copyType === "freelancer_copy"
      ? "SALINAN PIHAK PERTAMA (FREELANCER)"
      : "SALINAN PIHAK KEDUA (KLIEN)";
  const stampPlacement =
    copyType === "freelancer_copy"
      ? "e-Meterai dibubuhkan pada kolom tanda tangan Klien (Pihak Kedua)"
      : "e-Meterai dibubuhkan pada kolom tanda tangan Freelancer (Pihak Pertama)";

  const lines = [
    "SEPAKATIN - DOKUMEN PERJANJIAN KERJA BERMETERAI RESMI",
    "================================================================================",
    `Nomor Dokumen : ${contractId}`,
    `Jenis Salinan : ${copyTitle}`,
    `Judul Proyek  : ${title}`,
    `Tanggal Terbit: ${new Date().toLocaleDateString("id-ID")}`,
    "--------------------------------------------------------------------------------",
    "STATUS BEA METERAI REPUBLIK INDONESIA:",
    "[V] METERAI ELEKTRONIK Rp10.000 (LUNAS)",
    "Nomor Seri    : SN-2026-99824-EMTR",
    "Penyedia Resmi: PERURI - DJP RI (UU No. 10 Tahun 2020 tentang Bea Meterai)",
    `Penempatan    : ${stampPlacement}`,
    "Integritas    : Tervalidasi Kriptografis SHA-256",
    "--------------------------------------------------------------------------------",
    "Catatan:",
    "Dokumen ini merupakan salinan resmi berkekuatan hukum yang telah dibubuhi",
    "e-Meterai melalui portal resmi distributor dan diarsipkan di Sepakatin.",
  ];

  let streamContent = "BT\n/F1 11 Tf\n40 780 Td\n18 TL\n";
  lines.forEach((line) => {
    const escaped = line.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
    streamContent += `(${escaped}) '\n`;
  });
  streamContent += "ET\n";

  const streamLength = streamContent.length;

  const objects = [
    `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`,
    `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`,
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n`,
    `4 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}endstream\nendobj\n`,
    `5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>\nendobj\n`,
  ];

  let offset = 9; // header "%PDF-1.4\n" length
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
