// questions.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';
import { Question } from './question.entity';
import { Tryout } from '../tryouts/tryout.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Question, Tryout]),
    MulterModule.register({ dest: './uploads' }),
  ],
  providers: [QuestionsService],
  controllers: [QuestionsController],
  exports: [QuestionsService],
})
export class QuestionsModule {}