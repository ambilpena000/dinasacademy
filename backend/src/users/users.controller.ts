import {
  Controller, Get, Put, Post, Body, UseGuards,
  Request, ForbiddenException, UseInterceptors,
  UploadedFile, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserPhoto } from './user-photo.entity';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private usersService: UsersService,
    @InjectRepository(UserPhoto) private photoRepo: Repository<UserPhoto>,
  ) {}

  @Get('profile/me')
  getProfileMe(@Request() req: any) {
    return this.usersService.findOne(req.user.id);
  }

  @Put('profile/me')
  updateProfileMe(@Request() req: any, @Body() body: any) {
    const { password: _password, role: _role, ...safeData } = body;
    return this.usersService.update(req.user.id, safeData);
  }

  @Get('profile')
  getProfile(@Request() req: any) {
    return this.usersService.findOne(req.user.id);
  }

  @Put('profile')
  updateProfile(@Request() req: any, @Body() body: any) {
    const { password: _password, role: _role, ...safeData } = body;
    return this.usersService.update(req.user.id, safeData);
  }

  // FIX #5: Upload foto profil ke server — bukan base64 localStorage
  // POST /users/profile/photo  (multipart/form-data, field name: photo)
  @Post('profile/photo')
  @UseInterceptors(
    FileInterceptor('photo', {
      // Disimpan di database (bukan disk) — aman untuk hosting tanpa disk permanen
      storage: memoryStorage(),
      limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB (frontend sudah mengecilkan ke ±50 KB)
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/^image\/(jpeg|png|webp|gif)$/)) {
          return cb(new BadRequestException('Hanya file gambar yang diizinkan (jpg, png, webp)'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadPhoto(@UploadedFile() file: any, @Request() req: any) {
    if (!file) throw new BadRequestException('File foto tidak ditemukan');
    await this.photoRepo.save({ userId: req.user.id, mimeType: file.mimetype, data: file.buffer });
    // ?v= berubah tiap upload → browser memuat foto baru
    const photoUrl = `/api/users/${req.user.id}/photo?v=${Date.now()}`;
    await this.usersService.update(req.user.id, { photoUrl });
    return { photoUrl };
  }

  // Admin: GET /users
  @Get()
  async getAllUsers(@Request() req: any) {
    if (req.user.role !== 'admin') throw new ForbiddenException('Admin only');
    return this.usersService.findAll();
  }
}
