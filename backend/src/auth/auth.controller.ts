import { Controller, Post, Get, Body, Request, UseGuards, Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { IsEmail, IsString, MinLength } from 'class-validator';

// ── DTO (Data Transfer Object) = bentuk data yang diterima ──
export class RegisterDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // POST /api/auth/register
  @Post('register')
  register(@Body() body: RegisterDto) {
    return this.authService.register(body.name, body.email, body.password);
  }

  // POST /api/auth/login
  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }

  // GET /api/auth/me → data user yang sedang login
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Request() req) {
    return req.user;
  }

  // PUT /api/auth/change-password
  @Put('change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(
    @Request() req,
    @Body() body: { oldPassword: string; newPassword: string }
  ) {
    return this.authService.changePassword(
      req.user.id, body.oldPassword, body.newPassword
    );
  }
}