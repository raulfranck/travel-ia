import { IsString, IsDateString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateTripDto {
  @IsString()
  userId: string;

  @IsString()
  destination: string;

  @IsDateString()
  startDate: Date;

  @IsDateString()
  endDate: Date;

  @IsNumber()
  @Min(1)
  numberOfPeople: number;

  @IsNumber()
  @IsOptional()
  estimatedBudget?: number;
}

