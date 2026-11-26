import { Controller, Get, NotFoundException, Param, ParseIntPipe, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Response } from 'express';
import { UserPhoto } from './user-photo.entity';

// GET /api/users/:id/photo — publik (dipakai langsung di <img src>), tanpa data pribadi lain.
// URL foto selalu memuat ?v=<waktu upload>, jadi aman di-cache lama oleh browser.
@Controller('users')
export class UserPhotoController {
  constructor(@InjectRepository(UserPhoto) private photoRepo: Repository<UserPhoto>) {}

  @Get(':id/photo')
  async getPhoto(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const photo = await this.photoRepo.findOne({ where: { userId: id } });
    if (!photo) throw new NotFoundException('Foto tidak ditemukan');
    res.setHeader('Content-Type', photo.mimeType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.send(photo.data);
  }
}
