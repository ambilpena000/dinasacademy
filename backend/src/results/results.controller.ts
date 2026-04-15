// results.controller.ts
import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { ResultsService } from './results.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('results')
@UseGuards(JwtAuthGuard)
export class ResultsController {
  constructor(private resultsService: ResultsService) {}

  // GET /api/results → semua hasil ujian saya
  @Get()
  findMy(@Request() req) {
    return this.resultsService.findByUser(req.user.id);
  }

  // GET /api/results/:tryoutId → hasil ujian tryout tertentu
  @Get(':tryoutId')
  findOne(@Param('tryoutId') tryoutId: string, @Request() req) {
    return this.resultsService.findOne(req.user.id, tryoutId);
  }

  // GET /api/results/:tryoutId/ranking → papan peringkat
  @Get(':tryoutId/ranking')
  getRanking(@Param('tryoutId') tryoutId: string, @Request() req) {
    return this.resultsService.getRanking(tryoutId);
  }
}