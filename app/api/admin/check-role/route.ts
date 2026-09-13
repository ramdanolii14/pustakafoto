import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { isAdminUser } from "@/lib/require-admin";

/**
 * GET /api/admin/check-role
 * Returns { isAdmin: boolean } for the current session.
 * Fails closed (isAdmin: false) if there's no session or any error —
 * this endpoint only ever tells the client "you may show admin UI",
 * it is never itself relied on to gate a privileged action.
 */
export async function GET(_req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ isAdmin: false });

    const isAdmin = await isAdminUser(session.user.id);
    return NextResponse.json({ isAdmin });
  } catch {
    return NextResponse.json({ isAdmin: false });
  }
}