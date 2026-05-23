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

  // Frontend: GET /results/:tryoutId/ranking
  @Get(':tryoutId/ranking')
  getRanking(@Param('tryoutId') tryoutId: string) {
    return this.resultsService.getRanking(parseInt(tryoutId));
  }

  @Get(':tryoutId')
  getResultByTryout(@Request() req: any, @Param('tryoutId') tryoutId: string) {
    return this.resultsService.getResultByTryout(req.user.id, parseInt(tryoutId));
  }
}