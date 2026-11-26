import {
  Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards,
} from '@nestjs/common';
import { UniversitiesService } from './universities.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import {
  CreateMajorDto, CreateUniversityDto, ImportPassingGradeDto, UpdateMajorDto, UpdateUniversityDto,
} from './universities.dto';

const toInt = (v?: string) => (v ? parseInt(v, 10) || undefined : undefined);

// ── /universities ─────────────────────────────────────────────────
// GET bersifat publik (dipakai dropdown profil & analisis hasil).
@Controller('universities')
export class UniversitiesController {
  constructor(private readonly service: UniversitiesService) {}

  @Get()
  list(@Query('search') search?: string) {
    return this.service.listUniversities(search);
  }

  // Admin: termasuk universitas nonaktif
  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  listAll(@Query('search') search?: string) {
    return this.service.listUniversities(search, true);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.getUniversity(id);
  }

  @Get(':id/majors')
  majors(
    @Param('id', ParseIntPipe) id: number,
    @Query('peminatan') peminatan?: string,
    @Query('jenjang') jenjang?: string,
  ) {
    return this.service.listMajorsOfUniversity(id, peminatan, jenjang);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() dto: CreateUniversityDto) {
    return this.service.createUniversity(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUniversityDto) {
    return this.service.updateUniversity(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteUniversity(id);
  }
}

// ── /majors ───────────────────────────────────────────────────────
@Controller('majors')
export class MajorsController {
  constructor(private readonly service: UniversitiesService) {}

  // Publik: cari prodi lintas PTN (aktif saja)
  @Get()
  search(
    @Query('universityId') universityId?: string,
    @Query('search') search?: string,
    @Query('peminatan') peminatan?: string,
    @Query('jenjang') jenjang?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.searchMajors({
      universityId: toInt(universityId), search, peminatan, jenjang,
      page: toInt(page), limit: toInt(limit),
    });
  }

  // Admin: termasuk nonaktif + filter passing grade kosong
  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  searchAdmin(
    @Query('universityId') universityId?: string,
    @Query('search') search?: string,
    @Query('peminatan') peminatan?: string,
    @Query('jenjang') jenjang?: string,
    @Query('missingPassingGrade') missing?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.searchMajors({
      universityId: toInt(universityId), search, peminatan, jenjang,
      missingPassingGrade: missing === 'true', includeInactive: true,
      page: toInt(page), limit: toInt(limit),
    });
  }

  @Post('passing-grades/import')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  importPassingGrades(@Body() dto: ImportPassingGradeDto) {
    return this.service.importPassingGrades(dto.rows);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.getMajor(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() dto: CreateMajorDto) {
    return this.service.createMajor(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMajorDto) {
    return this.service.updateMajor(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteMajor(id);
  }
}
