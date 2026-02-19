// Changed by Qasim - 2025-02-20
import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl, mirrorSetCookieForSameOrigin } from "@/lib/session-proxy";

type RouteParams = { path?: string[] };

async function proxy(
  request: NextRequest,
  context: { params: Promise<RouteParams> }
) {
  const backend = getBackendUrl();
  if (!backend) {
    return NextResponse.json({ message: "Server misconfiguration" }, { status: 500 });
  }

  const { path } = await context.params;
  const pathSegments = path && path.length ? path : [];
  const apiPath = pathSegments.join("/");
  const url = `${backend}/${apiPath}`;

  const cookie = request.headers.get("cookie") || "";
  const contentType = request.headers.get("content-type");
  const headers: Record<string, string> = { cookie };
  if (contentType) headers["Content-Type"] = contentType;

  const method = request.method;
  const body = method !== "GET" && method !== "HEAD" ? await request.text() : undefined;

  const res = await fetch(url, {
    method,
    headers,
    body,
    cache: "no-store",
  });

  const isLogin =
    method === "POST" &&
    pathSegments[pathSegments.length - 2] === "session" &&
    pathSegments[pathSegments.length - 1] === "login";
  const clone = res.clone();
  const data = await res.json().catch(() => ({}));
  const nextRes = NextResponse.json(data, { status: res.status });

  if (isLogin && res.ok) {
    const setCookie = clone.headers.getSetCookie?.();
    const raw = setCookie?.length ? setCookie : clone.headers.get("set-cookie");
    mirrorSetCookieForSameOrigin(raw).forEach((c) => nextRes.headers.append("Set-Cookie", c));
  }

  return nextRes;
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const HEAD = proxy;
