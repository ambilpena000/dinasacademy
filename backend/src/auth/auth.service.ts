import {
  Injectable, UnauthorizedException, ConflictException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // ── REGISTER ─────────────────────────────────────
  async register(name: string, email: string, password: string) {
    // Cek apakah email sudah terdaftar
    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      throw new ConflictException('Email sudah terdaftar');
    }

    // Hash password agar aman di database
    // bcrypt mengubah "password123" → "$2b$10$xyz..." (tidak bisa di-decode)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan user baru
    const user = await this.usersService.create({
      name,
      email,
      password: hashedPassword,
      role: 'user',
    });

    // Langsung login setelah register
    return this.generateToken(user);
  }

  // ── LOGIN ─────────────────────────────────────────
  async login(email: string, password: string) {
    // Khusus admin hardcode (bisa dihapus setelah admin dibuat di DB)
    if (email === 'admin@dinasacademy.id' && password === 'Admin123!') {
      return {
        access_token: this.jwtService.sign({
          sub: 'admin',
          email,
          role: 'admin',
        }),
        user: {
          id: 'admin',
          name: 'Admin Dinas Academy',
          email,
          role: 'admin',
          hasPurchasedPackage: true,
        },
      };
    }

    // Cari user berdasarkan email
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Email atau password salah');
    }

    // Bandingkan password yang diinput dengan hash di database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Email atau password salah');
    }

    return this.generateToken(user);
  }

  // ── GANTI PASSWORD ────────────────────────────────
  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await this.usersService.findById(userId);
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new UnauthorizedException('Password lama salah');

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.usersService.update(userId, { password: hashed });
    return { message: 'Password berhasil diubah' };
  }

  // ── HELPER: Buat JWT Token ────────────────────────
  private generateToken(user: any) {
    // Payload = data yang disimpan dalam token
    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        hasPurchasedPackage: user.hasPurchasedPackage,
        packageType: user.packageType,
        targetType: user.targetType,
        targetUniversity: user.targetUniversity,
        targetMajor: user.targetMajor,
        profileCompleted: user.profileCompleted,
      },
    };
  }
}