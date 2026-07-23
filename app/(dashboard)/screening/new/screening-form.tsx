"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createScreening } from "@/actions/screening";
import { analyzeScreening } from "@/actions/ai-analysis";
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  CheckCircle,
  Loader2,
  User,
  ClipboardList,
  ChevronDown,
} from "lucide-react";

interface Patient {
  id: string;
  fullName: string;
  nik: string;
}

interface Question {
  id: number;
  text: string;
  instrument: string;
  category: string;
  order: number;
  scaleMin: number;
  scaleMax: number;
  scaleLabels: string;
}

interface ScreeningFormProps {
  patients: Patient[];
  questions: Question[];
  defaultPatientId?: string;
}

const instrumentLabels: Record<string, { label: string; description: string; color: string }> = {
  GAD7: {
    label: "GAD-7",
    description: "Generalized Anxiety Disorder — 7 pertanyaan tentang kecemasan",
    color: "blue",
  },
  PHQ9: {
    label: "PHQ-9",
    description: "Patient Health Questionnaire — 9 pertanyaan tentang depresi",
    color: "purple",
  },
  SRQ20: {
    label: "SRQ-20",
    description: "Self Reporting Questionnaire — 20 pertanyaan kesehatan umum",
    color: "emerald",
  },
};

const colorMap: Record<string, { bg: string; border: string; text: string; activeBg: string; activeBorder: string }> = {
  blue: {
    bg: "bg-blue-50 dark:bg-blue-900/10",
    border: "border-blue-200 dark:border-blue-800",
    text: "text-blue-700 dark:text-blue-400",
    activeBg: "bg-blue-600",
    activeBorder: "border-blue-600",
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-900/10",
    border: "border-purple-200 dark:border-purple-800",
    text: "text-purple-700 dark:text-purple-400",
    activeBg: "bg-purple-600",
    activeBorder: "border-purple-600",
  },
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-900/10",
    border: "border-emerald-200 dark:border-emerald-800",
    text: "text-emerald-700 dark:text-emerald-400",
    activeBg: "bg-emerald-600",
    activeBorder: "border-emerald-600",
  },
};

const scaleLabels = ["Tidak Pernah", "Jarang", "Kadang-kadang", "Sering", "Hampir Selalu"];

export const ScreeningForm = ({ patients, questions, defaultPatientId }: ScreeningFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [patientId, setPatientId] = useState(defaultPatientId || "");
  const [selectedInstrument, setSelectedInstrument] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [step, setStep] = useState<"select" | "instrument" | "questions" | "submitting" | "done">(
    defaultPatientId ? "instrument" : "select"
  );
  const [screeningId, setScreeningId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Group questions by instrument
  const grouped = questions.reduce((acc, q) => {
    if (!acc[q.instrument]) acc[q.instrument] = [];
    acc[q.instrument].push(q);
    return acc;
  }, {} as Record<string, Question[]>);

  const instruments = Object.keys(grouped);
  const currentQuestions = selectedInstrument ? grouped[selectedInstrument] || [] : [];
  const totalQuestions = currentQuestions.length;
  const answeredCount = Object.keys(answers).length;
  const progress = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  const selectedPatient = patients.find((p) => p.id === patientId);

  const handleAnswer = (questionId: number, score: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: score }));
  };

  const allAnswered = answeredCount === totalQuestions;

  const handleSubmit = () => {
    if (!patientId) { setError("Pilih pasien terlebih dahulu"); return; }
    if (!selectedInstrument) { setError("Pilih jenis skrining terlebih dahulu"); return; }
    if (!allAnswered) { setError(`Masih ada ${totalQuestions - answeredCount} pertanyaan belum dijawab`); return; }
    setError(null);

    startTransition(async () => {
      setStep("submitting");

      // Step 1: Save screening answers
      const result = await createScreening({
        patientId,
        instrument: selectedInstrument as any,
        answers: Object.entries(answers).map(([qId, score]) => ({
          questionId: parseInt(qId),
          score,
        })),
      });

      if (result.error) {
        setError(result.error);
        setStep("questions");
        return;
      }

      const sid = result.screeningId!;
      setScreeningId(sid);

      // Step 2: Immediately trigger AI analysis
      setIsAnalyzing(true);
      const aiResult = await analyzeScreening({ screeningId: sid });
      setIsAnalyzing(false);

      if (aiResult.error) {
        // Screening saved but AI failed — still navigate to the screening detail
        setStep("done");
        setTimeout(() => router.push(`/screening/${sid}`), 1000);
        return;
      }

      setStep("done");
      setTimeout(() => router.push(`/screening/${sid}`), 1500);
    });
  };

  // ─── Step: Select Patient ───────────────────────────────────────────────────
  if (step === "select") {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/screening" className="p-2 rounded-xl border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Skrining Baru</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Pilih pasien untuk memulai skrining</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6 space-y-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Pilih Pasien
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full pl-12 pr-10 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="">— Pilih pasien —</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName} — NIK: {p.nik}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {patientId && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
                Pasien dipilih: <span className="font-bold">{selectedPatient?.fullName}</span>
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">NIK: {selectedPatient?.nik}</p>
            </div>
          )}

          <div className="pt-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Pilih jenis skrining kemudian isi pertanyaan sesuai instrumen.
            </p>
            <button
              onClick={() => { if (patientId) setStep("instrument"); else setError("Pilih pasien terlebih dahulu"); }}
              disabled={!patientId}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-slate-600 text-white font-semibold rounded-xl transition-colors disabled:cursor-not-allowed"
            >
              Pilih Jenis Skrining
              <ArrowRight className="w-5 h-5" />
            </button>
            {error && <p className="mt-2 text-sm text-red-600 text-center">{error}</p>}
          </div>
        </div>
      </div>
    );
  }

  // ─── Step: Select Instrument ─────────────────────────────────────────────────
  if (step === "instrument") {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setStep("select")}
            className="p-2 rounded-xl border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pilih Jenis Skrining</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
              Pasien: <span className="font-medium text-gray-700 dark:text-gray-300">{selectedPatient?.fullName}</span>
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {instruments.map((instrument) => {
            const meta = instrumentLabels[instrument] || { label: instrument, description: "", color: "blue" };
            const colors = colorMap[meta.color] || colorMap.blue;
            const qCount = grouped[instrument].length;

            return (
              <button
                key={instrument}
                onClick={() => {
                  setSelectedInstrument(instrument);
                  setAnswers({});
                  setStep("questions");
                }}
                className={`w-full p-5 rounded-2xl border-2 ${colors.bg} ${colors.border} hover:scale-[1.01] transition-all text-left group`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${colors.border} ${colors.text} mb-2`}>
                      {meta.label}
                    </span>
                    <h2 className="font-semibold text-gray-900 dark:text-white">{meta.description}</h2>
                    <p className="text-xs text-gray-500 mt-2">{qCount} pertanyaan</p>
                  </div>
                  <ArrowRight className={`w-5 h-5 ${colors.text} group-hover:translate-x-1 transition-transform`} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ─── Step: Submitting / Analyzing ──────────────────────────────────────────
  if (step === "submitting" || step === "done") {
    return (
      <div className="max-w-md mx-auto flex flex-col items-center justify-center min-h-[400px] text-center space-y-6">
        {step === "done" ? (
          <>
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Selesai!</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Mengalihkan ke hasil skrining...</p>
            </div>
          </>
        ) : (
          <>
            <div className="w-20 h-20 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              {isAnalyzing ? (
                <Brain className="w-10 h-10 text-purple-600 animate-pulse" />
              ) : (
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isAnalyzing ? "Menganalisis dengan AI..." : "Menyimpan jawaban..."}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                {isAnalyzing
                  ? "Claude sedang menganalisis hasil kuesioner. Mohon tunggu sebentar."
                  : "Sedang menyimpan data skrining ke sistem."}
              </p>
            </div>
          </>
        )}
      </div>
    );
  }

  // ─── Step: Questions ────────────────────────────────────────────────────────
  const meta = instrumentLabels[selectedInstrument!] || { label: selectedInstrument!, description: "", color: "blue" };
  const colors = colorMap[meta.color] || colorMap.blue;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setStep("instrument")}
          className="p-2 rounded-xl border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${colors.border} ${colors.text}`}>
              {meta.label}
            </span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mt-1">Kuesioner {meta.label}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Pasien: <span className="font-medium text-gray-700 dark:text-gray-300">{selectedPatient?.fullName}</span>
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ClipboardList className={`w-4 h-4 ${colors.text}`} />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
          </div>
          <span className={`text-sm font-semibold ${colors.text}`}>
            {answeredCount} / {totalQuestions} pertanyaan
          </span>
        </div>
        <div className={`h-2.5 rounded-full overflow-hidden ${colors.bg}`}>
          <div
            className={`h-full ${colors.activeBg} rounded-full transition-all duration-300`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2 text-right">{progress}% selesai</p>
      </div>

      {/* Questions */}
      <div className={`bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden`}>
        {/* Instrument Header */}
        <div className={`p-5 border-b border-gray-100 dark:border-slate-700 ${colors.bg}`}>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{meta.description}</p>
        </div>

        {/* Questions */}
        <div className="divide-y divide-gray-100 dark:divide-slate-700">
          {currentQuestions.map((question, idx) => {
            const selected = answers[question.id];
            return (
              <div key={question.id} className="p-5">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-4">
                  <span className="text-gray-400 mr-2">{idx + 1}.</span>
                  {question.text}
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {[0, 1, 2, 3, 4].map((score) => (
                    <button
                      key={score}
                      onClick={() => handleAnswer(question.id, score)}
                      className={`flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl border-2 transition-all text-center ${
                        selected === score
                          ? `${colors.activeBg} ${colors.activeBorder} border-transparent text-white shadow-sm`
                          : "border-gray-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700/50"
                      }`}
                    >
                      <span className="text-lg font-bold leading-none">{score}</span>
                      <span className={`text-[10px] leading-tight font-medium ${selected === score ? "text-white/80" : "text-gray-400"}`}>
                        {scaleLabels[score].split(" ").map((w, i) => (
                          <span key={i} className="block">{w}</span>
                        ))}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Submit */}
      <div className="sticky bottom-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-lg p-4">
          {error && (
            <p className="text-sm text-red-600 mb-3 text-center">{error}</p>
          )}
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {allAnswered ? (
                <span className="text-green-600 dark:text-green-400 font-medium flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  Semua pertanyaan dijawab
                </span>
              ) : (
                <span>{totalQuestions - answeredCount} pertanyaan belum dijawab</span>
              )}
            </div>
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || isPending}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 dark:disabled:bg-slate-600 text-white font-semibold rounded-xl transition-colors disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5" />
                  Simpan & Analisis AI
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
