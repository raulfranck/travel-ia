import { IsString, IsDateString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { TripStatus } from '../entities/trip.entity';

export class UpdateTripDto {
  @IsString()
  @IsOptional()
  destination?: string;

  @IsDateString()
  @IsOptional()
  startDate?: Date;

  @IsDateString()
  @IsOptional()
  endDate?: Date;

  @IsNumber()
  @IsOptional()
  numberOfPeople?: number;

  @IsNumber()
  @IsOptional()
  estimatedBudget?: number;

  @IsEnum(TripStatus)
  @IsOptional()
  status?: TripStatus;

  @IsOptional()
  itineraryData?: Record<string, any>;
}

