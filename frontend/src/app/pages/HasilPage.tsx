import React, { useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { 
  TrendingUp, ChevronRight, Target, 
  Award, AlertCircle, GraduationCap, MapPin, Users,
  CheckCircle, Bookmark,
  Filter, Info
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { mockScores } from '../data/mockData';
import { useResults } from '../hooks/useResults';
import { universities, getPrograms, getPassingGradeStatus, PASSING_GRADE_DISCLAIMER } from '../data/universities';

export default function HasilPage() {
  const { results: backendResults } = useResults();


  // Read real exam results from localStorage, fall back to mockScores
  const realResults = React.useMemo(() => {
    const raw = backendResults.length > 0 ? JSON.stringify(backendResults) : localStorage.getItem('exam_results');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.length > 0) return parsed;
    }
    return mockScores;
  }, []);

  const latestResult = realResults[0];
  const avgScore = realResults.length > 0
    ? Math.round(realResults.reduce((s: number, r: any) => s + (r.totalScore || 0), 0) / realResults.length)
    : '0';
  
  // Progress data for line chart
  // Build progress chart from real exam results
  const progressData = React.useMemo(() => {
    if (realResults.length > 0) {
      return [...realResults].reverse().map((r: any, i: number) => ({
        name: `TO #${i + 1}`,
        label: r.tryOutTitle?.replace('Try Out ', '').replace(' 2026', '') || `TO #${i+1}`,
        score: Math.round((r.percentage || 0) * 10), // scale to /1000
      }));
    }
    // Demo data sesuai SNBT 2026 scoring
    return [
      { name: 'TO #1', label: 'SNBT #1', score: 540 },
      { name: 'TO #2', label: 'SNBT #2', score: 575 },
      { name: 'TO #3', label: 'SNBT #3', score: 598 },
      { name: 'TO #4', label: 'SKD #1', score: 612 },
      { name: 'TO #5', label: 'SNBT #4', score: 635 },
    ];
  }, [realResults]);

  // Subject scores for bar chart
  const subjectData = (latestResult?.subScores || mockScores[0].subScores).map((s: any, index: number) => ({
    id: `${s.code || s.subject}-${index}`,
    name: s.code || s.subject.split(' ')[0], // short code for chart
    fullName: s.subject,
    score: Math.round((s.score / s.maxScore) * 100),
    nilai: s.score,
    maxScore: s.maxScore,
  }));

  // Weakest subjects
  const weakestSubjects = [...(latestResult?.subScores || mockScores[0].subScores)]
    .sort((a, b) => (a.score / a.maxScore) - (b.score / b.maxScore))
    .slice(0, 2);


  const latestScore = latestResult?.totalScore || mockScores[0].totalScore;
  const highestScore = realResults.length > 0
    ? Math.max(...realResults.map((r: any) => r.totalScore || 0))
    : latestScore;
  const highestScoreResult = realResults.find((r: any) => r.totalScore === highestScore);
  const [historyPage, setHistoryPage] = React.useState(1);
  const ITEMS_PER_PAGE = 3;
  const totalPages = Math.ceil(realResults.length / ITEMS_PER_PAGE);
  const pagedResults = realResults.slice((historyPage - 1) * ITEMS_PER_PAGE, historyPage * ITEMS_PER_PAGE);

  // Cari prodi target user dari profil
  const userTargetUniv = React.useMemo(() => {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    const u = JSON.parse(raw);
    return { university: u.targetUniversity || '', major: u.targetMajor || '', type: u.targetType || 'PTN' };
  }, []);

  // Cari data passing grade prodi target
  const targetProgram = React.useMemo(() => {
    if (!userTargetUniv?.university) return null;
    const uni = universities.find((u: any) =>
      u.name === userTargetUniv.university || u.short === userTargetUniv.university
    );
    if (!uni) return null;
    const prog = uni.programs.find((p: any) => p.name === userTargetUniv.major);
    return prog ? { ...prog, uniName: uni.name, uniShort: uni.short, location: uni.location } : null;
  }, [userTargetUniv]);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analisis Hasil</h1>
            <p className="text-gray-600">Lihat progress dan rekomendasi PTN berdasarkan skor kamu</p>
          </div>

        </div>
      </motion.div>

      {/* Overview Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-blue-500 to-sky-600 text-white">
            <CardContent className="pt-6">
              <p className="text-blue-100 text-sm mb-1">Rata-rata Nilai</p>
              <h3 className="text-3xl font-bold mb-2">
                {avgScore}
              </h3>
              <p className="text-blue-100 text-sm">dari maksimal 1000</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-600 text-sm mb-1">Total Try Out</p>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">{realResults.length}</h3>
              <p className="text-sm text-gray-600">Diselesaikan</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Progress Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Progress Score</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" domain={[600, 750]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#2563EB" 
                  strokeWidth={3}
                  dot={{ fill: '#2563EB', r: 6 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-sm text-gray-600 mt-4 text-center">
              Score kamu meningkat konsisten! Pertahankan momentum ini 💪
            </p>
          </CardContent>
        </Card>

        {/* Subject Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Analisis Per Mata Pelajaran</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subjectData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                  formatter={(value: any, name: string) => {
                    if (name === 'score') return [`${value.toFixed(1)}%`, 'Persentase'];
                    return [value, name];
                  }}
                />
                <Bar dataKey="score" fill="#2563EB" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {/* Status Kelulusan Prodi Target */}
        {userTargetUniv?.type === 'PTN' && userTargetUniv?.university ? (
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-sky-600 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle>Status Kelulusan Prodi Target</CardTitle>
                  <div className="flex items-center gap-4 mt-1 flex-wrap">
                    <p className="text-sm text-gray-500">
                      Skor terakhir: <span className="font-bold text-blue-600">{latestScore}</span>
                      <span className="text-gray-400">/1000</span>
                    </p>
                    <p className="text-sm text-gray-400">·</p>
                    <p className="text-sm text-gray-500">
                      Skor tertinggi: <span className="font-bold text-green-600">{highestScore}</span>
                      <span className="text-gray-400">/1000</span>
                      {highestScoreResult && (
                        <span className="text-gray-400 text-xs ml-1">
                          ({highestScoreResult.tryOutTitle})
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {targetProgram ? (
                (() => {
                  const status = getPassingGradeStatus(latestScore, targetProgram.estimatedPassingGrade || 650);
                  return (
                    <div className="space-y-4">
                      {/* Target prodi info */}
                      <div className="flex items-start justify-between p-4 bg-gray-50 rounded-2xl">
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">Program Studi Target</p>
                          <p className="font-bold text-gray-900 text-lg">{targetProgram.name}</p>
                          <p className="text-sm text-blue-600 font-medium">{targetProgram.uniShort} — {targetProgram.faculty}</p>
                          <p className="text-xs text-gray-400 mt-1">{targetProgram.uniName}</p>
                        </div>
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${targetProgram.category === 'Saintek' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                          {targetProgram.category}
                        </span>
                      </div>

                      {/* Status */}
                      <div className={`p-5 rounded-2xl border-2 ${status.status === 'aman' ? 'bg-green-50 border-green-200' : status.status === 'tipis' ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
                        <p className={`text-base font-bold mb-1 ${status.color}`}>
                          {status.label.replace('✅ ', '').replace('⚠️ ', '').replace('❌ ', '')}
                        </p>
                        <p className="text-sm text-gray-600">{status.description}</p>
                        <div className="flex items-center gap-6 mt-4">
                          <div>
                            <p className="text-xs text-gray-500">Skor Kamu</p>
                            <p className="text-2xl font-black text-gray-900">{latestScore}</p>
                          </div>
                          <div className="text-gray-300 text-2xl">vs</div>
                          <div>
                            <p className="text-xs text-gray-500">Estimasi Passing Grade</p>
                            <p className="text-2xl font-black text-gray-700">~{targetProgram.estimatedPassingGrade}</p>
                          </div>
                        </div>
                        {status.status !== 'aman' && (
                          <p className="mt-3 text-sm font-medium text-gray-600 border-t border-current/10 pt-3">
                            Perlu meningkatkan{' '}
                            <span className="font-bold text-gray-800">
                              {Math.max(0, (targetProgram.estimatedPassingGrade || 650) - latestScore + 20)} poin
                            </span>{' '}
                            lagi untuk zona aman.
                            {highestScore > latestScore && (
                              <span className="ml-1">
                                Skor tertinggimu sudah mencapai{' '}
                                <span className="font-bold text-green-600">{highestScore}</span>.
                              </span>
                            )}
                          </p>
                        )}
                      </div>

                      {/* Disclaimer */}
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                        <p className="text-xs text-amber-700">{PASSING_GRADE_DISCLAIMER}</p>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="text-center py-8">
                  <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="font-semibold text-gray-700 mb-1">Program studi "{userTargetUniv.major}" belum ada di database kami</p>
                  <p className="text-sm text-gray-500 mb-4">Data kami mencakup prodi populer di 15 PTN terkemuka. Untuk prodi lainnya, cek langsung di snpmb.bppp.kemdikbud.go.id</p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-2 border-dashed border-gray-200">
            <CardContent className="pt-6 text-center py-10">
              <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="font-semibold text-gray-700 mb-1">Belum ada prodi target</p>
              <p className="text-sm text-gray-500 mb-4">Lengkapi profil kamu untuk melihat status kelulusan prodi target</p>
              <a href="/profile" className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white text-sm font-semibold rounded-xl hover:bg-[#1d4ed8] transition-all">
                Lengkapi Profil →
              </a>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Detailed Results */}

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Try Out</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pagedResults.map((score: any, index: number) => (
              <div 
                key={score.tryOutId}
                className="p-4 rounded-xl border-2 border-gray-100 hover:border-blue-300 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">{score.tryOutTitle}</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(score.date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <Badge variant="green">Selesai</Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600 mb-1">Total Skor</p>
                    <p className="text-2xl font-bold text-blue-600">{score.totalScore}</p>
                  </div>
                  <Link to={`/tryout/${score.tryOutId}/ranking`}
                    className="bg-gray-50 hover:bg-blue-50 hover:border-blue-200 border border-transparent rounded-lg p-3 transition-all group block">
                    <p className="text-sm text-gray-600 mb-1 group-hover:text-[#2563EB] transition-colors">Ranking</p>
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-bold text-gray-800 group-hover:text-[#2563EB] transition-colors">#{score.rank}</p>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#2563EB] transition-colors" />
                    </div>
                    <p className="text-xs text-gray-400 group-hover:text-blue-400 mt-0.5 transition-colors">Lihat papan peringkat</p>
                  </Link>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {score.subScores.map((sub: any, subIdx: number) => (
                    <div key={`${sub.subject}-${subIdx}`} className="text-sm bg-gray-50 px-3 py-1 rounded-lg">
                      <span className="font-medium text-gray-700">{sub.subject}:</span>
                      <span className="ml-1 text-gray-900">{sub.score}/{sub.maxScore}</span>
                    </div>
                  ))}
                </div>

                <Link to={`/tryout/${score.tryOutId}/pembahasan`}>
                  <Button variant="primary" size="sm" className="w-full">
                    Lihat Pembahasan
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
              <p className="text-sm text-gray-500">
                Menampilkan {(historyPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(historyPage * ITEMS_PER_PAGE, realResults.length)} dari {realResults.length} hasil
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                  disabled={historyPage === 1}
                  className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  ← Sebelumnya
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setHistoryPage(p)}
                    className={`w-8 h-8 text-sm font-semibold rounded-lg transition-all ${
                      p === historyPage
                        ? 'bg-[#2563EB] text-white'
                        : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setHistoryPage(p => Math.min(totalPages, p + 1))}
                  disabled={historyPage === totalPages}
                  className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Selanjutnya →
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}