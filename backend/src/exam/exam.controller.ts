import { Controller, Post, Get, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ExamService } from './exam.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('exam')
@UseGuards(JwtAuthGuard)
export class ExamController {
  constructor(private examService: ExamService) {}

  // Frontend: GET /exam/:tryoutId/draft
  @Get(':tryoutId/draft')
  getDraft(@Request() req: any, @Param('tryoutId') tryoutId: string) {
    return this.examService.getDraft(req.user.id, parseInt(tryoutId));
  }

  // Frontend: PUT /exam/:tryoutId/draft
  @Put(':tryoutId/draft')
  saveDraft(
    @Request() req: any,
    @Param('tryoutId') tryoutId: string,
    @Body() body: any,
  ) {
    return this.examService.saveDraft(req.user.id, {
      tryoutId: parseInt(tryoutId),
      answers: body.answers,
      currentSubtest: body.currentSubtest,
    });
  }

  // Frontend: POST /exam/:tryoutId/submit
  @Post(':tryoutId/submit')
  submitExam(
    @Request() req: any,
    @Param('tryoutId') tryoutId: string,
    @Body() body: any,
  ) {
    return this.examService.submitExam(req.user.id, {
      tryoutId: parseInt(tryoutId),
      answers: body.answers,
      subScores: body.subScores,
    });
  }
}