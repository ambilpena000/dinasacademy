// orders.controller.ts
import {
  Controller, Post, Get, Put, Body, Param,
  Request, UseGuards
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  // POST /api/orders → buat pesanan baru
  @Post()
  create(@Request() req, @Body() body: any) {
    return this.ordersService.create(req.user.id, body);
  }

  // GET /api/orders → semua pesanan (admin)
  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  findAll() {
    return this.ordersService.findAll();
  }

  // GET /api/orders/my → pesanan saya
  @Get('my')
  findMy(@Request() req) {
    return this.ordersService.findByUser(req.user.id);
  }

  // PUT /api/orders/:id/activate → aktifkan (admin)
  @Put(':id/activate')
  @UseGuards(RolesGuard)
  @Roles('admin')
  activate(@Param('id') id: string, @Request() req) {
    return this.ordersService.activate(id, req.user.id);
  }

  // PUT /api/orders/:id/reject → tolak (admin)
  @Put(':id/reject')
  @UseGuards(RolesGuard)
  @Roles('admin')
  reject(@Param('id') id: string) {
    return this.ordersService.reject(id);
  }
}