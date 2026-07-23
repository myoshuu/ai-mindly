import { BookOpen, Video, FileText, ExternalLink, PlayCircle } from "lucide-react";

export const dynamic = "force-dynamic";

const EducationPage = () => {
  const materials = [
    {
      id: "edu-1",
      title: "Panduan Manajemen Stres & Kecemasan Ringan",
      type: "Modul Edukasi",
      duration: "10 menit baca",
      link: "https://www.youtube.com/watch?v=wOGqlVqyznU",
      category: "Kecemasan",
    },
    {
      id: "edu-2",
      title: "Teknik Relaksasi Napas Dalam 4-7-8",
      type: "Video Praktik",
      duration: "5 menit video",
      link: "https://www.youtube.com/watch?v=1ZyBODF6igI",
      category: "Relaksasi",
    },
    {
      id: "edu-3",
      title: "Mengenali Tanda Dini Gangguan Kesehatan Mental",
      type: "Artikel Klinis",
      duration: "8 menit baca",
      link: "https://www.youtube.com/watch?v=rkZl2gsLUp4",
      category: "Edukasi Umum",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Edukasi Kesehatan Mental
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Materi edukasi, video relaksasi, dan panduan pertolongan pertama psikologis
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {materials.map((mat) => (
          <div key={mat.id} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-100 dark:border-slate-700 shadow-xs space-y-4 hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#0066FF] bg-blue-50 px-2 py-0.5 rounded border border-blue-100 uppercase">
                  {mat.category}
                </span>
                <span className="text-xs text-gray-400 font-medium">{mat.duration}</span>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-base leading-snug">
                {mat.title}
              </h3>
            </div>

            <a
              href={mat.link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center w-full py-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0066FF] font-bold text-xs transition-all border border-blue-100 gap-2"
            >
              <PlayCircle className="w-4 h-4" />
              Tonton / Baca Materi
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EducationPage;
