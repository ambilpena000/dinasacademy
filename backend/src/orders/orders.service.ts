import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
  ) {}

  async createOrder(userId: number, data: { packageName: string; packageType: string; amount: number; paymentMethod: string }) {
    const uniqueCode = Math.floor(Math.random() * 900) + 100; // 100–999
    const totalAmount = data.amount + uniqueCode;
    const order = this.orderRepo.create({
      userId,
      packageName: data.packageName,
      packageType: data.packageType,
      amount: data.amount,
      uniqueCode,
      totalAmount,
      paymentMethod: data.paymentMethod,
      status: 'pending',
    });
    return this.orderRepo.save(order);
  }

  async getUserOrders(userId: number) {
    return this.orderRepo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async findAll() {
    return this.orderRepo.find({ relations: ['user'], order: { createdAt: 'DESC' } });
  }

  async handlePaymentWebhook(body: any) {
    // implementasi sesuai kebutuhan
    return { received: true };
  }

  async findOne(id: number) {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async activateOrder(id: number) {
    await this.findOne(id); // validate exists
    await this.orderRepo.update(id, {
      status: 'active',
      activatedAt: new Date(),
    });
    return this.findOne(id);
  }

  async rejectOrder(id: number) {
    await this.findOne(id);
    await this.orderRepo.update(id, { status: 'rejected' });
    return this.findOne(id);
  }

  async updateStatus(id: number, status: string) {
    await this.orderRepo.update(id, { status });
    return this.findOne(id);
  }
}