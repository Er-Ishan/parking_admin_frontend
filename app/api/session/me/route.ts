import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/session-proxy";

export async function GET(request: NextRequest) {
  const backend = getBackendUrl();
  if (!backend) {
    return NextResponse.json({ message: "Server misconfiguration" }, { status: 500 });
  }

  const cookie = request.headers.get("cookie") || "";

  const res = await fetch(`${backend}/api/session/me`, {
    method: "GET",
    headers: { cookie },
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
