import { Controller, Get, Post, Put, Body, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(
    private ordersService: OrdersService,
    private usersService: UsersService,
  ) {}

  // Frontend memanggil GET /orders/my — pesanan user sendiri
  @Get('my')
  getMyOrders(@Request() req: any) {
    return this.ordersService.getUserOrders(req.user.id);
  }

  // POST /orders/webhook — (harus sebelum :id routes)
  @Post('webhook')
  handleWebhook(@Body() body: any) {
    return this.ordersService.handlePaymentWebhook(body);
  }

  // POST /orders — buat pesanan baru
  @Post()
  createOrder(@Request() req: any, @Body() body: any) {
    return this.ordersService.createOrder(req.user.id, body);
  }

  // GET /orders — admin: semua pesanan; user: pesanan sendiri
  @Get()
  async getAllOrders(@Request() req: any) {
    if (req.user.role === 'admin') {
      return this.ordersService.findAll();
    }
    return this.ordersService.getUserOrders(req.user.id);
  }

  // PUT /orders/:id/activate — admin aktifkan pesanan
  @Put(':id/activate')
  async activateOrder(@Request() req: any, @Param('id') id: string) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Admin only');
    }
    const order = await this.ordersService.activateOrder(parseInt(id));
    // Update user: hasPurchasedPackage = true, packageType = order.packageType
    try {
      await this.usersService.update(order.userId, {
        hasPurchasedPackage: true,
        packageType: order.packageType,
      });
    } catch (e) { /* user mungkin admin hardcoded */ }
    return order;
  }

  // PUT /orders/:id/reject — admin tolak pesanan
  @Put(':id/reject')
  async rejectOrder(@Request() req: any, @Param('id') id: string) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Admin only');
    }
    return this.ordersService.rejectOrder(parseInt(id));
  }
}