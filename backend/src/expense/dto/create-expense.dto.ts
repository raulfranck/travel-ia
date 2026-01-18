import { IsString, IsNumber, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { ExpenseCategory } from '../entities/expense.entity';

export class CreateExpenseDto {
  @IsString()
  tripId: string;

  @IsNumber()
  amount: number;

  @IsString()
  currency: string;

  @IsEnum(ExpenseCategory)
  category: ExpenseCategory;

  @IsString()
  description: string;

  @IsDateString()
  date: Date;

  @IsString()
  @IsOptional()
  receiptUrl?: string;

  @IsString()
  @IsOptional()
  ocrText?: string;
}

