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
          type: 'postgres',
          host: config.get<string>('DB_HOST', 'localhost'),
          port: config.get<number>('DB_PORT', 5432),
          username: config.get<string>('DB_USERNAME', 'postgres'),
          password: config.get<string>('DB_PASSWORD', ''),
          database: config.get<string>('DB_NAME', 'dinasacademy'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          // synchronize hanya aktif di development
          // di production gunakan: npm run migration:run
          synchronize: isDev,
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
  ],
})
export class AppModule {}
