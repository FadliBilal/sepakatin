"use client";

import React, { useRef, useState, useEffect } from "react";
import { RotateCcw, Sparkles } from "lucide-react";

interface SignaturePadProps {
  signerName: string;
  onSave: (dataUrl: string) => void;
  width?: number;
  height?: number;
  className?: string;
}

export function SignaturePad({
  signerName,
  onSave,
  width = 240,
  height = 100,
  className = "",
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasStroke, setHasStroke] = useState(false);

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
    if (canvasRef.current) {
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
    onSave(canvas.toDataURL("image/png"));
  };

  return (
    <div className={`space-y-2 select-none ${className}`}>
      <div className="relative border border-dashed border-slate-300 rounded-xl bg-white overflow-hidden hover:border-brand-600 transition-colors">
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
          className="cursor-crosshair w-full touch-none block"
        />

        {!hasStroke && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs">
            Tanda tangan di sini
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={clearCanvas}
          className="inline-flex items-center gap-1 font-medium text-slate-500 hover:text-rose-600 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Ulangi</span>
        </button>

        <button
          type="button"
          onClick={generateCursiveSignature}
          className="inline-flex items-center gap-1 text-brand-600 hover:underline font-semibold"
        >
          <Sparkles className="w-3 h-3" />
          <span>Isi otomatis dari nama</span>
        </button>
      </div>
    </div>
  );
}
