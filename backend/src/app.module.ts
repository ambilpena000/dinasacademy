import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PackagesModule } from './packages/packages.module';
import { OrdersModule } from './orders/orders.module';
import { TryoutsModule } from './tryouts/tryouts.module';
import { QuestionsModule } from './questions/questions.module';
import { ResultsModule } from './results/results.module';
import { ExamModule } from './exam/exam.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // ⚠️ SEMENTARA: hardcode untuk test koneksi
    // Ganti 'postgres123' dengan password PostgreSQL kamu
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'Maslangg06',   // ← GANTI INI dengan password kamu
      database: 'dinasacademy',
      autoLoadEntities: true,
      synchronize: true,
    }),

    AuthModule,
    UsersModule,
    PackagesModule,
    OrdersModule,
    TryoutsModule,
    QuestionsModule,
    ResultsModule,
    ExamModule,
  ],
})
export class AppModule {}