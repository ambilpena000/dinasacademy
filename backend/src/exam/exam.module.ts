// exam.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamService } from './exam.service';
import { ExamController } from './exam.controller';
import { ExamDraft } from './exam-draft.entity';
import { ResultsModule } from '../results/results.module';
import { QuestionsModule } from '../questions/questions.module';
import { TryoutsModule } from '../tryouts/tryouts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExamDraft]),
    ResultsModule,
    QuestionsModule,
    TryoutsModule,
  ],
  providers: [ExamService],
  controllers: [ExamController],
})
export class ExamModule {}