import { Settings, User, Bell, Lock, Shield, Database } from "lucide-react";

export const dynamic = "force-dynamic";

const SettingsPage = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Pengaturan
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Kelola profil perawat, keamanan akun, dan preferensi aplikasi
        </p>
      </div>

      {/* Card Settings */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-xs divide-y divide-gray-100 dark:divide-slate-700">
        
        {/* Profile */}
        <div className="p-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#0066FF] flex items-center justify-center border border-blue-100 shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-base">Profil Tenaga Kesehatan</h3>
              <p className="text-xs text-gray-400">Informasi perawat dan identitas Surat Izin Praktika (SIP/NIP)</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Nama Perawat</label>
                <input type="text" defaultValue="dr. Susi Handayani, S.Kep" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 text-xs font-medium bg-gray-50" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">NIP / SIP</label>
                <input type="text" defaultValue="1992031501234567" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 text-xs font-medium bg-gray-50" />
              </div>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="p-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-base">Keamanan & Password</h3>
              <p className="text-xs text-gray-400">Ubah kata sandi akun perawat demi keamanan data pasien</p>
            </div>
            <button className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 text-xs font-bold rounded-lg hover:bg-gray-200 transition-all">
              Ubah Sandi Akun
            </button>
          </div>
        </div>

        {/* System Info */}
        <div className="p-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center border border-purple-100 shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="font-bold text-gray-900 dark:text-white text-base">Informasi Lisensi & Versi</h3>
            <p className="text-xs text-gray-500 font-medium">AI-Mindly v2.4.0 • Standar SDKI, SLKI, SIKI PPNI</p>
            <p className="text-[11px] text-emerald-600 font-bold pt-1">🔒 Enkripsi Data Medis Terenkripsi SSL 256-bit</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsPage;
