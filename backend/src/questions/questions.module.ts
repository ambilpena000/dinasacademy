// questions.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';
import { Question } from './question.entity';
import { Tryout } from '../tryouts/tryout.entity';
import { TryoutsModule } from '../tryouts/tryouts.module';
import { ResultsModule } from '../results/results.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Question, Tryout]),
    MulterModule.register({ dest: './uploads' }),
    TryoutsModule,
    ResultsModule,
  ],
  providers: [QuestionsService],
  controllers: [QuestionsController],
  exports: [QuestionsService],
})
export class QuestionsModule {}