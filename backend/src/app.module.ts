import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';

// Modules
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { TravelModule } from './travel/travel.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PaymentModule } from './payment/payment.module';
import { ExpenseModule } from './expense/expense.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ChatModule } from './chat/chat.module'; // ⚠️ REMOVER EM PRODUÇÃO
import { DashboardModule } from './dashboard/dashboard.module';

// Config
import { databaseConfig } from './config/database.config';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
    }),

    // Database
    TypeOrmModule.forRoot(databaseConfig),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10) * 1000,
        limit: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
      },
    ]),

    // Scheduling
    ScheduleModule.forRoot(),

    // Feature modules
    WhatsappModule,
    TravelModule,
    UserModule,
    AuthModule,
    PaymentModule,
    ExpenseModule,
    AnalyticsModule,
    ChatModule, // ⚠️ REMOVER EM PRODUÇÃO
    DashboardModule,
  ],
})
export class AppModule {}

