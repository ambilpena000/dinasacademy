import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExamResult } from './exam-result.entity';

@Injectable()
export class ResultsService {
  constructor(
    @InjectRepository(ExamResult)
    private resultRepo: Repository<ExamResult>,
  ) {}

  async getUserResults(userId: number) {
    return this.resultRepo.find({ where: { userId } });
  }

  async getResultByTryout(userId: number, tryoutId: number) {
    return this.resultRepo.findOne({ where: { userId, tryoutId } });
  }

  async getRanking(tryoutId: number) {
    return this.resultRepo.find({
      where: { tryoutId },
      order: { totalScore: 'DESC' },
    });
  }

  async createResult(data: Partial<ExamResult>) {
    const result = this.resultRepo.create(data);
    return this.resultRepo.save(result);
  }
}