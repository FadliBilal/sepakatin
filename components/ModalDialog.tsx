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
          <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-5 h-5" />
          </div>
        );
      case "warning":
        return (
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
        );
      case "success":
        return (
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        );
      case "info":
      default:
        return (
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-[#6366F1] flex items-center justify-center flex-shrink-0">
            <Info className="w-5 h-5" />
          </div>
        );
    }
  };

  const getConfirmBtnClass = () => {
    switch (type) {
      case "danger":
        return "bg-rose-600 hover:bg-rose-700 text-white shadow-xs";
      case "warning":
        return "bg-amber-600 hover:bg-amber-700 text-white shadow-xs";
      case "success":
        return "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs";
      case "info":
      default:
        return "btn-primary";
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="max-w-md w-full p-6 space-y-4 rounded-xl border border-[#E8E8EC] bg-white relative shadow-lg animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Tombol Silang */}
        {!isLoading && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-md text-[#8E8E93] hover:text-[#0A0A0A] hover:bg-[#F4F4F6] transition-colors"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Konten Modal */}
        <div className="flex items-start gap-3.5">
          {getIcon()}
          <div className="space-y-1 flex-1 pr-6">
            <h3 className="text-base font-bold font-display text-[#0A0A0A] leading-snug">
              {title}
            </h3>
            <div className="text-xs sm:text-sm text-[#6B6B6B] leading-relaxed">
              {description}
            </div>
          </div>
        </div>

        {/* Tombol Aksi */}
        <div className="pt-3 border-t border-[#E8E8EC] flex items-center justify-end gap-2.5">
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
