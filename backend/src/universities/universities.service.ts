import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { University } from './university.entity';
import { Major } from './major.entity';
import {
  CreateMajorDto, CreateUniversityDto, PassingGradeRowDto, UpdateMajorDto, UpdateUniversityDto,
} from './universities.dto';

export interface MajorSearchQuery {
  universityId?: number;
  search?: string;
  peminatan?: string;
  jenjang?: string;
  missingPassingGrade?: boolean;
  includeInactive?: boolean;
  page?: number;
  limit?: number;
}

@Injectable()
export class UniversitiesService {
  constructor(
    @InjectRepository(University) private uniRepo: Repository<University>,
    @InjectRepository(Major) private majorRepo: Repository<Major>,
    private dataSource: DataSource,
  ) {}

  // ── Universitas ────────────────────────────────────────────────
  async listUniversities(search?: string, includeInactive = false) {
    const qb = this.uniRepo.createQueryBuilder('u')
      .loadRelationCountAndMap('u.majorCount', 'u.majors', 'm',
        (q) => (includeInactive ? q : q.andWhere('m.isActive = true')))
      .loadRelationCountAndMap('u.passingGradeCount', 'u.majors', 'pg',
        (q) => q.andWhere('pg.passingGrade IS NOT NULL'))
      .orderBy('u.name', 'ASC');
    if (!includeInactive) qb.andWhere('u.isActive = true');
    if (search?.trim()) {
      qb.andWhere('(u.name ILIKE :s OR u.shortName ILIKE :s OR CAST(u.id AS TEXT) LIKE :s)', {
        s: `%${search.trim()}%`,
      });
    }
    return qb.getMany();
  }

  async getUniversity(id: number) {
    const uni = await this.uniRepo.findOne({ where: { id } });
    if (!uni) throw new NotFoundException('Universitas tidak ditemukan');
    return uni;
  }

  async createUniversity(dto: CreateUniversityDto) {
    if (await this.uniRepo.exist({ where: { id: dto.id } })) {
      throw new ConflictException(`Kode PTN ${dto.id} sudah dipakai`);
    }
    return this.uniRepo.save(this.uniRepo.create(dto));
  }

  async updateUniversity(id: number, dto: UpdateUniversityDto) {
    const uni = await this.getUniversity(id);
    Object.assign(uni, dto);
    return this.uniRepo.save(uni);
  }

  async deleteUniversity(id: number) {
    const uni = await this.getUniversity(id);
    await this.uniRepo.remove(uni); // prodi ikut terhapus (ON DELETE CASCADE)
    return { success: true };
  }

  // ── Program Studi ──────────────────────────────────────────────
  async listMajorsOfUniversity(universityId: number, peminatan?: string, jenjang?: string) {
    await this.getUniversity(universityId);
    const where: any = { universityId, isActive: true };
    if (peminatan) where.peminatan = peminatan.toUpperCase();
    if (jenjang) where.jenjang = jenjang.toUpperCase();
    return this.majorRepo.find({ where, order: { jenjang: 'ASC', name: 'ASC' } });
  }

  async searchMajors(q: MajorSearchQuery) {
    const page = Math.max(1, q.page || 1);
    const limit = Math.min(Math.max(1, q.limit || 50), 500);
    const qb = this.majorRepo.createQueryBuilder('m')
      .leftJoinAndSelect('m.university', 'u')
      .orderBy('u.name', 'ASC')
      .addOrderBy('m.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);
    if (!q.includeInactive) qb.andWhere('m.isActive = true AND u.isActive = true');
    if (q.universityId) qb.andWhere('m.universityId = :uid', { uid: q.universityId });
    if (q.peminatan === 'NONE') qb.andWhere('m.peminatan IS NULL');
    else if (q.peminatan) qb.andWhere('m.peminatan = :p', { p: q.peminatan.toUpperCase() });
    if (q.jenjang) qb.andWhere('m.jenjang = :j', { j: q.jenjang.toUpperCase() });
    if (q.missingPassingGrade) qb.andWhere('m.passingGrade IS NULL');
    if (q.search?.trim()) {
      // Sinonim: nama resmi SNPMB beda antar kampus (UI "Pendidikan Dokter" vs UGM "Kedokteran")
      const raw = q.search.trim();
      const alt = raw.toLowerCase()
        .replace(/kedokteran/g, 'dokter')
        .replace(/ilmu komputer|teknik informatika/g, 'informatika');
      qb.andWhere('(m.name ILIKE :s OR m.name ILIKE :alt OR CAST(m.id AS TEXT) LIKE :s)', {
        s: `%${raw}%`, alt: `%${alt}%`,
      });
    }
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async getMajor(id: number) {
    const major = await this.majorRepo.findOne({ where: { id }, relations: ['university'] });
    if (!major) throw new NotFoundException('Program studi tidak ditemukan');
    return major;
  }

  async createMajor(dto: CreateMajorDto) {
    await this.getUniversity(dto.universityId);
    if (await this.majorRepo.exist({ where: { id: dto.id } })) {
      throw new ConflictException(`Kode prodi ${dto.id} sudah dipakai`);
    }
    return this.majorRepo.save(this.majorRepo.create({
      ...dto,
      passingGradeSource: dto.passingGrade != null ? 'manual' : null,
    }));
  }

  async updateMajor(id: number, dto: UpdateMajorDto) {
    const major = await this.majorRepo.findOne({ where: { id } });
    if (!major) throw new NotFoundException('Program studi tidak ditemukan');
    const pgChanged = dto.passingGrade !== undefined && dto.passingGrade !== major.passingGrade;
    Object.assign(major, dto);
    // Nilai dari admin dikunci sebagai 'manual'; dikosongkan → diisi ulang estimasi saat seed berikutnya
    if (pgChanged) major.passingGradeSource = major.passingGrade === null ? null : 'manual';
    return this.majorRepo.save(major);
  }

  async deleteMajor(id: number) {
    const res = await this.majorRepo.delete({ id });
    if (!res.affected) throw new NotFoundException('Program studi tidak ditemukan');
    return { success: true };
  }

  // Import massal passing grade: [{ id: kodeProdi, passingGrade }]
  async importPassingGrades(rows: PassingGradeRowDto[]) {
    const ids = [...new Set(rows.map((r) => r.id))];
    const existing = await this.majorRepo.find({ where: { id: In(ids) }, select: ['id'] });
    const found = new Set(existing.map((m) => m.id));
    const valid = rows.filter((r) => found.has(r.id));

    await this.dataSource.transaction(async (em) => {
      for (const r of valid) {
        await em.update(Major, { id: r.id }, {
          passingGrade: r.passingGrade,
          passingGradeSource: r.passingGrade === null ? null : 'manual',
        });
      }
    });
    return {
      updated: valid.length,
      notFound: ids.filter((id) => !found.has(id)),
    };
  }
}
