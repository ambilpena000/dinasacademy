import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tryout } from './tryout.entity';

@Injectable()
export class TryoutsService {
  constructor(
    @InjectRepository(Tryout)
    private tryoutRepo: Repository<Tryout>,
  ) {}

  async findAll() {
    return this.tryoutRepo.find();
  }

  async findOne(id: number) {
    const tryout = await this.tryoutRepo.findOne({ where: { id } });
    if (!tryout) throw new NotFoundException('Tryout not found');
    return tryout;
  }

  async purchase(userId: number, data: any) {
    // implementasi sesuai kebutuhan
    return { success: true };
  }
}