import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Trophy, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import { api } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from './Card';

interface Props {
  tryoutId: string | number;
  tryoutTitle?: string;
  userId?: string | number;
}

// Peringkat peserta pada satu try out SKD: total (nilai terbaik) + tiap subtes TWK/TIU/TKP
export function SkdRankCard({ tryoutId, tryoutTitle, userId }: Props) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    api.getRanking(String(tryoutId))
      .then(d => { if (alive) setData(d); })
      .catch(() => { if (alive) setData(null); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [tryoutId]);

  const me = data?.entries?.find((e: any) => String(e.userId) === String(userId));
  if (!loading && !me) return null;

  return (
    <Card className="border-2 border-violet-200">
      <CardHeader>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle>Peringkat SKD Kamu</CardTitle>
              <p className="text-sm text-gray-500 mt-0.5">{tryoutTitle || 'Try Out SKD'} · nilai terbaik</p>
            </div>
          </div>
          <Link to={`/tryout/${tryoutId}/ranking`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-violet-700 hover:underline">
            Lihat papan peringkat <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-violet-50">
              <div>
                <p className="text-xs text-gray-500">Peringkat total</p>
                <p className="text-3xl font-black text-violet-700">
                  #{me.rank}<span className="text-base font-semibold text-gray-500"> dari {data.participants}</span>
                </p>
                <p className={`mt-1 inline-flex items-center gap-1 text-xs font-semibold ${me.passed ? 'text-green-700' : 'text-gray-500'}`}>
                  {me.passed ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  {me.passed ? 'Memenuhi passing grade SKD' : 'Belum memenuhi passing grade SKD'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Nilai SKD tertinggimu</p>
                <p className="text-3xl font-black text-gray-900">{me.totalScore}</p>
                <p className="text-xs text-gray-400">dari 550</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {(data.subtests as string[]).map(c => {
                const score = me.subScores?.[c] ?? 0;
                const pg = data.passingGrade?.[c];
                return (
                  <div key={c} className="p-3 rounded-xl border border-gray-100 bg-white text-center">
                    <p className="text-xs font-bold text-gray-500">{c}</p>
                    <p className={`text-xl font-black ${pg != null && score < pg ? 'text-red-600' : 'text-gray-900'}`}>{score}</p>
                    {pg != null && <p className="text-[10px] text-gray-400">PG {pg}</p>}
                    <p className="text-[11px] font-semibold text-violet-700 mt-1">Peringkat #{me.subtestRank?.[c]}</p>
                    <p className="text-[10px] text-gray-400">tertinggi {data.topBySubtest?.[c]}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
