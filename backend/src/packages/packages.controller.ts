import {
  Body, Controller, Delete, ForbiddenException, Get, Param, ParseIntPipe, Post, Put, Request, UseGuards,
} from '@nestjs/common';
import { PackageDto, PackagesService } from './packages.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

function assertAdmin(req: any) {
  if (req.user?.role !== 'admin') throw new ForbiddenException('Admin only');
}

@Controller('packages')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  // Publik: paket aktif untuk halaman Paket / Landing
  @Get()
  findActive() {
    return this.packagesService.findActive();
  }

  // Admin: semua paket termasuk yang nonaktif
  @UseGuards(JwtAuthGuard)
  @Get('admin/all')
  findAll(@Request() req: any) {
    assertAdmin(req);
    return this.packagesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.packagesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req: any, @Body() body: PackageDto) {
    assertAdmin(req);
    return this.packagesService.create(body);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Request() req: any, @Param('id', ParseIntPipe) id: number, @Body() body: PackageDto) {
    assertAdmin(req);
    return this.packagesService.update(id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    assertAdmin(req);
    return this.packagesService.remove(id);
  }
}
