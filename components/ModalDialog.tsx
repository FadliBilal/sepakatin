"use client";

import React, { useEffect } from "react";
import { AlertTriangle, CheckCircle2, Info, Trash2, X } from "lucide-react";

export type ModalType = "danger" | "warning" | "success" | "info";

export interface ModalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void | Promise<void>;
  title: string;
  description: React.ReactNode;
  type?: ModalType;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export function ModalDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  type = "info",
  confirmText = "Lanjutkan",
  cancelText = "Batal",
  isLoading = false,
}: ModalDialogProps) {
  // Tutup dengan tombol Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const isConfirmation = Boolean(onConfirm);

  const getIcon = () => {
    switch (type) {
      case "danger":
        return (
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <Trash2 className="w-6 h-6" />
          </div>
        );
      case "warning":
        return (
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <AlertTriangle className="w-6 h-6" />
          </div>
        );
      case "success":
        return (
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        );
      case "info":
      default:
        return (
          <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <Info className="w-6 h-6" />
          </div>
        );
    }
  };

  const getConfirmBtnClass = () => {
    switch (type) {
      case "danger":
        return "bg-rose-600 hover:bg-rose-700 text-white shadow-sm";
      case "warning":
        return "bg-amber-600 hover:bg-amber-700 text-white shadow-sm";
      case "success":
        return "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm";
      case "info":
      default:
        return "btn-primary";
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="card max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100 bg-white relative animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Tombol Silang */}
        {!isLoading && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Konten Modal */}
        <div className="flex items-start gap-4">
          {getIcon()}
          <div className="space-y-1.5 flex-1 pr-6">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {title}
            </h3>
            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {description}
            </div>
          </div>
        </div>

        {/* Tombol Aksi */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          {isConfirmation ? (
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="btn btn-secondary btn-sm px-4"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                className={`btn btn-sm px-4 ${getConfirmBtnClass()}`}
              >
                {isLoading ? (
                  <span className="flex items-center gap-1.5">
                    <span className="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
                    Memproses...
                  </span>
                ) : (
                  confirmText
                )}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="btn btn-primary btn-sm w-full"
            >
              Mengerti
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
