"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

/** Same-origin session check so cookies work on Safari/iOS */
const SESSION_CHECK = "/api/session/check";

async function doCheck(): Promise<boolean> {
  const res = await fetch(SESSION_CHECK, { method: "GET", credentials: "include" });
  return res.ok;
}

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    const run = async () => {
      // Short delay so cookie is committed after login redirect (Safari/iOS)
      await new Promise((r) => setTimeout(r, 100));

      if (!mounted.current) return;
      let ok = await doCheck();
      if (!ok && mounted.current) {
        await new Promise((r) => setTimeout(r, 400));
        ok = await doCheck();
      }
      if (!mounted.current) return;
      if (ok) {
        setAuthorized(true);
      } else {
        router.replace("/auth/login");
      }
      setChecking(false);
    };
    run();
    return () => {
      mounted.current = false;
    };
  }, [router]);

  return (
    <>
      {/* ✅ ALWAYS render children (never unmount inputs) */}
      {children}

      {/* ⛔ overlay instead of unmount */}
      {checking && (
        <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
          Loading...
        </div>
      )}
    </>
  );
}
