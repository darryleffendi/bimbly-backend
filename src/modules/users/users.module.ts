import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { StudentsModule } from '../students/students.module';
import { TutorsModule } from '../tutors/tutors.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    StudentsModule,
    TutorsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
