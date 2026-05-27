import {
  Controller, Get, Post, Put, Delete, Param,
  Body, UseGuards, Request, ForbiddenException,
} from '@nestjs/common';
import { TryoutsService, CreateTryoutDto } from './tryouts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tryouts')
@UseGuards(JwtAuthGuard)
export class TryoutsController {
  constructor(private tryoutsService: TryoutsService) {}

  // GET /tryouts — semua tryout (admin) atau filter paket (user)
  @Get()
  async findAll(@Request() req: any) {
    const user = req.user;
    const allTryouts = await this.tryoutsService.findAll();

    if (user?.role === 'admin') return allTryouts;

    if (!user?.hasPurchasedPackage || !user?.packageType) return [];

    const pkg = (user.packageType || '').toLowerCase();
    let allowedCategories: string[] = [];
    if (pkg.includes('combo') || pkg.includes('lengkap')) {
      allowedCategories = ['PTN', 'SKD', 'STIS', 'SNBT'];
    } else if (pkg.includes('ptn') || pkg.includes('snbt')) {
      allowedCategories = ['PTN', 'SNBT'];
    } else if (pkg.includes('stis')) {
      allowedCategories = ['STIS', 'SKD'];
    } else if (pkg.includes('skd') || pkg.includes('sekdin') || pkg.includes('cpns')) {
      allowedCategories = ['SKD'];
    } else if (pkg.includes('ipdn') || pkg.includes('polstat')) {
      allowedCategories = ['SKD'];
    }

    // BUG FIX #3 (sebagian): filter hanya oleh kategori,
    // validasi akses per-tryout ada di GET /:id
    const filtered = allTryouts.filter(
      t => allowedCategories.includes(t.category) && t.isActive,
    );
    const maxTryouts = this.getMaxTryouts(user.packageType);
    return filtered.slice(0, maxTryouts);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    const tryout = await this.tryoutsService.findOne(parseInt(id));

    // BUG FIX #3: validasi akses user per-tryout (bukan hanya list)
    if (req.user?.role === 'admin') return tryout;

    if (!req.user?.hasPurchasedPackage) {
      throw new ForbiddenException('Kamu belum berlangganan paket');
    }

    const pkg = (req.user.packageType || '').toLowerCase();
    const cat = (tryout.category || '').toUpperCase();
    const allowed =
      pkg.includes('combo') || pkg.includes('lengkap') ||
      (cat === 'SKD'  && (pkg.includes('skd') || pkg.includes('sekdin') || pkg.includes('cpns') || pkg.includes('stis') || pkg.includes('ipdn'))) ||
      (cat === 'STIS' && (pkg.includes('stis') || pkg.includes('combo'))) ||
      ((cat === 'PTN' || cat === 'SNBT') && (pkg.includes('ptn') || pkg.includes('snbt') || pkg.includes('combo')));

    if (!allowed) throw new ForbiddenException('Paketmu tidak termasuk tryout ini');
    return tryout;
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

  private getMaxTryouts(packageType: string): number {
    const pkg = (packageType || '').toLowerCase();
    if (pkg.includes('premium') && (pkg.includes('snbt') || pkg.includes('ptn'))) return 15;
    if (pkg.includes('standar') && (pkg.includes('snbt') || pkg.includes('ptn'))) return 8;
    if (pkg.includes('basic')   && (pkg.includes('snbt') || pkg.includes('ptn'))) return 4;
    if (pkg.includes('premium') && pkg.includes('skd'))  return 12;
    if (pkg.includes('standar') && pkg.includes('skd'))  return 6;
    if (pkg.includes('premium') && pkg.includes('stis')) return 10;
    if (pkg.includes('combo'))  return 20;
    return 999;
  }
}
