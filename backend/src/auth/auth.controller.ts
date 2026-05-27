import {
  Controller, Post, Put, Get, Body,
  UseGuards, Request, Query, BadRequestException,
} from '@nestjs/common';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

export class RegisterDto {
  @IsNotEmpty({ message: 'Nama wajib diisi' }) @IsString() name!: string;
  @IsEmail({}, { message: 'Format email tidak valid' }) @IsNotEmpty() email!: string;
  @IsNotEmpty() @MinLength(6, { message: 'Password minimal 6 karakter' }) password!: string;
}
export class LoginDto {
  @IsEmail({}, { message: 'Format email tidak valid' }) @IsNotEmpty() email!: string;
  @IsNotEmpty() password!: string;
}
export class ChangePasswordDto {
  @IsNotEmpty() oldPassword!: string;
  @IsNotEmpty() @MinLength(8, { message: 'Password baru minimal 8 karakter' }) newPassword!: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.name, dto.email, dto.password);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Request() req: any) {
    return this.authService.getFullUser(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    return this.authService.getFullUser(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('change-password')
  changePassword(@Request() req: any, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.id, dto.oldPassword, dto.newPassword);
  }

  // FIX #7: verifikasi email via link
  @Get('verify-email')
  verifyEmail(@Query('token') token: string) {
    if (!token) throw new BadRequestException('Token tidak ditemukan');
    return this.authService.verifyEmail(token);
  }

  // FIX #7: kirim ulang email verifikasi
  @UseGuards(JwtAuthGuard)
  @Post('resend-verification')
  resendVerification(@Request() req: any) {
    return this.authService.resendVerification(req.user.id);
  }
}
