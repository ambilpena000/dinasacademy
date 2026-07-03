import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExamDraft } from './exam-draft.entity';
import { QuestionsService } from '../questions/questions.service';
import { ResultsService } from '../results/results.service';
import { TryoutsService } from '../tryouts/tryouts.service';

// ── BUG FIX #5: Formula skor sesuai aturan resmi ────────────────
//
// SKD (CPNS/Sekdin/STIS):
//   TWK : benar +5, salah 0, kosong 0  — max 35 soal → max 175
//   TIU : benar +5, salah 0, kosong 0  — max 35 soal → max 175
//   TKP : skala opsi 1–5 per jawaban    — max 35 soal → max 175
//   Total max: 550  |  Passing grade: TWK≥65, TIU≥80, TKP≥166
//
// SNBT/PTN (UTBK):
//   Semua subtes: benar +1, salah 0, kosong 0
//   Skor akhir dikonversi ke skala 0–1000

interface SubScore {
  subtest: string;
  correct: number;
  wrong: number;
  unanswered: number;
  rawScore: number;     // sebelum konversi skala
  scaledScore: number;  // setelah konversi ke skala resmi
  passingGrade?: number;
  passed?: boolean;
}

interface ScoreResult {
  subScores: SubScore[];
  totalScore: number;
  maxScore: number;
  percentage: number;
  correct: number;
  wrong: number;
  unanswered: number;
  totalQuestions: number;
  passingInfo?: {
    TWK?: { score: number; pass: boolean; required: number };
    TIU?: { score: number; pass: boolean; required: number };
    TKP?: { score: number; pass: boolean; required: number };
    allPassed: boolean;
  };
}

// TKP — nilai tiap opsi (disesuaikan per posisi; gunakan rata-rata jika tidak diketahui)
// Resminya tiap soal punya bobot berbeda — kita pakai 5/4/3/2/1 sebagai default
const TKP_OPTION_SCORES: Record<string, number> = { a: 5, b: 4, c: 3, d: 2, e: 1 };

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
    let category = 'PTN';

    try {
      const tryout = await this.tryoutsService.findOne(submission.tryoutId);
      tryoutTitle = tryout.title;
      category    = tryout.category;
    } catch { /* tryout tidak ada di DB */ }

    const questions = await this.questionsService.findAllByTryout(submission.tryoutId);
    const answers   = submission.answers;

    // BUG FIX #5: hitung skor dengan formula yang benar per kategori
    const scored = this.calculateScore(questions, answers, category);

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
      subScores:      scored as any,
      completedAt:    new Date(),
    });

    await this.draftRepo.delete({ userId, tryoutId: submission.tryoutId });
    return result;
  }

  // ── Kalkulasi skor ─────────────────────────────────────────────
  private calculateScore(
    questions: any[],
    answers: Record<string, string>,
    category: string,
  ): ScoreResult {
    const cat = (category || '').toUpperCase();
    const isSKD = cat === 'SKD' || cat === 'STIS' || cat.includes('CPNS') || cat.includes('SEKDIN');

    // Kelompokkan soal per subtes
    const bySubtest: Record<string, any[]> = {};
    for (const q of questions) {
      const key = (q.subtestCode || q.subtestName || 'UMUM').toUpperCase();
      if (!bySubtest[key]) bySubtest[key] = [];
      bySubtest[key].push(q);
    }

    const subScores: SubScore[] = [];
    let totalCorrect   = 0;
    let totalWrong     = 0;
    let totalUnanswered = 0;

    for (const [subtest, qs] of Object.entries(bySubtest)) {
      let rawScore = 0;
      let correct  = 0;
      let wrong    = 0;
      let unanswered = 0;

      for (const q of qs) {
        const userAns = (answers[q.id.toString()] || '').toLowerCase();
        const correct_ans = (q.correctAnswer || '').toLowerCase();

        if (!userAns) {
          unanswered++;
        } else if (isSKD && subtest === 'TKP') {
          // FIX B2 TKP: tidak ada konsep benar/salah — semua opsi yang dipilih
          // langsung menghasilkan skor sesuai bobotnya (a=5 b=4 c=3 d=2 e=1 default).
          // Jika soal punya optionWeights (JSON field), gunakan itu;
          // jika tidak, fallback ke TKP_OPTION_SCORES posisional.
          const weights = q.optionWeights
            ? (typeof q.optionWeights === 'string' ? JSON.parse(q.optionWeights) : q.optionWeights)
            : TKP_OPTION_SCORES;
          const score = weights[userAns] ?? TKP_OPTION_SCORES[userAns] ?? 3;
          rawScore += score;
          // Untuk TKP semua jawaban dianggap "benar" (ada nilainya)
          correct++;
        } else if (userAns === correct_ans) {  // TWK/TIU/SNBT: cek jawaban benar
          correct++;
          if (isSKD) {
            rawScore += 5; // TWK/TIU: +5 benar
          } else {
            rawScore += 1; // SNBT/PTN: +1 benar
          }
        } else {
          wrong++;
          // TWK/TIU/SNBT: tidak ada pengurangan untuk jawaban salah
        }
      }

      totalCorrect    += correct;
      totalWrong      += wrong;
      totalUnanswered += unanswered;

      // Scaled score
      let scaledScore = rawScore;
      let passingGrade: number | undefined;

      if (isSKD) {
        // SKD: skor sudah dalam skala poin langsung
        scaledScore = rawScore;
        if (subtest === 'TWK') passingGrade = 65;
        if (subtest === 'TIU') passingGrade = 80;
        if (subtest === 'TKP') passingGrade = 166;
      } else {
        // SNBT: konversi ke 0–1000
        const maxRaw = qs.length;
        scaledScore = maxRaw > 0 ? Math.round((rawScore / maxRaw) * 1000) : 0;
      }

      subScores.push({
        subtest,
        correct,
        wrong,
        unanswered,
        rawScore,
        scaledScore,
        passingGrade,
        passed: passingGrade !== undefined ? scaledScore >= passingGrade : undefined,
      });
    }

    // Hitung total
    const totalQuestions = questions.length || Object.keys(answers).length;

    let totalScore: number;
    let maxScore: number;

    if (isSKD) {
      // SKD: jumlah semua scaled score per subtes
      totalScore = subScores.reduce((s, ss) => s + ss.scaledScore, 0);
      maxScore   = 550; // max resmi SKD (175 TWK + 175 TIU + 175 TKP + 25 bonus)
    } else {
      // FIX B2: SNBT — totalScore = rata-rata scaledScore semua subtes (bukan sum)
      // Sehingga totalScore max = 1000, bukan 7000 (7 subtes x 1000)
      const totalRaw = subScores.reduce((s, ss) => s + ss.scaledScore, 0);
      totalScore = subScores.length > 0 ? Math.round(totalRaw / subScores.length) : 0;
      maxScore   = 1000;
    }

    const percentage = totalQuestions > 0
      ? Math.round((totalCorrect / totalQuestions) * 100)
      : 0;

    // Passing info untuk SKD
    let passingInfo: ScoreResult['passingInfo'];
    if (isSKD) {
      const twk = subScores.find(s => s.subtest === 'TWK');
      const tiu = subScores.find(s => s.subtest === 'TIU');
      const tkp = subScores.find(s => s.subtest === 'TKP');
      passingInfo = {
        TWK: twk ? { score: twk.scaledScore, pass: twk.scaledScore >= 65,  required: 65  } : undefined,
        TIU: tiu ? { score: tiu.scaledScore, pass: tiu.scaledScore >= 80,  required: 80  } : undefined,
        TKP: tkp ? { score: tkp.scaledScore, pass: tkp.scaledScore >= 166, required: 166 } : undefined,
        allPassed:
          (!twk || twk.scaledScore >= 65)  &&
          (!tiu || tiu.scaledScore >= 80)  &&
          (!tkp || tkp.scaledScore >= 166),
      };
    }

    return {
      subScores,
      totalScore,
      maxScore,
      percentage,
      correct:        totalCorrect,
      wrong:          totalWrong,
      unanswered:     totalUnanswered,
      totalQuestions,
      passingInfo,
    };
  }
}
