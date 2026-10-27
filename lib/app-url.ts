const RAW_CONFIGURED = (process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "").trim().replace(/\/+$/, "");

export function appUrl(): string {
  if (typeof window !== "undefined") return window.location.origin;
  if (RAW_CONFIGURED) return RAW_CONFIGURED;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export function verifyUrlFor(contractId: string): string {
  return `${appUrl()}/verify/${contractId}`;
}

export function reviewUrlFor(token: string): string {
  return `${appUrl()}/review/${token}`;
}
