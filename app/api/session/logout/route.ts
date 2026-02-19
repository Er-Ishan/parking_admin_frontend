// Changed by Qasim - 2025-02-20
import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/session-proxy";

function clearCookieNames(cookieHeader: string): string[] {
  if (!cookieHeader) return [];
  return cookieHeader.split(";").map((p) => p.trim().split("=")[0].trim()).filter(Boolean);
}

export async function POST(request: NextRequest) {
  const backend = getBackendUrl();
  if (!backend) {
    return NextResponse.json({ message: "Server misconfiguration" }, { status: 500 });
  }

  const cookie = request.headers.get("cookie") || "";

  const res = await fetch(`${backend}/api/session/logout`, {
    method: "POST",
    headers: { cookie },
  });

  const nextRes = NextResponse.json(res.ok ? {} : { message: "Logout failed" }, { status: res.status });

  // Clear same-origin session cookies so client is logged out
  clearCookieNames(cookie).forEach((name) => {
    nextRes.headers.append("Set-Cookie", `${name}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`);
  });

  return nextRes;
}
