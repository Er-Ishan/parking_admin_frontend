"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

/** Same-origin session API so cookies work on Safari/iOS (no cross-origin cookie blocking) */
const SESSION_LOGIN = "/api/session/login";
const SESSION_CHECK = "/api/session/check";

async function checkSession(): Promise<boolean> {
  const res = await fetch(SESSION_CHECK, { method: "GET", credentials: "include" });
  return res.ok;
}

export default function LoginPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!name || !password) {
      toast.error("Both fields required");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(SESSION_LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Login failed");
        return;
      }

      toast.success("Login successful");

      // Verify session is available before redirect (fixes Safari/iOS: cookie not sent on first request)
      let ok = await checkSession();
      if (!ok) {
        await new Promise((r) => setTimeout(r, 300));
        ok = await checkSession();
      }
      if (!ok) {
        await new Promise((r) => setTimeout(r, 300));
        ok = await checkSession();
      }

      if (ok) {
        router.replace("/dashboard");
      } else {
        toast.error("Session could not be verified. Please try again.");
      }
    } catch (err) {
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center">
      <div className="w-full max-w-md bg-white p-8 border rounded border-black">

        <h2 className="text-3xl font-bold text-center">Welcome Back</h2>
        <p className="text-center text-gray-500 mb-8">
          Please login to continue
        </p>

        <div className="mb-5">
          <label>Username</label>
          <input
            className="w-full mt-2 px-4 py-3 border rounded border-black"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <label>Password</label>
          <input
            className="w-full mt-2 px-4 py-3 border rounded border-black"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>


        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-purple-600 text-white py-3 rounded"
        >
          {loading ? "Signing in..." : "Login"}
        </button>

      </div>
    </div>
  );
}
