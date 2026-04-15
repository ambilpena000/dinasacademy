// results.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResultsService } from './results.service';
import { ResultsController } from './results.controller';
import { ExamResult } from './exam-result.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExamResult])],
  providers: [ResultsService],
  controllers: [ResultsController],
  exports: [ResultsService],
})
export class ResultsModule {}