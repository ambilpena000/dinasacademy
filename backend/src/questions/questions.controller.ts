import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards, UseInterceptors,
  UploadedFile, Request, ForbiddenException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { QuestionsService } from './questions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  // GET /questions/tryout/:tryoutId — soal per tryout (untuk exam, tanpa paginasi)
  @Get('tryout/:tryoutId')
  @UseGuards(JwtAuthGuard)
  findByTryout(@Param('tryoutId') tryoutId: string) {
    return this.questionsService.findAllByTryout(parseInt(tryoutId));
  }

  // POST /questions/upload — import JSON atau PDF (admin only)
  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadFile(@UploadedFile() file: any, @Request() req: any) {
    if (req.user.role !== 'admin') throw new ForbiddenException('Admin only');
    return this.questionsService.processFile(file);
  }

  // GET /questions?tryoutId=X&page=1&limit=50 — FIX #2: ada paginasi
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @Query('tryoutId') tryoutId?: string,
    @Query('page')     page     = '1',
    @Query('limit')    limit    = '50',
  ) {
    return this.questionsService.findAll(
      tryoutId ? parseInt(tryoutId) : undefined,
      parseInt(page),
      Math.min(parseInt(limit), 200), // cap 200 per halaman
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
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
