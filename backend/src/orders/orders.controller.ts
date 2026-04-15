import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request as ExpressRequest } from 'express';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  createOrder(@Request() req: ExpressRequest & { user: { userId: number } }, @Body() body: any) {
    return this.ordersService.createOrder(req.user.userId, body);
  }

  @Get()
  getUserOrders(@Request() req: ExpressRequest & { user: { userId: number } }) {
    return this.ordersService.getUserOrders(req.user.userId);
  }

  @Post('webhook')
  handleWebhook(@Body() body: any) {
    return this.ordersService.handlePaymentWebhook(body);
  }
}