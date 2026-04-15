import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request as ExpressRequest } from 'express';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  getProfile(@Request() req: ExpressRequest & { user: { userId: number } }) {
    return this.usersService.findOne(req.user.userId);
  }

  @Put('profile')
  updateProfile(@Request() req: ExpressRequest & { user: { userId: number } }, @Body() body: any) {
    return this.usersService.update(req.user.userId, body);
  }
}