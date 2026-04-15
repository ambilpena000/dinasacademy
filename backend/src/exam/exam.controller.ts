// exam.controller.ts
import { Controller, Get, Put, Post, Param, Body, Request, UseGuards } from '@nestjs/common';
import { ExamService } from './exam.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('exam')
@UseGuards(JwtAuthGuard)
export class ExamController {
  constructor(private examService: ExamService) {}

  // GET /api/exam/:tryoutId/draft → ambil draft jawaban tersimpan
  @Get(':tryoutId/draft')
  getDraft(@Param('tryoutId') tryoutId: string, @Request() req) {
    return this.examService.getDraft(req.user.id, tryoutId);
  }

  // PUT /api/exam/:tryoutId/draft → auto-save jawaban
  @Put(':tryoutId/draft')
  saveDraft(
    @Param('tryoutId') tryoutId: string,
    @Request() req,
    @Body() body: { answers: Record<string, string>; currentSubtest: number }
  ) {
    return this.examService.saveDraft(req.user.id, tryoutId, body.answers, body.currentSubtest);
  }

  // POST /api/exam/:tryoutId/submit → kumpulkan jawaban
  @Post(':tryoutId/submit')
  submit(
    @Param('tryoutId') tryoutId: string,
    @Request() req,
    @Body() body: { answers: Record<string, string>; subScores: any[] }
  ) {
    return this.examService.submit(req.user.id, tryoutId, body.answers, body.subScores);
  }
}