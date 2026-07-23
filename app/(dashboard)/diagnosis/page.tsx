import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Stethoscope, ChevronRight, FileText, Activity } from "lucide-react";

export const dynamic = "force-dynamic";

const DiagnosisPage = async () => {
  const diagnoses = await prisma.diagnosis.findMany({
    orderBy: { code: "asc" },
    include: {
      symptoms: true,
      interventions: { select: { id: true } },
    },
  });

  const formatCauses = (causes: string) => {
    try {
      return JSON.parse(causes);
    } catch {
      return [];
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Diagnosis Keperawatan
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Standar Diagnosis Keperawatan Indonesia (SDKI)
        </p>
      </div>

      {/* Diagnosis Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {diagnoses.map((diagnosis: any) => {
          const causes = formatCauses(diagnosis.causes);

          return (
            <div
              key={diagnosis.id}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-100 dark:border-slate-700">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                      <Stethoscope className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <span className="text-xs font-medium text-purple-600">
                        {diagnosis.code}
                      </span>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {diagnosis.title}
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    {diagnosis.category}
                  </span>
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                    {diagnosis.subcategory}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                  {diagnosis.definition}
                </p>

                {/* Causes */}
                <div className="mt-4">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Penyebab
                  </p>
                  <ul className="space-y-1">
                    {causes.slice(0, 3).map((cause: string, index: number) => (
                      <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                        <span className="text-purple-500">•</span>
                        <span className="line-clamp-1">{cause.replace(/^\d+\.\s*/, "")}</span>
                      </li>
                    ))}
                    {causes.length > 3 && (
                      <li className="text-xs text-gray-500">
                        +{causes.length - 3} lainnya
                      </li>
                    )}
                  </ul>
                </div>

                {/* Stats */}
                <div className="mt-4 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    <span>{diagnosis.symptoms.length} Gejala</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Activity className="w-4 h-4" />
                    <span>{diagnosis.interventions.length} Intervensi</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-slate-700/50 border-t border-gray-100 dark:border-slate-700">
                <Link
                  href={`/diagnosis/${diagnosis.id}`}
                  className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Lihat Detail
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {diagnoses.length === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-12 text-center">
          <Stethoscope className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
          <p className="mt-4 text-gray-500 dark:text-gray-400">
            Belum ada data diagnosis
          </p>
        </div>
      )}
    </div>
  );
};

export default DiagnosisPage;
