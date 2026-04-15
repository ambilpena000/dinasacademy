import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  // Cari user berdasarkan email (untuk login)
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { email } });
  }

  // Cari user berdasarkan ID
  async findById(id: string): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User tidak ditemukan');
    return user;
  }

  // Buat user baru (dipanggil saat register)
  async create(data: Partial<User>): Promise<User> {
    const user = this.usersRepo.create(data);
    return this.usersRepo.save(user);
  }

  // Update profil user
  async update(id: string, data: Partial<User>): Promise<User> {
    await this.usersRepo.update(id, data);
    return this.findById(id);
  }

  // Ambil semua user (untuk admin panel)
  async findAll(): Promise<User[]> {
    return this.usersRepo.find({
      select: ['id', 'name', 'email', 'role', 'hasPurchasedPackage',
               'packageType', 'joinDate', 'profileCompleted'],
      order: { joinDate: 'DESC' },
    });
  }

  // Hapus user
  async remove(id: string): Promise<void> {
    await this.usersRepo.delete(id);
  }

  // Aktifkan paket user (dipanggil admin saat approve order)
  async activatePackage(userId: string, packageType: string): Promise<User> {
    await this.usersRepo.update(userId, {
      hasPurchasedPackage: true,
      packageType,
    });
    return this.findById(userId);
  }
}