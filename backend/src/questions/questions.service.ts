import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './question.entity';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private questionsRepo: Repository<Question>,
  ) {}

  async findAll(tryoutId?: string): Promise<Question[]> {
    const where: any = {};
    if (tryoutId) where.tryoutId = tryoutId;
    return this.questionsRepo.find({
      where,
      order: { subtestCode: 'ASC', orderIndex: 'ASC' },
    });
  }

  async findByTryout(tryoutId: string): Promise<Question[]> {
    return this.questionsRepo.find({
      where: { tryoutId },
      order: { subtestCode: 'ASC', orderIndex: 'ASC' },
    });
  }

  async create(data: Partial<Question>): Promise<Question> {
    const q = this.questionsRepo.create(data);
    return this.questionsRepo.save(q);
  }

  async update(id: string, data: Partial<Question>): Promise<Question | null> {  // Fix: tambah | null
    await this.questionsRepo.update(id, data);
    return this.questionsRepo.findOne({ where: { id } });
  }

  async remove(id: string): Promise<void> {
    await this.questionsRepo.delete(id);
  }

  async bulkCreate(questions: Partial<Question>[]): Promise<Question[]> {
    const entities = this.questionsRepo.create(questions);
    return this.questionsRepo.save(entities);
  }
}