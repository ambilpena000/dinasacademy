import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { University } from './university.entity';
import { Major } from './major.entity';
import { UniversitiesService } from './universities.service';
import { MajorsController, UniversitiesController } from './universities.controller';

@Module({
  imports: [TypeOrmModule.forFeature([University, Major])],
  controllers: [UniversitiesController, MajorsController],
  providers: [UniversitiesService],
  exports: [UniversitiesService],
})
export class UniversitiesModule {}
