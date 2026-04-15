import { Module } from '@nestjs/common';
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
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'Maslangg06',   // pastikan sesuai password Anda
      database: 'dinasacademy',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
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