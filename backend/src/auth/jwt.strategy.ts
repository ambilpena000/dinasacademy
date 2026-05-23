// ── jwt.strategy.ts ──────────────────────────────────────────
// Ini yang memvalidasi token JWT di setiap request
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      // Ambil token dari header: "Authorization: Bearer xxx"
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET', 'dinasacademy_secret'),
    });
  }

  // Dipanggil otomatis setelah token valid
  // Hasilnya tersedia di req.user di controller
  // PENTING: property di sini harus konsisten di semua controller
  async validate(payload: any) {
    return {
      id: payload.sub,       // user ID (number atau 'admin')
      email: payload.email,
      role: payload.role,
    };
  }
}