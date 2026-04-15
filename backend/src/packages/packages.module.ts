import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PackageEntity } from './package.entity';

// ── Service ───────────────────────────────────────────────────────
@Injectable()
export class PackagesService {
  constructor(
    @InjectRepository(PackageEntity)
    private packagesRepo: Repository<PackageEntity>,
  ) {}

  findAll(): Promise<PackageEntity[]> {
    return this.packagesRepo.find({
      where: { isActive: true },
      order: { price: 'ASC' },
    });
  }

  // Fix: return Promise<PackageEntity | null>
  findOne(id: string): Promise<PackageEntity | null> {
    return this.packagesRepo.findOne({ where: { id } });
  }

  create(data: Partial<PackageEntity>): Promise<PackageEntity> {
    return this.packagesRepo.save(this.packagesRepo.create(data));
  }

  async update(id: string, data: Partial<PackageEntity>): Promise<PackageEntity | null> {
    await this.packagesRepo.update(id, data);
    return this.findOne(id);
  }
}

// ── Controller ────────────────────────────────────────────────────
import { Controller, Get, Post, Put, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('packages')
export class PackagesController {
  constructor(private packagesService: PackagesService) {}

  @Get()
  findAll() { return this.packagesService.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.packagesService.findOne(id); }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() body: any) { return this.packagesService.create(body); }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() body: any) {
    return this.packagesService.update(id, body);
  }
}

// ── Module ────────────────────────────────────────────────────────
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([PackageEntity])],
  providers: [PackagesService],
  controllers: [PackagesController],
  exports: [PackagesService],
})
export class PackagesModule {}