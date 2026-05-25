// frontend/src/app/hooks/useTryouts.ts
// Hook untuk fetch try out dari backend — NO MOCK DATA
import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export function useTryouts() {
  const [tryouts, setTryouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.getTryouts()
      .then((data: any[]) => {
        if (data && data.length > 0) {
          const mapped = data.map((t: any) => ({
            id: String(t.id),
            title: t.title,
            description: t.description,
            category: t.category,
            difficulty: t.difficulty,
            duration: t.duration,
            totalQuestions: t.totalQuestions,
            isActive: t.isActive,
            isLocked: t.isLocked || false,
            isCompleted: false,
            subjects: Array.isArray(t.subjects) ? t.subjects : [],
          }));
          setTryouts(mapped);
        } else {
          setTryouts([]);
        }
      })
      .catch((err) => {
        console.error('Gagal fetch tryouts:', err);
        setError('Gagal memuat try out');
        setTryouts([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return { tryouts, loading, error };
}

export function useQuestions(tryoutId: string) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tryoutId) return;
    setLoading(true);
    api.getQuestions(tryoutId)
      .then((data: any[]) => {
        if (data && data.length > 0) {
          const mapped = data.map((q: any, i: number) => ({
            id: q.id,
            questionNumber: i + 1,
            questionText: q.questionText,
            subject: q.subtestName || q.subtestCode,
            subjectCode: q.subtestCode,
            options: [
              { id: 'a', text: q.optionA },
              { id: 'b', text: q.optionB },
              { id: 'c', text: q.optionC },
              { id: 'd', text: q.optionD },
              ...(q.optionE ? [{ id: 'e', text: q.optionE }] : []),
            ],
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
          }));
          setQuestions(mapped);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tryoutId]);

  return { questions, loading };
}
