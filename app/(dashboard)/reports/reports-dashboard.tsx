"use client";

import { FileText, Download, Printer, Users, AlertTriangle, CheckCircle } from "lucide-react";

interface ReportProps {
  initialStats: {
    total: number;
    highRisk: number;
    validated: number;
    draft: number;
  };
}

export const ReportsDashboard = ({ initialStats }: ReportProps) => {
  const handleDownloadCSV = () => {
    window.open("/api/reports?type=csv", "_blank");
  };

  const handlePrint = () => {
    // Navigate to a clean print view or trigger window.print directly
    fetch("/api/reports?type=print")
      .then((res) => res.json())
      .then((data) => {
        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        const rows = data.screenings.map((s: any, idx: number) => `
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 8px;">${idx + 1}</td>
            <td style="padding: 8px;">${s.patient.fullName}</td>
            <td style="padding: 8px;">${s.patient.nik}</td>
            <td style="padding: 8px;">${s.patient.gender === "MAN" ? "Laki-laki" : "Perempuan"}</td>
            <td style="padding: 8px;">${new Date(s.createdAt).toLocaleDateString("id-ID")}</td>
            <td style="padding: 8px;">${s.ai?.totalScore ?? "-"}</td>
            <td style="padding: 8px;">${s.ai?.riskLevel ?? "-"}</td>
            <td style="padding: 8px;">${s.validation ? (s.validation.decision === "APPROVED" ? "Disetujui" : "Direvisi") : "Belum Divalidasi"}</td>
            <td style="padding: 8px; max-width: 250px; font-size: 11px; line-height: 1.4;">${s.ai?.summary ?? "-"}</td>
            <td style="padding: 8px; max-width: 200px; font-size: 11px; line-height: 1.4;">${s.validation?.notes ?? "-"}</td>
          </tr>
        `).join("");

        printWindow.document.write(`
          <html>
            <head>
              <title>Laporan Rekapitulasi Skrining Kesehatan Mental</title>
              <style>
                body { font-family: sans-serif; padding: 20px; color: #333; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; table-layout: fixed; }
                th { background-color: #f4f4f4; text-align: left; padding: 8px; border-bottom: 2px solid #ddd; font-size: 13px; }
                h1 { margin-bottom: 5px; }
                p { margin-top: 0; color: #666; font-size: 14px; }
              </style>
            </head>
            <body>
              <h1>Laporan Rekapitulasi Skrining Kesehatan Mental</h1>
              <p>Dicetak pada: ${new Date().toLocaleString("id-ID")} • Total Data: ${data.screenings.length}</p>
              <table>
                <colgroup>
                  <col style="width: 4%;">
                  <col style="width: 14%;">
                  <col style="width: 12%;">
                  <col style="width: 8%;">
                  <col style="width: 10%;">
                  <col style="width: 5%;">
                  <col style="width: 8%;">
                  <col style="width: 9%;">
                  <col style="width: 18%;">
                  <col style="width: 12%;">
                </colgroup>
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama Pasien</th>
                    <th>NIK</th>
                    <th>Gender</th>
                    <th>Tanggal</th>
                    <th>Skor</th>
                    <th>Risiko</th>
                    <th>Status</th>
                    <th>Analisis Deskriptif (AI)</th>
                    <th>Catatan (Perawat)</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows}
                </tbody>
              </table>
              <script>
                window.onload = function() { window.print(); }
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Laporan Skrining & Asuhan
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Ekspor dan cetak laporan hasil skrining kesehatan mental pasien langsung dari database
          </p>
        </div>
        <button
          onClick={handleDownloadCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          Ekspor CSV / Excel
        </button>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{initialStats.total}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Skrining</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{initialStats.highRisk}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Kasus Risiko Tinggi</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{initialStats.validated}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Tervalidasi Perawat</p>
          </div>
        </div>
      </div>

      {/* Interactive Report Cards */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Dokumen Laporan Tersedia</h2>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-slate-700">
          <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center border border-blue-100 dark:border-blue-900/50 shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-base">
                  Laporan Rekapitulasi Skrining Keseluruhan
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Mencakup seluruh data hasil skrining, level risiko AI, serta status persetujuan verifikasi klinis perawat.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handlePrint}
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all inline-flex items-center gap-2"
              >
                <Printer className="w-4 h-4 text-gray-500" />
                Cetak Laporan
              </button>
              <button
                onClick={handleDownloadCSV}
                className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all inline-flex items-center gap-2 shadow-sm"
              >
                <Download className="w-4 h-4" />
                Unduh CSV
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
