"use client";

import Link from "next/link";
import { Check } from "lucide-react";

const PatientSubmittedPage = () => {
  return (
    <div className="min-h-screen bg-sky-50/50 dark:bg-slate-900 max-w-md mx-auto relative shadow-2xl p-6 flex flex-col justify-between border-x border-gray-100 dark:border-slate-800 text-center">
      
      <div className="space-y-8 pt-6">
        {/* Title */}
        <h1 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Data Terkirim
        </h1>

        {/* Graphic Nurse & Green Check Badge (Screen 4 mockup) */}
        <div className="relative w-44 h-44 mx-auto my-6 flex items-center justify-center">
          <div className="w-36 h-36 rounded-full bg-blue-100 dark:bg-blue-950/60 border-4 border-blue-200 dark:border-blue-800 flex items-center justify-center p-4 overflow-hidden relative shadow-inner">
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-blue-600">
              <path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5z" fill="#93C5FD" opacity="0.4"/>
              <circle cx="12" cy="7" r="3" fill="#2563EB"/>
              <path d="M7 19v-2a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v2" stroke="#1E40AF" strokeWidth="1.5"/>
            </svg>
          </div>

          {/* Green Checkmark Badge overlay */}
          <div className="absolute bottom-2 right-4 w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-lg">
            <Check className="w-6 h-6 stroke-[3]" />
          </div>
        </div>

        {/* Paragraphs */}
        <div className="space-y-3 px-4">
          <p className="text-sm font-bold text-gray-900 dark:text-white leading-relaxed">
            Hasil skrining Anda telah dikirim ke perawat untuk ditindaklanjuti.
          </p>
          <p className="text-xs text-gray-400 font-medium leading-relaxed">
            Terima kasih telah menggunakan AI-Mindly.
          </p>
        </div>
      </div>

      {/* Bottom Action Button */}
      <div className="pb-4">
        <Link
          href="/patient/beranda"
          className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-[#0066FF] hover:bg-blue-700 text-white font-bold text-sm shadow-xs transition-all"
        >
          Kembali ke Beranda
        </Link>
      </div>

    </div>
  );
};

export default PatientSubmittedPage;
