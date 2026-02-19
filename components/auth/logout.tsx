"use client";
// Changed by Qasim - 2025-02-20

import { useRouter } from "next/navigation";

export default function Logout() {
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/session/logout", {
      method: "POST",
      credentials: "include",
    });
    router.replace("/auth/login");
  };

  return (
    <button
      onClick={logout}
      className="text-red-600 hover:text-red-800 font-semibold"
    >
      Logout
    </button>
  );
}
