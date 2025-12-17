import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { StudentsModule } from './modules/students/students.module';
import { TutorsModule } from './modules/tutors/tutors.module';
import { AdminModule } from './modules/admin/admin.module';
import { AcademicReportsModule } from './modules/academic-reports/academic-reports.module';
import { SessionSummariesModule } from './modules/session-summaries/session-summaries.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { QuizTemplatesModule } from './modules/quiz-templates/quiz-templates.module';
import { QuizAssignmentsModule } from './modules/quiz-assignments/quiz-assignments.module';
import { StudentAnswersModule } from './modules/student-answers/student-answers.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ChatModule } from './modules/chat/chat.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

// Polyfill for crypto.randomUUID in Node.js 18
if (!globalThis.crypto?.randomUUID) {
  globalThis.crypto = {
    ...globalThis.crypto,
    randomUUID: () => require('crypto').randomUUID()
  } as any;
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: parseInt(configService.get('DB_PORT') || '5433'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
        retryAttempts: 10,
        retryDelay: 3000,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    StudentsModule,
    TutorsModule,
    AdminModule,
    BookingsModule,
    AcademicReportsModule,
    SessionSummariesModule,
    ReviewsModule,
    QuizTemplatesModule,
    QuizAssignmentsModule,
    StudentAnswersModule,
    PaymentsModule,
    ChatModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
