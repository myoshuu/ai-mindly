"use client";

import Link from "next/link";
import {
  Bell,
  BookOpen,
  FileText,
  Sparkles,
  HeartHandshake,
} from "lucide-react";

interface PatientBerandaClientProps {
  displayName: string;
  initials: string;
  lastScreeningDate: string | null;
  hasCompletedScreening: boolean;
  riskLevel: string | null;
  riskLabel: string;
}

const PatientBerandaClient = ({
  displayName,
  lastScreeningDate,
  hasCompletedScreening,
}: PatientBerandaClientProps) => {
  return (
    <div className="pb-20">
      {/* Top Header Card (Blue section) */}
      <div className="bg-[#0066FF] pt-8 pb-12 px-6 text-white rounded-b-2xl relative shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Halo, {displayName} 👋
            </h1>
            <p className="text-xs text-blue-100 mt-1 font-medium leading-relaxed">
              Jaga kesehatan mentalmu, karena kamu berharga.
            </p>
          </div>
          <button className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/20">
            <Bell className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Card: Skrining Saya */}
      <div className="-mt-8 px-6 pt-18">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-lg shadow-blue-500/5 border border-gray-100 dark:border-slate-700/80 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Skrining Saya
              </h2>
              {hasCompletedScreening && lastScreeningDate ? (
                <p className="text-xs text-gray-400 font-medium mt-0.5">
                  Terakhir dilakukan {lastScreeningDate}
                </p>
              ) : (
                <p className="text-xs text-gray-400 font-medium mt-0.5">
                  Belum ada skrining
                </p>
              )}
            </div>
          </div>

          <Link
            href={
              hasCompletedScreening ? "/patient/results" : "/patient/screening"
            }
            className="inline-flex items-center justify-center w-full py-2.5 rounded-lg bg-[#0066FF] hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all"
          >
            {hasCompletedScreening ? "Lihat Hasil" : "Mulai Skrining"}
          </Link>
        </div>
      </div>

      {/* 2x2 Feature Grid */}
      <div className="p-6 grid grid-cols-2 gap-4 mt-1">
        {/* Card 1: Edukasi Kesehatan Mental */}
        <Link
          href="/patient/education"
          className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700/60 shadow-xs hover:shadow-sm transition-all flex flex-col items-center text-center space-y-2.5"
        >
          <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-100">
            <BookOpen className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-snug">
            Edukasi
            <br />
            Kesehatan Mental
          </p>
        </Link>

        {/* Card 2: Riwayat Skrining */}
        <Link
          href="/patient/history"
          className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700/60 shadow-xs hover:shadow-sm transition-all flex flex-col items-center text-center space-y-2.5"
        >
          <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100">
            <FileText className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-snug">
            Riwayat
            <br />
            Skrining
          </p>
        </Link>

        {/* Card 3: Tips Sehat Mental */}
        <Link
          href="/patient/education"
          className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700/60 shadow-xs hover:shadow-sm transition-all flex flex-col items-center text-center space-y-2.5"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100">
            <Sparkles className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-snug">
            Tips
            <br />
            Sehat Mental
          </p>
        </Link>

        {/* Card 4: Bantuan Darurat */}
        <div
          onClick={() =>
            alert(
              "Menghubungi layanan bantuan kesehatan mental darurat (119 ext 8)...",
            )
          }
          className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700/60 shadow-xs hover:shadow-sm transition-all flex flex-col items-center text-center space-y-2.5 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-100">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-snug">
            Bantuan
            <br />
            Darurat
          </p>
        </div>
      </div>
    </div>
  );
};

export default PatientBerandaClient;
