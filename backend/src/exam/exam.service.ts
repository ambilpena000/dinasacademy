import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExamDraft } from './exam-draft.entity';
import { QuestionsService } from '../questions/questions.service';
import { ResultsService } from '../results/results.service';
import { TryoutsService } from '../tryouts/tryouts.service';
import { ExamResult } from '../results/exam-result.entity';
import {
  calculateScore, computeQuestionWeights, firstAttempts, rankBestAttempts, usesWeightedScoring,
} from './scoring';

// Formula skor ada di ./scoring.ts (SKD resmi; SNBT berbobot per soal).

@Injectable()
export class ExamService {
  constructor(
    @InjectRepository(ExamDraft)
    private draftRepo: Repository<ExamDraft>,
    private questionsService: QuestionsService,
    private resultsService: ResultsService,
    private tryoutsService: TryoutsService,
  ) {}

  async saveDraft(userId: number, data: {
    tryoutId: number;
    answers: Record<string, string>;
    currentSubtest: string | number;
  }) {
    let draft = await this.draftRepo.findOne({ where: { userId, tryoutId: data.tryoutId } });
    if (draft) {
      draft.answers = data.answers;
      draft.currentSubtest = String(data.currentSubtest);
    } else {
      draft = this.draftRepo.create({
        userId,
        tryoutId: data.tryoutId,
        answers: data.answers,
        currentSubtest: String(data.currentSubtest),
      });
    }
    return this.draftRepo.save(draft);
  }

  async getDraft(userId: number, tryoutId: number) {
    const draft = await this.draftRepo.findOne({ where: { userId, tryoutId } });
    if (!draft) return { answers: {}, currentSubtest: 0 };
    return draft;
  }

  async submitExam(userId: number, submission: {
    tryoutId: number;
    answers: Record<string, string>;
    subScores?: any[];
  }) {
    let tryoutTitle = 'Tryout';
    let category = 'SNBT';

    try {
      const tryout = await this.tryoutsService.findOne(submission.tryoutId);
      tryoutTitle = tryout.title;
      category    = tryout.category;
    } catch { /* tryout tidak ada di DB */ }

    const questions = await this.questionsService.findAllByTryout(submission.tryoutId);
    const answers   = submission.answers;

    // Skor awal; untuk SNBT segera dihitung ulang dengan bobot terbaru di bawah
    const scored = calculateScore(questions, answers, category);

    const result = await this.resultsService.createResult({
      userId,
      tryoutId:       submission.tryoutId,
      tryoutTitle,
      category,
      answers:        submission.answers,
      correct:        scored.correct,
      wrong:          scored.wrong,
      unanswered:     scored.unanswered,
      totalQuestions: scored.totalQuestions,
      totalScore:     scored.totalScore,
      maxScore:       scored.maxScore,
      percentage:     scored.percentage,
      rank:           0,
      totalParticipants: 1,
      subScores:      scored.subScores,
      completedAt:    new Date(),
    });

    await this.draftRepo.delete({ userId, tryoutId: submission.tryoutId });

    // Hitung ulang bobot soal (SNBT) + skor & peringkat semua peserta try out ini
    await this.recalculateTryout(submission.tryoutId);
    return (await this.resultsService.findById(result.id)) ?? result;
  }

  /**
   * Hitung ulang skor seluruh hasil pada satu try out.
   * SNBT: bobot soal dari tingkat benar percobaan pertama tiap peserta (kosong = tidak benar).
   * SKD : skor tetap (aturan resmi), hanya peringkat yang diperbarui.
   */
  async recalculateTryout(tryoutId: number) {
    const [questions, results] = await Promise.all([
      this.questionsService.findAllByTryout(tryoutId),
      this.resultsService.findByTryout(tryoutId),
    ]);
    if (!results.length) return { tryoutId, results: 0, weighted: false };

    const category = results[0].category;
    const weighted = usesWeightedScoring(category);
    const weights = weighted
      ? computeQuestionWeights(questions, firstAttempts(results).map((r) => (r.answers || {}) as Record<string, string>))
      : undefined;

    if (questions.length) {
      for (const r of results) {
        const s = calculateScore(questions, (r.answers || {}) as Record<string, string>, r.category, weights);
        Object.assign(r, {
          correct: s.correct, wrong: s.wrong, unanswered: s.unanswered, totalQuestions: s.totalQuestions,
          totalScore: s.totalScore, maxScore: s.maxScore, percentage: s.percentage, subScores: s.subScores,
        });
      }
    }
    // Peringkat: percobaan terbaik tiap peserta (SKD: tie-break TKP > TIU > TWK)
    const ranking = rankBestAttempts(results, category);
    for (const r of results) {
      r.rank = ranking.rankOf(r);
      r.totalParticipants = ranking.participants;
    }
    await this.resultsService.saveMany(results as ExamResult[]);
    return { tryoutId, results: results.length, weighted };
  }

  /** Statistik & bobot tiap soal (untuk admin). */
  async questionStats(tryoutId: number) {
    const [questions, results] = await Promise.all([
      this.questionsService.findAllByTryout(tryoutId),
      this.resultsService.findByTryout(tryoutId),
    ]);
    const attempts = firstAttempts(results).map((r) => (r.answers || {}) as Record<string, string>);
    const weights = computeQuestionWeights(questions, attempts);
    const weighted = usesWeightedScoring(results[0]?.category ?? (questions[0] as any)?.category);
    return {
      tryoutId,
      participants: attempts.length,
      weighted,
      questions: questions.map((q: any) => {
        const w = weights.get(q.id)!;
        const answered = attempts.filter((a) => (a[String(q.id)] || '').trim() !== '').length;
        return {
          questionId: q.id,
          orderIndex: q.orderIndex,
          subtest: (q.subtestCode || q.subtestName || 'UMUM').toUpperCase(),
          correct: w.correct,
          answered,
          unanswered: attempts.length - answered,
          correctRate: attempts.length ? w.correct / attempts.length : null, // tingkat benar sebenarnya
          weight: weighted ? w.weight : null,
        };
      }),
    };
  }
}
