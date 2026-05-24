import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(name: string, email: string, password: string) {
    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      throw new ConflictException('Email sudah terdaftar');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.usersService.create({
      name,
      email,
      password: hashedPassword,
      role: 'student',
    });
    return this.generateToken(user);
  }

  async login(email: string, password: string) {
    // Admin hardcode
    if (email === 'admin@dinasacademy.id' && password === 'Admin123!') {
      return {
        access_token: this.jwtService.sign({ sub: 'admin', email, role: 'admin' }),
        user: {
          id: 'admin',
          name: 'Admin Dinas Academy',
          email,
          role: 'admin',
          hasPurchasedPackage: true,
        },
      };
    }

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Email atau password salah');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Email atau password salah');
    }

    // FIX: Ambil data user lengkap dari DB setelah login
    // agar phone, school, goals, dll ikut terbawa
    const fullUser = await this.usersService.findOne(user.id);
    return this.generateToken(fullUser);
  }

  async getFullUser(userId: number | string) {
    if (userId === 'admin') {
      return { id: 'admin', name: 'Admin Dinas Academy', email: 'admin@dinasacademy.id', role: 'admin', hasPurchasedPackage: true };
    }
    return this.usersService.findOne(Number(userId));
  }

  async changePassword(userId: number, oldPassword: string, newPassword: string) {
    const user = await this.usersService.findOneWithPassword(userId);
    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new UnauthorizedException('Password lama salah');
    const hashed = await bcrypt.hash(newPassword, 10);
    await this.usersService.update(userId, { password: hashed });
    return { message: 'Password berhasil diubah' };
  }

  private generateToken(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      // FIX: kembalikan SEMUA field profil agar tidak hilang saat login
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        school: user.school,
        hasPurchasedPackage: user.hasPurchasedPackage,
        packageType: user.packageType,
        targetType: user.targetType,
        targetUniversity: user.targetUniversity,
        targetMajor: user.targetMajor,
        goals: user.goals,
        profileCompleted: user.profileCompleted,
        joinDate: user.joinDate,
      },
    };
  }
}