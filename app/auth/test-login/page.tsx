"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TestLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setMsg("Logging in...");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMsg(data.message || "Login failed");
        setLoading(false);
        return;
      }

      // store user
      localStorage.setItem("user", JSON.stringify(data.user));

      setMsg("Success! Redirecting...");
      router.push("/dashboard");
    } catch (err) {
      setMsg("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 300, margin: "50px auto", textAlign: "center" }}>
      <h2>Test Login</h2>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: "100%", padding: 8, marginTop: 10 }}
      />

      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: "100%", padding: 8, marginTop: 10 }}
      />

      <button
        onClick={handleLogin}
        style={{ width: "100%", padding: 8, marginTop: 15 }}
      >
        {loading ? "Loading..." : "Login"}
      </button>

      <p style={{ marginTop: 10 }}>{msg}</p>
    </div>
  );
}
