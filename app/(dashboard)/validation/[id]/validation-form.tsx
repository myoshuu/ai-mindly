"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { validateScreening, assignDiagnosis } from "@/actions/screening";
import {
  CheckCircle,
  XCircle,
  Edit,
  Stethoscope,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Loader2,
} from "lucide-react";

interface Diagnosis {
  id: string;
  code: string;
  title: string;
  category: string;
}

interface ValidationFormProps {
  screeningId: string;
  nurseId: string;
  nurseName: string;
  availableDiagnoses: Diagnosis[];
  aiRiskLevel: string;
  recommendedDiagnoses: string[];
}

const riskLevels = [
  { value: "NONE", label: "Tidak Ada" },
  { value: "MINIMAL", label: "Minimal" },
  { value: "MILD", label: "Ringan" },
  { value: "MODERATE", label: "Sedang" },
  { value: "SEVERE", label: "Berat" },
  { value: "HIGH", label: "Tinggi" },
];

export const ValidationForm = ({
  screeningId,
  nurseId,
  nurseName,
  availableDiagnoses,
  aiRiskLevel,
  recommendedDiagnoses,
}: ValidationFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [decision, setDecision] = useState<"APPROVED" | "REVISED" | "REJECTED">("APPROVED");
  const [notes, setNotes] = useState("");
  const [revisedRiskLevel, setRevisedRiskLevel] = useState(aiRiskLevel);
  const [selectedDiagnoses, setSelectedDiagnoses] = useState<string[]>(recommendedDiagnoses);
  const [showDiagnosisSelect, setShowDiagnosisSelect] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        // Step 1: Save nurse validation
        const validationResult = await validateScreening({
          screeningId,
          nurseId,
          decision,
          notes: notes || undefined,
          revisedRiskLevel: decision === "REVISED" ? (revisedRiskLevel as any) : undefined,
        });

        if (validationResult.error) {
          setError(validationResult.error);
          return;
        }

        // Step 2: Assign selected diagnoses if approved
        if (decision === "APPROVED" && selectedDiagnoses.length > 0) {
          const diagnosisResult = await assignDiagnosis({
            screeningId,
            diagnosisIds: selectedDiagnoses,
            priorities: Object.fromEntries(selectedDiagnoses.map((id, i) => [id, i + 1])),
          });

          if (diagnosisResult.error) {
            setError(diagnosisResult.error);
            return;
          }
        }

        setSuccess(true);
        setTimeout(() => {
          router.push("/validation");
          router.refresh();
        }, 1500);
      } catch (err) {
        setError("Terjadi kesalahan. Silakan coba lagi.");
      }
    });
  };

  const toggleDiagnosis = (id: string) => {
    setSelectedDiagnoses((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  if (success) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-green-200 dark:border-green-800 shadow-sm p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Validasi Berhasil!
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Mengalihkan ke halaman validasi...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Decision Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Keputusan Validasi
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Divalidasi oleh: <span className="font-medium text-gray-700 dark:text-gray-300">{nurseName}</span>
          </p>
        </div>
        <div className="p-6 space-y-4">
          {/* Decision Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setDecision("APPROVED")}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                decision === "APPROVED"
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                  : "border-gray-200 dark:border-slate-600 hover:border-green-300"
              }`}
            >
              <CheckCircle className={`w-6 h-6 ${decision === "APPROVED" ? "text-green-600" : "text-gray-400"}`} />
              <span className={`text-xs font-medium ${decision === "APPROVED" ? "text-green-700 dark:text-green-400" : "text-gray-500"}`}>
                Setujui
              </span>
            </button>
            <button
              type="button"
              onClick={() => setDecision("REVISED")}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                decision === "REVISED"
                  ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
                  : "border-gray-200 dark:border-slate-600 hover:border-yellow-300"
              }`}
            >
              <Edit className={`w-6 h-6 ${decision === "REVISED" ? "text-yellow-600" : "text-gray-400"}`} />
              <span className={`text-xs font-medium ${decision === "REVISED" ? "text-yellow-700 dark:text-yellow-400" : "text-gray-500"}`}>
                Revisi
              </span>
            </button>
            <button
              type="button"
              onClick={() => setDecision("REJECTED")}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                decision === "REJECTED"
                  ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                  : "border-gray-200 dark:border-slate-600 hover:border-red-300"
              }`}
            >
              <XCircle className={`w-6 h-6 ${decision === "REJECTED" ? "text-red-600" : "text-gray-400"}`} />
              <span className={`text-xs font-medium ${decision === "REJECTED" ? "text-red-700 dark:text-red-400" : "text-gray-500"}`}>
                Tolak
              </span>
            </button>
          </div>

          {/* Revised Risk Level (show when REVISED) */}
          {decision === "REVISED" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Revisi Tingkat Risiko
              </label>
              <select
                value={revisedRiskLevel}
                onChange={(e) => setRevisedRiskLevel(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {riskLevels.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Catatan Klinis {decision !== "APPROVED" && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Tambahkan catatan klinis atau alasan keputusan..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
              required={decision !== "APPROVED"}
            />
          </div>
        </div>
      </div>

      {/* Diagnosis Assignment (only when APPROVED) */}
      {decision === "APPROVED" && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setShowDiagnosisSelect(!showDiagnosisSelect)}
            className="w-full p-6 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Stethoscope className="w-5 h-5 text-blue-600" />
              <div className="text-left">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tetapkan Diagnosis (SDKI)</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedDiagnoses.length} dipilih
                </p>
              </div>
            </div>
            {showDiagnosisSelect ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {showDiagnosisSelect && (
            <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
              {availableDiagnoses.map((diagnosis) => (
                <label
                  key={diagnosis.id}
                  className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                    selectedDiagnoses.includes(diagnosis.id)
                      ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                      : "border border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedDiagnoses.includes(diagnosis.id)}
                    onChange={() => toggleDiagnosis(diagnosis.id)}
                    className="mt-0.5 rounded accent-blue-600"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{diagnosis.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{diagnosis.code}</p>
                  </div>
                </label>
              ))}
            </div>
          )}

          {/* Selected diagnoses summary */}
          {selectedDiagnoses.length > 0 && (
            <div className="px-4 pb-4">
              <div className="flex flex-wrap gap-2">
                {selectedDiagnoses.map((id) => {
                  const diag = availableDiagnoses.find((d) => d.id === id);
                  return diag ? (
                    <span
                      key={id}
                      className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full font-medium"
                    >
                      {diag.title}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className={`w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl font-semibold text-white transition-all text-sm ${
          decision === "APPROVED"
            ? "bg-green-600 hover:bg-green-700 disabled:bg-green-400"
            : decision === "REVISED"
            ? "bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400"
            : "bg-red-600 hover:bg-red-700 disabled:bg-red-400"
        } disabled:cursor-not-allowed`}
      >
        {isPending ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Menyimpan...
          </>
        ) : (
          <>
            {decision === "APPROVED" && <CheckCircle className="w-5 h-5" />}
            {decision === "REVISED" && <Edit className="w-5 h-5" />}
            {decision === "REJECTED" && <XCircle className="w-5 h-5" />}
            {decision === "APPROVED" ? "Setujui & Simpan Diagnosis" : decision === "REVISED" ? "Simpan Revisi" : "Tolak Skrining"}
          </>
        )}
      </button>
    </form>
  );
};
