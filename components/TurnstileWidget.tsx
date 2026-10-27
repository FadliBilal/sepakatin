"use client";

import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useCallback,
  useState,
} from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        params: {
          sitekey: string;
          callback?: (token: string) => void;
          "error-callback"?: (error?: string) => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact" | "flexible";
          action?: string;
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

export interface TurnstileWidgetHandle {
  reset: () => void;
}

export interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onError?: (error?: string) => void;
  onExpire?: () => void;
  action?: string;
  className?: string;
}

const CLOUDFLARE_TEST_SITEKEY = "1x00000000000000000000AA";

export const TurnstileWidget = forwardRef<TurnstileWidgetHandle, TurnstileWidgetProps>(
  function TurnstileWidget({ onVerify, onError, onExpire, action, className }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const [renderError, setRenderError] = useState<string | null>(null);

    const siteKey =
      process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY?.trim() ||
      (process.env.NODE_ENV === "development" ? CLOUDFLARE_TEST_SITEKEY : "");

    const handleVerify = useCallback(
      (token: string) => {
        setRenderError(null);
        onVerify(token);
      },
      [onVerify]
    );

    const handleError = useCallback(
      (err?: string) => {
        console.warn("[Turnstile] Cloudflare challenge error:", err);
        setRenderError(err || "Gagal memverifikasi Turnstile");
        if (onError) onError(err);
      },
      [onError]
    );

    const handleExpire = useCallback(() => {
      if (onExpire) onExpire();
    }, [onExpire]);

    useImperativeHandle(ref, () => ({
      reset: () => {
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.reset(widgetIdRef.current);
          } catch {}
        }
      },
    }));

    useEffect(() => {
      if (!siteKey) {
        handleVerify("turnstile_unconfigured_bypass");
        return;
      }

      let intervalId: ReturnType<typeof setInterval> | null = null;
      let isCancelled = false;

      const initTurnstile = () => {
        if (isCancelled) return true;
        if (!containerRef.current || !window.turnstile) return false;

        if (widgetIdRef.current) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch {}
          widgetIdRef.current = null;
        }

        try {
          const id = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            callback: handleVerify,
            "error-callback": handleError,
            "expired-callback": handleExpire,
            theme: "light",
            size: "normal",
            action: action || "auth",
          });
          widgetIdRef.current = id;
          return true;
        } catch (err) {
          console.warn("[Turnstile] Render exception:", err);
          return false;
        }
      };

      // 1. Coba render langsung jika library sudah terpasang
      if (initTurnstile()) return;

      // 2. Pastikan script tag ada di DOM
      const SCRIPT_ID = "cf-turnstile-script";
      if (!document.getElementById(SCRIPT_ID)) {
        const script = document.createElement("script");
        script.id = SCRIPT_ID;
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }

      // 3. Polling sampai window.turnstile siap
      intervalId = setInterval(() => {
        if (initTurnstile() && intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      }, 80);

      const timeoutId = setTimeout(() => {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      }, 10000);

      return () => {
        isCancelled = true;
        if (intervalId) clearInterval(intervalId);
        clearTimeout(timeoutId);
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch {}
          widgetIdRef.current = null;
        }
      };
    }, [siteKey, handleVerify, handleError, handleExpire, action]);

    if (!siteKey) {
      return null;
    }

    return (
      <div className={`w-full flex flex-col items-center justify-center py-2 ${className || ""}`}>
        <div ref={containerRef} className="min-h-[65px] flex items-center justify-center" />
        {renderError && (
          <p className="text-[11px] text-rose-600 mt-1">
            {renderError.includes("400010") || renderError.includes("domain")
              ? "Domain ini (localhost) belum didaftarkan di Cloudflare Turnstile dashboard."
              : "Verifikasi Cloudflare Turnstile mengalami kendala."}
          </p>
        )}
      </div>
    );
  }
);
