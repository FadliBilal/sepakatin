import { getAdmin } from "@/lib/server/supabase-admin";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  const uptimeSeconds = process.uptime ? Math.floor(process.uptime()) : 0;

  try {
    const db = getAdmin();
    const { error } = await db.from("profiles").select("id").limit(1);

    if (error) {
      throw error;
    }

    const latencyMs = Date.now() - startTime;

    return NextResponse.json(
      {
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptimeSeconds,
        database: {
          connected: true,
          latencyMs,
        },
        environment: process.env.NODE_ENV || "development",
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (err: unknown) {
    const latencyMs = Date.now() - startTime;
    const errorMessage = err instanceof Error ? err.message : "Database connection failed";

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        uptimeSeconds,
        database: {
          connected: false,
          latencyMs,
          error: errorMessage,
        },
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  }
}
