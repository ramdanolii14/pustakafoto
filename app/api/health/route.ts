import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

interface CheckResult {
  status: "ok" | "error";
  latency_ms?: number;
  error?: string;
}

async function checkDatabase(): Promise<CheckResult> {
  const start = Date.now();
  try {
    const db = getAdminClient();
    const { error } = await db.from("posts").select("id", { count: "exact", head: true }).limit(1);
    if (error) throw error;
    return { status: "ok", latency_ms: Date.now() - start };
  } catch (err: any) {
    return { status: "error", error: err.message || "Database connection failed" };
  }
}

async function checkAuthTables(): Promise<CheckResult> {
  const start = Date.now();
  try {
    const db = getAdminClient();
    const { error } = await db.from("user").select("id", { count: "exact", head: true }).limit(1);
    if (error) throw error;
    return { status: "ok", latency_ms: Date.now() - start };
  } catch (err: any) {
    return { status: "error", error: err.message || "Auth tables unreachable" };
  }
}

async function checkR2(): Promise<CheckResult> {
  const start = Date.now();
  try {
    const r2Dev = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_DEV_URL;
    if (!r2Dev) throw new Error("R2 URL not configured");

    // Lightweight check: just verify the domain responds (HEAD request to root)
    const res = await fetch(r2Dev, { method: "HEAD", signal: AbortSignal.timeout(5000) });
    // R2 may return 404 for root path — that's still "reachable"
    if (res.status >= 500) throw new Error(`R2 returned ${res.status}`);
    return { status: "ok", latency_ms: Date.now() - start };
  } catch (err: any) {
    return { status: "error", error: err.message || "R2 unreachable" };
  }
}

function checkEnvVars(): CheckResult {
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "DATABASE_URL",
    "BETTER_AUTH_SECRET",
    "CLOUDFLARE_ACCOUNT_ID",
    "CLOUDFLARE_BUCKET_NAME",
  ];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    return { status: "error", error: `Missing env vars: ${missing.join(", ")}` };
  }
  return { status: "ok" };
}

export async function GET() {
  const startTime = Date.now();

  const [database, authTables, r2, env] = await Promise.all([
    checkDatabase(),
    checkAuthTables(),
    checkR2(),
    Promise.resolve(checkEnvVars()),
  ]);

  const allChecks = { database, auth_tables: authTables, storage_r2: r2, environment: env };
  const allHealthy = Object.values(allChecks).every((c) => c.status === "ok");

  const body = {
    status: allHealthy ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    total_latency_ms: Date.now() - startTime,
    checks: allChecks,
  };

  return NextResponse.json(body, { status: allHealthy ? 200 : 503 });
}