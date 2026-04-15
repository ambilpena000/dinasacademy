import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ResultsService } from './results.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request as ExpressRequest } from 'express';

@Controller('results')
@UseGuards(JwtAuthGuard)
export class ResultsController {
  constructor(private resultsService: ResultsService) {}

  @Get()
  getUserResults(@Request() req: ExpressRequest & { user: { userId: number } }) {
    return this.resultsService.getUserResults(req.user.userId);
  }

  @Get(':tryoutId')
  getResultByTryout(@Request() req: ExpressRequest & { user: { userId: number } }, @Param('tryoutId') tryoutId: string) {
    return this.resultsService.getResultByTryout(req.user.userId, parseInt(tryoutId));
  }

  @Get('ranking/:tryoutId')
  getRanking(@Param('tryoutId') tryoutId: string) {
    return this.resultsService.getRanking(parseInt(tryoutId));
  }
}