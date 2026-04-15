// tryouts.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tryout } from './tryout.entity';

@Injectable()
export class TryoutsService {
  constructor(
    @InjectRepository(Tryout)
    private tryoutsRepo: Repository<Tryout>,
  ) {}

  // Ambil semua tryout aktif, filter sesuai paket user
  async findAll(packageType?: string): Promise<Tryout[]> {
    const qb = this.tryoutsRepo.createQueryBuilder('t')
      .where('t.isActive = true')
      .orderBy('t.createdAt', 'ASC');

    if (packageType) {
      const allowed = this.getAllowedCategories(packageType);
      qb.andWhere('t.category IN (:...categories)', { categories: allowed });
    }

    return qb.getMany();
  }

  // Tentukan kategori tryout yang boleh diakses berdasarkan paket
  private getAllowedCategories(packageType: string): string[] {
    const pkg = packageType.toLowerCase();
    if (pkg.includes('combo'))  return ['PTN', 'SKD', 'STIS'];
    if (pkg.includes('stis'))   return ['STIS', 'SKD'];
    if (pkg.includes('skd') || pkg.includes('sekdin')) return ['SKD'];
    return ['PTN']; // default PTN Premium
  }

  async findOne(id: string): Promise<Tryout> {
    const tryout = await this.tryoutsRepo.findOne({ where: { id } });
    if (!tryout) throw new NotFoundException('Try out tidak ditemukan');
    return tryout;
  }

  async create(data: Partial<Tryout>): Promise<Tryout> {
    const tryout = this.tryoutsRepo.create(data);
    return this.tryoutsRepo.save(tryout);
  }

  async update(id: string, data: Partial<Tryout>): Promise<Tryout> {
    await this.tryoutsRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.tryoutsRepo.delete(id);
  }
}