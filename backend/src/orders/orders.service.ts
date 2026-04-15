// orders.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepo: Repository<Order>,
    private usersService: UsersService,
  ) {}

  // Buat pesanan baru
  async create(userId: string, dto: {
    packageName: string;
    packageType: string;
    amount: number;
    paymentMethod: string;
  }): Promise<Order> {
    // Generate kode unik dari user ID
    const digits = userId.replace(/[^0-9a-f]/gi, '');
    const num = parseInt(digits.slice(-4), 16);
    const uniqueCode = (num % 900) + 100; // selalu 100-999

    const order = this.ordersRepo.create({
      userId,
      ...dto,
      uniqueCode,
      totalAmount: dto.amount + uniqueCode,
      status: 'pending',
    });
    return this.ordersRepo.save(order);
  }

  // Ambil semua pesanan (admin)
  async findAll(): Promise<Order[]> {
    return this.ordersRepo.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  // Ambil pesanan user tertentu
  async findByUser(userId: string): Promise<Order[]> {
    return this.ordersRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  // Aktifkan pesanan (admin)
  async activate(orderId: string, adminId: string): Promise<Order> {
    const order = await this.ordersRepo.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Pesanan tidak ditemukan');

    order.status = 'active';
    order.activatedAt = new Date();
    order.activatedBy = adminId;
    await this.ordersRepo.save(order);

    // Aktifkan paket user
    await this.usersService.activatePackage(order.userId, order.packageType);

    return order;
  }

  // Tolak pesanan (admin)
  async reject(orderId: string): Promise<Order> {
    const order = await this.ordersRepo.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Pesanan tidak ditemukan');
    order.status = 'rejected';
    return this.ordersRepo.save(order);
  }
}