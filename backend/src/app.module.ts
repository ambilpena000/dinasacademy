import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TryoutsModule } from './tryouts/tryouts.module';
import { QuestionsModule } from './questions/questions.module';
import { ExamModule } from './exam/exam.module';
import { ResultsModule } from './results/results.module';
import { OrdersModule } from './orders/orders.module';
import { PackagesModule } from './packages/packages.module';
import { dbConnectionOptions } from './config/db-connection';
import { HealthController } from './health.controller';
import { UniversitiesModule } from './universities/universities.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isDev = config.get<string>('NODE_ENV', 'development') !== 'production';
        return {
          // DATABASE_URL (Neon/Supabase, SSL) atau DB_HOST/DB_PORT/... (lokal/VPS)
          ...dbConnectionOptions(process.env),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          migrations: [__dirname + '/migrations/*{.ts,.js}'],
          // Development: synchronize (skema mengikuti entity otomatis).
          // Production : synchronize mati, migrasi tertunda dijalankan otomatis saat start.
          synchronize: isDev,
          migrationsRun: !isDev,
          logging: isDev,
        };
      },
    }),

    AuthModule,
    UsersModule,
    TryoutsModule,
    QuestionsModule,
    ExamModule,
    ResultsModule,
    OrdersModule,
    PackagesModule,
    UniversitiesModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
