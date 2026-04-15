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
      // Fallback ke localStorage jika belum login ke backend
      const raw = localStorage.getItem('exam_results');
      if (raw) {
        try { setResults(JSON.parse(raw)); } catch {}
      }
      return;
    }

    setLoading(true);
    api.getResults()
      .then((data: any[]) => {
        if (data && data.length > 0) {
          const mapped = data.map((r: any) => ({
            tryOutId: r.tryoutId,
            tryOutTitle: r.tryoutTitle,
            category: r.category,
            totalScore: r.totalScore,
            percentage: parseFloat(r.percentage),
            rank: r.rank,
            totalParticipants: r.totalParticipants,
            correct: r.correct,
            wrong: r.wrong,
            unanswered: r.unanswered,
            totalQuestions: r.totalQuestions,
            subScores: r.subScores || [],
            date: r.completedAt,
          }));
          setResults(mapped);
          // Update localStorage juga agar komponen lain bisa baca
          localStorage.setItem('exam_results', JSON.stringify(mapped));
        } else {
          // Ambil dari localStorage sebagai fallback
          const raw = localStorage.getItem('exam_results');
          if (raw) { try { setResults(JSON.parse(raw)); } catch {} }
        }
      })
      .catch(() => {
        // Fallback ke localStorage
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
        // Kirim ke backend
        const result = await api.submitExam(tryoutId, answers, subScores);
        return result;
      }
    } catch (err) {
      console.error('Submit ke backend gagal, simpan ke localStorage:', err);
    } finally {
      setSubmitting(false);
    }
    return null;
  };

  return { submitExam, submitting };
}