"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerSchema } from "@/lib/zod";
import { Info } from "lucide-react";

const RegisterPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    email?: string;
    birthDate?: string;
    password?: string;
  }>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const birthDate = formData.get("birthDate") as string;
    const password = formData.get("password") as string;

    // Validate with Zod
    const validation = registerSchema.safeParse({ fullName, email, birthDate, password });
    if (!validation.success) {
      const formattedErrors: {
        fullName?: string;
        email?: string;
        birthDate?: string;
        password?: string;
      } = {};
      validation.error.issues.forEach((err) => {
        const field = err.path[0] as keyof typeof formattedErrors;
        if (field) formattedErrors[field] = err.message;
      });
      setFieldErrors(formattedErrors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName, role: "PATIENT", action: "register" }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/login?registered=true");
      } else {
        setError(data.error || "Registrasi gagal");
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sky-50/50 dark:bg-slate-900 p-4">
      <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-xl p-6 sm:p-8 border border-gray-100 dark:border-slate-700 shadow-lg shadow-blue-500/5 space-y-6">
        
        {/* Brand Logo & Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-300 flex items-center justify-center p-2.5 shadow-inner">
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-emerald-600">
              <circle cx="12" cy="12" r="10" stroke="#059669" strokeWidth="1.5" fill="#D1FAE5" opacity="0.4"/>
              <path d="M12 4a8 8 0 0 0-8 8c0 4.418 3.582 8 8 8s8-3.582 8-8a8 8 0 0 0-8-8zm-2 5a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm4 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm-6 7c1-2 3-2 4-2s3 0 4 2" stroke="#059669" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>

          <h1 className="text-xl font-black text-[#0066FF] tracking-tight">
            AI-Mindly
          </h1>
          <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
            Buat Akun
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-600 font-medium flex items-center gap-2">
            <Info className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Inputs */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-sm" noValidate>
          <div>
            <input
              type="text"
              name="fullName"
              placeholder="Nama Lengkap"
              className={`w-full px-3.5 py-2.5 rounded-lg border bg-gray-50/50 dark:bg-slate-700/50 text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                fieldErrors.fullName
                  ? "border-rose-400 focus:ring-rose-400"
                  : "border-gray-200 dark:border-slate-700 focus:ring-blue-500"
              }`}
            />
            {fieldErrors.fullName && (
              <div className="flex items-center gap-1.5 mt-1 text-rose-600">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span className="text-xs font-medium">{fieldErrors.fullName}</span>
              </div>
            )}
          </div>

          <div>
            <input
              type="text"
              name="email"
              placeholder="Email / No. HP"
              className={`w-full px-3.5 py-2.5 rounded-lg border bg-gray-50/50 dark:bg-slate-700/50 text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                fieldErrors.email
                  ? "border-rose-400 focus:ring-rose-400"
                  : "border-gray-200 dark:border-slate-700 focus:ring-blue-500"
              }`}
            />
            {fieldErrors.email && (
              <div className="flex items-center gap-1.5 mt-1 text-rose-600">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span className="text-xs font-medium">{fieldErrors.email}</span>
              </div>
            )}
          </div>

          <div>
            <input
              type="date"
              name="birthDate"
              placeholder="Tanggal Lahir"
              className={`w-full px-3.5 py-2.5 rounded-lg border bg-gray-50/50 dark:bg-slate-700/50 text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                fieldErrors.birthDate
                  ? "border-rose-400 focus:ring-rose-400"
                  : "border-gray-200 dark:border-slate-700 focus:ring-blue-500"
              }`}
            />
            {fieldErrors.birthDate && (
              <div className="flex items-center gap-1.5 mt-1 text-rose-600">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span className="text-xs font-medium">{fieldErrors.birthDate}</span>
              </div>
            )}
          </div>

          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              className={`w-full px-3.5 py-2.5 rounded-lg border bg-gray-50/50 dark:bg-slate-700/50 text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                fieldErrors.password
                  ? "border-rose-400 focus:ring-rose-400"
                  : "border-gray-200 dark:border-slate-700 focus:ring-blue-500"
              }`}
            />
            {fieldErrors.password && (
              <div className="flex items-center gap-1.5 mt-1 text-rose-600">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span className="text-xs font-medium">{fieldErrors.password}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-lg bg-[#0066FF] hover:bg-blue-700 text-white font-bold text-sm shadow-xs transition-all mt-2"
          >
            {isLoading ? "Memproses..." : "Daftar"}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs font-medium text-gray-500">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-[#0066FF] font-bold hover:underline">
              Masuk
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;

