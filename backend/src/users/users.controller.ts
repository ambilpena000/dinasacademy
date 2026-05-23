import { Controller, Get, Put, Body, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  // Frontend memanggil GET /users/profile/me
  @Get('profile/me')
  getProfileMe(@Request() req: any) {
    return this.usersService.findOne(req.user.id);
  }

  // Frontend memanggil PUT /users/profile/me
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

  // Admin: GET /users — daftar semua user
  @Get()
  async getAllUsers(@Request() req: any) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Admin only');
    }
    return this.usersService.findAll();
  }
}