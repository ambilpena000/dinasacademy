import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    const config = app.get(ConfigService);

    app.enableCors({
      origin: config.get<string>('FRONTEND_URL', 'http://localhost:5173'),
      credentials: true,
    });

    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.setGlobalPrefix('api');

    // FIX #5: serve file statis dari folder uploads/
    // Foto profil bisa diakses via: http://localhost:3000/uploads/photos/xxx.jpg
    const uploadsPath = join(process.cwd(), 'uploads');
    if (!existsSync(uploadsPath)) mkdirSync(uploadsPath, { recursive: true });
    app.useStaticAssets(uploadsPath, { prefix: '/uploads' });

    const port = config.get<number>('PORT', 3000);
    await app.listen(port);
    console.log(`✅ Backend berjalan di http://localhost:${port}/api`);
    console.log(`📁 Static uploads: http://localhost:${port}/uploads`);
  } catch (error) {
    console.error('❌ Gagal menjalankan backend:', error);
    process.exit(1);
  }
}
bootstrap();
