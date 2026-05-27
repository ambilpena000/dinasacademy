import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tryout } from './tryout.entity';
import { Question } from '../questions/question.entity';

export interface CreateTryoutDto {
  title: string;
  description: string;
  category: string;       // 'SKD' | 'SNBT' | 'PTN' | 'STIS'
  difficulty: string;     // 'Mudah' | 'Sedang' | 'Sulit'
  duration: number;       // menit
  totalQuestions: number;
  isActive?: boolean;
  isLocked?: boolean;
}

@Injectable()
export class TryoutsService {
  constructor(
    @InjectRepository(Tryout)
    private tryoutRepo: Repository<Tryout>,

    @InjectRepository(Question)
    private questionRepo: Repository<Question>,
  ) {}

  private async computeSubjects(tryoutId: number) {
    const raw = await this.questionRepo
      .createQueryBuilder('q')
      .select('q.subtestCode', 'code')
      .addSelect('q.subtestName', 'name')
      .addSelect('COUNT(q.id)', 'totalQuestions')
      .where('q.tryoutId = :tryoutId', { tryoutId })
      .groupBy('q.subtestCode')
      .addGroupBy('q.subtestName')
      .getRawMany();

    return raw.map((r) => ({
      name: r.name,
      code: r.code,
      totalQuestions: parseInt(r.totalQuestions, 10),
    }));
  }

  async findAll() {
    const tryouts = await this.tryoutRepo.find({ order: { id: 'ASC' } });
    const results = await Promise.all(
      tryouts.map(async (tryout) => {
        const subjects = await this.computeSubjects(tryout.id);
        return { ...tryout, subjects };
      }),
    );
    return results;
  }

  async findOne(id: number) {
    const tryout = await this.tryoutRepo.findOne({ where: { id } });
    if (!tryout) throw new NotFoundException('Tryout tidak ditemukan');
    const subjects = await this.computeSubjects(tryout.id);
    return { ...tryout, subjects };
  }

  // BUG FIX #2: create, update, remove untuk admin
  async create(dto: CreateTryoutDto) {
    const tryout = this.tryoutRepo.create({
      ...dto,
      isActive: dto.isActive ?? true,
      isLocked: dto.isLocked ?? false,
    });
    return this.tryoutRepo.save(tryout);
  }

  async update(id: number, dto: Partial<CreateTryoutDto>) {
    await this.findOne(id); // throws 404 jika tidak ada
    await this.tryoutRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const tryout = await this.tryoutRepo.findOne({ where: { id } });
    if (!tryout) throw new NotFoundException('Tryout tidak ditemukan');
    await this.tryoutRepo.remove(tryout);
    return { deleted: true, id };
  }

  async toggleActive(id: number) {
    const tryout = await this.tryoutRepo.findOne({ where: { id } });
    if (!tryout) throw new NotFoundException('Tryout tidak ditemukan');
    await this.tryoutRepo.update(id, { isActive: !tryout.isActive });
    return this.findOne(id);
  }
}
