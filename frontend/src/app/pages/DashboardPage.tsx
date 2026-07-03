import React from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import {
  FileText, BarChart3, ArrowRight, ChevronRight,
  Target, Calendar, Clock, TrendingUp,
  CheckCircle, Play, Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTryouts } from '../hooks/useTryouts';
import { useResults } from '../hooks/useResults';
import { api } from '../lib/api';

export default function DashboardPage() {
  const { user: authUser, refreshUser } = useAuth();
  const [packages, setPackages] = React.useState<any[]>([]);

  React.useEffect(() => {
    refreshUser();
    api.getPackages().then((data: any[]) => {
      if (Array.isArray(data)) setPackages(data);
    }).catch(() => {});
  }, []);

  // Hasil dari backend/localStorage — NO MOCK FALLBACK
  const { results: backendResults, loading: resultsLoading } = useResults();
  const examResults = React.useMemo(() => {
    return backendResults.length > 0 ? backendResults : [];
  }, [backendResults]);

  // Try out dari backend — NO MOCK
  const { tryouts: backendTryouts, loading: tryoutsLoading } = useTryouts();

  const completedIds: string[] = React.useMemo(() => {
    const raw = localStorage.getItem('completed_tryouts');
    return raw ? JSON.parse(raw) : [];
  }, []);

  // Hitung max tryout sesuai paket dari backend database
  const maxTryouts = React.useMemo(() => {
    if (!authUser?.packageType) return 0;
    const pkg = packages.find(p =>
      p.name?.toLowerCase() === (authUser.packageType || '').toLowerCase() ||
      (authUser.packageType || '').toLowerCase().includes(p.name?.toLowerCase().split(' ')[1]?.toLowerCase() || '')
    );
    return pkg?.includedTryouts || pkg?.includedTryOuts || 999;
  }, [authUser, packages]);

  // Filter tryout sesuai kategori paket
  const allowedCategories = React.useMemo((): string[] => {
    if (!authUser?.hasPurchasedPackage || !authUser?.packageType) return [];
    const pkg = (authUser.packageType || '').toLowerCase();
    if (pkg.includes('combo') || pkg.includes('lengkap')) return ['PTN', 'SKD', 'STIS'];
    if (pkg.includes('ptn') || pkg.includes('snbt')) return ['PTN'];
    if (pkg.includes('stis')) return ['STIS', 'SKD'];
    if (pkg.includes('skd') || pkg.includes('sekdin')) return ['SKD'];
    return [];
  }, [authUser]);

  const mergedTryOuts = React.useMemo(() => {
    return backendTryouts
      .filter(t => allowedCategories.includes(t.category))
      .slice(0, maxTryouts)
      .map(t => ({
        ...t,
        isCompleted: completedIds.includes(t.id) || t.isCompleted,
      }));
  }, [backendTryouts, allowedCategories, maxTryouts, completedIds]);

  const upcomingTryOuts = mergedTryOuts.filter(t => !t.isCompleted && !t.isLocked).slice(0, 2);
  const completedCount = mergedTryOuts.filter(t => t.isCompleted).length;

  const recentScore = examResults.length > 0 ? examResults[0] : null;
  const avgScore = examResults.length > 0
    ? (examResults.reduce((acc: number, s: any) => acc + (s.percentage || 0), 0) / examResults.length).toFixed(1)
    : '0';

  const displayName = authUser?.name || 'Siswa';

  const greetingTime = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Selamat pagi';
    if (h < 17) return 'Selamat siang';
    return 'Selamat malam';
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-[#2563EB] rounded-2xl overflow-hidden"
      >
        <div className="absolute -right-10 -top-10 w-56 h-56 rounded-full bg-white/5" />
        <div className="absolute right-10 bottom-0 w-32 h-32 rounded-full bg-white/5" />
        <div className="relative z-10 p-6">
          <p className="text-blue-200 text-sm mb-1">{greetingTime()},</p>
          <h1 className="text-white text-3xl font-bold mb-4">{displayName}</h1>
          <div className="flex items-center gap-3 flex-wrap">
            {authUser?.hasPurchasedPackage ? (
              <span className="inline-flex items-center gap-2 bg-white/15 text-white text-sm font-semibold px-4 py-2 rounded-xl">
                <CheckCircle className="w-4 h-4 text-green-300" />
                {authUser.packageType || 'Paket Aktif'}
              </span>
            ) : (
              <Link to="/paket">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white text-[#2563EB] text-sm font-bold px-5 py-2 rounded-xl shadow-sm"
                >
                  Beli Paket Sekarang →
                </motion.button>
              </Link>
            )}
            <span className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-sm px-4 py-2 rounded-xl">
              <FileText className="w-4 h-4" />
              {completedCount}/{mergedTryOuts.length} try out selesai
            </span>
          </div>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-4 items-stretch">
        {[
          {
            label: 'Try Out Selesai',
            value: completedCount,
            suffix: `/${mergedTryOuts.length}`,
            icon: <CheckCircle className="w-5 h-5 text-[#2563EB]" />,
            progress: mergedTryOuts.length > 0 ? Math.round((completedCount / mergedTryOuts.length) * 100) : 0,
          },
          {
            label: 'Rata-rata Skor',
            value: examResults.length > 0 ? `${avgScore}%` : '—',
            suffix: null,
            icon: <TrendingUp className="w-5 h-5 text-[#2563EB]" />,
            progress: null,
          },
          {
            label: 'Try Out Tersedia',
            value: tryoutsLoading ? '...' : mergedTryOuts.filter(t => !t.isLocked).length,
            suffix: null,
            icon: <Play className="w-5 h-5 text-[#2563EB]" />,
            progress: null,
          },
        ].map((stat, i) => (
          <motion.div key={stat.label}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.06 }}>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm h-full flex flex-col">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                {stat.icon}
              </div>
              <div className="flex items-baseline gap-0.5">
                <span className="text-3xl font-black text-gray-900">{stat.value}</span>
                {stat.suffix && <span className="text-base text-gray-400 font-medium">{stat.suffix}</span>}
              </div>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              {stat.progress !== null && (
                <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-[#2563EB] rounded-full"
                    initial={{ width: 0 }} animate={{ width: `${stat.progress}%` }}
                    transition={{ delay: 0.4, duration: 0.7, ease: 'easeOut' }} />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Target */}
      {authUser?.targetUniversity && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Target className="w-5 h-5 text-[#2563EB]" />
              </div>
              <p className="text-base font-bold text-gray-900">Target Kamu</p>
            </div>
            <p className="text-lg font-bold text-gray-900">{authUser.targetUniversity}</p>
            {authUser.targetMajor && <p className="text-sm text-gray-500 mt-0.5">{authUser.targetMajor}</p>}
            <Link to="/hasil">
              <button className="mt-4 w-full py-2.5 text-sm font-semibold text-[#2563EB] bg-blue-50 hover:bg-blue-100 rounded-xl transition-all">
                Cek Status Kelulusan →
              </button>
            </Link>
          </div>
        </motion.div>
      )}

      {/* Hasil Terakhir */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <BarChart3 className="w-[18px] h-[18px] text-[#2563EB]" />
              </div>
              <h2 className="text-base font-bold text-gray-900">Hasil Try Out Terakhir</h2>
            </div>
            <Link to="/hasil" className="flex items-center gap-1 text-sm text-[#2563EB] font-semibold hover:underline">
              Semua hasil <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {recentScore ? (
            <div className="p-6">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <p className="font-semibold text-gray-900 text-base leading-tight">{recentScore.tryOutTitle}</p>
                  <div className="flex items-center gap-1.5 text-sm text-gray-400 mt-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(recentScore.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
                <span className="flex-shrink-0 inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-sm font-semibold px-3 py-1.5 rounded-full border border-green-100">
                  <CheckCircle className="w-3.5 h-3.5" /> Selesai
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: 'Total Skor', value: recentScore.totalScore, blue: true },
                  { label: 'Persentase', value: `${recentScore.percentage}%`, blue: false },
                  { label: 'Ranking', value: `#${recentScore.rank}`, blue: false },
                ].map(item => (
                  <div key={item.label}
                    className={`rounded-xl p-4 text-center ${item.blue ? 'bg-[#2563EB]' : 'bg-gray-50'}`}>
                    <p className={`text-xs mb-1.5 ${item.blue ? 'text-blue-200' : 'text-gray-400'}`}>{item.label}</p>
                    <p className={`text-2xl font-black ${item.blue ? 'text-white' : 'text-gray-900'}`}>{item.value}</p>
                  </div>
                ))}
              </div>

              {recentScore.subScores && recentScore.subScores.length > 0 && (
                <div className="space-y-3 mb-5">
                  {recentScore.subScores.slice(0, 4).map((sub: any, idx: number) => {
                    // BUG FIX E1/A9: normalize field name — backend kirim subtest/scaledScore,
                    // localStorage mungkin simpan legacy format subject/score/maxScore
                    const label    = sub.code    || sub.subtest || sub.subject || `S${idx + 1}`;
                    const score    = sub.scaledScore ?? sub.score    ?? 0;
                    const maxScore = sub.maxScore   ?? 1000;
                    const pct      = maxScore > 0 ? Math.min(100, Math.round((score / maxScore) * 100)) : 0;
                    return (
                      <div key={`${label}-${idx}`} className="flex items-center gap-4">
                        <span className="text-sm font-bold text-gray-400 w-12 flex-shrink-0">{label}</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div className="h-full bg-[#2563EB] rounded-full"
                            initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                            transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }} />
                        </div>
                        <span className="text-sm text-gray-500 w-10 text-right font-medium">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              )}

              <Link to={`/tryout/${recentScore.tryOutId}/pembahasan`}>
                <button className="w-full py-3 text-sm font-semibold text-[#2563EB] bg-blue-50 hover:bg-blue-100 rounded-xl transition-all">
                  Lihat Pembahasan Soal →
                </button>
              </Link>
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="w-7 h-7 text-[#2563EB]" />
              </div>
              <p className="font-semibold text-gray-700 mb-1">Belum Ada Hasil</p>
              <p className="text-sm text-gray-400 mb-5">Kerjakan try out pertama untuk melihat analisis skor kamu</p>
              <Link to="/tryout">
                <button className="px-6 py-2.5 bg-[#2563EB] text-white text-sm font-semibold rounded-xl hover:bg-[#1d4ed8] transition-all">
                  Mulai Try Out Sekarang
                </button>
              </Link>
            </div>
          )}
        </div>
      </motion.div>

      {/* Try Out Tersedia */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <FileText className="w-[18px] h-[18px] text-[#2563EB]" />
              </div>
              <h2 className="text-base font-bold text-gray-900">Try Out Tersedia</h2>
            </div>
            <Link to="/tryout" className="flex items-center gap-1 text-sm text-[#2563EB] font-semibold hover:underline">
              Lihat semua <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="divide-y divide-gray-50">
            {tryoutsLoading ? (
              <div className="py-8 text-center">
                <Loader2 className="w-6 h-6 text-[#2563EB] animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-400">Memuat try out...</p>
              </div>
            ) : upcomingTryOuts.length > 0 ? upcomingTryOuts.map((tryOut, i) => (
              <Link key={tryOut.id} to={`/tryout/${tryOut.id}/exam`}>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 + i * 0.05 }}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-11 h-11 rounded-xl border border-blue-100 bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-[#2563EB]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-gray-900 mb-1">{tryOut.title}</p>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-0.5 rounded-md font-semibold ${
                        tryOut.category === 'PTN' ? 'bg-blue-50 text-blue-700' :
                        tryOut.category === 'SKD' ? 'bg-violet-50 text-violet-700' :
                        'bg-sky-50 text-sky-700'
                      }`}>
                        {tryOut.category}
                      </span>
                      <span className="text-sm text-gray-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />{tryOut.duration} menit
                      </span>
                      <span className="text-sm text-gray-400">{tryOut.totalQuestions} soal</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gray-50 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#2563EB] transition-colors" />
                  </div>
                </motion.div>
              </Link>
            )) : mergedTryOuts.length === 0 ? (
              <div className="py-8 text-center">
                <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Try out belum tersedia</p>
                {!authUser?.hasPurchasedPackage && (
                  <Link to="/paket">
                    <button className="mt-3 px-4 py-2 text-sm font-semibold text-[#2563EB] bg-blue-50 rounded-xl hover:bg-blue-100 transition-all">
                      Beli Paket →
                    </button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="py-10 text-center">
                <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
                <p className="font-semibold text-gray-600">Semua try out sudah dikerjakan!</p>
                <p className="text-sm text-gray-400 mt-1">Pantau hasilmu di halaman Hasil</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Riwayat Skor — hanya tampil kalau ada hasil real */}
      {examResults.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                  <TrendingUp className="w-[18px] h-[18px] text-[#2563EB]" />
                </div>
                <h2 className="text-base font-bold text-gray-900">Riwayat Skor</h2>
              </div>
              <Link to="/hasil" className="text-sm text-[#2563EB] font-semibold hover:underline">Semua</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {examResults.slice(0, 3).map((r: any, i: number) => (
                <div key={i} className="flex items-center justify-between px-6 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-800 truncate">{r.tryOutTitle}</p>
                    <p className="text-sm text-gray-400 mt-0.5 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(r.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="text-xl font-black text-[#2563EB]">{r.totalScore}</p>
                    <p className="text-sm text-gray-400">{r.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* CTA Beli Paket */}
      {!authUser?.hasPurchasedPackage && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="relative bg-[#1e40af] rounded-2xl p-6 overflow-hidden">
            <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-white/5" />
            <div className="absolute right-12 -top-4 w-24 h-24 rounded-full bg-white/5" />
            <div className="relative z-10">
              <p className="text-white font-bold text-lg mb-1">Mulai Persiapan Sekarang</p>
              <p className="text-blue-200 text-sm mb-5 leading-relaxed">
                Akses ratusan soal Try Out SNBT & SKD beserta pembahasan lengkapnya
              </p>
              <Link to="/paket">
                <button className="w-full py-3 bg-white text-[#1e40af] text-sm font-bold rounded-xl hover:bg-blue-50 transition-all">
                  Lihat Pilihan Paket →
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
