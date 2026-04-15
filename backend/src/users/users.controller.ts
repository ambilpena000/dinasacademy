import {
  Controller, Get, Put, Delete, Param, Body,
  UseGuards, Request
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard) // semua endpoint butuh login
export class UsersController {
  constructor(private usersService: UsersService) {}

  // GET /api/users → semua user (admin only)
  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  findAll() {
    return this.usersService.findAll();
  }

  // GET /api/users/:id → detail user
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  // PUT /api/users/:id → update user
  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.usersService.update(id, body);
  }

  // DELETE /api/users/:id → hapus user (admin)
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  // GET /api/users/profile/me → profil saya sendiri
  @Get('profile/me')
  getMyProfile(@Request() req) {
    return this.usersService.findById(req.user.id);
  }

  // PUT /api/users/profile/me → update profil saya
  @Put('profile/me')
  updateMyProfile(@Request() req, @Body() body: any) {
    return this.usersService.update(req.user.id, body);
  }
}