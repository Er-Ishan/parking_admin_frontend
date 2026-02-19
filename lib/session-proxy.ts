/**
 * Session proxy helpers for same-origin cookies (fixes Safari/iOS login redirect issues).
 * Backend may set cookies on a different domain; we mirror them to our domain so the
 * browser treats them as first-party and sends them on every request.
 */

// Prefer server-only env so production can use NEXT_PUBLIC_API_BASE_URL=/api/backend for client
const BACKEND_URL =
  (typeof process !== "undefined" && process.env.API_BACKEND_URL) ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "";

export function getBackendUrl(): string {
  return BACKEND_URL.replace(/\/$/, "");
}

/**
 * Parse Set-Cookie header(s) from backend and build same-origin cookie string.
 * Uses SameSite=Lax so cookies work on Safari/iOS and all browsers.
 */
export function mirrorSetCookieForSameOrigin(setCookieHeader: string | null | undefined): string[] {
  if (!setCookieHeader) return [];

  const cookies: string[] = [];
  // Handle multiple Set-Cookie (array in Node fetch, or single string)
  const parts = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];

  for (const raw of parts) {
    if (!raw || typeof raw !== "string") continue;
    const idx = raw.indexOf(";");
    const nameValue = idx >= 0 ? raw.slice(0, idx).trim() : raw.trim();
    if (!nameValue) continue;
    // Re-set for our domain: Path=/; HttpOnly; SameSite=Lax; Secure (when HTTPS)
    const secure = typeof process !== "undefined" && process.env.NODE_ENV === "production";
    const opts = ["Path=/", "HttpOnly", "SameSite=Lax", ...(secure ? ["Secure"] : [])];
    cookies.push(`${nameValue}; ${opts.join("; ")}`);
  }
  return cookies;
}
