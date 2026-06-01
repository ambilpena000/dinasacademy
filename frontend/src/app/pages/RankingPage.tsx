import { api } from '../lib/api';
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Trophy, Medal, Crown, User, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// FIX B2: Tidak ada mock data, tidak ada generateLeaderboard fiktif

const rankBadge = (rank: number, isUser: boolean) => {
  if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
  if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
  return <span className={`text-sm font-bold w-5 text-center ${isUser ? 'text-[#2563EB]' : 'text-gray-400'}`}>{rank}</span>;
};

const rankRowStyle = (rank: number, isUser: boolean) => {
  if (isUser) return 'bg-blue-50 border-2 border-[#2563EB]';
  if (rank === 1) return 'bg-yellow-50 border border-yellow-100';
  if (rank === 2) return 'bg-gray-50 border border-gray-100';
  if (rank === 3) return 'bg-amber-50 border border-amber-100';
  return 'bg-white border border-gray-100';
};

export default function RankingPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [entries, setEntries] = useState<any[]>([]);
  const [tryOutTitle, setTryOutTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ambil hasil user dari localStorage untuk highlight baris user
  const examResult = React.useMemo(() => {
    const raw = localStorage.getItem('exam_results');
    if (!raw) return null;
    try {
      const results = JSON.parse(raw);
      return results.find((r: any) => String(r.tryOutId) === String(id)) || null;
    } catch { return null; }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    Promise.all([
      api.getTryout(id),
      api.getRanking(id),
    ])
      .then(([tryout, rankingData]) => {
        setTryOutTitle(tryout?.title || 'Try Out');

        // Backend mengembalikan array hasil, kita urutkan dan beri nomor rank
        const sorted = Array.isArray(rankingData)
          ? [...rankingData].sort((a: any, b: any) => b.totalScore - a.totalScore)
          : [];

        const withRank = sorted.map((r: any, i: number) => ({
          rank: i + 1,
          userId: r.userId,
          // Anonimkan nama: tampilkan "Kamu" jika userId milik user saat ini
          name: r.userId === user?.id ? (user?.name || 'Kamu') : anonimize(r.userId, i),
          score: Math.round(Number(r.totalScore)),
          isUser: String(r.userId) === String(user?.id),
        }));

        setEntries(withRank);
      })
      .catch(err => setError(err.message || 'Gagal memuat ranking'))
      .finally(() => setLoading(false));
  }, [id, user?.id]);

  // Anonimkan nama peserta lain untuk privasi
  const anonimize = (userId: number, index: number) => {
    const names = ['Peserta A','Peserta B','Peserta C','Peserta D','Peserta E',
      'Peserta F','Peserta G','Peserta H','Peserta I','Peserta J'];
    return names[index % names.length];
  };

  const userEntry = entries.find(e => e.isUser);
  const top3 = entries.filter(e => e.rank <= 3);
  const others = entries.filter(e => e.rank > 3);
  // Jika user tidak di top 3 dan tidak di 4 entri pertama, tambahkan spacer
  const userInOthers = others.find(e => e.isUser);
  const showSeparator = userEntry && userEntry.rank > 4 &&
    others.length > 0 && others[0].rank > 4;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Memuat ranking...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-gray-500">{error}</p>
        <Link to="/hasil">
          <button className="px-4 py-2 bg-[#2563EB] text-white text-sm font-semibold rounded-xl">
            Kembali ke Hasil
          </button>
        </Link>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <Trophy className="w-12 h-12 text-gray-300 mx-auto" />
        <p className="text-gray-500 font-medium">Belum ada peserta yang menyelesaikan try out ini</p>
        <Link to="/hasil">
          <button className="px-4 py-2 text-[#2563EB] text-sm font-semibold hover:underline">
            ← Kembali ke Hasil
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <Link to="/hasil">
            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-all">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Kembali</span>
            </button>
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{tryOutTitle}</h1>
        <p className="text-gray-500 text-sm mt-1">{entries.length} peserta · Peringkat berdasarkan total skor</p>
      </motion.div>

      {/* User rank card */}
      {userEntry && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="bg-[#2563EB] text-white rounded-2xl p-5">
            <p className="text-blue-100 text-sm mb-1">Peringkat Kamu</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-black">
                  #{userEntry.rank}
                </div>
                <div>
                  <p className="font-bold text-lg">{userEntry.name}</p>
                  <p className="text-blue-100 text-sm">dari {entries.length} peserta</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black">{userEntry.score}</p>
                <p className="text-blue-100 text-sm">poin</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Leaderboard */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Papan Peringkat
            </h2>
          </div>

          <div className="divide-y divide-gray-50">
            {/* Top 3 */}
            {top3.map((entry, i) => (
              <motion.div
                key={entry.rank}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.04 }}
                className={`flex items-center gap-4 p-4 ${rankRowStyle(entry.rank, entry.isUser)}`}
              >
                <div className="w-8 flex items-center justify-center flex-shrink-0">
                  {rankBadge(entry.rank, entry.isUser)}
                </div>
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold truncate ${entry.isUser ? 'text-[#2563EB]' : 'text-gray-900'}`}>
                    {entry.name} {entry.isUser && <span className="text-xs font-normal">(Kamu)</span>}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-lg font-bold ${entry.isUser ? 'text-[#2563EB]' : 'text-gray-900'}`}>
                    {entry.score}
                  </p>
                  <p className="text-xs text-gray-400">poin</p>
                </div>
              </motion.div>
            ))}

            {/* Separator jika ada gap antara top3 dan posisi user */}
            {showSeparator && (
              <div className="flex items-center gap-4 p-3 bg-gray-50">
                <div className="w-8 text-center text-gray-300 text-xs">···</div>
                <p className="text-xs text-gray-400">Peserta lainnya</p>
              </div>
            )}

            {/* Peserta lain (termasuk user jika bukan top 3) */}
            {others.slice(0, showSeparator && userInOthers
              ? Math.max(others.indexOf(userInOthers) + 2, 5)
              : 10
            ).map((entry, i) => (
              <motion.div
                key={entry.rank}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.03 }}
                className={`flex items-center gap-4 p-4 ${rankRowStyle(entry.rank, entry.isUser)}`}
              >
                <div className="w-8 flex items-center justify-center flex-shrink-0">
                  {rankBadge(entry.rank, entry.isUser)}
                </div>
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold truncate ${entry.isUser ? 'text-[#2563EB]' : 'text-gray-900'}`}>
                    {entry.name} {entry.isUser && <span className="text-xs font-normal">(Kamu)</span>}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-lg font-bold ${entry.isUser ? 'text-[#2563EB]' : 'text-gray-900'}`}>
                    {entry.score}
                  </p>
                  <p className="text-xs text-gray-400">poin</p>
                </div>
              </motion.div>
            ))}

            {entries.length > 13 && (
              <div className="p-4 text-center text-sm text-gray-400">
                +{entries.length - 13} peserta lainnya
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
