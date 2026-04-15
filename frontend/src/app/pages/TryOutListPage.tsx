import React, { useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import {
  Search, Clock, FileText, Lock,
  CheckCircle, Play, ChevronRight, AlertCircle
} from 'lucide-react';
import { mockTryOuts, TryOut } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

export default function TryOutListPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // Completed try outs dari localStorage
  const completedIds: string[] = React.useMemo(() => {
    const raw = localStorage.getItem('completed_tryouts');
    return raw ? JSON.parse(raw) : [];
  }, []);

  // Merge completion status
  const tryOuts = mockTryOuts.map(t => ({
    ...t,
    isCompleted: completedIds.includes(t.id) || t.isCompleted,
  }));

  // Tentukan kategori yang bisa diakses berdasarkan paket
  const allowedCategories = React.useMemo((): string[] => {
    if (!user?.hasPurchasedPackage || !user?.packageType) return [];
    const pkg = (user.packageType || '').toLowerCase();
    if (pkg.includes('combo') || pkg.includes('lengkap')) return ['PTN', 'SKD', 'STIS'];
    if (pkg.includes('ptn') || pkg.includes('snbt')) return ['PTN'];
    if (pkg.includes('stis')) return ['STIS', 'SKD'];
    if (pkg.includes('skd') || pkg.includes('sekdin') || user.packageType === 'SKD') return ['SKD'];
    if (pkg.includes('ipdn') || pkg.includes('polstat')) return ['SKD'];
    return [];
  }, [user]);

  // Label paket untuk header
  const packageLabel = React.useMemo(() => {
    if (!user?.hasPurchasedPackage) return null;
    const pkg = (user.packageType || '').toLowerCase();
    if (pkg.includes('combo') || pkg.includes('lengkap')) return 'Paket Combo (SNBT + SKD)';
    if (pkg.includes('ptn') || pkg.includes('snbt')) return 'Paket SNBT/PTN';
    if (pkg.includes('stis')) return 'Paket STIS';
    if (pkg.includes('skd') || pkg.includes('sekdin') || user.packageType === 'SKD') return 'Paket SKD Sekdin';
    if (pkg.includes('ipdn')) return 'Paket IPDN';
    if (pkg.includes('polstat')) return 'Paket POLSTAT';
    return user.packageType;
  }, [user]);

  // Filter: hanya tampilkan tryout sesuai paket + search
  const filteredTryOuts = tryOuts.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPackage = allowedCategories.includes(t.category);
    return matchSearch && matchPackage;
  });

  const completedCount = filteredTryOuts.filter(t => t.isCompleted).length;

  const categoryStyle = (c: string) => {
    if (c === 'PTN') return 'bg-blue-50 text-blue-700';
    if (c === 'SKD') return 'bg-violet-50 text-violet-700';
    return 'bg-sky-50 text-sky-700';
  };

  // Belum beli paket
  if (!user?.hasPurchasedPackage) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Try Out</h1>
          <p className="text-gray-500">Simulasi ujian dengan sistem CAT seperti tes sesungguhnya</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-[#2563EB]" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Paket Belum Aktif</h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            Beli paket terlebih dahulu untuk mengakses semua try out
          </p>
          <Link to="/paket">
            <button className="px-6 py-3 bg-[#2563EB] text-white font-semibold rounded-xl hover:bg-[#1d4ed8] transition-all">
              Lihat Pilihan Paket →
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Try Out</h1>
            {packageLabel && (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 bg-blue-50 text-[#2563EB] text-sm font-semibold px-3 py-1 rounded-full">
                  <CheckCircle className="w-3.5 h-3.5" />
                  {packageLabel}
                </span>
                <span className="text-sm text-gray-400">
                  {completedCount}/{filteredTryOuts.length} selesai
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Search ── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 w-[18px] h-[18px] text-gray-400" />
          <input
            type="text"
            placeholder="Cari try out..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all shadow-sm"
          />
        </div>
      </motion.div>

      {/* ── Grid Try Out ── */}
      {filteredTryOuts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="font-semibold text-gray-600">
            {searchQuery ? 'Try out tidak ditemukan' : 'Belum ada try out tersedia'}
          </p>
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="mt-2 text-sm text-[#2563EB] hover:underline">
              Hapus pencarian
            </button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTryOuts.map((tryOut, i) => (
            <motion.div
              key={tryOut.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + i * 0.04 }}
            >
              <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col h-full transition-shadow hover:shadow-md ${
                tryOut.isCompleted ? 'border-green-100' : 'border-gray-100'
              }`}>

                {/* Card header */}
                <div className="px-5 pt-5 pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${categoryStyle(tryOut.category)}`}>
                      {tryOut.category}
                    </span>
                    {tryOut.isCompleted ? (
                      <span className="flex items-center gap-1 text-green-600 text-xs font-semibold">
                        <CheckCircle className="w-4 h-4" /> Selesai
                      </span>
                    ) : tryOut.isLocked ? (
                      <span className="flex items-center gap-1 text-gray-400 text-xs font-medium">
                        <Lock className="w-4 h-4" /> Terkunci
                      </span>
                    ) : null}
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight">{tryOut.title}</h3>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-50 mx-5" />

                {/* Stats */}
                <div className="px-5 py-3">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {tryOut.duration} menit
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-gray-400" />
                      {tryOut.totalQuestions} soal
                    </span>
                  </div>
                </div>

                {/* Subtes tags */}
                <div className="px-5 pb-3">
                  <p className="text-xs text-gray-400 mb-1.5">Materi:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {tryOut.subjects.slice(0, 4).map((sub, j) => (
                      <span key={j} className="text-xs bg-gray-50 border border-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                        {typeof sub === 'string' ? sub : sub.code}
                      </span>
                    ))}
                    {tryOut.subjects.length > 4 && (
                      <span className="text-xs text-gray-400 px-1">+{tryOut.subjects.length - 4}</span>
                    )}
                  </div>
                </div>

                {/* Action */}
                <div className="px-5 pb-5 mt-auto pt-2">
                  {tryOut.isLocked ? (
                    <button disabled
                      className="w-full py-3 bg-gray-100 text-gray-400 text-sm font-semibold rounded-xl cursor-not-allowed flex items-center justify-center gap-2">
                      <Lock className="w-4 h-4" /> Tidak Tersedia
                    </button>
                  ) : tryOut.isCompleted ? (
                    <div className="space-y-2">
                      <Link to={`/tryout/${tryOut.id}/pembahasan`}>
                        <button className="w-full py-3 bg-[#2563EB] text-white text-sm font-semibold rounded-xl hover:bg-[#1d4ed8] transition-all">
                          Lihat Pembahasan
                        </button>
                      </Link>
                      <Link to={`/tryout/${tryOut.id}/exam`}>
                        <button className="w-full py-2.5 text-sm font-semibold text-gray-500 hover:text-[#2563EB] border border-gray-100 hover:border-blue-200 rounded-xl transition-all">
                          Ulangi Try Out
                        </button>
                      </Link>
                    </div>
                  ) : (
                    <Link to={`/tryout/${tryOut.id}/exam`}>
                      <button className="w-full py-3 bg-[#2563EB] text-white text-sm font-semibold rounded-xl hover:bg-[#1d4ed8] transition-all flex items-center justify-center gap-2">
                        <Play className="w-4 h-4" /> Mulai Try Out
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Tips box ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-9 h-9 rounded-xl bg-[#2563EB] flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-4.5 h-4.5 w-[18px] h-[18px] text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 mb-1.5">Tips Mengerjakan Try Out</p>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Pastikan koneksi internet stabil sebelum mulai</li>
              <li>• Timer per subtes berjalan otomatis — kelola waktu dengan baik</li>
              <li>• Tandai soal yang ragu dengan ikon bendera untuk direview nanti</li>
              <li>• Jawaban tersimpan otomatis setiap 30 detik</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}