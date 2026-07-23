import { prisma } from "@/lib/prisma";
import { Target, CheckCircle2, Award, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

const mockOutcomes = [
  {
    id: "slki-1",
    code: "L.09088",
    title: "Tingkat Ansietas",
    category: "Psikologis",
    definition: "Kondisi emosi dan pengalaman subjektif individu terhadap objek yang tidak jelas dan spesifik akibat antisipasi bahaya.",
    criteria: [
      "Verbalisasi kebingungan menurun (skor 5)",
      "Verbalisasi kekhawatiran akibat kondisi yang dihadapi menurun (skor 5)",
      "Perilaku gelisah menurun (skor 5)",
      "Perilaku tegang menurun (skor 5)",
      "Konsentrasi membaik (skor 5)",
      "Pola tidur membaik (skor 5)",
    ],
  },
  {
    id: "slki-2",
    code: "L.09092",
    title: "Citra Tubuh",
    category: "Psikologis",
    definition: "Persepsi tentang penampilan, struktur, dan fungsi fisik individu.",
    criteria: [
      "Verbalisasi kecacatan bagian tubuh membaik (skor 5)",
      "Verbalisasi kehilangan bagian tubuh menurun (skor 5)",
      "Verbalisasi perasaan negatif tentang perubahan tubuh menurun (skor 5)",
      "Melihat bagian tubuh membaik (skor 5)",
      "Menyentuh bagian tubuh membaik (skor 5)",
    ],
  },
  {
    id: "slki-3",
    code: "L.08064",
    title: "Status Kenyamanan",
    category: "Kenyamanan",
    definition: "Overall feeling of well-being, relief, and ease in physical, psychospiritual, and social dimensions.",
    criteria: [
      "Kesejahteraan fisik meningkat (skor 5)",
      "Kesejahteraan psikologis meningkat (skor 5)",
      "Dukungan sosial dari keluarga meningkat (skor 5)",
      "Keluhan tidak nyaman menurun (skor 5)",
      "Gelisah menurun (skor 5)",
    ],
  },
];

const OutcomesPage = async () => {
  let dbOutcomes = await prisma.outcome.findMany({
    orderBy: { code: "asc" },
  }).catch(() => []);

  const outcomes = dbOutcomes.length > 0 ? dbOutcomes : mockOutcomes;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Luaran Keperawatan (SLKI)
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Standar Luaran Keperawatan Indonesia — Kriteria Hasil & Indikator Pemulihan
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {outcomes.map((item: any) => (
          <div
            key={item.id}
            className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-6 space-y-4 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-100">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400">
                  {item.code}
                </span>
                <h3 className="font-bold text-gray-900 dark:text-white text-base">
                  {item.title}
                </h3>
              </div>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
              {item.definition}
            </p>

            <div className="pt-2 border-t border-gray-100 dark:border-slate-700/80 space-y-2">
              <p className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Kriteria Hasil (Target):
              </p>
              <ul className="space-y-1.5">
                {(Array.isArray(item.criteria) ? item.criteria : typeof item.criteria === "string" ? JSON.parse(item.criteria || "[]") : []).map((crit: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 shrink-0 mt-0.5" />
                    <span>{crit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OutcomesPage;
