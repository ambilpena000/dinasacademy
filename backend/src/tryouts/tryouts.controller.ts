import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { TryoutsService } from './tryouts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request as ExpressRequest } from 'express';

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

  @UseGuards(JwtAuthGuard)
  @Post('purchase')
  purchase(@Request() req: ExpressRequest & { user: { userId: number } }, @Body() body: any) {
    return this.tryoutsService.purchase(req.user.userId, body);
  }
}