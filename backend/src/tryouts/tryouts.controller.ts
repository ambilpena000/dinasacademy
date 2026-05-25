import { Controller, Get, Param, UseGuards, Request, Optional } from '@nestjs/common';
import { TryoutsService } from './tryouts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tryouts')
export class TryoutsController {
  constructor(private tryoutsService: TryoutsService) {}

  // GET /tryouts — filter sesuai paket user jika login, tampil semua jika admin
  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Request() req: any) {
    const user = req.user;
    const allTryouts = await this.tryoutsService.findAll();

    // Admin: tampilkan semua
    if (user?.role === 'admin') {
      return allTryouts;
    }

    // User biasa: filter berdasarkan packageType & hasPurchasedPackage
    if (!user?.hasPurchasedPackage || !user?.packageType) {
      return [];
    }

    const pkg = (user.packageType || '').toLowerCase();

    // Tentukan kategori yang diizinkan
    let allowedCategories: string[] = [];
    if (pkg.includes('combo') || pkg.includes('lengkap')) {
      allowedCategories = ['PTN', 'SKD', 'STIS'];
    } else if (pkg.includes('ptn') || pkg.includes('snbt')) {
      allowedCategories = ['PTN'];
    } else if (pkg.includes('stis')) {
      allowedCategories = ['STIS', 'SKD'];
    } else if (pkg.includes('skd') || pkg.includes('sekdin')) {
      allowedCategories = ['SKD'];
    } else if (pkg.includes('ipdn') || pkg.includes('polstat')) {
      allowedCategories = ['SKD'];
    }

    // Filter kategori
    const filtered = allTryouts.filter(t => allowedCategories.includes(t.category));

    // Tentukan max tryout berdasarkan nama paket
    const maxTryouts = this.getMaxTryoutsFromPackageType(user.packageType);

    // Batasi jumlah sesuai paket
    return filtered.slice(0, maxTryouts);
  }

  private getMaxTryoutsFromPackageType(packageType: string): number {
    const pkg = (packageType || '').toLowerCase();
    // Pola: "Paket SNBT Premium" -> 15, "Paket SNBT Standar" -> 8, "Paket SNBT Basic" -> 4
    // Coba extract angka dari nama paket jika ada di packageType
    // Fallback berdasarkan nama paket yang dikenal
    if (pkg.includes('premium') && (pkg.includes('snbt') || pkg.includes('ptn'))) return 15;
    if (pkg.includes('standar') && (pkg.includes('snbt') || pkg.includes('ptn'))) return 8;
    if (pkg.includes('basic') && (pkg.includes('snbt') || pkg.includes('ptn'))) return 4;
    if (pkg.includes('premium') && pkg.includes('skd')) return 12;
    if (pkg.includes('standar') && pkg.includes('skd')) return 6;
    if (pkg.includes('premium') && pkg.includes('stis')) return 10;
    if (pkg.includes('combo')) return 20;
    // Default: tampilkan semua yang ada di kategori tersebut
    return 999;
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.tryoutsService.findOne(parseInt(id));
  }
}
