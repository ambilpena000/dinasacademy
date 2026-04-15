import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { PackagesService } from './packages.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('packages')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Get()
  findAll() {
    return this.packagesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.packagesService.findOne(parseInt(id));
  }

  @UseGuards(JwtAuthGuard)
  @Post('purchase')
  purchase(@Request() req: any, @Body() body: { packageId: number }) {
    return this.packagesService.purchase(req.user.userId, body.packageId);
  }
}