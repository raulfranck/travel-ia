import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { whatsappHash: string }) {
    return this.authService.login(body.whatsappHash);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() body: { whatsappHash: string; otp: string }) {
    return this.authService.verifyOtp(body.whatsappHash, body.otp);
  }
}

