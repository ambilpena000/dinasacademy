import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ResultsService } from './results.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('results')
@UseGuards(JwtAuthGuard)
export class ResultsController {
  constructor(private resultsService: ResultsService) {}

  @Get()
  getUserResults(@Request() req: any) {
    return this.resultsService.getUserResults(req.user.id);
  }

  // FIX B7 + B8: ranking kembalikan data anonim + strip field sensitif
  @Get(':tryoutId/ranking')
  async getRanking(@Param('tryoutId') tryoutId: string) {
    const results = await this.resultsService.getRanking(parseInt(tryoutId));
    return results.map((r: any, i: number) => ({
      rank:        i + 1,
      userId:      r.userId,          // perlu untuk highlight baris user sendiri
      totalScore:  Math.round(Number(r.totalScore)),
      category:    r.category,
      completedAt: r.completedAt,
      // TIDAK kirim: answers, subScores, percentage, correct/wrong
    }));
  }

  @Get(':tryoutId')
  getResultByTryout(@Request() req: any, @Param('tryoutId') tryoutId: string) {
    return this.resultsService.getResultByTryout(req.user.id, parseInt(tryoutId));
  }
}