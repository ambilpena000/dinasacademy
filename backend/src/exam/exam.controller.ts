import { Controller, Post, Get, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ExamService } from './exam.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request as ExpressRequest } from 'express';

@Controller('exam')
@UseGuards(JwtAuthGuard)
export class ExamController {
  constructor(private examService: ExamService) {}

  @Post('draft')
  saveDraft(@Request() req: ExpressRequest & { user: { userId: number } }, @Body() body: any) {
    return this.examService.saveDraft(req.user.userId, body);
  }

  @Get('draft/:tryoutId')
  getDraft(@Request() req: ExpressRequest & { user: { userId: number } }, @Param('tryoutId') tryoutId: string) {
    return this.examService.getDraft(req.user.userId, parseInt(tryoutId));
  }

  @Post('submit')
  submitExam(@Request() req: ExpressRequest & { user: { userId: number } }, @Body() body: any) {
    return this.examService.submitExam(req.user.userId, body);
  }
}