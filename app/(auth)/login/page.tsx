"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";
import { loginSchema } from "@/lib/zod";
import { Info, AlertCircle } from "lucide-react";

const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  // Auto redirect if already logged in
  useEffect(() => {
    fetch("/api/auth")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          const targetPath = data.user.role === "PATIENT" ? "/patient/beranda" : "/";
          window.location.href = targetPath;
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Validate with Zod
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      const formattedErrors: { email?: string; password?: string } = {};
      validation.error.issues.forEach((err) => {
        if (err.path[0] === "email") formattedErrors.email = err.message;
        if (err.path[0] === "password") formattedErrors.password = err.message;
      });
      setFieldErrors(formattedErrors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, action: "sign-in" }),
      });

      const data = await response.json();

      if (response.ok && (data.session || data.user)) {
        const targetPath = data.user?.role === "PATIENT" ? "/patient/beranda" : "/";
        window.location.href = targetPath;
      } else {
        setError(data.error || "Login gagal");
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-slate-900 p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8 space-y-2">
          <div className="mx-auto w-16 h-16 rounded-full overflow-hidden border border-gray-100 flex items-center justify-center shadow-md mb-3">
            <img src="/ai-mindly.jpeg" alt="AI-Mindly Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Sistem Informasi Perawat
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            Deteksi Cepat. Asuhan Tepat.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 sm:p-8 border border-gray-100 dark:border-slate-700 shadow-lg shadow-blue-500/5">
          {registered && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-600 shrink-0" />
              <p className="text-xs text-emerald-700 font-semibold">
                Registrasi berhasil! Silakan masuk dengan akun Anda.
              </p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <p className="text-xs text-rose-700 font-semibold">
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-sm" noValidate>
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                NAMA PENGGUNA / NIP
              </label>
              <input
                type="text"
                id="email"
                name="email"
                placeholder="Masukkan NIP atau username"
                className={`w-full px-3.5 py-2.5 rounded-lg border bg-gray-50/50 dark:bg-slate-700/50 text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  fieldErrors.email 
                    ? "border-rose-400 focus:ring-rose-400" 
                    : "border-gray-200 dark:border-slate-700 focus:ring-blue-500"
                }`}
              />
              {fieldErrors.email && (
                <div className="flex items-center gap-1.5 mt-1.5 text-rose-600">
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-xs font-medium">{fieldErrors.email}</span>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  KATA SANDI
                </label>
                <a href="#" className="text-xs text-[#0066FF] font-semibold hover:underline">
                  Lupa Sandi?
                </a>
              </div>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                className={`w-full px-3.5 py-2.5 rounded-lg border bg-gray-50/50 dark:bg-slate-700/50 text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  fieldErrors.password 
                    ? "border-rose-400 focus:ring-rose-400" 
                    : "border-gray-200 dark:border-slate-700 focus:ring-blue-500"
                }`}
              />
              {fieldErrors.password && (
                <div className="flex items-center gap-1.5 mt-1.5 text-rose-600">
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-xs font-medium">{fieldErrors.password}</span>
                </div>
              )}
            </div>

            <div className="flex items-center pt-1">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="remember" className="ml-2 text-xs text-gray-600 dark:text-gray-400 font-medium">
                Tetap masuk di perangkat ini
              </label>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 h-11 rounded-lg bg-[#0066FF] hover:bg-blue-700 text-white font-bold text-sm shadow-xs transition-all mt-2"
            >
              {isLoading ? "Memproses..." : "Masuk →"}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500 space-y-1 font-medium">
          <p>Kesulitan mengakses akun? <a href="#" className="text-[#0066FF] font-bold">Hubungi Bantuan</a></p>
          <p className="pt-2 text-[11px]">v2.4.0-Stable • © 2026 MINDLY Indonesia</p>
          <p className="text-[10px] text-emerald-600 font-semibold pt-0.5">🔒 KONEKSI TERENKRIPSI & AMAN</p>
        </div>
      </div>
    </div>
  );
};

const LoginPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-500 text-sm font-semibold">Memuat...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
};

export default LoginPage;
