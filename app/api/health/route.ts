import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

interface CheckResult {
  status: "ok" | "error";
  label: string;
  latency_ms: number | null;
  message: string;
}

function ms(start: number) {
  return Math.round((Date.now() - start) * 100) / 100;
}

async function checkDatabase(): Promise<CheckResult> {
  const start = Date.now();
  try {
    const db = getAdminClient();
    const { error } = await db.from("posts").select("id", { count: "exact", head: true }).limit(1);
    if (error) throw error;
    return { status: "ok", label: "Database (Supabase)", latency_ms: ms(start), message: "Connected and responding normally." };
  } catch (err: any) {
    return { status: "error", label: "Database (Supabase)", latency_ms: null, message: err.message || "Database connection failed." };
  }
}

async function checkAuthTables(): Promise<CheckResult> {
  const start = Date.now();
  try {
    const db = getAdminClient();
    const { error } = await db.from("user").select("id", { count: "exact", head: true }).limit(1);
    if (error) throw error;
    return { status: "ok", label: "Authentication (Better Auth)", latency_ms: ms(start), message: "User tables reachable." };
  } catch (err: any) {
    return { status: "error", label: "Authentication (Better Auth)", latency_ms: null, message: err.message || "Auth tables unreachable." };
  }
}

async function checkR2(): Promise<CheckResult> {
  const start = Date.now();
  try {
    const r2Dev = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_DEV_URL;
    if (!r2Dev) throw new Error("R2 public URL is not configured.");
    const res = await fetch(r2Dev, { method: "HEAD", signal: AbortSignal.timeout(5000) });
    if (res.status >= 500) throw new Error(`R2 responded with HTTP ${res.status}.`);
    return { status: "ok", label: "Storage (Cloudflare R2)", latency_ms: ms(start), message: "CDN endpoint is reachable." };
  } catch (err: any) {
    return { status: "error", label: "Storage (Cloudflare R2)", latency_ms: null, message: err.message || "R2 endpoint unreachable." };
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
    return {
      status: "error",
      label: "Environment Configuration",
      latency_ms: null,
      message: `Missing required variable(s): ${missing.join(", ")}.`,
    };
  }
  return { status: "ok", label: "Environment Configuration", latency_ms: null, message: "All required variables are set." };
}

export async function GET() {
  const startTime = Date.now();

  const [database, auth, storage, environment] = await Promise.all([
    checkDatabase(),
    checkAuthTables(),
    checkR2(),
    Promise.resolve(checkEnvVars()),
  ]);

  const checks = [database, auth, storage, environment];
  const failedCount = checks.filter((c) => c.status === "error").length;
  const overallStatus = failedCount === 0 ? "healthy" : failedCount === checks.length ? "down" : "degraded";

  const avgLatency = (() => {
    const latencies = checks.map((c) => c.latency_ms).filter((v): v is number => v !== null);
    if (latencies.length === 0) return null;
    return Math.round((latencies.reduce((a, b) => a + b, 0) / latencies.length) * 100) / 100;
  })();

  const body = {
    service: "PustakaFoto",
    status: overallStatus,
    summary: `${checks.length - failedCount}/${checks.length} systems operational`,
    timestamp: new Date().toISOString(),
    response_time_ms: ms(startTime),
    average_check_latency_ms: avgLatency,
    checks: checks.map((c) => ({
      name: c.label,
      status: c.status,
      latency_ms: c.latency_ms,
      message: c.message,
    })),
  };

  const httpStatus = overallStatus === "healthy" ? 200 : overallStatus === "degraded" ? 200 : 503;

  return new NextResponse(JSON.stringify(body, null, 2), {
    status: httpStatus,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}