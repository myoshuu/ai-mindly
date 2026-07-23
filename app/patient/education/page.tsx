"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  PlayCircle,
  Clock,
  BookOpen,
} from "lucide-react";

const PatientEducationPage = () => {
  const materials = [
    {
      id: "edu-1",
      title: "Panduan Manajemen Stres & Kecemasan Ringan",
      type: "Modul Edukasi",
      duration: "10 menit baca",
      link: "https://www.youtube.com/watch?v=wOGqlVqyznU",
      category: "Kecemasan",
      color: "blue",
    },
    {
      id: "edu-2",
      title: "Teknik Relaksasi Napas Dalam 4-7-8",
      type: "Video Praktik",
      duration: "5 menit video",
      link: "https://www.youtube.com/watch?v=1ZyBODF6igI",
      category: "Relaksasi",
      color: "teal",
    },
    {
      id: "edu-3",
      title: "Mengenali Tanda Dini Gangguan Kesehatan Mental",
      type: "Artikel Klinis",
      duration: "8 menit baca",
      link: "https://www.youtube.com/watch?v=rkZl2gsLUp4",
      category: "Edukasi Umum",
      color: "purple",
    },
  ];

  const colorStyles: Record<
    string,
    { bg: string; border: string; text: string; icon: string }
  > = {
    blue: {
      bg: "bg-blue-50 dark:bg-blue-950/50",
      border: "border-blue-100 dark:border-blue-900/50",
      text: "text-blue-600 dark:text-blue-400",
      icon: "bg-blue-100 dark:bg-blue-900/50",
    },
    teal: {
      bg: "bg-teal-50 dark:bg-teal-950/50",
      border: "border-teal-100 dark:border-teal-900/50",
      text: "text-teal-600 dark:text-teal-400",
      icon: "bg-teal-100 dark:bg-teal-900/50",
    },
    purple: {
      bg: "bg-purple-50 dark:bg-purple-950/50",
      border: "border-purple-100 dark:border-purple-900/50",
      text: "text-purple-600 dark:text-purple-400",
      icon: "bg-purple-100 dark:bg-purple-900/50",
    },
  };

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 px-6 py-4">
        <div className="flex items-center gap-4">
          <Link
            href="/patient/beranda"
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              Edukasi Kesehatan Mental
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Materi edukasi & video relaksasi
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {materials.map((mat) => {
          const colors = colorStyles[mat.color];
          return (
            <div
              key={mat.id}
              className={`${colors.bg} rounded-xl p-4 border ${colors.border} space-y-3`}
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`${colors.icon} w-10 h-10 rounded-lg flex items-center justify-center`}
                >
                  <BookOpen className={`w-5 h-5 ${colors.text}`} />
                </div>
                <span
                  className={`text-[10px] font-bold ${colors.text} bg-white dark:bg-slate-800 px-2 py-0.5 rounded border ${colors.border} uppercase`}
                >
                  {mat.category}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-snug">
                  {mat.title}
                </h3>
                <div className="flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>{mat.duration}</span>
                  <span className="mx-1">•</span>
                  <span>{mat.type}</span>
                </div>
              </div>

              <a
                href={mat.link}
                target="_blank"
                rel="noreferrer"
                className={`inline-flex items-center justify-center w-full py-2.5 px-3 rounded-lg font-bold text-xs transition-all border gap-2 ${colors.bg.replace(
                  "50",
                  "100",
                )} ${colors.text} border-current hover:opacity-80`}
              >
                <PlayCircle className="w-4 h-4" />
                Tonton / Baca
                <ExternalLink className="w-3.5 h-3.5 ml-auto" />
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PatientEducationPage;
