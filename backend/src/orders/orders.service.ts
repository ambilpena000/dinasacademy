import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { Package } from '../packages/package.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @InjectRepository(Package)
    private packageRepo: Repository<Package>,
  ) {}

  private async activePackage(packageId: number) {
    const pkg = await this.packageRepo.findOne({ where: { id: Number(packageId) } });
    if (!pkg || !pkg.isActive) throw new BadRequestException('Paket tidak tersedia');
    return pkg;
  }

  // Pesanan paket berbayar. Bila packageId dikirim, nama/jenis/harga diambil dari database
  // (bukan dari browser) agar harga tidak bisa dimanipulasi.
  async createOrder(userId: number, data: {
    packageId?: number;
    packageName: string;
    packageType: string;
    amount: number;
    paymentMethod: string;
  }) {
    let fields: Partial<Order> = {
      packageName: data.packageName, packageType: data.packageType,
      amount: Number(data.amount) || 0, paymentMethod: data.paymentMethod,
    };
    if (data.packageId) {
      const pkg = await this.activePackage(data.packageId);
      if (pkg.isFree) throw new BadRequestException('Paket ini gratis — gunakan tombol "Ambil Gratis"');
      fields = { ...fields, packageId: pkg.id, packageName: pkg.name, packageType: pkg.type, amount: Number(pkg.price) };
    }
    const uniqueCode  = Math.floor(Math.random() * 900) + 100; // 100–999
    const totalAmount = Number(fields.amount) + uniqueCode;
    const order = this.orderRepo.create({
      userId, ...fields, uniqueCode, totalAmount, status: 'pending',
    });
    return this.orderRepo.save(order);
  }

  /**
   * Klaim paket gratis: pesanan langsung aktif tanpa pembayaran & tanpa konfirmasi admin.
   * Bila peserta sudah pernah mengklaim paket ini, pesanan lama dikembalikan.
   */
  async claimFree(userId: number, packageId: number): Promise<{ order: Order; pkg: Package; alreadyClaimed: boolean }> {
    const pkg = await this.activePackage(packageId);
    if (!pkg.isFree) throw new BadRequestException('Paket ini berbayar');
    const existing = await this.orderRepo.findOne({ where: { userId, packageId: pkg.id, status: 'active' } });
    if (existing) return { order: existing, pkg, alreadyClaimed: true };
    const order = await this.orderRepo.save(this.orderRepo.create({
      userId, packageId: pkg.id, packageName: pkg.name, packageType: pkg.type,
      amount: 0, uniqueCode: 0, totalAmount: 0, paymentMethod: 'Gratis',
      status: 'active', activatedAt: new Date(), activatedBy: 'otomatis (paket gratis)',
    }));
    return { order, pkg, alreadyClaimed: false };
  }

  async getUserOrders(userId: number) {
    return this.orderRepo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async findAll() {
    return this.orderRepo.find({ relations: ['user'], order: { createdAt: 'DESC' } });
  }

  async handlePaymentWebhook(_body: any) {
    return { received: true };
  }

  async findOne(id: number) {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  // FIX #4: activateOrder kembalikan userId & packageType agar controller bisa update user
  async activateOrder(id: number): Promise<Order> {
    await this.findOne(id);
    await this.orderRepo.update(id, { status: 'active', activatedAt: new Date() });
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
