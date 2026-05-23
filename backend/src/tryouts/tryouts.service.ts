import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tryout } from './tryout.entity';
import { Question } from '../questions/question.entity';

@Injectable()
export class TryoutsService {
  constructor(
    @InjectRepository(Tryout)
    private tryoutRepo: Repository<Tryout>,

    @InjectRepository(Question)
    private questionRepo: Repository<Question>,
  ) {}

  /**
   * Hitung subjects dari tabel questions berdasarkan tryoutId.
   * Mengelompokkan berdasarkan subtestCode + subtestName dan menghitung jumlah soal.
   */
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

    // Hitung subjects untuk semua tryout secara paralel
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
    if (!tryout) throw new NotFoundException('Tryout not found');

    const subjects = await this.computeSubjects(tryout.id);
    return { ...tryout, subjects };
  }

  async purchase(userId: number, data: any) {
    // implementasi sesuai kebutuhan
    return { success: true };
  }
}