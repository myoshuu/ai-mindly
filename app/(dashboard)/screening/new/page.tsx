import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ScreeningForm } from "./screening-form";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ patientId?: string }>;
}

const NewScreeningPage = async ({ searchParams }: PageProps) => {
  const { patientId } = await searchParams;

  // Fetch all patients for the selector
  const patients = await prisma.patient.findMany({
    orderBy: { fullName: "asc" },
    select: { id: true, fullName: true, nik: true },
  });

  // Fetch all questions grouped by instrument
  const questions = await prisma.question.findMany({
    orderBy: [{ instrument: "asc" }, { order: "asc" }],
  });

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
          <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Data Pertanyaan Belum Ada</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          Jalankan seed database terlebih dahulu untuk mengisi data pertanyaan kuesioner.
        </p>
        <code className="text-xs bg-gray-100 dark:bg-slate-700 px-3 py-1.5 rounded-lg text-gray-600 dark:text-gray-300">
          bun run db:seed
        </code>
      </div>
    );
  }

  return (
    <ScreeningForm
      patients={patients}
      questions={questions}
      defaultPatientId={patientId}
    />
  );
};

export default NewScreeningPage;
