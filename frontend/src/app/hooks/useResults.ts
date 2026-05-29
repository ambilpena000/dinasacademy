// frontend/src/app/hooks/useResults.ts
// Hook untuk fetch hasil try out dari backend
import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export function useResults() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchResults = () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      // Tidak login → bersihkan sisa data akun lain, tampilkan kosong
      setResults([]);
      localStorage.setItem('exam_results', '[]');
      return;
    }

    setLoading(true);
    api.getResults()
      .then((data: any[]) => {
        // FIX A3: SELALU timpa localStorage dengan data dari backend,
        // termasuk saat array kosong [] — mencegah kebocoran data antar akun.
        const mapped = Array.isArray(data)
          ? data.map((r: any) => ({
              tryOutId: String(r.tryoutId),
              tryOutTitle: r.tryoutTitle || 'Try Out',
              category: r.category,
              totalScore: Number(r.totalScore),
              percentage: parseFloat(r.percentage),
              rank: r.rank,
              totalParticipants: r.totalParticipants,
              correct: r.correct,
              wrong: r.wrong,
              unanswered: r.unanswered,
              totalQuestions: r.totalQuestions,
              subScores: r.subScores || [],
              date: r.completedAt,
            }))
          : [];
        setResults(mapped);
        // Override localStorage — data akun ini, bukan akun lain
        localStorage.setItem('exam_results', JSON.stringify(mapped));
      })
      .catch(() => {
        // Network error saja yang fallback ke cache — bukan data kosong
        const raw = localStorage.getItem('exam_results');
        if (raw) { try { setResults(JSON.parse(raw)); } catch {} }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchResults();
  }, []);

  return { results, loading, refetch: fetchResults };
}

export function useExamSubmit() {
  const [submitting, setSubmitting] = useState(false);

  const submitExam = async (
    tryoutId: string,
    answers: Record<string, string>,
    subScores: any[]
  ) => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        const result = await api.submitExam(tryoutId, answers, subScores);
        return result;
      }
    } catch (err) {
      console.error('Submit ke backend gagal:', err);
    } finally {
      setSubmitting(false);
    }
    return null;
  };

  return { submitExam, submitting };
}
