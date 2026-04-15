// tryouts.controller.ts
import {
  Controller, Get, Post, Put, Delete,
  Param, Body, Query, Request, UseGuards
} from '@nestjs/common';
import { TryoutsService } from './tryouts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('tryouts')
@UseGuards(JwtAuthGuard)
export class TryoutsController {
  constructor(private tryoutsService: TryoutsService) {}

  // GET /api/tryouts → list tryout sesuai paket user
  @Get()
  findAll(@Request() req) {
    const packageType = req.user?.packageType;
    return this.tryoutsService.findAll(packageType);
  }

  // GET /api/tryouts/:id → detail tryout
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tryoutsService.findOne(id);
  }

  // POST /api/tryouts → buat tryout baru (admin)
  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  create(@Body() body: any) {
    return this.tryoutsService.create(body);
  }

  // PUT /api/tryouts/:id → update tryout (admin)
  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() body: any) {
    return this.tryoutsService.update(id, body);
  }

  // DELETE /api/tryouts/:id → hapus tryout (admin)
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.tryoutsService.remove(id);
  }
}