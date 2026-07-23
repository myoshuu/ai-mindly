"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { analyzeScreening } from "@/actions/ai-analysis";
import { Brain, Loader2, CheckCircle, AlertTriangle } from "lucide-react";

interface AnalyzeButtonProps {
  screeningId: string;
}

export const AnalyzeButton = ({ screeningId }: AnalyzeButtonProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleAnalyze = () => {
    setState("idle");
    startTransition(async () => {
      const result = await analyzeScreening({ screeningId });
      if (result.error) {
        setState("error");
        setErrorMsg(result.error);
      } else {
        setState("success");
        setTimeout(() => router.refresh(), 1200);
      }
    });
  };

  if (state === "success") {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl">
        <CheckCircle className="w-4 h-4" />
        Analisis Selesai!
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleAnalyze}
        disabled={isPending}
        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white text-sm font-medium rounded-xl transition-colors disabled:cursor-not-allowed"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Menganalisis AI...
          </>
        ) : (
          <>
            <Brain className="w-4 h-4" />
            Analisis dengan AI
          </>
        )}
      </button>
      {state === "error" && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          {errorMsg}
        </p>
      )}
    </div>
  );
};
