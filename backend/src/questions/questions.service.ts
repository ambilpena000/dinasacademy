import {
  Injectable, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './question.entity';

// ── Paginasi DTO ───────────────────────────────────────────────────
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private questionRepo: Repository<Question>,
  ) {}

  // FIX #2: Paginasi — GET /questions?page=1&limit=50&tryoutId=X
  async findAll(tryoutId?: number, page = 1, limit = 50): Promise<PaginatedResult<Question>> {
    const where = tryoutId ? { tryoutId } : {};
    const [data, total] = await this.questionRepo.findAndCount({
      where,
      relations: ['tryout'],
      order: { tryoutId: 'ASC', orderIndex: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // findAllRaw masih dipakai exam.service (ambil semua soal tryout tanpa paginasi)
  async findAllByTryout(tryoutId: number): Promise<Question[]> {
    return this.questionRepo.find({
      where: { tryoutId },
      order: { orderIndex: 'ASC' },
    });
  }

  async findOne(id: number) {
    const question = await this.questionRepo.findOne({ where: { id } });
    if (!question) throw new NotFoundException('Soal tidak ditemukan');
    return question;
  }

  async create(data: Partial<Question>) {
    const question = this.questionRepo.create(data);
    return this.questionRepo.save(question);
  }

  async update(id: number, data: Partial<Question>) {
    await this.questionRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number) {
    const question = await this.findOne(id);
    await this.questionRepo.remove(question);
    return { deleted: true };
  }

  // ── FIX #3: processFile benar-benar memproses JSON & PDF ──────────
  async processFile(file: any): Promise<{ imported: number; errors: string[] }> {
    if (!file || !file.buffer) {
      throw new BadRequestException('File tidak valid atau kosong');
    }
    const ext = (file.originalname || '').split('.').pop()?.toLowerCase();
    if (ext === 'json') return this.importFromJson(file.buffer);
    if (ext === 'pdf')  return this.importFromPdf(file.buffer);
    throw new BadRequestException('Format file tidak didukung. Gunakan .json atau .pdf');
  }

  private async importFromJson(buffer: Buffer): Promise<{ imported: number; errors: string[] }> {
    let data: any[];
    try {
      data = JSON.parse(buffer.toString('utf-8'));
    } catch {
      throw new BadRequestException('File JSON tidak valid — periksa format JSON');
    }
    if (!Array.isArray(data)) {
      throw new BadRequestException('JSON harus berupa array soal: [{ tryoutId, subtestCode, ... }]');
    }

    const errors: string[] = [];
    let imported = 0;
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const idx  = i + 1;
      if (!item.tryoutId)     { errors.push(`Soal #${idx}: tryoutId wajib`);    continue; }
      if (!item.subtestCode)  { errors.push(`Soal #${idx}: subtestCode wajib`); continue; }
      if (!item.questionText) { errors.push(`Soal #${idx}: questionText wajib`);continue; }
      if (!item.optionA || !item.optionB || !item.optionC || !item.optionD) {
        errors.push(`Soal #${idx}: optionA–D semua wajib`); continue;
      }
      if (!item.correctAnswer) { errors.push(`Soal #${idx}: correctAnswer wajib`); continue; }
      try {
        await this.questionRepo.save(this.questionRepo.create({
          tryoutId:     Number(item.tryoutId),
          subtestCode:  String(item.subtestCode),
          subtestName:  String(item.subtestName || item.subtestCode),
          questionText: String(item.questionText),
          optionA:      String(item.optionA),
          optionB:      String(item.optionB),
          optionC:      String(item.optionC),
          optionD:      String(item.optionD),
          optionE:      String(item.optionE || ''),
          correctAnswer: String(item.correctAnswer).toLowerCase(),
          explanation:  item.explanation ? String(item.explanation) : undefined,
          tips:         item.tips        ? String(item.tips)        : undefined,
          orderIndex:   Number(item.orderIndex ?? i),
        }));
        imported++;
      } catch (err: any) {
        errors.push(`Soal #${idx}: gagal simpan — ${err?.message}`);
      }
    }
    return { imported, errors };
  }

  private async importFromPdf(buffer: Buffer): Promise<{ imported: number; errors: string[] }> {
    let pdfParse: any;
    try { pdfParse = (await import('pdf-parse')).default; } catch {
      throw new BadRequestException('Library pdf-parse belum terpasang. Jalankan: npm install pdf-parse');
    }
    let fullText = '';
    try {
      const result = await pdfParse(buffer);
      fullText = result.text || '';
    } catch {
      throw new BadRequestException('Gagal membaca PDF. Pastikan PDF punya text layer (bukan scan).');
    }

    const blocks = fullText
      .split(/\n(?=\d+[.)])/g)
      .map((b: string) => b.trim())
      .filter((b: string) => b.length > 10);

    const errors: string[] = [];
    let imported = 0;
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      const idx   = i + 1;
      const optA  = block.match(/\bA[.)]\s*(.+)/i)?.[1]?.trim();
      const optB  = block.match(/\bB[.)]\s*(.+)/i)?.[1]?.trim();
      const optC  = block.match(/\bC[.)]\s*(.+)/i)?.[1]?.trim();
      const optD  = block.match(/\bD[.)]\s*(.+)/i)?.[1]?.trim();
      const optE  = block.match(/\bE[.)]\s*(.+)/i)?.[1]?.trim();
      const ans   = block.match(/JAWABAN\s*[:=]\s*([A-Ea-e])/i);
      const expl  = block.match(/PEMBAHASAN\s*[:=]\s*(.+)/is);
      const questionText = block
        .replace(/^\d+[.)]\s*/, '')
        .replace(/\n[A-Ea-e][.)].+/g, '')
        .replace(/JAWABAN\s*[:=].+/is, '')
        .replace(/PEMBAHASAN\s*[:=].+/is, '')
        .trim();

      if (!questionText || !optA || !optB || !optC || !optD || !ans) {
        errors.push(`Blok #${idx}: format tidak dikenali — lewati`); continue;
      }
      try {
        await this.questionRepo.save(this.questionRepo.create({
          tryoutId: 0, subtestCode: 'UNKNOWN', subtestName: 'Perlu diisi',
          questionText, optionA: optA, optionB: optB, optionC: optC, optionD: optD,
          optionE: optE || '', correctAnswer: ans[1].toLowerCase(),
          explanation: expl?.[1]?.trim(), orderIndex: i,
        }));
        imported++;
      } catch (err: any) {
        errors.push(`Blok #${idx}: gagal simpan — ${err?.message}`);
      }
    }
    return { imported, errors };
  }
}
