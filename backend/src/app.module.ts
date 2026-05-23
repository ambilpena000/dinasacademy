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

@Module({
  imports: [
    // Load .env dari root backend (backend/.env)
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // TypeORM menggunakan variabel dari .env via ConfigService
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USERNAME', 'postgres'),
        password: config.get<string>('DB_PASSWORD', ''),
        database: config.get<string>('DB_NAME', 'dinasacademy'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        // WARNING: synchronize: true hanya untuk development!
        // Di production, gunakan migrations.
        synchronize: true,
      }),
    }),

    AuthModule,
    UsersModule,
    TryoutsModule,
    QuestionsModule,
    ExamModule,
    ResultsModule,
    OrdersModule,
    PackagesModule,
  ],
})
export class AppModule {}