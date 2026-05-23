// tryouts.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TryoutsService } from './tryouts.service';
import { TryoutsController } from './tryouts.controller';
import { Tryout } from './tryout.entity';
import { Question } from '../questions/question.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tryout, Question])],
  providers: [TryoutsService],
  controllers: [TryoutsController],
  exports: [TryoutsService],
})
export class TryoutsModule {}