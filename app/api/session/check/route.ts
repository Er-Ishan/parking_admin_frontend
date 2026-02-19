// Changed by Qasim - 2025-02-20
import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/session-proxy";

export async function GET(request: NextRequest) {
  const backend = getBackendUrl();
  if (!backend) {
    return NextResponse.json({ message: "Server misconfiguration" }, { status: 500 });
  }

  const cookie = request.headers.get("cookie") || "";

  const res = await fetch(`${backend}/api/session/check`, {
    method: "GET",
    headers: { cookie },
    cache: "no-store",
  });

  return new NextResponse(res.body, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("Content-Type") || "application/json" },
  });
}
