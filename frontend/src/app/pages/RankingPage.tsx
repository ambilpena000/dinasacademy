import { api } from '../lib/api';
import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Trophy, Medal, Crown, User } from 'lucide-react';
import { mockTryOuts } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

// Generate mock leaderboard data berdasarkan tryout ID
function generateLeaderboard(tryOutId: string, userRank: number, userScore: number, userName: string) {
  const seed = tryOutId.charCodeAt(0) + tryOutId.charCodeAt(tryOutId.length - 1);
  const totalParticipants = 800 + (seed % 1200);

  const entries: { rank: number; name: string; score: number; isUser: boolean }[] = [];

  const names = [
    'Andi Saputra', 'Budi Hartono', 'Citra Dewi', 'Dani Pratama',
    'Eka Putri', 'Fajar Nugroho', 'Gita Sari', 'Hendra Wijaya',
    'Indah Lestari', 'Joko Susilo', 'Kiki Amelia', 'Lina Marlina',
    'Made Surya', 'Nanda Kusuma', 'Oki Firmansyah', 'Putri Rahayu',
    'Rahmat Hidayat', 'Sari Wulandari', 'Tono Santoso', 'Umar Hakim',
    'Vina Anggraini', 'Wahyu Setiawan', 'Xena Pertiwi', 'Yudi Kurniawan',
    'Zara Nabilah', 'Arif Budiman', 'Bayu Prakoso', 'Clara Novita',
    'Dewa Asmara', 'Erni Susanti',
  ];

  // Top 3
  const topScores = [
    userRank === 1 ? userScore : Math.max(userScore + 150 + (seed % 100), 900),
    userRank === 2 ? userScore : Math.max(userScore + 100 + (seed % 80), 860),
    userRank === 3 ? userScore : Math.max(userScore + 50 + (seed % 60), 820),
  ];

  for (let i = 0; i < 3; i++) {
    if (i + 1 === userRank) {
      entries.push({ rank: i + 1, name: userName, score: userScore, isUser: true });
    } else {
      entries.push({ rank: i + 1, name: names[i], score: topScores[i], isUser: false });
    }
  }

  // Sekitar user rank (jika user bukan top 3)
  if (userRank > 3) {
    const startRank = Math.max(4, userRank - 3);
    const endRank = Math.min(userRank + 3, totalParticipants);

    for (let r = startRank; r <= endRank; r++) {
      if (r === userRank) {
        entries.push({ rank: r, name: userName, score: userScore, isUser: true });
      } else {
        const nameIdx = (r + seed) % names.length;
        const diff = r - userRank;
        const score = Math.max(0, userScore - diff * 12 + (seed % 10));
        entries.push({ rank: r, name: names[nameIdx], score: Math.min(1000, score), isUser: false });
      }
    }
  }

  // Urutkan dan deduplicate
  const unique = [...new Map(entries.map(e => [e.rank, e])).values()];
  unique.sort((a, b) => a.rank - b.rank);

  return { entries: unique, totalParticipants };
}

const rankBadge = (rank: number) => {
  if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
  if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
  return <span className="text-sm font-bold text-gray-400 w-5 text-center">{rank}</span>;
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

  // Fetch ranking dari backend (optional)
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (id && token) {
      api.getRanking(id).catch(() => {});
    }
  }, [id]);

  const tryOut = mockTryOuts.find(t => t.id === id);

  // Ambil hasil try out user dari localStorage
  const examResult = React.useMemo(() => {
    const raw = localStorage.getItem('exam_results');
    if (!raw) return null;
    const results = JSON.parse(raw);
    return results.find((r: any) => r.tryOutId === id) || null;
  }, [id]);

  const userRank = examResult?.rank || 99;
  const userScore = examResult?.totalScore || 0;
  const userName = user?.name || 'Kamu';

  const { entries, totalParticipants } = React.useMemo(
    () => generateLeaderboard(id || '1', userRank, userScore, userName),
    [id, userRank, userScore, userName]
  );

  const userEntry = entries.find(e => e.isUser);
  const top3 = entries.filter(e => e.rank <= 3);
  const others = entries.filter(e => e.rank > 3);
  const showSeparator = others.length > 0 && top3.length > 0 && others[0].rank > 4;

  if (!tryOut) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Try out tidak ditemukan</p>
        <Link to="/hasil" className="text-[#2563EB] text-sm font-semibold mt-2 block">← Kembali ke Hasil</Link>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Link to="/hasil" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Hasil
        </Link>

        <div className="bg-[#2563EB] rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute right-8 -bottom-4 w-24 h-24 rounded-full bg-white/5" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-yellow-300" />
              <p className="text-blue-100 text-sm font-medium">Papan Peringkat</p>
            </div>
            <h1 className="text-xl font-bold mb-1">{tryOut.title}</h1>
            <p className="text-blue-200 text-sm">{totalParticipants.toLocaleString('id-ID')} peserta</p>
          </div>
        </div>
      </motion.div>

      {/* Posisi Kamu */}
      {userEntry && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs text-gray-400 font-medium mb-3">Posisi Kamu</p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#2563EB] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900">{userName}</p>
                <p className="text-sm text-gray-400">Skor: <span className="font-semibold text-[#2563EB]">{userScore}</span></p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-[#2563EB]">#{userRank}</p>
                <p className="text-xs text-gray-400">dari {totalParticipants.toLocaleString('id-ID')}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Leaderboard */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h2 className="text-sm font-bold text-gray-900">Peringkat Peserta</h2>
          </div>

          <div className="divide-y divide-gray-50 px-2 py-2 space-y-1">
            {/* Top 3 */}
            {top3.map((entry, i) => (
              <motion.div
                key={entry.rank}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.05 }}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl ${rankRowStyle(entry.rank, entry.isUser)}`}
              >
                <div className="w-8 flex items-center justify-center flex-shrink-0">
                  {rankBadge(entry.rank)}
                </div>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  entry.isUser ? 'bg-[#2563EB] text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {entry.isUser
                    ? userName.charAt(0).toUpperCase()
                    : entry.name.charAt(0).toUpperCase()
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${entry.isUser ? 'text-[#2563EB]' : 'text-gray-800'}`}>
                    {entry.name}
                    {entry.isUser && <span className="ml-1.5 text-xs bg-[#2563EB] text-white px-1.5 py-0.5 rounded-full">Kamu</span>}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-base font-black ${entry.isUser ? 'text-[#2563EB]' : 'text-gray-900'}`}>
                    {entry.score}
                  </p>
                </div>
              </motion.div>
            ))}

            {/* Separator */}
            {showSeparator && (
              <div className="flex items-center gap-2 px-3 py-1">
                <div className="flex-1 border-t border-dashed border-gray-200" />
                <span className="text-xs text-gray-400">···</span>
                <div className="flex-1 border-t border-dashed border-gray-200" />
              </div>
            )}

            {/* Sekitar user */}
            {others.map((entry, i) => (
              <motion.div
                key={entry.rank}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.04 }}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl ${rankRowStyle(entry.rank, entry.isUser)}`}
              >
                <div className="w-8 flex items-center justify-center flex-shrink-0">
                  {rankBadge(entry.rank)}
                </div>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  entry.isUser ? 'bg-[#2563EB] text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {entry.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${entry.isUser ? 'text-[#2563EB]' : 'text-gray-800'}`}>
                    {entry.name}
                    {entry.isUser && <span className="ml-1.5 text-xs bg-[#2563EB] text-white px-1.5 py-0.5 rounded-full">Kamu</span>}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-base font-black ${entry.isUser ? 'text-[#2563EB]' : 'text-gray-900'}`}>
                    {entry.score}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/50">
            <p className="text-xs text-gray-400 text-center">
              Menampilkan peringkat di sekitar posisi kamu dari {totalParticipants.toLocaleString('id-ID')} peserta
            </p>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        className="flex gap-3">
        <Link to={`/tryout/${id}/pembahasan`} className="flex-1">
          <button className="w-full py-3 bg-[#2563EB] text-white text-sm font-semibold rounded-xl hover:bg-[#1d4ed8] transition-all">
            Lihat Pembahasan
          </button>
        </Link>
        <Link to={`/tryout/${id}/exam`} className="flex-1">
          <button className="w-full py-3 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-all">
            Ulangi Try Out
          </button>
        </Link>
      </motion.div>
    </div>
  );
}