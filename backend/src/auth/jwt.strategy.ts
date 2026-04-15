// ── jwt.strategy.ts ──────────────────────────────────────────
// Ini yang memvalidasi token JWT di setiap request
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // Ambil token dari header: "Authorization: Bearer xxx"
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'dinasacademy_secret',
    });
  }

  // Dipanggil otomatis setelah token valid
  // Hasilnya tersedia di req.user di controller
  async validate(payload: any) {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}