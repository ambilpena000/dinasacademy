import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './user.entity';
import { UserPhoto } from './user-photo.entity';
import { UserPhotoController } from './user-photo.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserPhoto])],
  providers: [UsersService],
  controllers: [UsersController, UserPhotoController],
  exports: [UsersService], // export agar bisa dipakai AuthModule
})
export class UsersModule {}