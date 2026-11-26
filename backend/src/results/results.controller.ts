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
  getRanking(@Param('tryoutId') tryoutId: string) {
    // Nilai terbaik per peserta + skor & peringkat per subtes.
    // TIDAK mengirim: nama/email, jawaban, jumlah benar/salah.
    return this.resultsService.getRanking(parseInt(tryoutId));
  }

  @Get(':tryoutId')
  getResultByTryout(@Request() req: any, @Param('tryoutId') tryoutId: string) {
    return this.resultsService.getResultByTryout(req.user.id, parseInt(tryoutId));
  }
}