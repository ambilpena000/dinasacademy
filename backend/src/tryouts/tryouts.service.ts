import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Tryout } from './tryout.entity';
import { Question } from '../questions/question.entity';
import { AccessUser, Entitlement, accessibleTryouts } from './tryout-access';
import { Order } from '../orders/order.entity';
import { Package } from '../packages/package.entity';
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

    @InjectRepository(Order)
    private orderRepo: Repository<Order>,

    @InjectRepository(Package)
    private packageRepo: Repository<Package>,
  ) {}

  /**
   * Lengkapi user dengan paket-paket aktifnya (pesanan berstatus "active").
   * Paket yang punya pilihan try out dari admin → hanya try out itu; selain itu → sesuai kategori paket.
   * User tanpa pesanan aktif (mis. diaktifkan manual) tetap memakai packageType.
   */
  private async withEntitlements(user: AccessUser | undefined): Promise<AccessUser | undefined> {
    if (!user?.id || user.role === 'admin') return user;
    const orders = await this.orderRepo.find({ where: { userId: user.id, status: 'active' } });
    if (!orders.length) return user;
    const pkgIds = [...new Set(orders.map((o) => o.packageId).filter((x): x is number => !!x))];
    const pkgs = pkgIds.length ? await this.packageRepo.find({ where: { id: In(pkgIds) } }) : [];
    const byId = new Map(pkgs.map((p) => [p.id, p]));
    const entitlements: Entitlement[] = orders.map((o) => {
      const pkg = o.packageId ? byId.get(o.packageId) : undefined;
      return pkg
        ? { packageType: pkg.type, tryoutIds: (pkg.tryoutIds || []).map(Number) }
        : { packageType: o.packageType };
    });
    return { ...user, hasPurchasedPackage: true, entitlements };
  }

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
    return accessibleTryouts(await this.withEntitlements(user), await this.findAll());
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
    const u = await this.withEntitlements(user);
    if (!u?.hasPurchasedPackage) throw new ForbiddenException('Kamu belum berlangganan paket');
    if (!accessibleTryouts(u, all).some((t) => t.id === tryoutId)) {
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
