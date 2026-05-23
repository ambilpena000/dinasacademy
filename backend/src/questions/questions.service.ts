import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './question.entity';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private questionRepo: Repository<Question>,
  ) {}

  async findAll(tryoutId?: number) {
    if (tryoutId) {
      return this.questionRepo.find({ where: { tryoutId }, order: { orderIndex: 'ASC' } });
    }
    return this.questionRepo.find({ order: { tryoutId: 'ASC', orderIndex: 'ASC' } });
  }

  async findOne(id: number) {
    const question = await this.questionRepo.findOne({ where: { id } });
    if (!question) throw new NotFoundException('Question not found');
    return question;
  }

  async create(data: Partial<Question>) {
    const question = this.questionRepo.create(data);
    return this.questionRepo.save(question);
  }

  async update(id: number, data: Partial<Question>) {
    await this.questionRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number) {
    const question = await this.findOne(id);
    await this.questionRepo.remove(question);
    return { deleted: true };
  }

  async processFile(file: any) {
    return { message: 'File processed', filename: file?.originalname };
  }
}