import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';
import { UserPlan } from '../entities/user.entity';

export class CreateUserDto {
  @IsString()
  whatsappHash: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsEnum(UserPlan)
  @IsOptional()
  plan?: UserPlan;
}

