import {
  Controller, Get, Post, Put, Delete, Param,
  Body, UseGuards, Request, ForbiddenException, ParseIntPipe,
} from '@nestjs/common';
import { TryoutsService, CreateTryoutDto } from './tryouts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tryouts')
@UseGuards(JwtAuthGuard)
export class TryoutsController {
  constructor(private tryoutsService: TryoutsService) {}

  // GET /tryouts — semua tryout (admin) atau sesuai paket & kuota (user)
  @Get()
  findAll(@Request() req: any) {
    return this.tryoutsService.findAccessible(req.user);
  }

  // GET /tryouts/:id — validasi akses per-tryout (paket, kategori, kuota)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    await this.tryoutsService.assertAccess(req.user, id);
    return this.tryoutsService.findOne(id);
  }

  // BUG FIX #2: Admin CRUD Tryout
  @Post()
  create(@Request() req: any, @Body() dto: CreateTryoutDto) {
    if (req.user.role !== 'admin') throw new ForbiddenException('Admin only');
    return this.tryoutsService.create(dto);
  }

  @Put(':id')
  update(@Request() req: any, @Param('id') id: string, @Body() dto: Partial<CreateTryoutDto>) {
    if (req.user.role !== 'admin') throw new ForbiddenException('Admin only');
    return this.tryoutsService.update(parseInt(id), dto);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    if (req.user.role !== 'admin') throw new ForbiddenException('Admin only');
    return this.tryoutsService.remove(parseInt(id));
  }

  @Put(':id/toggle-active')
  toggleActive(@Request() req: any, @Param('id') id: string) {
    if (req.user.role !== 'admin') throw new ForbiddenException('Admin only');
    return this.tryoutsService.toggleActive(parseInt(id));
  }
}
