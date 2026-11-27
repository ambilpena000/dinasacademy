import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Package } from './package.entity';

export interface PackageDto {
  name?: string;
  description?: string;
  price?: number;
  originalPrice?: number | null;
  isFree?: boolean;
  duration?: number;
  track?: string;
  type?: string;
  features?: string[];
  includedTryouts?: string[];
  tryoutIds?: number[];
  isActive?: boolean;
}

@Injectable()
export class PackagesService {
  constructor(
    @InjectRepository(Package)
    private packageRepo: Repository<Package>,
  ) {}

  /** Paket yang ditampilkan ke peserta (hanya yang aktif). Gratis tampil lebih dulu. */
  async findActive() {
    const list = await this.packageRepo.find({ where: { isActive: true }, order: { id: 'ASC' } });
    return list.sort((a, b) => Number(b.isFree) - Number(a.isFree));
  }

  /** Semua paket (admin). */
  async findAll() {
    return this.packageRepo.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number) {
    const pkg = await this.packageRepo.findOne({ where: { id } });
    if (!pkg) throw new NotFoundException('Paket tidak ditemukan');
    return pkg;
  }

  private clean(dto: PackageDto): Partial<Package> {
    const out: Partial<Package> = {};
    if (dto.name !== undefined) {
      if (!String(dto.name).trim()) throw new BadRequestException('Nama paket wajib diisi');
      out.name = String(dto.name).trim();
    }
    if (dto.description !== undefined) out.description = String(dto.description);
    if (dto.isFree !== undefined) out.isFree = !!dto.isFree;
    if (dto.price !== undefined) {
      const price = Number(dto.price);
      if (!Number.isFinite(price) || price < 0) throw new BadRequestException('Harga tidak valid');
      out.price = price;
    }
    if (dto.originalPrice !== undefined) {
      const op = dto.originalPrice === null || dto.originalPrice === ('' as any) ? null : Number(dto.originalPrice);
      if (op !== null && (!Number.isFinite(op) || op < 0)) throw new BadRequestException('Harga coret tidak valid');
      out.originalPrice = op;
    }
    if (dto.duration !== undefined) out.duration = Math.max(1, Math.round(Number(dto.duration) || 365));
    if (dto.track !== undefined) out.track = String(dto.track);
    if (dto.type !== undefined) {
      if (!String(dto.type).trim()) throw new BadRequestException('Jenis paket wajib diisi');
      out.type = String(dto.type).trim();
    }
    // features disimpan dipisah koma (simple-array) → koma di dalam fitur diganti "·" agar tidak terpecah
    if (dto.features !== undefined) out.features = (dto.features || []).map((f) => String(f).replace(/\s*,\s*/g, ' · ').trim()).filter(Boolean);
    if (dto.includedTryouts !== undefined) out.includedTryouts = (dto.includedTryouts || []).map((t) => String(t).replace(/\s*,\s*/g, ' ')).filter(Boolean);
    if (dto.tryoutIds !== undefined) out.tryoutIds = [...new Set((dto.tryoutIds || []).map(Number).filter((n) => Number.isInteger(n) && n > 0))];
    if (dto.isActive !== undefined) out.isActive = !!dto.isActive;
    // Paket gratis selalu berharga 0
    if (out.isFree) out.price = 0;
    return out;
  }

  async create(dto: PackageDto) {
    const data = this.clean(dto);
    if (!data.name || !data.type) throw new BadRequestException('Nama dan jenis paket wajib diisi');
    const pkg = this.packageRepo.create({
      description: '', price: 0, duration: 365, track: data.type, features: [], includedTryouts: [],
      tryoutIds: [], isActive: true, isFree: false, ...data,
    });
    return this.packageRepo.save(pkg);
  }

  async update(id: number, dto: PackageDto) {
    const pkg = await this.findOne(id);
    const data = this.clean(dto);
    if (dto.isFree === false && dto.price === undefined && Number(pkg.price) === 0 && pkg.originalPrice) {
      data.price = Number(pkg.originalPrice); // gratis → berbayar: pakai harga coret sebagai harga
    }
    Object.assign(pkg, data);
    if (pkg.isFree) pkg.price = 0;
    return this.packageRepo.save(pkg);
  }

  async remove(id: number) {
    const pkg = await this.findOne(id);
    await this.packageRepo.remove(pkg);
    return { deleted: true, id };
  }
}
