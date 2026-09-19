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
