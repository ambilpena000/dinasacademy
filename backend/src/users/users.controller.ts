import {
  Controller, Get, Put, Post, Body, UseGuards,
  Request, ForbiddenException, UseInterceptors,
  UploadedFile, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// Pastikan folder uploads/photos ada
const UPLOAD_DIR = join(process.cwd(), 'uploads', 'photos');
if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true });

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile/me')
  getProfileMe(@Request() req: any) {
    return this.usersService.findOne(req.user.id);
  }

  @Put('profile/me')
  updateProfileMe(@Request() req: any, @Body() body: any) {
    const { password, role, ...safeData } = body;
    return this.usersService.update(req.user.id, safeData);
  }

  @Get('profile')
  getProfile(@Request() req: any) {
    return this.usersService.findOne(req.user.id);
  }

  @Put('profile')
  updateProfile(@Request() req: any, @Body() body: any) {
    const { password, role, ...safeData } = body;
    return this.usersService.update(req.user.id, safeData);
  }

  // FIX #5: Upload foto profil ke server — bukan base64 localStorage
  // POST /users/profile/photo  (multipart/form-data, field name: photo)
  @Post('profile/photo')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: UPLOAD_DIR,
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 3 * 1024 * 1024 }, // 3 MB
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
    const photoUrl = `/uploads/photos/${file.filename}`;
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
