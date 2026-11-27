import {
  Controller, Get, Post, Put, Body,
  Param, UseGuards, Request, ForbiddenException, BadRequestException,
} from '@nestjs/common';
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

  @Get('my')
  getMyOrders(@Request() req: any) {
    return this.ordersService.getUserOrders(req.user.id);
  }

  @Post('webhook')
  handleWebhook(@Body() body: any) {
    return this.ordersService.handlePaymentWebhook(body);
  }

  // POST /orders/claim-free { packageId } — ambil paket gratis, langsung aktif
  @Post('claim-free')
  async claimFree(@Request() req: any, @Body() body: { packageId: number }) {
    if (!body?.packageId) throw new BadRequestException('packageId wajib diisi');
    const { order, pkg, alreadyClaimed } = await this.ordersService.claimFree(req.user.id, Number(body.packageId));
    const user = await this.usersService.findOne(req.user.id);
    if (!user.hasPurchasedPackage || !user.packageType) {
      await this.usersService.update(req.user.id, { hasPurchasedPackage: true, packageType: pkg.type as any });
    }
    return { order, alreadyClaimed };
  }

  @Post()
  createOrder(@Request() req: any, @Body() body: any) {
    return this.ordersService.createOrder(req.user.id, body);
  }

  @Get()
  async getAllOrders(@Request() req: any) {
    if (req.user.role === 'admin') return this.ordersService.findAll();
    return this.ordersService.getUserOrders(req.user.id);
  }

  // FIX #4: aktivasi order SEKALIGUS update hasPurchasedPackage & packageType di user
  @Put(':id/activate')
  async activateOrder(@Request() req: any, @Param('id') id: string) {
    if (req.user.role !== 'admin') throw new ForbiddenException('Admin only');

    const order = await this.ordersService.activateOrder(parseInt(id));

    // Sinkronisasi status paket user — inilah yang sebelumnya hilang
    await this.usersService.update(order.userId, {
      hasPurchasedPackage: true,
      packageType: order.packageType as any,
    });

    return order;
  }

  // FIX #4: reject order — jika tidak ada paket lain aktif, reset hasPurchasedPackage
  @Put(':id/reject')
  async rejectOrder(@Request() req: any, @Param('id') id: string) {
    if (req.user.role !== 'admin') throw new ForbiddenException('Admin only');

    const order = await this.ordersService.rejectOrder(parseInt(id));

    // Cek apakah user masih punya order aktif lain
    const allOrders = await this.ordersService.getUserOrders(order.userId);
    const stillActive = allOrders.find(o => o.status === 'active' && String(o.id) !== id);
    if (!stillActive) {
      await this.usersService.update(order.userId, {
        hasPurchasedPackage: false,
        packageType: undefined,
      });
    } else {
      // Label paket user mengikuti paket yang masih aktif (mis. paket gratis)
      await this.usersService.update(order.userId, { packageType: stillActive.packageType as any });
    }

    return order;
  }
}
