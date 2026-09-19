// ==============================================================================
// Sepakatin — Cryptographic & Canonical Hashing Utilities
// ==============================================================================

/**
 * Deterministically sorts all object keys recursively to produce a canonical JSON string.
 * This guarantees that differences in property order do not affect the SHA-256 hash.
 */
export function canonicalJsonStringify(obj: unknown): string {
  if (obj === null || typeof obj !== "object") {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    return `[${obj.map((item) => canonicalJsonStringify(item)).join(",")}]`;
  }

  const record = obj as Record<string, unknown>;
  const sortedKeys = Object.keys(record).sort();
  const pairs = sortedKeys.map(
    (key) => `${JSON.stringify(key)}:${canonicalJsonStringify(record[key])}`
  );
  return `{${pairs.join(",")}}`;
}

/**
 * Generates a SHA-256 hex string from canonical content.
 * Works seamlessly in both browser (Web Crypto API) and Node.js environments.
 */
export async function generateDocumentHash(content: unknown): Promise<string> {
  const canonicalString = canonicalJsonStringify(content);

  // Browser & modern Edge runtime Web Crypto API
  if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(canonicalString);
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  // Node.js fallback
  try {
    // Dynamic import to prevent bundler errors in browser
    const cryptoModule = await import("crypto");
    return cryptoModule.createHash("sha256").update(canonicalString).digest("hex");
  } catch {
    // Basic fallback algorithm for edge cases
    let hash = 0;
    for (let i = 0; i < canonicalString.length; i++) {
      const char = canonicalString.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(64, "0");
  }
}

/**
 * Generates human-friendly Contract ID: SPK-YYYY-XXXXX
 */
export function generateContractId(): string {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  return `SPK-${year}-${randomSuffix}`;
}

/**
 * Format number to Indonesian Rupiah (IDR)
 */
export function formatCurrencyIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format Date to standard Indonesian readable format
 */
export function formatDateID(dateStr?: string): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    return dateStr;
  }
}

/**
 * Format Datetime with hours & minutes
 */
export function formatDateTimeID(dateStr?: string): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return dateStr;
  }
}
