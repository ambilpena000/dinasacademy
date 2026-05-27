import { Injectable, UnauthorizedException } from '@nestjs/common';
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

  // BUG FIX #1 (lanjutan): tidak ada lagi pengecekan hardcode 'admin'
  // Semua user (termasuk admin) diambil dari DB — hasPurchasedPackage selalu fresh
  async validate(payload: any) {
    try {
      const user = await this.usersService.findOne(Number(payload.sub));
      if (!user) throw new UnauthorizedException('Token tidak valid');
      return {
        id: user.id,
        email: user.email,
        role: user.role,
        hasPurchasedPackage: user.hasPurchasedPackage,
        packageType: user.packageType,
      };
    } catch {
      throw new UnauthorizedException('Token tidak valid atau sudah kadaluarsa');
    }
  }
}
