import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET', 'dinasacademy_secret'),
    });
  }

  // Dipanggil otomatis setelah token valid
  // Sertakan hasPurchasedPackage & packageType agar tryouts controller bisa filter
  async validate(payload: any) {
    // Admin hardcode
    if (payload.sub === 'admin' || payload.role === 'admin') {
      return {
        id: 'admin',
        email: payload.email,
        role: 'admin',
        hasPurchasedPackage: true,
        packageType: null,
      };
    }

    // User biasa: ambil data terbaru dari DB
    try {
      const user = await this.usersService.findOne(Number(payload.sub));
      if (user) {
        return {
          id: user.id,
          email: user.email,
          role: user.role,
          hasPurchasedPackage: user.hasPurchasedPackage,
          packageType: user.packageType,
        };
      }
    } catch {}

    // Fallback jika DB tidak terjangkau
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      hasPurchasedPackage: false,
      packageType: null,
    };
  }
}
