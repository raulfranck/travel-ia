import { IsString, IsEmail, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { UserPlan } from '../entities/user.entity';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsEnum(UserPlan)
  @IsOptional()
  plan?: UserPlan;

  @IsBoolean()
  @IsOptional()
  hasConsented?: boolean;

  @IsString()
  @IsOptional()
  stripeCustomerId?: string;

  @IsString()
  @IsOptional()
  stripeSubscriptionId?: string;

  @IsOptional()
  preferences?: Record<string, any>;
}

