// exam.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExamDraft } from './exam-draft.entity';
import { ResultsService } from '../results/results.service';
import { QuestionsService } from '../questions/questions.service';
import { TryoutsService } from '../tryouts/tryouts.service';

@Injectable()
export class ExamService {
  constructor(
    @InjectRepository(ExamDraft)
    private draftsRepo: Repository<ExamDraft>,
    private resultsService: ResultsService,
    private questionsService: QuestionsService,
    private tryoutsService: TryoutsService,
  ) {}

  // Ambil draft jawaban (auto-save)
  async getDraft(userId: string, tryoutId: string): Promise<ExamDraft | null> {
    return this.draftsRepo.findOne({ where: { userId, tryoutId } });
  }

  // Simpan draft jawaban
  async saveDraft(userId: string, tryoutId: string, answers: Record<string, string>, currentSubtest: number) {
    const existing = await this.getDraft(userId, tryoutId);
    if (existing) {
      existing.answers = answers;
      existing.currentSubtest = currentSubtest;
      return this.draftsRepo.save(existing);
    }
    const draft = this.draftsRepo.create({ userId, tryoutId, answers, currentSubtest });
    return this.draftsRepo.save(draft);
  }

  // Kumpulkan jawaban & hitung skor
  async submit(userId: string, tryoutId: string, answers: Record<string, string>, subScoresData: any[]) {
    const tryout = await this.tryoutsService.findOne(tryoutId);
    const questions = await this.questionsService.findByTryout(tryoutId);

    // Hitung skor
    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i.toString()] === q.correctAnswer) correct++;
    });

    const totalQ = questions.length;
    const wrong = Object.keys(answers).length - correct;
    const unanswered = totalQ - Object.keys(answers).length;
    const totalScore = Math.round((correct / totalQ) * 1000);
    const percentage = parseFloat(((correct / totalQ) * 100).toFixed(2));

    // Ambil total peserta untuk ranking sementara
    const ranking = await this.resultsService.getRanking(tryoutId);
    const rank = ranking.entries.filter(e => e.score > totalScore).length + 1;

    // Simpan hasil
    const result = await this.resultsService.save({
      userId,
      tryoutId,
      tryoutTitle: tryout.title,
      category: tryout.category,
      answers,
      correct,
      wrong,
      unanswered,
      totalQuestions: totalQ,
      totalScore,
      maxScore: 1000,
      percentage,
      rank,
      totalParticipants: ranking.totalParticipants + 1,
      subScores: subScoresData,
    });

    // Hapus draft setelah submit
    await this.draftsRepo.delete({ userId, tryoutId });

    return result;
  }
}