import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExamResult } from './exam-result.entity';

@Injectable()
export class ResultsService {
  constructor(
    @InjectRepository(ExamResult)
    private resultsRepo: Repository<ExamResult>,
  ) {}

  async save(data: Partial<ExamResult>): Promise<ExamResult> {
    await this.resultsRepo.delete({ userId: data.userId, tryoutId: data.tryoutId });
    const result = this.resultsRepo.create(data);
    return this.resultsRepo.save(result);
  }

  async findByUser(userId: string): Promise<ExamResult[]> {
    return this.resultsRepo.find({
      where: { userId },
      order: { completedAt: 'DESC' },
    });
  }

  async findOne(userId: string, tryoutId: string): Promise<ExamResult | null> {  // Fix: tambah | null
    return this.resultsRepo.findOne({ where: { userId, tryoutId } });
  }

  async getRanking(tryoutId: string): Promise<{
    entries: any[];
    totalParticipants: number;
  }> {
    const results = await this.resultsRepo.find({
      where: { tryoutId },
      order: { totalScore: 'DESC' },
      select: ['id', 'userId', 'totalScore', 'percentage', 'completedAt'],
    });

    const entries = results.map((r, index) => ({
      rank: index + 1,
      userId: r.userId,
      score: r.totalScore,
      percentage: r.percentage,
    }));

    return { entries, totalParticipants: results.length };
  }

  async findAll(): Promise<ExamResult[]> {
    return this.resultsRepo.find({ order: { completedAt: 'DESC' } });
  }
}