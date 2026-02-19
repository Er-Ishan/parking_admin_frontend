// Changed by Qasim - 2025-02-20
import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl, mirrorSetCookieForSameOrigin } from "@/lib/session-proxy";

export async function POST(request: NextRequest) {
  const backend = getBackendUrl();
  if (!backend) {
    return NextResponse.json({ message: "Server misconfiguration" }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid body" }, { status: 400 });
  }

  const res = await fetch(`${backend}/api/session/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  const nextRes = NextResponse.json(data, { status: res.status });

  // Mirror backend Set-Cookie to our domain so Safari/iOS send the cookie (first-party)
  const setCookie = res.headers.getSetCookie?.();
  const mirrored = mirrorSetCookieForSameOrigin(setCookie && setCookie.length ? setCookie : res.headers.get("set-cookie"));
  mirrored.forEach((cookie) => {
    nextRes.headers.append("Set-Cookie", cookie);
  });

  return nextRes;
}
