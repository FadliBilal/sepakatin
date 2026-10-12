"use client";

import React, { useRef, useState, useEffect } from "react";
import { RotateCcw, Sparkles } from "lucide-react";

interface SignaturePadProps {
  signerName: string;
  onSave: (dataUrl: string) => void;
  width?: number;
  height?: number;
  className?: string;
  /**
   * Jika diisi, tanda tangan baru dikirim saat tombol ini ditekan (bukan tiap goresan).
   * Dipakai di tempat yang langsung menyimpan ke server agar pengguna sempat meninjau dulu.
   */
  confirmLabel?: string;
  /** Dipanggil saat kanvas dikosongkan, supaya tanda tangan tersimpan ikut dibatalkan. */
  onClear?: () => void;
  /** Mematikan kanvas, misalnya ketika dokumen sudah terkunci. */
  disabled?: boolean;
  isSaving?: boolean;
}

export function SignaturePad({
  signerName,
  onSave,
  width = 240,
  height = 100,
  className = "",
  confirmLabel,
  onClear,
  disabled = false,
  isSaving = false,
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasStroke, setHasStroke] = useState(false);
  const needsConfirm = Boolean(confirmLabel);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = "#0a187a"; // Elegant deep royal blue pen ink
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled || isSaving) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasStroke(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    // Dengan tombol konfirmasi, goresan hanya disimpan di kanvas dulu supaya
    // pengguna bisa meninjau dan mengulang sebelum tanda tangan benar-benar dikirim.
    if (!needsConfirm && canvasRef.current) {
      onSave(canvasRef.current.toDataURL("image/png"));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasStroke(false);
    onClear?.();
  };

  const confirmSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasStroke) return;
    onSave(canvas.toDataURL("image/png"));
  };

  const generateCursiveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.font = "italic bold 28px Georgia, 'Times New Roman', serif";
    ctx.fillStyle = "#0a187a";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(signerName || "Tanda Tangan", canvas.width / 2, canvas.height / 2);

    setHasStroke(true);
    if (!needsConfirm) onSave(canvas.toDataURL("image/png"));
  };

  return (
    <div className={`space-y-2 select-none ${className}`}>
      <div
        className={`relative border border-dashed rounded-xl overflow-hidden transition-colors ${
          disabled ? "border-slate-200 bg-slate-100" : "border-slate-300 bg-white hover:border-brand-600"
        }`}
      >
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          aria-label={`Kotak tanda tangan untuk ${signerName || "penanda tangan"}`}
          className={`w-full touch-none block ${disabled ? "cursor-not-allowed" : "cursor-crosshair"}`}
        />

        {!hasStroke && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs">
            {disabled ? "Tanda tangan terkunci" : "Tanda tangan di sini"}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={clearCanvas}
          disabled={disabled || isSaving || !hasStroke}
          className="inline-flex items-center gap-1 font-medium text-slate-500 hover:text-rose-600 transition-colors disabled:opacity-40 disabled:hover:text-slate-500"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Ulangi</span>
        </button>

        <button
          type="button"
          onClick={generateCursiveSignature}
          disabled={disabled || isSaving}
          className="inline-flex items-center gap-1 text-brand-600 hover:underline font-semibold disabled:opacity-40 disabled:no-underline"
        >
          <Sparkles className="w-3 h-3" />
          <span>Isi otomatis dari nama</span>
        </button>
      </div>

      {needsConfirm && (
        <button
          type="button"
          onClick={confirmSignature}
          disabled={disabled || isSaving || !hasStroke}
          className="btn btn-primary btn-sm w-full"
        >
          {isSaving ? "Menyimpan..." : confirmLabel}
        </button>
      )}

      {needsConfirm && !hasStroke && !disabled && (
        <p className="text-[11px] text-slate-400 text-center">
          Goreskan tanda tangan dulu, lalu tekan tombol di atas untuk menyimpan.
        </p>
      )}
    </div>
  );
}
