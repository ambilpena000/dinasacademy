import { Controller, Post, Get, Put, Body, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ExamService } from './exam.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { TryoutsService } from '../tryouts/tryouts.service';

@Controller('exam')
@UseGuards(JwtAuthGuard)
export class ExamController {
  constructor(private examService: ExamService, private tryoutsService: TryoutsService) {}

  // Frontend: GET /exam/:tryoutId/draft
  @Get(':tryoutId/draft')
  async getDraft(@Request() req: any, @Param('tryoutId', ParseIntPipe) tryoutId: number) {
    await this.tryoutsService.assertAccess(req.user, tryoutId);
    return this.examService.getDraft(req.user.id, tryoutId);
  }

  // Frontend: PUT /exam/:tryoutId/draft
  @Put(':tryoutId/draft')
  async saveDraft(
    @Request() req: any,
    @Param('tryoutId', ParseIntPipe) tryoutId: number,
    @Body() body: any,
  ) {
    await this.tryoutsService.assertAccess(req.user, tryoutId);
    return this.examService.saveDraft(req.user.id, {
      tryoutId,
      answers: body.answers,
      currentSubtest: body.currentSubtest,
    });
  }

  // Frontend: POST /exam/:tryoutId/submit
  @Post(':tryoutId/submit')
  async submitExam(
    @Request() req: any,
    @Param('tryoutId', ParseIntPipe) tryoutId: number,
    @Body() body: any,
  ) {
    // Hanya peserta yang paketnya mencakup try out ini; juga menolak try out yang tidak ada
    await this.tryoutsService.assertAccess(req.user, tryoutId);
    return this.examService.submitExam(req.user.id, {
      tryoutId,
      answers: body.answers,
      subScores: body.subScores,
    });
  }

  // Admin: statistik tingkat benar & bobot tiap soal
  @Get(':tryoutId/question-stats')
  @UseGuards(RolesGuard)
  @Roles('admin')
  questionStats(@Param('tryoutId', ParseIntPipe) tryoutId: number) {
    return this.examService.questionStats(tryoutId);
  }

  // Admin: hitung ulang bobot, skor & peringkat seluruh peserta satu try out
  @Post(':tryoutId/recalculate')
  @UseGuards(RolesGuard)
  @Roles('admin')
  recalculate(@Param('tryoutId', ParseIntPipe) tryoutId: number) {
    return this.examService.recalculateTryout(tryoutId);
  }
}
