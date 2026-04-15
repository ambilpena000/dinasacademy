import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Package } from './package.entity';

@Injectable()
export class PackagesService {
  constructor(
    @InjectRepository(Package)
    private packageRepo: Repository<Package>,
  ) {}

  async findAll() {
    return this.packageRepo.find();
  }

  async findOne(id: number) {
    const pkg = await this.packageRepo.findOne({ where: { id } });
    if (!pkg) throw new NotFoundException('Package not found');
    return pkg;
  }

  async purchase(userId: number, packageId: number) {
    // Implementasi sesuai kebutuhan (misal buat order)
    return { success: true, userId, packageId };
  }
}