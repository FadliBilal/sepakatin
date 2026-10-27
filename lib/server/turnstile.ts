import { clientIp } from "./rate-limit";

export interface TurnstileVerificationResult {
  success: boolean;
  errorCodes?: string[];
  hostname?: string;
  action?: string;
}

const DEFAULT_SECRET_KEY = "0x4AAAAAAFn1FyRRRnsKEGBZAaZ8bZ9erB0";

export async function verifyTurnstileToken(
  token: string,
  req?: Request,
  expectedAction?: string
): Promise<TurnstileVerificationResult> {
  const secretKey = (
    process.env.TURNSTILE_SECRET ||
    process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY ||
    (process.env.NODE_ENV === "production" ? DEFAULT_SECRET_KEY : "")
  ).trim();

  if (!secretKey) {
    return { success: true };
  }

  if (!token || typeof token !== "string" || token.length === 0 || token.length > 2048) {
    return {
      success: false,
      errorCodes: ["missing-input-response"],
    };
  }

  const ip = req ? clientIp(req) : undefined;
  const formData = new URLSearchParams();
  formData.append("secret", secretKey);
  formData.append("response", token);
  if (ip && ip !== "unknown" && !ip.startsWith("127.") && ip !== "::1") {
    formData.append("remoteip", ip);
  }

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      signal: AbortSignal.timeout(10_000),
      body: formData,
    });

    if (!response.ok) {
      return { success: false, errorCodes: ["turnstile-upstream-error"] };
    }

    const data = (await response.json()) as {
      success: boolean;
      "error-codes"?: string[];
      hostname?: string;
      action?: string;
    };

    if (!data.success) {
      return {
        success: false,
        errorCodes: data["error-codes"],
        hostname: data.hostname,
        action: data.action,
      };
    }

    if (expectedAction && data.action && data.action !== expectedAction) {
      return {
        success: false,
        errorCodes: ["action-mismatch"],
        hostname: data.hostname,
        action: data.action,
      };
    }

    return {
      success: true,
      errorCodes: data["error-codes"],
      hostname: data.hostname,
      action: data.action,
    };
  } catch {
    return { success: false, errorCodes: ["network-error"] };
  }
}
