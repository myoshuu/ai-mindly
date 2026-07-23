import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Stethoscope,
  Activity,
  Target,
  FileText,
  CheckCircle,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

const DiagnosisDetailPage = async ({ params }: PageProps) => {
  const { id } = await params;

  const diagnosis = await prisma.diagnosis.findUnique({
    where: { id },
    include: {
      symptoms: {
        orderBy: { order: "asc" },
      },
      outcomes: {
        include: {
          criteria: {
            orderBy: { order: "asc" },
          },
        },
      },
      interventions: {
        include: {
          actions: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  if (!diagnosis) {
    notFound();
  }

  const formatCauses = (causes: string) => {
    try {
      return JSON.parse(causes) as string[];
    } catch {
      return [];
    }
  };

  const formatClinicalConditions = (conditions: string) => {
    try {
      return JSON.parse(conditions) as string[];
    } catch {
      return [];
    }
  };

  const formatReferences = (refs: string) => {
    try {
      return JSON.parse(refs) as string[];
    } catch {
      return [];
    }
  };

  const causes = formatCauses(diagnosis.causes);
  const clinicalConditions = formatClinicalConditions(diagnosis.clinicalConditions);
  const references = formatReferences(diagnosis.references);

  const majorSymptoms = diagnosis.symptoms.filter((s) => s.type === "MAJOR");
  const minorSymptoms = diagnosis.symptoms.filter((s) => s.type === "MINOR");

  const getActionTypeColor = (type: string) => {
    switch (type) {
      case "OBSERVATION":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "THERAPEUTIC":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      case "EDUCATION":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "COLLABORATION":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getActionTypeLabel = (type: string) => {
    switch (type) {
      case "OBSERVATION":
        return "Observasi";
      case "THERAPEUTIC":
        return "Terapeutik";
      case "EDUCATION":
        return "Edukasi";
      case "COLLABORATION":
        return "Kolaborasi";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Back Button */}
      <Link
        href="/diagnosis"
        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Daftar Diagnosis
      </Link>

      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-100 dark:border-slate-700">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center shrink-0">
              <Stethoscope className="w-7 h-7 text-purple-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-lg font-bold text-purple-600">
                  {diagnosis.code}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  {diagnosis.category}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {diagnosis.title}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {diagnosis.subcategory}
              </p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Definisi
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {diagnosis.definition}
          </p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Causes */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-slate-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Penyebab
            </h2>
          </div>
          <div className="p-6">
            <ul className="space-y-3">
              {causes.map((cause, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400"
                >
                  <span className="text-amber-500 mt-1">•</span>
                  <span>{cause}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Clinical Conditions */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-slate-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              Kondisi Klinis
            </h2>
          </div>
          <div className="p-6">
            <ul className="space-y-3">
              {clinicalConditions.map((condition, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400"
                >
                  <span className="text-blue-500 mt-1">•</span>
                  <span>{condition}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Symptoms */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-slate-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            Gejala
          </h2>
        </div>
        <div className="p-6">
          {/* Major Symptoms */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              Mayor (Mendasar)
            </h3>
            <div className="space-y-4">
              {majorSymptoms.map((symptom) => (
                <div
                  key={symptom.id}
                  className="p-4 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {symptom.subjective && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Subjektif
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {symptom.subjective}
                        </p>
                      </div>
                    )}
                    {symptom.objective && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Objektif
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {symptom.objective}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Minor Symptoms */}
          {minorSymptoms.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gray-400" />
                Minor (Pendukung)
              </h3>
              <div className="space-y-4">
                {minorSymptoms.map((symptom) => (
                  <div
                    key={symptom.id}
                    className="p-4 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {symptom.subjective && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                            Subjektif
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {symptom.subjective}
                          </p>
                        </div>
                      )}
                      {symptom.objective && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                            Objektif
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {symptom.objective}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Outcomes (SLKI) */}
      {diagnosis.outcomes.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-slate-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-teal-500" />
              Luaran (SLKI)
            </h2>
          </div>
          <div className="p-6 space-y-6">
            {diagnosis.outcomes.map((outcome) => (
              <div key={outcome.id} className="p-6 rounded-xl bg-teal-50/30 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/30">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-sm font-semibold text-teal-600 dark:text-teal-400">
                      {outcome.code}
                    </span>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {outcome.title}
                    </h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    outcome.expectation === "MENINGKAT" || outcome.expectation === "MEMBAIK"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  }`}>
                    {outcome.expectation === "MENINGKAT" || outcome.expectation === "MEMBAIK"
                      ? "Meningkat"
                      : "Menurun"}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {outcome.definition}
                </p>
                <div className="space-y-3">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Kriteria
                  </p>
                  {outcome.criteria.map((criterion) => (
                    <div key={criterion.id} className="p-3 rounded-lg bg-white/50 dark:bg-slate-800/50">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {criterion.indicator}
                      </p>
                      <div className="grid grid-cols-5 gap-2 text-center text-xs">
                        <div className="p-2 rounded bg-red-100 dark:bg-red-900/30">
                          <p className="font-semibold text-red-700 dark:text-red-400">1</p>
                          <p className="text-red-600 dark:text-red-400">{criterion.score1}</p>
                        </div>
                        <div className="p-2 rounded bg-orange-100 dark:bg-orange-900/30">
                          <p className="font-semibold text-orange-700 dark:text-orange-400">2</p>
                          <p className="text-orange-600 dark:text-orange-400">{criterion.score2}</p>
                        </div>
                        <div className="p-2 rounded bg-yellow-100 dark:bg-yellow-900/30">
                          <p className="font-semibold text-yellow-700 dark:text-yellow-400">3</p>
                          <p className="text-yellow-600 dark:text-yellow-400">{criterion.score3}</p>
                        </div>
                        <div className="p-2 rounded bg-lime-100 dark:bg-lime-900/30">
                          <p className="font-semibold text-lime-700 dark:text-lime-400">4</p>
                          <p className="text-lime-600 dark:text-lime-400">{criterion.score4}</p>
                        </div>
                        <div className="p-2 rounded bg-green-100 dark:bg-green-900/30">
                          <p className="font-semibold text-green-700 dark:text-green-400">5</p>
                          <p className="text-green-600 dark:text-green-400">{criterion.score5}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interventions (SIKI) */}
      {diagnosis.interventions.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-slate-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-500" />
              Intervensi (SIKI)
            </h2>
          </div>
          <div className="p-6 space-y-6">
            {diagnosis.interventions.map((intervention) => (
              <div key={intervention.id} className="p-6 rounded-xl bg-purple-50/30 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                      {intervention.code}
                    </span>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {intervention.title}
                    </h3>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {intervention.definition}
                </p>
                <div className="space-y-4">
                  {intervention.actions.map((action) => (
                    <div
                      key={action.id}
                      className="p-4 rounded-lg bg-white/50 dark:bg-slate-800/50 border border-gray-100 dark:border-gray-700"
                    >
                      <div className="flex items-start gap-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${getActionTypeColor(action.type)}`}>
                          {getActionTypeLabel(action.type)}
                        </span>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {action.action}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* References */}
      {references.length > 0 && (
        <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Referensi
          </h3>
          <ul className="space-y-2">
            {references.map((ref, index) => (
              <li key={index} className="text-sm text-gray-600 dark:text-gray-400 italic">
                {ref}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DiagnosisDetailPage;
