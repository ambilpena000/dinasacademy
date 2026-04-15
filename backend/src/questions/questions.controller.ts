// questions.controller.ts
import {
  Controller, Get, Post, Put, Delete,
  Param, Body, Query, UseGuards, UploadedFile, UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { QuestionsService } from './questions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('questions')
@UseGuards(JwtAuthGuard)
export class QuestionsController {
  constructor(private questionsService: QuestionsService) {}

  // GET /api/questions?tryoutId=xxx → semua soal (admin)
  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  findAll(@Query('tryoutId') tryoutId?: string) {
    return this.questionsService.findAll(tryoutId);
  }

  // GET /api/questions/tryout/:id → soal untuk ujian
  @Get('tryout/:id')
  findByTryout(@Param('id') id: string) {
    return this.questionsService.findByTryout(id);
  }

  // POST /api/questions → tambah soal (admin)
  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  create(@Body() body: any) {
    return this.questionsService.create(body);
  }

  // POST /api/questions/import → import dari CSV (admin)
  @Post('import')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('file'))
  async importCsv(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    // Parse CSV sederhana
    const content = file.buffer.toString('utf-8');
    const rows = content.split('\n').slice(1); // skip header
    const questions = rows
      .filter(row => row.trim())
      .map(row => {
        const cols = row.split(',');
        return {
          tryoutId: body.tryoutId,
          subtestCode: cols[0]?.trim(),
          subtestName: cols[1]?.trim(),
          questionText: cols[2]?.trim(),
          optionA: cols[3]?.trim(),
          optionB: cols[4]?.trim(),
          optionC: cols[5]?.trim(),
          optionD: cols[6]?.trim(),
          correctAnswer: cols[7]?.trim().toLowerCase(),
          explanation: cols[8]?.trim(),
        };
      });
    return this.questionsService.bulkCreate(questions);
  }

  // PUT /api/questions/:id → update soal (admin)
  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() body: any) {
    return this.questionsService.update(id, body);
  }

  // DELETE /api/questions/:id → hapus soal (admin)
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.questionsService.remove(id);
  }
}