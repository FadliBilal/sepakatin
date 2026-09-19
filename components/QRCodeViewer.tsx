"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";

interface QRCodeViewerProps {
  value: string;
  size?: number;
  className?: string;
}

export function QRCodeViewer({ value, size = 120, className = "" }: QRCodeViewerProps) {
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    if (!value) return;
    QRCode.toDataURL(value, {
      width: size,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    })
      .then((url) => setDataUrl(url))
      .catch((err) => console.error("QR Code generation error:", err));
  }, [value, size]);

  if (!dataUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`bg-slate-100 border border-slate-200 rounded-lg animate-pulse ${className}`}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={dataUrl}
      alt="Kode QR untuk cek keaslian dokumen"
      width={size}
      height={size}
      className={`rounded-lg ${className}`}
    />
  );
}
