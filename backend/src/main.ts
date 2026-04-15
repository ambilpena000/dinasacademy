import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    app.enableCors({
      origin: 'http://localhost:5173',
      credentials: true,
    });

    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

    app.setGlobalPrefix('api');

    const port = 3000;
    await app.listen(port);
    console.log(`✅ Backend berjalan di http://localhost:${port}/api`);
  } catch (error) {
    console.error('❌ Gagal menjalankan backend:', error);
    process.exit(1);
  }
}
bootstrap();