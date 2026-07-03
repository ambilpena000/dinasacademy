import {
  Injectable, UnauthorizedException, ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // FIX #1: register kini generate token verifikasi email
  async register(name: string, email: string, password: string) {
    const existing = await this.usersService.findByEmail(email);
    if (existing) throw new ConflictException('Email sudah terdaftar');

    const hashedPassword = await bcrypt.hash(password, 10);
    // FIX #7: buat token verifikasi unik
    const emailVerifyToken = crypto.randomBytes(32).toString('hex');

    const user = await this.usersService.create({
      name, email,
      password: hashedPassword,
      role: 'student',
      isEmailVerified: false,
      emailVerifyToken,
    });

    // Kirim email verifikasi (jika SMTP tersedia)
    await this.sendVerificationEmail(email, name, emailVerifyToken).catch(() => {
      // Gagal kirim email tidak membatalkan registrasi
      console.warn(`⚠️  Gagal kirim email verifikasi ke ${email}`);
    });

    return {
      ...this.generateToken(user),
      emailVerificationSent: true,
      message: 'Registrasi berhasil! Cek email kamu untuk verifikasi.',
    };
  }

  // FIX #1: login via DB (bukan hardcode)
  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Email atau password salah');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Email atau password salah');

    const fullUser = await this.usersService.findOne(user.id);
    return this.generateToken(fullUser);
  }

  async getFullUser(userId: number) {
    return this.usersService.findOne(userId);
  }

  // FIX #1: changePassword sekarang berfungsi untuk admin juga
  async changePassword(userId: number, oldPassword: string, newPassword: string) {
    const user = await this.usersService.findOneWithPassword(userId);
    if (!user) throw new NotFoundException('User tidak ditemukan');
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new UnauthorizedException('Password lama salah');
    const hashed = await bcrypt.hash(newPassword, 10);
    await this.usersService.update(userId, { password: hashed });
    return { message: 'Password berhasil diubah' };
  }

  // FIX #7: verifikasi token dari link email
  async verifyEmail(token: string) {
    const user = await this.usersService.findByVerifyToken(token);
    if (!user) throw new NotFoundException('Token verifikasi tidak valid atau sudah kedaluarsa');

    await this.usersService.update(user.id, {
      isEmailVerified: true,
      emailVerifyToken: undefined,
    });

    const updated = await this.usersService.findOne(user.id);
    return {
      ...this.generateToken(updated),
      message: 'Email berhasil diverifikasi!',
    };
  }

  // FIX #7: kirim ulang email verifikasi
  async resendVerification(userId: number) {
    const user = await this.usersService.findOne(userId);
    if (user.isEmailVerified) {
      return { message: 'Email sudah terverifikasi' };
    }
    const emailVerifyToken = crypto.randomBytes(32).toString('hex');
    await this.usersService.update(userId, { emailVerifyToken });
    await this.sendVerificationEmail(user.email, user.name, emailVerifyToken).catch(() => {
      console.warn(`⚠️  Gagal kirim ulang email verifikasi ke ${user.email}`);
    });
    return { message: 'Email verifikasi dikirim ulang' };
  }

  private async sendVerificationEmail(email: string, name: string, token: string) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:5173');
    const verifyUrl   = `${frontendUrl}/verify-email?token=${token}`;

    // Coba kirim via nodemailer jika SMTP tersedia
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    if (!smtpHost) {
      // SMTP belum dikonfigurasi — log token untuk development
      console.log(`\n📧 [DEV] Email verifikasi untuk ${email}:`);
      console.log(`   URL  : ${verifyUrl}`);
      console.log(`   Token: ${token}\n`);
      return;
    }

    try {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.createTransport({
        host:   smtpHost,
        port:   this.configService.get<number>('SMTP_PORT', 587),
        secure: false,
        auth: {
          user: this.configService.get<string>('SMTP_USER'),
          pass: this.configService.get<string>('SMTP_PASS'),
        },
      });

      await transporter.sendMail({
        from:    `"Dinas Academy" <${this.configService.get('SMTP_USER')}>`,
        to:      email,
        subject: 'Verifikasi Email — Dinas Academy',
        html: `
          <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px">
            <h2 style="color:#2563EB">Halo, ${name}! 👋</h2>
            <p>Terima kasih sudah mendaftar di <strong>Dinas Academy</strong>.</p>
            <p>Klik tombol di bawah untuk memverifikasi email kamu:</p>
            <a href="${verifyUrl}"
               style="display:inline-block;margin:16px 0;padding:12px 24px;background:#2563EB;color:white;text-decoration:none;border-radius:8px;font-weight:bold">
              ✅ Verifikasi Email
            </a>
            <p style="color:#888;font-size:12px">Link berlaku 24 jam. Jika tidak mendaftar, abaikan email ini.</p>
          </div>`,
      });
    } catch (err) {
      console.error('Gagal kirim email:', err);
      throw err;
    }
  }

  private generateToken(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        school: user.school,
        photoUrl: user.photoUrl,
        hasPurchasedPackage: user.hasPurchasedPackage,
        packageType: user.packageType,
        targetType: user.targetType,
        targetUniversity: user.targetUniversity,
        targetMajor: user.targetMajor,
        goals: user.goals,
        profileCompleted: user.profileCompleted,
        isEmailVerified: user.isEmailVerified,
        joinDate: user.joinDate,
      },
    };
  }
}
