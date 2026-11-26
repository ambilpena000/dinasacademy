import { Controller, Get } from '@nestjs/common';

// GET /api/health — cek server hidup TANPA menyentuh database.
// Dipakai health check Render & pemantau uptime (mis. UptimeRobot) agar backend
// tidak "tidur", tanpa ikut membangunkan database Neon (hemat kuota komputasi gratis).
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok', time: new Date().toISOString() };
  }
}
