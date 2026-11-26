import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tryout } from './tryout.entity';
import { Question } from '../questions/question.entity';
import { AccessUser, accessibleTryouts } from './tryout-access';
import { normalizeCategory } from './category';

export interface CreateTryoutDto {
  title: string;
  description: string;
  category: string;       // 'SNBT' (termasuk PTN) | 'SKD' | 'STIS'
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

  /** Daftar try out yang boleh diakses user sesuai paketnya. */
  async findAccessible(user: AccessUser | undefined) {
    return accessibleTryouts(user, await this.findAll());
  }

  /**
   * Pastikan user boleh mengerjakan try out ini (paket aktif, kategori & kuota paket).
   * Melempar 404 bila tidak ada, 403 bila tidak berhak.
   */
  async assertAccess(user: AccessUser | undefined, tryoutId: number): Promise<Tryout> {
    const all = await this.tryoutRepo.find({ order: { id: 'ASC' } });
    const tryout = all.find((t) => t.id === tryoutId);
    if (!tryout) throw new NotFoundException('Tryout tidak ditemukan');
    if (user?.role === 'admin') return tryout;
    if (!user?.hasPurchasedPackage) throw new ForbiddenException('Kamu belum berlangganan paket');
    if (!accessibleTryouts(user, all).some((t) => t.id === tryoutId)) {
      throw new ForbiddenException('Paketmu tidak termasuk tryout ini');
    }
    return tryout;
  }

  async findOne(id: number) {
    const tryout = await this.tryoutRepo.findOne({ where: { id } });
    if (!tryout) throw new NotFoundException('Tryout tidak ditemukan');
    const subjects = await this.computeSubjects(tryout.id);
    return { ...tryout, subjects };
  }

  // BUG FIX #2: create, update, remove untuk admin
  private categoryOrThrow(category?: string) {
    const c = normalizeCategory(category);
    if (!c) throw new BadRequestException('Kategori harus SNBT, SKD, atau STIS');
    return c;
  }

  async create(dto: CreateTryoutDto) {
    const tryout = this.tryoutRepo.create({
      ...dto,
      category: this.categoryOrThrow(dto.category),
      isActive: dto.isActive ?? true,
      isLocked: dto.isLocked ?? false,
    });
    return this.tryoutRepo.save(tryout);
  }

  async update(id: number, dto: Partial<CreateTryoutDto>) {
    await this.findOne(id); // throws 404 jika tidak ada
    if (dto.category !== undefined) dto = { ...dto, category: this.categoryOrThrow(dto.category) };
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
