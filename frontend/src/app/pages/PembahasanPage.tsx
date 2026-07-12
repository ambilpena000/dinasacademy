import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle, XCircle, Lightbulb, PlayCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { api } from '../lib/api';

// FIX B1: Tidak ada mock data — semua dari backend + localStorage

export default function PembahasanPage() {
  const { id } = useParams();

  // Ambil tryout info dari backend
  const [tryOut, setTryOut] = useState<any>(null);
  // Ambil soal lengkap (dengan correctAnswer + explanation) dari backend
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ambil jawaban user dari localStorage (disimpan saat submit ujian)
  const examResult = React.useMemo(() => {
    const raw = localStorage.getItem('exam_results');
    if (!raw) return null;
    try {
      const results = JSON.parse(raw);
      return results.find((r: any) => String(r.tryOutId) === String(id)) || null;
    } catch { return null; }
  }, [id]);

  // answers: { questionIndex: optionId } atau { questionId: optionId }
  const userAnswers: Record<string, string> = examResult?.answers || {};

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    // Fetch tryout info + soal dengan correctAnswer (endpoint admin/pembahasan)
    Promise.all([
      api.getTryout(id),
      // Gunakan endpoint questions dengan correctAnswer untuk pembahasan
      // Backend perlu endpoint khusus pembahasan yang include correctAnswer
      api.getQuestionsWithAnswers ? api.getQuestionsWithAnswers(id) : api.getQuestions(id),
    ])
      .then(([tryoutData, questionsData]) => {
        setTryOut(tryoutData);
        const mapped = Array.isArray(questionsData) ? questionsData.map((q: any, i: number) => ({
          id: String(q.id),
          index: i,
          questionText: q.questionText,
          subject: q.subtestName || q.subtestCode,
          options: [
            { id: 'a', text: q.optionA },
            { id: 'b', text: q.optionB },
            { id: 'c', text: q.optionC },
            { id: 'd', text: q.optionD },
            ...(q.optionE ? [{ id: 'e', text: q.optionE }] : []),
          ],
          correctAnswer: (q.correctAnswer || '').toLowerCase(),
          explanation: q.explanation || 'Pembahasan belum tersedia.',
          tips: q.tips || null,
          videoUrl: q.videoUrl || null,
          optionWeights: q.optionWeights ? (typeof q.optionWeights === 'string' ? JSON.parse(q.optionWeights) : q.optionWeights) : null,
        })) : [];
        setQuestions(mapped);
      })
      .catch(err => setError(err.message || 'Gagal memuat pembahasan'))
      .finally(() => setLoading(false));
  }, [id]);

  // Hitung skor dari jawaban user vs jawaban benar
  const score = React.useMemo(() => {
    if (!questions.length) return { correct: 0, total: 0, percentage: 0 };
    let correct = 0;
    questions.forEach((q, i) => {
      const ans = userAnswers[String(q.id)] || userAnswers[String(i)];
      if (ans === q.correctAnswer) correct++;
    });
    const total = questions.length;
    return { correct, total, percentage: total > 0 ? (correct / total) * 100 : 0 };
  }, [questions, userAnswers]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Memuat pembahasan...</p>
        </div>
      </div>
    );
  }

  if (error || !tryOut) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 mb-4">{error || 'Try out tidak ditemukan'}</p>
        <Link to="/tryout"><Button variant="ghost">Kembali ke Try Out</Button></Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link to="/tryout">
          <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-all">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Kembali</span>
          </button>
        </Link>
      </div>

      {/* Score Summary */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-4">{tryOut.title}</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <p className="text-blue-100 text-sm mb-1">Benar</p>
                <p className="text-3xl font-bold">{examResult?.correct ?? score.correct}</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <p className="text-blue-100 text-sm mb-1">Salah</p>
                <p className="text-3xl font-bold">{examResult?.wrong ?? (score.total - score.correct)}</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <p className="text-blue-100 text-sm mb-1">Nilai</p>
                <p className="text-3xl font-bold">
                  {examResult?.totalScore ?? score.percentage.toFixed(0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Questions with Explanation */}
      <div className="space-y-6">
        {questions.map((question, index) => {
          // Coba lookup jawaban user: bisa by questionId atau by index
          const userAnswer = userAnswers[String(question.id)] || userAnswers[String(index)] || '';
          const isTKP = question.subject === 'TKP';
          const isCorrect = isTKP ? !!userAnswer : userAnswer === question.correctAnswer;
          const tkpWeights = question.optionWeights || { a: 5, b: 4, c: 3, d: 2, e: 1 };
          const userPoints = isTKP && userAnswer ? (tkpWeights[userAnswer] || 0) : 0;

          return (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Card>
                <CardContent className="pt-6">
                  {/* Question Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold ${
                        !userAnswer ? 'bg-gray-400' : (isTKP ? 'bg-[#2563EB]' : (isCorrect ? 'bg-green-500' : 'bg-red-500'))
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        {isTKP ? (
                          <Badge variant={!userAnswer ? 'default' : 'blue'}>
                            {!userAnswer ? 'Tidak Dijawab' : `Poin: ${userPoints}`}
                          </Badge>
                        ) : (
                          <Badge variant={!userAnswer ? 'default' : isCorrect ? 'green' : 'red'}>
                            {!userAnswer ? 'Tidak Dijawab' : isCorrect ? 'Benar' : 'Salah'}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Badge variant="blue">{question.subject}</Badge>
                  </div>

                  {/* Question Text */}
                  <div className="mb-6">
                    <p className="text-lg text-gray-900 leading-relaxed">{question.questionText}</p>
                  </div>

                  {/* Options */}
                  <div className="space-y-3 mb-6">
                    {question.options.map((option: any) => {
                      const isUserAnswer = userAnswer === option.id;
                      const isCorrectAnswer = !isTKP && (question.correctAnswer === option.id);
                      const optionPoint = isTKP ? (tkpWeights[option.id] || 0) : null;
                      
                      return (
                        <div key={option.id} className={`p-4 rounded-xl border-2 ${
                          isTKP
                            ? (isUserAnswer ? 'border-[#2563EB] bg-blue-50' : 'border-gray-200')
                            : (isCorrectAnswer
                                ? 'border-green-500 bg-green-50'
                                : isUserAnswer && !isCorrect
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-200')
                        }`}>
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-0.5">
                              {isTKP ? (
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                                  isUserAnswer ? 'border-[#2563EB] bg-[#2563EB] text-white' : 'border-gray-300 text-gray-500'
                                }`}>{option.id.toUpperCase()}</div>
                              ) : isCorrectAnswer ? (
                                <CheckCircle className="w-6 h-6 text-green-600" />
                              ) : isUserAnswer && !isCorrect ? (
                                <XCircle className="w-6 h-6 text-red-600" />
                              ) : (
                                <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
                              )}
                            </div>
                            <div className="flex-1">
                              {!isTKP && <span className="font-medium text-gray-700 mr-2">{option.id.toUpperCase()}.</span>}
                              <span className={`${
                                isTKP 
                                  ? (isUserAnswer ? 'text-blue-900 font-semibold' : 'text-gray-900')
                                  : (isCorrectAnswer ? 'text-green-900 font-semibold' :
                                     isUserAnswer && !isCorrect ? 'text-red-900' : 'text-gray-900')
                              }`}>
                                {option.text}
                              </span>
                              
                              {isTKP && (
                                <span className={`ml-2 text-xs font-bold px-2 py-0.5 rounded-full ${
                                  optionPoint === 5 ? 'bg-green-100 text-green-700' :
                                  optionPoint === 1 ? 'bg-red-100 text-red-700' :
                                  'bg-gray-100 text-gray-600'
                                }`}>
                                  Poin: {optionPoint}
                                </span>
                              )}

                              {!isTKP && isUserAnswer && !isCorrect && (
                                <span className="ml-2 text-sm text-red-600">(Jawaban kamu)</span>
                              )}
                              {!isTKP && isCorrectAnswer && (
                                <span className="ml-2 text-sm text-green-600">(Jawaban benar)</span>
                              )}
                              {isTKP && isUserAnswer && (
                                <span className="ml-2 text-sm text-[#2563EB]">(Jawaban kamu)</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  <div className="bg-blue-50 border-l-4 border-[#2563EB] rounded-r-xl p-4 mb-4">
                    <div className="flex items-start space-x-3">
                      <Lightbulb className="w-5 h-5 text-[#2563EB] flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-gray-900 mb-2">Pembahasan:</h4>
                        <p className="text-gray-700 leading-relaxed">{question.explanation}</p>
                      </div>
                    </div>
                  </div>

                  {/* Tips */}
                  {question.tips && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-r-xl p-4 mb-4">
                      <div className="flex items-start space-x-3">
                        <span className="text-xl flex-shrink-0">💡</span>
                        <div>
                          <h4 className="font-bold text-gray-900 mb-1">Tips:</h4>
                          <p className="text-gray-700 text-sm">{question.tips}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {question.videoUrl && (
                    <Button variant="ghost" size="sm">
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Tonton Video Pembahasan
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white border-t border-gray-200 p-4 z-20">
        <div className="max-w-4xl mx-auto flex space-x-3">
          <Link to="/tryout" className="flex-1">
            <Button variant="ghost" className="w-full">Kembali ke Try Out</Button>
          </Link>
          <Link to="/hasil" className="flex-1">
            <Button variant="primary" className="w-full">Lihat Analisis Lengkap</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
