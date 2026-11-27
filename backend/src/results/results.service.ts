import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExamResult } from './exam-result.entity';
import {
  isSkdCategory, rankBestAttempts, SKD_PASSING_GRADE, SKD_SUBTESTS, subScoreMap, subtestRanks,
} from '../exam/scoring';
import { normalizeCategory } from '../tryouts/category';

@Injectable()
export class ResultsService {
  constructor(
    @InjectRepository(ExamResult)
    private resultRepo: Repository<ExamResult>,
  ) {}

  async getUserResults(userId: number) {
    return this.resultRepo.find({ 
      where: { userId },
      order: { completedAt: 'DESC' }
    });
  }

  /** Jumlah hasil ujian (semua peserta) untuk satu try out. */
  async countByTryout(tryoutId: number) {
    return this.resultRepo.count({ where: { tryoutId } });
  }

  async getResultByTryout(userId: number, tryoutId: number) {
    return this.resultRepo.findOne({ where: { userId, tryoutId } });
  }

  /**
   * Papan peringkat satu try out: satu baris per peserta (nilai terbaiknya).
   * SKD: urut total, tie-break TKP > TIU > TWK; sertakan peringkat per subtes & status passing grade.
   */
  async getRanking(tryoutId: number) {
    const results = await this.resultRepo.find({ where: { tryoutId } });
    const category = normalizeCategory(results[0]?.category) ?? (results[0]?.category || null);
    if (!results.length) {
      return { tryoutId, category, participants: 0, subtests: [], topBySubtest: {}, passingGrade: null, entries: [] };
    }
    const skd = isSkdCategory(category);
    const { leaderboard, participants } = rankBestAttempts(results, category || '');
    const best = leaderboard.map((x) => x.item);

    // Urutan subtes: SKD baku (TWK, TIU, TKP); SNBT sesuai urutan di hasil
    const subtests: string[] = skd
      ? [...SKD_SUBTESTS]
      : [...new Set(best.flatMap((r) => Object.keys(subScoreMap(r.subScores))))];
    const ranksBySubtest = subtestRanks(best, subtests);
    const topBySubtest: Record<string, number> = {};
    for (const code of subtests) {
      topBySubtest[code] = Math.max(0, ...best.map((r) => subScoreMap(r.subScores)[code] ?? 0));
    }

    const attempts = new Map<number, number>();
    for (const r of results) attempts.set(r.userId, (attempts.get(r.userId) || 0) + 1);

    return {
      tryoutId,
      category,
      participants,
      subtests,
      topBySubtest,
      passingGrade: skd ? SKD_PASSING_GRADE : null,
      entries: leaderboard.map(({ item, rank }) => {
        const scores = subScoreMap(item.subScores);
        const subtestRank: Record<string, number> = {};
        for (const code of subtests) subtestRank[code] = ranksBySubtest[code].get(item.userId)!;
        return {
          rank,
          userId: item.userId,
          totalScore: Math.round(Number(item.totalScore)),
          subScores: Object.fromEntries(subtests.map((c) => [c, scores[c] ?? 0])),
          subtestRank,
          passed: skd ? subtests.every((c) => (scores[c] ?? 0) >= SKD_PASSING_GRADE[c]) : null,
          attempts: attempts.get(item.userId) || 1,
          completedAt: item.completedAt,
        };
      }),
    };
  }

  async createResult(data: Partial<ExamResult>) {
    const result = this.resultRepo.create(data);
    return this.resultRepo.save(result);
  }

  async findByTryout(tryoutId: number) {
    return this.resultRepo.find({ where: { tryoutId } });
  }

  async findById(id: number) {
    return this.resultRepo.findOne({ where: { id } });
  }

  async saveMany(results: ExamResult[]) {
    return this.resultRepo.save(results, { chunk: 200 });
  }

  // FIX B8: update rank setelah skor semua peserta diketahui
  async updateRank(resultId: number, rank: number, totalParticipants: number) {
    await this.resultRepo.update(resultId, { rank, totalParticipants });
  }
}