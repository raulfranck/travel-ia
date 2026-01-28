import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { AuthModule } from '../auth/auth.module';
import { TravelModule } from '../travel/travel.module';
import { ExpenseModule } from '../expense/expense.module';

@Module({
  imports: [AuthModule, TravelModule, ExpenseModule],
  controllers: [DashboardController],
})
export class DashboardModule {}
