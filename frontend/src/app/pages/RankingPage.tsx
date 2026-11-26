import { api } from '../lib/api';
import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Trophy, Medal, Crown, User, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Data dari GET /results/:tryoutId/ranking — satu baris per peserta (nilai terbaiknya)
interface RankingEntry {
  rank: number;
  userId: number;
  totalScore: number;
  subScores: Record<string, number>;
  subtestRank: Record<string, number>;
  passed: boolean | null;
  attempts: number;
}
interface RankingData {
  category: string | null;
  participants: number;
  subtests: string[];
  topBySubtest: Record<string, number>;
  passingGrade: Record<string, number> | null;
  entries: RankingEntry[];
}

const SUBTEST_LABEL: Record<string, string> = {
  TWK: 'Wawasan Kebangsaan', TIU: 'Intelegensi Umum', TKP: 'Karakteristik Pribadi',
  PU: 'Penalaran Umum', PPU: 'Pengetahuan & Pemahaman Umum', KMBM: 'Membaca & Menulis',
  PK: 'Pengetahuan Kuantitatif', LBI: 'Literasi B. Indonesia', LBE: 'Literasi B. Inggris', PM: 'Penalaran Matematika',
};

const rankBadge = (rank: number, isUser: boolean) => {
  if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
  if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
  return <span className={`text-sm font-bold w-5 text-center ${isUser ? 'text-[#2563EB]' : 'text-gray-400'}`}>{rank}</span>;
};

const rankRowStyle = (rank: number, isUser: boolean) => {
  if (isUser) return 'bg-blue-50 border-l-4 border-[#2563EB]';
  if (rank === 1) return 'bg-yellow-50';
  if (rank === 2) return 'bg-gray-50';
  if (rank === 3) return 'bg-amber-50';
  return 'bg-white';
};

// Nama samaran stabil per peserta (privasi)
const pseudonym = (userId: number) => `Peserta ${((userId * 7919) % 9000) + 1000}`;

const TOP_N = 10;

export default function RankingPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [data, setData] = useState<RankingData | null>(null);
  const [tryOutTitle, setTryOutTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<string>('TOTAL'); // 'TOTAL' atau kode subtes

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([api.getTryout(id).catch(() => null), api.getRanking(id)])
      .then(([tryout, ranking]) => {
        setTryOutTitle(tryout?.title || 'Try Out');
        setData(ranking as RankingData);
      })
      .catch(err => setError(err.message || 'Gagal memuat ranking'))
      .finally(() => setLoading(false));
  }, [id]);

  const isSKD = (data?.category || '').toUpperCase() === 'SKD';
  const isMe = (e: RankingEntry) => String(e.userId) === String(user?.id);

  // Urutan & peringkat sesuai tab yang dipilih
  const rows = useMemo(() => {
    if (!data) return [];
    const list = data.entries.map(e => ({
      ...e,
      name: isMe(e) ? (user?.name || 'Kamu') : pseudonym(e.userId),
      shownRank: tab === 'TOTAL' ? e.rank : e.subtestRank[tab],
      shownScore: tab === 'TOTAL' ? e.totalScore : e.subScores[tab] ?? 0,
    }));
    return list.sort((a, b) => a.shownRank - b.shownRank || b.shownScore - a.shownScore);
  }, [data, tab, user?.id, user?.name]);

  const me = rows.find(r => isMe(r));
  const myEntry = data?.entries.find(e => isMe(e));
  const topRows = rows.slice(0, TOP_N);
  const meOutsideTop = me && !topRows.includes(me);

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

  if (error || !data) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-gray-500">{error || 'Gagal memuat ranking'}</p>
        <Link to="/hasil">
          <button className="px-4 py-2 bg-[#2563EB] text-white text-sm font-semibold rounded-xl">Kembali ke Hasil</button>
        </Link>
      </div>
    );
  }

  if (data.entries.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <Trophy className="w-12 h-12 text-gray-300 mx-auto" />
        <p className="text-gray-500 font-medium">Belum ada peserta yang menyelesaikan try out ini</p>
        <Link to="/hasil">
          <button className="px-4 py-2 text-[#2563EB] text-sm font-semibold hover:underline">← Kembali ke Hasil</button>
        </Link>
      </div>
    );
  }

  const tabLabel = tab === 'TOTAL' ? 'Total Skor' : `${tab} · ${SUBTEST_LABEL[tab] || tab}`;

  const Row = ({ r, i }: { r: (typeof rows)[number]; i: number }) => (
    <motion.div
      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 + i * 0.02 }}
      className={`flex items-center gap-3 sm:gap-4 px-4 py-3 ${rankRowStyle(r.shownRank, isMe(r))}`}
    >
      <div className="w-8 flex items-center justify-center flex-shrink-0">{rankBadge(r.shownRank, isMe(r))}</div>
      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
        <User className="w-4 h-4 text-gray-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-semibold truncate ${isMe(r) ? 'text-[#2563EB]' : 'text-gray-900'}`}>
          {r.name} {isMe(r) && <span className="text-xs font-normal">(Kamu)</span>}
        </p>
        {tab === 'TOTAL' && data.subtests.length > 0 && (
          <p className="text-[11px] text-gray-500 truncate">
            {data.subtests.map(c => `${c} ${r.subScores[c] ?? 0}`).join(' · ')}
          </p>
        )}
      </div>
      {isSKD && r.passed !== null && (
        <span className={`hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
          r.passed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
        }`}>
          {r.passed ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
          {r.passed ? 'Lulus PG' : 'Belum lulus PG'}
        </span>
      )}
      <div className="text-right flex-shrink-0 w-14">
        <p className={`text-lg font-bold ${isMe(r) ? 'text-[#2563EB]' : 'text-gray-900'}`}>{r.shownScore}</p>
        <p className="text-[10px] text-gray-400">poin</p>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Link to="/hasil" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2">
          <ArrowLeft className="w-5 h-5" /><span className="font-medium">Kembali</span>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{tryOutTitle}</h1>
        <p className="text-gray-500 text-sm mt-1">
          {data.participants} peserta · nilai terbaik tiap peserta
          {isSKD && ' · bila total sama: TKP, lalu TIU, lalu TWK lebih tinggi menang'}
        </p>
      </motion.div>

      {/* Kartu peringkat saya */}
      {myEntry && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="bg-[#2563EB] text-white rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-xl font-black">
                  #{myEntry.rank}
                </div>
                <div>
                  <p className="text-blue-100 text-sm">Peringkat Kamu (total)</p>
                  <p className="font-bold text-lg">dari {data.participants} peserta</p>
                  {isSKD && myEntry.passed !== null && (
                    <p className="text-xs mt-0.5 text-blue-100">
                      {myEntry.passed ? '✓ Memenuhi passing grade SKD' : 'Belum memenuhi passing grade SKD'}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black">{myEntry.totalScore}</p>
                <p className="text-blue-100 text-sm">poin terbaik{myEntry.attempts > 1 ? ` (${myEntry.attempts}x mengerjakan)` : ''}</p>
              </div>
            </div>
            {data.subtests.length > 0 && (
              <div className={`grid gap-2 ${data.subtests.length <= 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>
                {data.subtests.map(c => {
                  const pg = data.passingGrade?.[c];
                  const below = pg != null && (myEntry.subScores[c] ?? 0) < pg;
                  return (
                    <div key={c} className="bg-white/10 rounded-xl p-3">
                      <p className="text-xs text-blue-100">{c}</p>
                      <p className="text-lg font-bold">
                        {myEntry.subScores[c] ?? 0}
                        {pg != null && <span className={`text-[10px] font-medium ml-1 ${below ? 'text-red-200' : 'text-green-200'}`}>/ PG {pg}</span>}
                      </p>
                      <p className="text-[11px] text-blue-100">Peringkat #{myEntry.subtestRank[c]} · tertinggi {data.topBySubtest[c]}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Tab peringkat */}
      <div className="flex gap-2 flex-wrap">
        {['TOTAL', ...data.subtests].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === t ? 'bg-[#2563EB] text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#2563EB]'
            }`}>
            {t === 'TOTAL' ? 'Total' : t}
          </button>
        ))}
      </div>

      {/* Papan peringkat */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-2 flex-wrap">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" /> Papan Peringkat · {tabLabel}
            </h2>
            {tab !== 'TOTAL' && (
              <span className="text-xs text-gray-500">Nilai tertinggi: <b className="text-gray-800">{data.topBySubtest[tab]}</b></span>
            )}
          </div>
          <div className="divide-y divide-gray-50">
            {topRows.map((r, i) => <Row key={r.userId} r={r} i={i} />)}
            {meOutsideTop && me && (
              <>
                <div className="flex items-center gap-4 px-4 py-2 bg-gray-50">
                  <div className="w-8 text-center text-gray-300 text-xs">···</div>
                  <p className="text-xs text-gray-400">Posisi kamu</p>
                </div>
                <Row r={me} i={TOP_N} />
              </>
            )}
            {rows.length > TOP_N + (meOutsideTop ? 1 : 0) && (
              <div className="p-4 text-center text-sm text-gray-400">
                +{rows.length - TOP_N - (meOutsideTop ? 1 : 0)} peserta lainnya
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
