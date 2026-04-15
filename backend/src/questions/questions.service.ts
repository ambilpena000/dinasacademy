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
      return this.questionRepo.find({ where: { tryoutId } });
    }
    return this.questionRepo.find();
  }

  async findOne(id: number) {
    const question = await this.questionRepo.findOne({ where: { id } });
    if (!question) throw new NotFoundException('Question not found');
    return question;
  }

  async processFile(file: any) {
    return { message: 'File processed', filename: file.originalname };
  }
}