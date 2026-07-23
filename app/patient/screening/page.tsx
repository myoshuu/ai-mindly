"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Brain, ChevronRight, CheckCircle, Loader2 } from "lucide-react";

interface Question {
  id: number;
  text: string;
  instrument: string;
  order: number;
}

const instrumentLabels: Record<string, { label: string; description: string; color: string; icon: string }> = {
  GAD7: {
    label: "GAD-7",
    description: "Skrining kecemasan (Generalized Anxiety Disorder)",
    color: "blue",
    icon: "😰",
  },
  PHQ9: {
    label: "PHQ-9",
    description: "Skrining depresi (Patient Health Questionnaire)",
    color: "purple",
    icon: "😔",
  },
  SRQ20: {
    label: "SRQ-20",
    description: "Skrining kesehatan mental umum (Self Reporting Questionnaire)",
    color: "emerald",
    icon: "🧠",
  },
};

const colorStyles: Record<string, { bg: string; border: string; text: string; selectedBg: string }> = {
  blue: {
    bg: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
    border: "border-blue-300 dark:border-blue-700",
    text: "text-blue-700 dark:text-blue-400",
    selectedBg: "bg-blue-600",
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800",
    border: "border-purple-300 dark:border-purple-700",
    text: "text-purple-700 dark:text-purple-400",
    selectedBg: "bg-purple-600",
  },
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800",
    border: "border-emerald-300 dark:border-emerald-700",
    text: "text-emerald-700 dark:text-emerald-400",
    selectedBg: "bg-emerald-600",
  },
};

const scaleLabels = [
  { label: "Tidak pernah", short: "0" },
  { label: "Jarang", short: "1" },
  { label: "Kadang-kadang", short: "2" },
  { label: "Sering", short: "3" },
  { label: "Sangat sering", short: "4" },
];

export default function PatientScreeningPage() {
  const router = useRouter();
  const [step, setStep] = useState<"select" | "questions" | "submitting">("select");
  const [selectedInstrument, setSelectedInstrument] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch questions on mount
  useEffect(() => {
    async function fetchQuestions() {
      try {
        const res = await fetch("/api/questions");
        if (res.ok) {
          const data = await res.json();
          setQuestions(data);
        }
      } catch (err) {
        console.error("Failed to fetch questions:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchQuestions();
  }, []);

  // Get questions grouped by instrument
  const groupedQuestions = questions.reduce((acc, q) => {
    if (!acc[q.instrument]) acc[q.instrument] = [];
    acc[q.instrument].push(q);
    return acc;
  }, {} as Record<string, Question[]>);

  const instruments = Object.keys(groupedQuestions);
  const currentQuestions = selectedInstrument ? groupedQuestions[selectedInstrument] || [] : [];
  const totalQuestions = currentQuestions.length;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === totalQuestions && totalQuestions > 0;

  const handleSelectInstrument = (instrument: string) => {
    setSelectedInstrument(instrument);
    setAnswers({});
    setStep("questions");
  };

  const handleAnswer = (questionId: number, score: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: score }));
  };

  const handleSubmit = async () => {
    if (!allAnswered || !selectedInstrument) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/patient-screening", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instrument: selectedInstrument,
          answers: Object.entries(answers).map(([qId, score]) => ({
            questionId: parseInt(qId),
            score,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan skrining");
      }

      // Redirect to results page
      router.push(`/patient/results?screeningId=${data.screeningId}`);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
      setIsSubmitting(false);
    }
  };

  // ─── Step: Submitting ──────────────────────────────────────────────────────
  if (step === "submitting" || isSubmitting) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto">
            <Brain className="w-10 h-10 text-purple-600 animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Menganalisis dengan AI...
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {selectedInstrument === "GAD7"
                ? "Menganalisis tingkat kecemasan Anda"
                : selectedInstrument === "PHQ9"
                ? "Menganalisis tingkat depresi Anda"
                : "Menganalisis kesehatan mental Anda"}
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            Mohon tunggu...
          </div>
        </div>
      </div>
    );
  }

  // ─── Step: Select Instrument ────────────────────────────────────────────────
  if (step === "select") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <div className="max-w-lg mx-auto p-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              href="/patient/beranda"
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Pilih Jenis Skrining
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Pilih kuesioner yang ingin Anda isi
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : instruments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                Data kuesioner belum tersedia. Hubungi administrator.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {instruments.map((instrument) => {
                const meta = instrumentLabels[instrument] || {
                  label: instrument,
                  description: "",
                  color: "blue",
                  icon: "📋",
                };
                const styles = colorStyles[meta.color];
                const qCount = groupedQuestions[instrument].length;

                return (
                  <button
                    key={instrument}
                    onClick={() => handleSelectInstrument(instrument)}
                    className={`w-full p-5 rounded-2xl border-2 ${styles.bg} ${styles.border} hover:scale-[1.02] transition-all text-left group`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-3xl">{meta.icon}</span>
                        <div>
                          <h3 className={`font-bold text-lg ${styles.text}`}>
                            {meta.label}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {meta.description}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {qCount} pertanyaan
                          </p>
                        </div>
                      </div>
                      <ChevronRight className={`w-5 h-5 ${styles.text} group-hover:translate-x-1 transition-transform`} />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Step: Questions ────────────────────────────────────────────────────────
  const meta = instrumentLabels[selectedInstrument!] || {
    label: selectedInstrument!,
    description: "",
    color: "blue",
    icon: "📋",
  };
  const styles = colorStyles[meta.color];
  const progress = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="max-w-lg mx-auto p-6 flex flex-col min-h-screen">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setStep("select")}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {meta.icon} {meta.label}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {meta.description}
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="w-full bg-gray-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${styles.selectedBg}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className={`text-xs font-semibold ${styles.text}`}>
              {answeredCount} dari {totalQuestions} dijawab
            </p>
          </div>
        </div>

        {/* Questions */}
        <div className="flex-1 space-y-4 mt-6">
          {currentQuestions.map((question, idx) => (
            <div key={question.id} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700 shadow-sm">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-4">
                <span className="text-gray-400 mr-2">{idx + 1}.</span>
                {question.text}
              </p>
              <div className="grid grid-cols-5 gap-2">
                {scaleLabels.map((scale, scaleIdx) => {
                  const isSelected = answers[question.id] === scaleIdx;
                  return (
                    <button
                      key={scaleIdx}
                      onClick={() => handleAnswer(question.id, scaleIdx)}
                      className={`flex flex-col items-center gap-1 py-3 px-1 rounded-xl border-2 transition-all ${
                        isSelected
                          ? `${styles.selectedBg} border-transparent text-white`
                          : "border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700/50"
                      }`}
                    >
                      <span className="text-lg font-bold leading-none">{scale.short}</span>
                      <span className={`text-[10px] leading-tight text-center ${isSelected ? "text-white/80" : "text-gray-400"}`}>
                        {scale.label.split(" ").map((w, i) => (
                          <span key={i} className="block">{w}</span>
                        ))}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="pt-6 pb-4 space-y-3">
          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}
          <button
            onClick={handleSubmit}
            disabled={!allAnswered}
            className={`w-full py-4 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${
              allAnswered
                ? "bg-[#0066FF] hover:bg-blue-700 text-white"
                : "bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
            }`}
          >
            {allAnswered ? (
              <>
                Kirim Jawaban
                <CheckCircle className="w-5 h-5" />
              </>
            ) : (
              `Jawab semua pertanyaan terlebih dahulu`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
