import crypto from "crypto";
import { AgreementError } from "@/lib/agreement-logic";

export interface IdempotencyEntry {
  scopedKey: string;
  fingerprint: string;
  status: "PROCESSING" | "COMPLETED";
  statusCode: number;
  responseBody: unknown;
  createdAt: number;
  expiresAt: number;
}

const memoryStore = new Map<string, IdempotencyEntry>();
const TTL_MS = 24 * 60 * 60 * 1000;
const MAX_ENTRIES = 5000;

function sweepExpired(now: number) {
  const expired: string[] = [];
  memoryStore.forEach((entry, key) => {
    if (entry.expiresAt <= now) expired.push(key);
  });
  expired.forEach((k) => memoryStore.delete(k));

  if (memoryStore.size > MAX_ENTRIES) {
    const list = Array.from(memoryStore.entries()).sort(
      (a, b) => a[1].createdAt - b[1].createdAt
    );
    list.slice(0, memoryStore.size - MAX_ENTRIES).forEach(([k]) => memoryStore.delete(k));
  }
}

export function computeFingerprint(payload: unknown): string {
  try {
    const canonical = JSON.stringify(payload, Object.keys(payload || {}).sort());
    return crypto.createHash("sha256").update(canonical || "").digest("hex");
  } catch {
    return crypto.createHash("sha256").update(String(payload || "")).digest("hex");
  }
}

export function extractIdempotencyKey(req: Request): string | null {
  const key =
    req.headers.get("idempotency-key") ||
    req.headers.get("x-idempotency-key") ||
    req.headers.get("Idempotency-Key");
  if (!key) return null;
  const trimmed = key.trim();
  return trimmed.length > 0 && trimmed.length <= 128 ? trimmed : null;
}

export interface RunIdempotentParams<T> {
  key: string | null;
  scope: string;
  payload: unknown;
  execute: () => Promise<{ status: number; body: T }>;
}

export async function runWithIdempotency<T>({
  key,
  scope,
  payload,
  execute,
}: RunIdempotentParams<T>): Promise<{ status: number; body: T; isReplay: boolean }> {
  if (!key) {
    const res = await execute();
    return { status: res.status, body: res.body, isReplay: false };
  }

  const now = Date.now();
  if (memoryStore.size > MAX_ENTRIES) sweepExpired(now);

  const scopedKey = `${scope}::${key}`;
  const fingerprint = computeFingerprint(payload);

  const existing = memoryStore.get(scopedKey);
  if (existing) {
    if (existing.expiresAt > now) {
      if (existing.fingerprint !== fingerprint) {
        throw new AgreementError(
          "Kunci Idempotency digunakan kembali dengan data yang berbeda.",
          422,
          "IDEMPOTENCY_PAYLOAD_MISMATCH"
        );
      }

      if (existing.status === "PROCESSING") {
        throw new AgreementError(
          "Permintaan identik sedang dalam proses. Harap tunggu sebentar.",
          409,
          "CONCURRENT_MUTATION"
        );
      }

      return {
        status: existing.statusCode,
        body: existing.responseBody as T,
        isReplay: true,
      };
    }
    memoryStore.delete(scopedKey);
  }

  memoryStore.set(scopedKey, {
    scopedKey,
    fingerprint,
    status: "PROCESSING",
    statusCode: 200,
    responseBody: null,
    createdAt: now,
    expiresAt: now + TTL_MS,
  });

  try {
    const result = await execute();
    memoryStore.set(scopedKey, {
      scopedKey,
      fingerprint,
      status: "COMPLETED",
      statusCode: result.status,
      responseBody: result.body,
      createdAt: now,
      expiresAt: now + TTL_MS,
    });
    return { status: result.status, body: result.body, isReplay: false };
  } catch (err) {
    memoryStore.delete(scopedKey);
    throw err;
  }
}

export function clearIdempotencyStore(): void {
  memoryStore.clear();
}
