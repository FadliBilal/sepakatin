"use client";

import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useCallback,
  useState,
} from "react";
import Script from "next/script";

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
    onTurnstileLoaded?: () => void;
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
    const [scriptReady, setScriptReady] = useState(false);

    const siteKey =
      process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY?.trim() ||
      (process.env.NODE_ENV === "development" ? CLOUDFLARE_TEST_SITEKEY : "");

    const handleVerify = useCallback(
      (token: string) => {
        onVerify(token);
      },
      [onVerify]
    );

    const handleError = useCallback(
      (err?: string) => {
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

    const renderWidget = useCallback(() => {
      if (!siteKey) {
        handleVerify("turnstile_unconfigured_bypass");
        return;
      }

      if (!containerRef.current || !window.turnstile) return;

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
      } catch (err) {
        console.warn("[Turnstile] Render error:", err);
      }
    }, [siteKey, handleVerify, handleError, handleExpire, action]);

    useEffect(() => {
      if (scriptReady && window.turnstile) {
        renderWidget();
      }

      return () => {
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch {}
          widgetIdRef.current = null;
        }
      };
    }, [scriptReady, renderWidget]);

    useEffect(() => {
      if (typeof window !== "undefined" && window.turnstile) {
        setScriptReady(true);
      }
    }, []);

    if (!siteKey) {
      return null;
    }

    return (
      <div className={`w-full flex justify-center py-2 ${className || ""}`}>
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="afterInteractive"
          onLoad={() => setScriptReady(true)}
        />
        <div ref={containerRef} className="min-h-[65px] flex items-center justify-center" />
      </div>
    );
  }
);
