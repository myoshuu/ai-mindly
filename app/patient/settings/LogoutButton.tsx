"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "sign-out" }),
      });

      if (response.ok) {
        router.push("/login");
        router.refresh();
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-4 p-4 w-full bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-100 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors text-red-600 dark:text-red-400"
    >
      <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
        <LogOut className="w-5 h-5" />
      </div>
      <span className="font-medium text-sm">Keluar</span>
    </button>
  );
}
