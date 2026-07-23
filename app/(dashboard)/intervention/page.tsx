import { prisma } from "@/lib/prisma";
import { Activity, ShieldCheck, HeartPulse, CheckSquare } from "lucide-react";

export const dynamic = "force-dynamic";

const mockInterventions = [
  {
    id: "siki-1",
    code: "I.09314",
    title: "Reduksi Ansietas",
    category: "Psikologis",
    definition: "Minimalkan kondisi individu dan pengalaman subjektif terhadap objek yang tidak jelas dan spesifik akibat antisipasi bahaya.",
    actions: [
      { type: "Observasi", text: "Identifikasi saat tingkat ansietas berubah (mis. kondisi, waktu, stresor)" },
      { type: "Observasi", text: "Monitor tanda-tanda ansietas (verbal dan nonverbal)" },
      { type: "Terapeutik", text: "Ciptakan suasana terapeutik untuk menumbuhkan kepercayaan" },
      { type: "Terapeutik", text: "Pahami situasi yang membuat ansietas, dengarkan dengan penuh perhatian" },
      { type: "Edukasi", text: "Jelaskan prosedur, termasuk sensasi yang mungkin dialami" },
      { type: "Edukasi", text: "Anjurkan keluarga untuk tetap bersama pasien, jika perlu" },
      { type: "Kolaborasi", text: "Kolaborasi pemberian obat antiansietas, jika perlu" },
    ],
  },
  {
    id: "siki-2",
    code: "I.09326",
    title: "Terapi Relaksasi",
    category: "Psikologis",
    definition: "Menggunakan teknik napas dalam dan distraksi untuk mengurangi ketegangan fisik dan mental.",
    actions: [
      { type: "Observasi", text: "Identifikasi penurunan tingkat energi, ketidakmampuan berkonsentrasi" },
      { type: "Terapeutik", text: "Ciptakan lingkungan tenang dan tanpa gangguan dengan pencahayaan dan suhu nyaman" },
      { type: "Edukasi", text: "Jelaskan tujuan, manfaat, batasan, dan jenis relaksasi yang tersedia (napas dalam)" },
      { type: "Edukasi", text: "Demonstrasikan dan latih teknik relaksasi napas dalam 4-7-8 secara mandiri" },
    ],
  },
  {
    id: "siki-3",
    code: "I.09287",
    title: "Dukungan Emosional",
    category: "Perilaku",
    definition: "Memberikan penenangan, penerimaan, dan dorongan selama periode stres emosional.",
    actions: [
      { type: "Observasi", text: "Identifikasi fungsi marah, frustrasi, dan amuk bagi pasien" },
      { type: "Terapeutik", text: "Fasilitasi mengungkapkan perasaan cemas, marah, atau sedih" },
      { type: "Edukasi", text: "Anjurkan mengungkapkan perasaan yang dialami secara verbal tanpa menghakimi" },
    ],
  },
];

const InterventionPage = async () => {
  let dbInterventions = await prisma.intervention.findMany({
    orderBy: { code: "asc" },
  }).catch(() => []);

  const interventions = dbInterventions.length > 0 ? dbInterventions : mockInterventions;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Intervensi Keperawatan (SIKI)
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Standar Intervensi Keperawatan Indonesia — Tindakan Observasi, Terapeutik, Edukasi & Kolaborasi
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {interventions.map((item: any) => (
          <div
            key={item.id}
            className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-6 space-y-4 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#0066FF] flex items-center justify-center border border-blue-100">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#0066FF]">
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
                Tindakan Keperawatan:
              </p>
              <div className="space-y-2">
                {(Array.isArray(item.actions) ? item.actions : []).map((act: any, idx: number) => (
                  <div key={idx} className="bg-gray-50/70 dark:bg-slate-700/40 p-2.5 rounded-lg border border-gray-100 dark:border-slate-700 text-xs">
                    <span className="font-bold text-[#0066FF] mr-1.5 uppercase text-[10px] tracking-wide bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                      {act.type || "Tindakan"}
                    </span>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{act.text || act.action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InterventionPage;
