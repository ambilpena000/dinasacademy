import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Clock, Flag, ChevronLeft, ChevronRight, X,
  AlertTriangle, CheckCircle, Save
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';
import { mockTryOuts, mockQuestions } from '../data/mockData';
import { api } from '../lib/api';

// ── Subtes SNBT 2026 (urutan & durasi sesuai regulasi) ────────────
const SNBT_SUBTESTS = [
  { code: 'PU',   name: 'Penalaran Umum',                     duration: 30, totalQ: 30 },
  { code: 'PPU',  name: 'Pengetahuan & Pemahaman Umum',        duration: 15, totalQ: 20 },
  { code: 'KMBM', name: 'Kemampuan Memahami Bacaan & Menulis', duration: 15, totalQ: 20 },
  { code: 'PK',   name: 'Pengetahuan Kuantitatif',             duration: 20, totalQ: 20 },
  { code: 'LBI',  name: 'Literasi Bahasa Indonesia',           duration: 42, totalQ: 30 },
  { code: 'LBE',  name: 'Literasi Bahasa Inggris',             duration: 20, totalQ: 20 },
  { code: 'PM',   name: 'Penalaran Matematika',                duration: 42, totalQ: 20 },
];

const SKD_SUBTESTS = [
  { code: 'TWK', name: 'Tes Wawasan Kebangsaan',    duration: 27, totalQ: 30 },
  { code: 'TIU', name: 'Tes Intelegensia Umum',     duration: 32, totalQ: 35 },
  { code: 'TKP', name: 'Tes Karakteristik Pribadi', duration: 41, totalQ: 45 },
];

const STIS_SUBTESTS = [
  { code: 'MTK', name: 'Matematika',         duration: 60, totalQ: 50 },
  { code: 'ENG', name: 'Bahasa Inggris',     duration: 40, totalQ: 30 },
  { code: 'PU',  name: 'Pengetahuan Umum',  duration: 20, totalQ: 20 },
];

type SubtestCfg = { code: string; name: string; duration: number; totalQ: number };

const getSaveKey = (id: string) => `exam_draft_${id}`;

// ── Modal transisi antar subtes ───────────────────────────────────
function SubtestTransitionModal({ current, next, onContinue }: {
  current: SubtestCfg; next?: SubtestCfg; onContinue: () => void;
}) {
  const [cd, setCd] = useState(5);
  useEffect(() => {
    if (cd <= 0) { onContinue(); return; }
    const t = setTimeout(() => setCd(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cd, onContinue]);

  return (
    <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl"
        initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}>
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-xl font-black text-gray-900 mb-1">Subtes Selesai!</h3>
        <p className="text-sm text-gray-500 mb-6">
          <span className="font-semibold text-[#2563EB]">{current.name}</span> telah berakhir
        </p>
        {next ? (
          <>
            <div className="bg-blue-50 rounded-2xl p-4 mb-6">
              <p className="text-xs text-gray-400 mb-1">Subtes berikutnya</p>
              <p className="font-bold text-gray-900 text-base">{next.name}</p>
              <p className="text-xs text-gray-500 mt-1">{next.totalQ} soal · {next.duration} menit</p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#2563EB] text-white font-black text-lg flex items-center justify-center">
                {cd}
              </div>
              <Button variant="primary" onClick={onContinue}>Mulai Sekarang</Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-gray-500 text-sm mb-6">Semua subtes selesai 🎉</p>
            <Button variant="primary" className="w-full" onClick={onContinue}>Lihat Hasil</Button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────
export default function TryOutExamPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const tryOut = mockTryOuts.find(t => t.id === id);

  const subtests: SubtestCfg[] = React.useMemo(() => {
    if (!tryOut) return [];
    if (tryOut.category === 'PTN') return SNBT_SUBTESTS;
    if (tryOut.category === 'SKD') return SKD_SUBTESTS;
    return STIS_SUBTESTS;
  }, [tryOut]);

  // ── Load saved state ──────────────────────────────────────────
  const savedDraft = React.useMemo(() => {
    if (!id) return null;
    const raw = localStorage.getItem(getSaveKey(id));
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }, [id]);

  const [currentSubtestIdx, setCurrentSubtestIdx] = useState(savedDraft?.currentSubtestIdx || 0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>(savedDraft?.answers || {});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [subtestTimer, setSubtestTimer] = useState(0);
  const [showTransition, setShowTransition] = useState(false);
  const [showFinish, setShowFinish] = useState(false);
  const [showNavigator, setShowNavigator] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentSubtest = subtests[currentSubtestIdx];

  // ── Subtest question ranges ───────────────────────────────────
  const subtestRanges = React.useMemo(() => {
    let s = 0;
    return subtests.map(sub => { const r = { start: s, end: s + sub.totalQ - 1 }; s += sub.totalQ; return r; });
  }, [subtests]);

  // ── Build all questions ───────────────────────────────────────
  const allQuestions = React.useMemo(() => {
    if (!subtests.length) return [];
    return subtests.flatMap(sub => {
      const pool = mockQuestions.filter(q => q.subjectCode === sub.code);
      return Array(sub.totalQ).fill(null).map((_, i) => {
        const base = pool.length > 0 ? pool[i % pool.length] : mockQuestions[i % mockQuestions.length];
        return { ...base, subjectCode: sub.code, subjectName: sub.name };
      });
    });
  }, [subtests]);

  const currentRange = subtestRanges[currentSubtestIdx] || { start: 0, end: 0 };
  const subtestQs = allQuestions.slice(currentRange.start, currentRange.end + 1);
  const globalIdx = currentRange.start + currentQuestion;

  // ── Init timer on subtest change ─────────────────────────────
  const goNextSubtest = useCallback(() => {
    if (currentSubtestIdx < subtests.length - 1) setShowTransition(true);
    else setShowFinish(true);
  }, [currentSubtestIdx, subtests.length]);

  useEffect(() => {
    if (!currentSubtest) return;
    const initialTime = currentSubtest.duration * 60;
    setSubtestTimer(initialTime);
    setCurrentQuestion(0);

    // Start countdown immediately with initialTime (tidak tunggu state update)
    if (timerRef.current) clearInterval(timerRef.current);
    let remaining = initialTime;
    timerRef.current = setInterval(() => {
      remaining -= 1;
      setSubtestTimer(remaining);
      if (remaining <= 0) {
        clearInterval(timerRef.current!);
        timerRef.current = null;
        // Trigger next subtest via state — pakai setTimeout agar tidak conflict dengan render
        setTimeout(() => {
          setCurrentSubtestIdx((prev : number) => {
            if (prev < subtests.length - 1) {
              setShowTransition(true);
            } else {
              setShowFinish(true);
            }
            return prev;
          });
        }, 100);
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [currentSubtestIdx, subtests.length]);

  // ── Auto-save ─────────────────────────────────────────────────
  const saveProgress = useCallback(() => {
    if (!id) return;
    localStorage.setItem(getSaveKey(id), JSON.stringify({ answers, currentSubtestIdx, savedAt: new Date().toISOString() }));
    // Sinkron draft ke backend
    const token = localStorage.getItem('access_token');
    if (token && id) {
      api.saveDraft(id, answers, currentSubtestIdx).catch(() => {});
    }
    setLastSaved(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
  }, [id, answers, currentSubtestIdx]);

  // Debounced save on answer change
  useEffect(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(saveProgress, 2000);
  }, [answers, saveProgress]);

  // Periodic save every 30s
  useEffect(() => {
    const t = setInterval(saveProgress, 30000);
    return () => clearInterval(t);
  }, [saveProgress]);

  // ── Handlers ─────────────────────────────────────────────────
  const handleAnswer = (optionId: string) => setAnswers(p => ({ ...p, [globalIdx]: optionId }));

  const toggleFlag = () => setFlagged(p => {
    const s = new Set(p);
    s.has(globalIdx) ? s.delete(globalIdx) : s.add(globalIdx);
    return s;
  });

  const handleTransitionContinue = () => {
    setShowTransition(false);
    if (currentSubtestIdx < subtests.length - 1) setCurrentSubtestIdx((p: number) => p + 1);
    else confirmFinish();
  };

  const getStatus = (gi: number) => answers[gi] ? 'answered' : flagged.has(gi) ? 'flagged' : 'unanswered';

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  // ── Finish ────────────────────────────────────────────────────
  const confirmFinish = () => {
    const totalQ = allQuestions.length;
    const correct = allQuestions.filter((q, i) => answers[i] === q.correctAnswer).length;
    const subScores = subtests.map((sub, si) => {
      const r = subtestRanges[si];
      const sQs = allQuestions.slice(r.start, r.end + 1);
      const sCorrect = sQs.filter((q, qi) => answers[r.start + qi] === q.correctAnswer).length;
      const maxS = sub.code === 'TKP' ? 225 : sub.code === 'TIU' ? 175 : 150;
      return { subject: sub.name, code: sub.code, score: Math.floor((sCorrect / sQs.length) * maxS), maxScore: maxS, correctCount: sCorrect, totalCount: sQs.length };
    });
    const result = {
      tryOutId: id, tryOutTitle: tryOut?.title || '', category: tryOut?.category || 'PTN',
      answers, correct, wrong: Object.keys(answers).length - correct,
      unanswered: totalQ - Object.keys(answers).length,
      totalQuestions: totalQ, totalScore: Math.round((correct / totalQ) * 1000),
      maxScore: 1000, percentage: Math.round((correct / totalQ) * 100),
      rank: Math.floor(Math.random() * 200) + 50,
      totalParticipants: Math.floor(Math.random() * 2000) + 1000,
      date: new Date().toISOString(), subScores,
    };
    const existing = JSON.parse(localStorage.getItem('exam_results') || '[]');
    localStorage.setItem('exam_results', JSON.stringify([result, ...existing.filter((r: any) => r.tryOutId !== id)]));
    const completed = JSON.parse(localStorage.getItem('completed_tryouts') || '[]');
    if (!completed.includes(id)) localStorage.setItem('completed_tryouts', JSON.stringify([...completed, id]));
    const today = new Date().toDateString();
    const sd = JSON.parse(localStorage.getItem('streak_data') || '{"streak":0,"lastDate":""}');
    if (sd.lastDate !== today) {
      const yd = new Date(); yd.setDate(yd.getDate() - 1);
      localStorage.setItem('streak_data', JSON.stringify({ streak: sd.lastDate === yd.toDateString() ? sd.streak + 1 : 1, lastDate: today }));
    }
    if (id) localStorage.removeItem(getSaveKey(id));
    navigate(`/tryout/${id}/pembahasan`);
  };

  // ── Counts ────────────────────────────────────────────────────
  const subtestAnswered = subtestQs.filter((_, i) => answers[currentRange.start + i]).length;
  const totalAnswered = Object.keys(answers).length;
  const totalQ = allQuestions.length;

  if (!tryOut || !subtests.length) return <div className="p-8 text-center text-gray-500">Try out tidak ditemukan</div>;

  return (
    <div className="fixed inset-0 bg-[#F9FAFB] z-50 flex flex-col">

      <AnimatePresence>
        {showTransition && <SubtestTransitionModal current={currentSubtest} next={subtests[currentSubtestIdx + 1]} onContinue={handleTransitionContinue} />}
      </AnimatePresence>

      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <p className="text-xs text-gray-400 hidden md:block truncate">{tryOut.title}</p>
            <p className="text-sm font-bold text-gray-900 truncate">{currentSubtest?.name}</p>
          </div>
          {/* Subtest pills */}
          <div className="hidden lg:flex items-center gap-1 flex-shrink-0">
            {subtests.map((sub, i) => (
              <span key={sub.code} className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                i === currentSubtestIdx ? 'bg-[#2563EB] text-white' :
                i < currentSubtestIdx ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
              }`}>{sub.code}</span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {lastSaved && (
            <div className="hidden md:flex items-center gap-1 text-xs text-gray-400">
              <Save className="w-3 h-3" /><span>Tersimpan {lastSaved}</span>
            </div>
          )}
          {/* Timer */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-mono font-bold flex-shrink-0 ${
            subtestTimer < 120 ? 'bg-red-100 text-red-700 animate-pulse' :
            subtestTimer < 300 ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
          }`}>
            <Clock className="w-4 h-4" />{formatTime(subtestTimer)}
          </div>
          {/* Total progress */}
          <div className="hidden md:flex text-xs bg-gray-100 px-2.5 py-1.5 rounded-lg text-gray-500 flex-shrink-0">
            <span className="font-bold text-gray-700">{totalAnswered}</span>/{totalQ}
          </div>
          <button onClick={() => setShowNavigator(!showNavigator)} className="md:hidden p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Subinfo bar */}
      <div className="bg-blue-50 border-b border-blue-100 px-4 py-1 flex items-center justify-between text-xs flex-shrink-0">
        <span className="text-blue-700 font-medium">Subtes {currentSubtestIdx + 1}/{subtests.length} · Soal {currentQuestion + 1}/{subtestQs.length}</span>
        <span className="text-blue-600">Dijawab: <span className="font-bold">{subtestAnswered}/{subtestQs.length}</span></span>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Question */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-3xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div key={`${currentSubtestIdx}-${currentQuestion}`}
                initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.15 }}>
                <Card>
                  <CardContent className="pt-5 pb-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#3B82F6] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {currentQuestion + 1}
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Soal {currentQuestion + 1} dari {subtestQs.length}</p>
                          <p className="text-xs font-semibold text-[#2563EB]">{currentSubtest?.name}</p>
                        </div>
                      </div>
                      <button onClick={toggleFlag} title="Tandai ragu"
                        className={`p-2 rounded-lg transition-all ${flagged.has(globalIdx) ? 'bg-yellow-100 text-yellow-600' : 'hover:bg-gray-100 text-gray-300'}`}>
                        <Flag className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-base text-gray-900 leading-relaxed mb-5">
                      {subtestQs[currentQuestion]?.questionText}
                    </p>

                    <div className="space-y-2.5">
                      {subtestQs[currentQuestion]?.options.map((opt: any) => (
                        <button key={opt.id} onClick={() => handleAnswer(opt.id)}
                          className={`w-full text-left p-3.5 rounded-xl border-2 transition-all ${
                            answers[globalIdx] === opt.id
                              ? 'border-[#2563EB] bg-blue-50'
                              : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                          }`}>
                          <div className="flex items-start gap-3">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold ${
                              answers[globalIdx] === opt.id
                                ? 'border-[#2563EB] bg-[#2563EB] text-white'
                                : 'border-gray-300 text-gray-500'
                            }`}>{opt.id.toUpperCase()}</div>
                            <span className="text-sm text-gray-900 leading-relaxed">{opt.text}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Nav buttons */}
                <div className="flex items-center justify-between mt-4">
                  <Button variant="ghost" size="sm"
                    onClick={() => setCurrentQuestion(p => Math.max(0, p - 1))}
                    disabled={currentQuestion === 0}>
                    <ChevronLeft className="w-4 h-4 mr-1" /> Sebelumnya
                  </Button>
                  <div className="flex items-center gap-2">
                    <button onClick={saveProgress}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-all">
                      <Save className="w-3.5 h-3.5" /> Simpan
                    </button>
                    {currentQuestion === subtestQs.length - 1 ? (
                      currentSubtestIdx < subtests.length - 1 ? (
                        <Button variant="primary" size="sm" onClick={() => setShowTransition(true)}>
                          Selesai & Lanjut <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      ) : (
                        <Button variant="primary" size="sm" onClick={() => setShowFinish(true)}>
                          Selesai Ujian
                        </Button>
                      )
                    ) : (
                      <Button variant="primary" size="sm" onClick={() => setCurrentQuestion(p => p + 1)}>
                        Selanjutnya <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ── Navigator ── */}
        <div className={`${showNavigator ? 'flex' : 'hidden'} md:flex flex-col w-68 bg-white border-l border-gray-200 flex-shrink-0`} style={{ width: '272px' }}>
          <div className="p-4 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-gray-900">Navigasi Soal</h3>
              <button onClick={() => setShowNavigator(false)} className="md:hidden p-1 hover:bg-gray-100 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-3 text-xs">
              <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded bg-green-500" /><span className="text-gray-500">Dijawab</span></div>
              <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded bg-yellow-400" /><span className="text-gray-500">Ragu</span></div>
              <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded bg-gray-200" /><span className="text-gray-500">Kosong</span></div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {subtests.map((sub, si) => {
              const r = subtestRanges[si];
              const sQs = allQuestions.slice(r.start, r.end + 1);
              const isCurrent = si === currentSubtestIdx;
              const isDone = si < currentSubtestIdx;
              return (
                <div key={sub.code}>
                  <div className={`flex justify-between mb-2 ${!isCurrent && !isDone ? 'opacity-40' : ''}`}>
                    <p className={`text-xs font-bold ${isCurrent ? 'text-[#2563EB]' : isDone ? 'text-green-600' : 'text-gray-400'}`}>
                      {isDone ? '✓ ' : ''}{sub.code} — {sub.name}
                    </p>
                    <span className="text-xs text-gray-400">{sub.duration}m</span>
                  </div>
                  {(isCurrent || isDone) && (
                    <div className="grid grid-cols-6 gap-1.5">
                      {sQs.map((_, qi) => {
                        const gi = r.start + qi;
                        const st = getStatus(gi);
                        return (
                          <button key={qi} disabled={!isCurrent}
                            onClick={() => { if (isCurrent) { setCurrentQuestion(qi); setShowNavigator(false); } }}
                            className={`aspect-square rounded-lg text-xs font-semibold transition-all ${
                              isCurrent && currentQuestion === qi ? 'ring-2 ring-[#2563EB] ring-offset-1' : ''
                            } ${
                              st === 'answered' ? 'bg-green-500 text-white' :
                              st === 'flagged' ? 'bg-yellow-400 text-white' :
                              'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            } ${!isCurrent ? 'cursor-default opacity-70' : ''}`}>
                            {qi + 1}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="p-4 border-t border-gray-100 flex-shrink-0">
            <Button variant="primary" className="w-full" size="sm" onClick={() => setShowFinish(true)}>
              Selesai Ujian
            </Button>
          </div>
        </div>
      </div>

      {/* ── Finish Modal ── */}
      <AnimatePresence>
        {showFinish && (
          <motion.div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowFinish(false)}>
            <motion.div className="bg-white rounded-2xl p-6 max-w-md w-full"
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}>
              <div className="text-center mb-5">
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-orange-100 flex items-center justify-center">
                  <AlertTriangle className="w-7 h-7 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Selesai Ujian?</h3>
                <p className="text-sm text-gray-500">Jawaban tidak bisa diubah setelah dikumpulkan</p>
              </div>

              {/* Summary per subtes */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2">
                {subtests.map((sub, si) => {
                  const r = subtestRanges[si];
                  const sQs = allQuestions.slice(r.start, r.end + 1);
                  const ans = sQs.filter((_, qi) => answers[r.start + qi]).length;
                  return (
                    <div key={sub.code} className="flex justify-between text-sm">
                      <span className="text-gray-600">{sub.code} — {sub.name}</span>
                      <span className={`font-bold ${ans === sQs.length ? 'text-green-600' : ans > 0 ? 'text-yellow-600' : 'text-gray-400'}`}>
                        {ans}/{sQs.length}
                      </span>
                    </div>
                  );
                })}
                <div className="border-t border-gray-200 pt-2 flex justify-between font-bold">
                  <span className="text-gray-700">Total</span>
                  <span className={totalAnswered === totalQ ? 'text-green-600' : 'text-orange-600'}>
                    {totalAnswered}/{totalQ}
                  </span>
                </div>
              </div>

              {totalAnswered < totalQ && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4">
                  <p className="text-xs text-yellow-800">⚠️ Masih ada <strong>{totalQ - totalAnswered} soal</strong> belum dijawab</p>
                </div>
              )}

              <div className="space-y-2">
                <Button variant="primary" className="w-full" onClick={confirmFinish}>
                  <CheckCircle className="w-4 h-4 mr-2" /> Ya, Kumpulkan Jawaban
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => setShowFinish(false)}>
                  Kembali Periksa
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}