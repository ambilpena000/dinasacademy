import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExamDraft } from './exam-draft.entity';
import { QuestionsService } from '../questions/questions.service';
import { ResultsService } from '../results/results.service';
import { TryoutsService } from '../tryouts/tryouts.service';

@Injectable()
export class ExamService {
  constructor(
    @InjectRepository(ExamDraft)
    private draftRepo: Repository<ExamDraft>,
    private questionsService: QuestionsService,
    private resultsService: ResultsService,
    private tryoutsService: TryoutsService,
  ) {}

  async saveDraft(userId: number, data: { tryoutId: number; answers: Record<string, string>; currentSubtest: string | number }) {
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
    if (!draft) {
      return { answers: {}, currentSubtest: 0 };
    }
    return draft;
  }

  async submitExam(userId: number, submission: {
    tryoutId: number;
    answers: Record<string, string>;
    subScores?: any[];
  }) {
    // Ambil info tryout
    let tryoutTitle = 'Tryout';
    let category = 'PTN';
    try {
      const tryout = await this.tryoutsService.findOne(submission.tryoutId);
      tryoutTitle = tryout.title;
      category = tryout.category;
    } catch (e) { /* tryout mungkin tidak ada di DB */ }

    // Hitung skor dari backend (jika questions ada di DB)
    const questions = await this.questionsService.findAll(submission.tryoutId);
    const answers = submission.answers;
    let correctCount = 0;
    let wrongCount = 0;
    const totalAnswered = Object.keys(answers).length;

    if (questions.length > 0) {
      for (const q of questions) {
        const userAnswer = answers[q.id.toString()] || '';
        if (userAnswer) {
          if (userAnswer.toLowerCase() === q.correctAnswer.toLowerCase()) correctCount++;
          else wrongCount++;
        }
      }
    }

    const totalQuestions = questions.length || totalAnswered;
    const unanswered = totalQuestions - totalAnswered;
    const maxScore = 1000;
    const totalScore = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * maxScore) : 0;
    const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    const result = await this.resultsService.createResult({
      userId,
      tryoutId: submission.tryoutId,
      tryoutTitle,
      category,
      answers: submission.answers,
      correct: correctCount,
      wrong: wrongCount,
      unanswered,
      totalQuestions,
      totalScore,
      maxScore,
      percentage,
      rank: 0,
      totalParticipants: 1,
      subScores: submission.subScores || {},
      completedAt: new Date(),
    });

    // Hapus draft setelah submit
    await this.draftRepo.delete({ userId, tryoutId: submission.tryoutId });
    return result;
  }
}