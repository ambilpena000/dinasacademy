import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExamDraft } from './exam-draft.entity';
import { QuestionsService } from '../questions/questions.service';
import { ResultsService } from '../results/results.service';

@Injectable()
export class ExamService {
  constructor(
    @InjectRepository(ExamDraft)
    private draftRepo: Repository<ExamDraft>,
    private questionsService: QuestionsService,
    private resultsService: ResultsService,
  ) {}

  async saveDraft(userId: number, data: { tryoutId: number; answers: Record<string, string>; currentSubtest: string }) {
    let draft = await this.draftRepo.findOne({ where: { userId, tryoutId: data.tryoutId } });
    if (draft) {
      draft.answers = data.answers;
      draft.currentSubtest = data.currentSubtest;
      draft.savedAt = new Date();
    } else {
      draft = this.draftRepo.create({
        userId,
        tryoutId: data.tryoutId,
        answers: data.answers,
        currentSubtest: data.currentSubtest,
      });
    }
    return this.draftRepo.save(draft);
  }

  async getDraft(userId: number, tryoutId: number) {
    const draft = await this.draftRepo.findOne({ where: { userId, tryoutId } });
    if (!draft) {
      return { answers: {}, currentSubtest: '' };
    }
    return draft;
  }

  async submitExam(userId: number, submission: { tryoutId: number; answers: Record<string, string> }) {
    const questions = await this.questionsService.findAll(submission.tryoutId);
    let correctCount = 0;
    const answers = submission.answers;

    for (const q of questions) {
      const userAnswer = answers[q.id.toString()] || '';
      if (userAnswer === q.correctAnswer) correctCount++;
    }

    const totalQuestions = questions.length;
    const score = (correctCount / totalQuestions) * 100;

    const result = await this.resultsService.createResult({
      userId,
      tryoutId: submission.tryoutId,
      tryoutTitle: questions[0]?.subtestName || 'Tryout',
      category: 'Umum',
      answers: submission.answers,
      correct: correctCount,
      wrong: totalQuestions - correctCount,
      unanswered: totalQuestions - Object.keys(answers).length,
      totalQuestions,
      totalScore: score,
      maxScore: 100,
      percentage: score,
      rank: 0,
      totalParticipants: 1,
      subScores: {},
      completedAt: new Date(),
    });

    await this.draftRepo.delete({ userId, tryoutId: submission.tryoutId });
    return result;
  }
}