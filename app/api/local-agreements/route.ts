import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { AgreementRecord } from "@/lib/types";

export const dynamic = "force-dynamic";

const LOCAL_STORE_PATH = path.join(process.cwd(), ".local-agreements.json");

function isLocalDevAllowed(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  return true;
}

function readDiskStore(): AgreementRecord[] {
  try {
    if (fs.existsSync(LOCAL_STORE_PATH)) {
      const raw = fs.readFileSync(LOCAL_STORE_PATH, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Gagal membaca .local-agreements.json:", err);
    }
  }
  return [];
}

function writeDiskStore(items: AgreementRecord[]): void {
  try {
    fs.writeFileSync(LOCAL_STORE_PATH, JSON.stringify(items, null, 2), "utf-8");
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Gagal menyimpan ke .local-agreements.json:", err);
    }
  }
}

export async function GET(req: Request) {
  if (!isLocalDevAllowed()) {
    return NextResponse.json(
      { error: "Endpoint ini dinonaktifkan di lingkungan produksi." },
      { status: 404 }
    );
  }

  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const contractId = url.searchParams.get("contractId");
  const id = url.searchParams.get("id");

  const list = readDiskStore();

  if (token) {
    const item = list.find((a) => a.reviewToken === token);
    if (!item) {
      return NextResponse.json({ error: "Kesepakatan tidak ditemukan", code: "NOT_FOUND" }, { status: 404 });
    }
    return NextResponse.json({ agreement: item });
  }

  if (contractId) {
    const normalized = contractId.trim().toUpperCase();
    const item = list.find((a) => a.contractId.toUpperCase() === normalized);
    if (!item) {
      return NextResponse.json({ error: "Kesepakatan tidak ditemukan", code: "NOT_FOUND" }, { status: 404 });
    }
    return NextResponse.json({ agreement: item });
  }

  if (id) {
    const item = list.find((a) => a.id === id);
    if (!item) {
      return NextResponse.json({ error: "Kesepakatan tidak ditemukan", code: "NOT_FOUND" }, { status: 404 });
    }
    return NextResponse.json({ agreement: item });
  }

  // Hanya izinkan pembacaan seluruh koleksi jika dipanggil dari development internal
  return NextResponse.json({ agreements: list });
}

export async function POST(req: Request) {
  if (!isLocalDevAllowed()) {
    return NextResponse.json(
      { error: "Endpoint ini dinonaktifkan di lingkungan produksi." },
      { status: 404 }
    );
  }

  try {
    const body = await req.json();
    const toSave: AgreementRecord[] = body.agreements
      ? body.agreements
      : body.agreement
      ? [body.agreement]
      : [];

    if (toSave.length === 0) {
      return NextResponse.json({ success: true, count: 0 });
    }

    const current = readDiskStore();
    const map = new Map<string, AgreementRecord>();
    current.forEach((a) => map.set(a.id, a));
    toSave.forEach((a) => map.set(a.id, a));

    const updated = Array.from(map.values());
    writeDiskStore(updated);

    return NextResponse.json({ success: true, count: updated.length });
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Gagal memproses /api/local-agreements POST:", err);
    }
    return NextResponse.json({ error: "Gagal menyimpan data lokal", details: String(err) }, { status: 500 });
  }
}
