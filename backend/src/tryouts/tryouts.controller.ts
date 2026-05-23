import { Controller, Get, Param } from '@nestjs/common';
import { TryoutsService } from './tryouts.service';

@Controller('tryouts')
export class TryoutsController {
  constructor(private tryoutsService: TryoutsService) {}

  @Get()
  findAll() {
    return this.tryoutsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tryoutsService.findOne(parseInt(id));
  }
}