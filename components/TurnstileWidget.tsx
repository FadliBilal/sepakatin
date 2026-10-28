"use client";

import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
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
          appearance?: "always" | "execute" | "interaction-only";
          action?: string;
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
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

const DEFAULT_SITEKEY = "0x4AAAAAAFn1F5tQmxGmcHpR";

export const TurnstileWidget = forwardRef<TurnstileWidgetHandle, TurnstileWidgetProps>(
  function TurnstileWidget({ onVerify, onError, onExpire, action, className }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const [renderError, setRenderError] = useState<string | null>(null);

    const onVerifyRef = useRef(onVerify);
    onVerifyRef.current = onVerify;

    const onErrorRef = useRef(onError);
    onErrorRef.current = onError;

    const onExpireRef = useRef(onExpire);
    onExpireRef.current = onExpire;

    const siteKey =
      process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY?.trim() || DEFAULT_SITEKEY;

    useImperativeHandle(ref, () => ({
      reset: () => {
        if (window.turnstile) {
          try {
            if (widgetIdRef.current) {
              window.turnstile.reset(widgetIdRef.current);
            } else {
              window.turnstile.reset();
            }
          } catch {}
        }
      },
    }));

    useEffect(() => {
      let intervalId: ReturnType<typeof setInterval> | null = null;
      let isCancelled = false;

      const initTurnstile = () => {
        if (isCancelled) return true;
        if (!containerRef.current || !window.turnstile || typeof window.turnstile.render !== "function") {
          return false;
        }

        if (widgetIdRef.current) {
          return true;
        }

        try {
          if (containerRef.current) {
            containerRef.current.innerHTML = "";
          }
          const id = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            callback: (token: string) => {
              setRenderError(null);
              onVerifyRef.current(token);
            },
            "error-callback": (err?: string) => {
              if (process.env.NODE_ENV !== "production") {
                console.warn("[Turnstile] Cloudflare challenge error:", err);
              }
              setRenderError(err || "Gagal memverifikasi Turnstile");
              onErrorRef.current?.(err);
            },
            "expired-callback": () => {
              onExpireRef.current?.();
            },
            theme: "light",
            size: "normal",
            appearance: "always",
            action: action || "auth",
          });
          widgetIdRef.current = id;
          return true;
        } catch (err) {
          if (process.env.NODE_ENV !== "production") {
            console.warn("[Turnstile] Render exception:", err);
          }
          return false;
        }
      };

      if (initTurnstile()) return;

      const SCRIPT_ID = "cf-turnstile-script";
      if (!document.getElementById(SCRIPT_ID)) {
        const script = document.createElement("script");
        script.id = SCRIPT_ID;
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }

      const timer = setInterval(() => {
        if (initTurnstile()) {
          clearInterval(timer);
          intervalId = null;
        }
      }, 50);
      intervalId = timer;

      const timeoutId = setTimeout(() => {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      }, 10000);

      return () => {
        isCancelled = true;
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
        clearTimeout(timeoutId);
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch {}
          widgetIdRef.current = null;
        }
      };
    }, [siteKey, action]);

    return (
      <div className={`w-full flex flex-col items-center justify-center py-2 ${className || ""}`}>
        <div
          ref={containerRef}
          className="min-h-[65px] min-w-[300px] flex items-center justify-center"
        />
        {renderError && (
          <p className="text-[11px] text-rose-600 mt-1 text-center">
            {renderError.includes("400010") || renderError.includes("domain")
              ? "Domain ini belum diizinkan di Cloudflare Turnstile dashboard."
              : "Verifikasi Cloudflare Turnstile mengalami kendala."}
          </p>
        )}
      </div>
    );
  }
);
