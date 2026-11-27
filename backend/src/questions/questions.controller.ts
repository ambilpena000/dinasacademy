import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards, UseInterceptors,
  UploadedFile, Request, ForbiddenException, ParseIntPipe, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { QuestionsService } from './questions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TryoutsService } from '../tryouts/tryouts.service';
import { ResultsService } from '../results/results.service';
import { ImportWordDto } from './questions.service';
import { parseWordQuestions } from './word-import';

@Controller('questions')
export class QuestionsController {
  constructor(
    private readonly questionsService: QuestionsService,
    private readonly tryoutsService: TryoutsService,
    private readonly resultsService: ResultsService,
  ) {}

  // GET /questions/tryout/:tryoutId — soal per tryout (untuk exam, tanpa paginasi)
  @Get('tryout/:tryoutId')
  @UseGuards(JwtAuthGuard)
  async findByTryout(@Param('tryoutId', ParseIntPipe) tryoutId: number, @Request() req: any) {
    // Hanya peserta yang paketnya mencakup try out ini (atau admin)
    await this.tryoutsService.assertAccess(req.user, tryoutId);
    const questions = await this.questionsService.findAllByTryout(tryoutId);
    // Keamanan: strip correctAnswer & explanation agar user tidak bisa curang saat ujian.
    // optionWeights TETAP dikirim karena dibutuhkan untuk tampilan soal TKP di frontend.
    return questions.map(({ correctAnswer: _c, explanation: _e, ...rest }) => rest);
  }

  // FIX B1: endpoint pembahasan — include correctAnswer + explanation setelah ujian selesai
  @Get('tryout/:tryoutId/pembahasan')
  @UseGuards(JwtAuthGuard)
  async findByTryoutWithAnswers(@Param('tryoutId', ParseIntPipe) tryoutId: number, @Request() req: any) {
    // Kunci jawaban hanya untuk admin atau peserta yang SUDAH menyelesaikan try out ini
    if (req.user?.role !== 'admin') {
      const done = await this.resultsService.getResultByTryout(req.user.id, tryoutId);
      if (!done) throw new ForbiddenException('Pembahasan tersedia setelah kamu menyelesaikan try out ini');
    }
    return this.questionsService.findAllByTryout(tryoutId);
  }

  // POST /questions/upload — import JSON atau PDF (admin only)
  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadFile(@UploadedFile() file: any, @Request() req: any) {
    if (req.user.role !== 'admin') throw new ForbiddenException('Admin only');
    return this.questionsService.processFile(file);
  }

  // POST /questions/import-word/preview — baca file Word satu subtes, tampilkan pratinjau (belum disimpan)
  @Post('import-word/preview')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } }))
  async previewWord(@UploadedFile() file: any, @Request() req: any, @Body() body: { tryoutId?: string; subtestCode?: string }) {
    if (req.user.role !== 'admin') throw new ForbiddenException('Admin only');
    if (!file?.buffer) throw new BadRequestException('File belum dipilih');
    if (!/\.docx$/i.test(file.originalname || '')) throw new BadRequestException('Gunakan file Word .docx (bukan .doc / PDF)');
    const tryoutId = Number(body.tryoutId);
    const subtestCode = String(body.subtestCode || '').toUpperCase();
    if (!tryoutId || !subtestCode) throw new BadRequestException('Pilih try out dan subtes terlebih dahulu');
    const tryout = await this.tryoutsService.findOne(tryoutId);
    let parsed;
    try {
      parsed = await parseWordQuestions(file.buffer);
    } catch {
      throw new BadRequestException('File Word tidak dapat dibaca. Pastikan file .docx tidak rusak atau terkunci.');
    }
    return {
      tryout: { id: tryout.id, title: tryout.title, category: tryout.category },
      subtestCode,
      existingCount: await this.questionsService.countSubtest(tryoutId, subtestCode),
      resultCount: await this.resultsService.countByTryout(tryoutId),
      ...parsed,
    };
  }

  // POST /questions/import-word — simpan soal hasil pratinjau untuk satu subtes
  @Post('import-word')
  @UseGuards(JwtAuthGuard)
  async saveWord(@Request() req: any, @Body() body: ImportWordDto) {
    if (req.user.role !== 'admin') throw new ForbiddenException('Admin only');
    const tryoutId = Number(body.tryoutId);
    await this.tryoutsService.findOne(tryoutId);
    if (body.mode !== 'replace' && body.mode !== 'append') throw new BadRequestException('Mode harus replace atau append');
    if (body.mode === 'replace' && !body.force) {
      const done = await this.resultsService.countByTryout(tryoutId);
      if (done > 0) {
        throw new BadRequestException(`Try out ini sudah dikerjakan ${done} kali. Mengganti soal akan membuat hasil & pembahasan lama tidak cocok. Centang konfirmasi untuk tetap mengganti.`);
      }
    }
    return this.questionsService.importWord({ ...body, tryoutId });
  }

  // GET /questions?tryoutId=X&page=1&limit=50 — FIX #2: ada paginasi
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @Request() req: any,
    @Query('tryoutId') tryoutId?: string,
    @Query('page')     page     = '1',
    @Query('limit')    limit    = '50',
  ) {
    // Bank soal lengkap (termasuk kunci jawaban) — admin saja
    if (req.user?.role !== 'admin') throw new ForbiddenException('Admin only');
    return this.questionsService.findAll(
      tryoutId ? parseInt(tryoutId) : undefined,
      parseInt(page),
      Math.min(parseInt(limit), 5000), // cap 5000 per halaman
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Request() req: any, @Param('id') id: string) {
    if (req.user?.role !== 'admin') throw new ForbiddenException('Admin only');
    return this.questionsService.findOne(parseInt(id));
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req: any, @Body() body: any) {
    if (req.user.role !== 'admin') throw new ForbiddenException('Admin only');
    return this.questionsService.create(body);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    if (req.user.role !== 'admin') throw new ForbiddenException('Admin only');
    return this.questionsService.update(parseInt(id), body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Request() req: any, @Param('id') id: string) {
    if (req.user.role !== 'admin') throw new ForbiddenException('Admin only');
    return this.questionsService.remove(parseInt(id));
  }
}
