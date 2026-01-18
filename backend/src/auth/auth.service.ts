import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(whatsappHash: string) {
    const user = await this.userService.findByWhatsappHash(whatsappHash);
    
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    // Aqui você implementaria o envio de OTP via WhatsApp
    return {
      message: 'OTP enviado para seu WhatsApp',
      userId: user.id,
    };
  }

  async verifyOtp(whatsappHash: string, otp: string) {
    // Aqui você verificaria o OTP (ex: Redis)
    // Por simplicidade, vamos gerar o token direto
    
    const user = await this.userService.findByWhatsappHash(whatsappHash);
    
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    const payload = { sub: user.id, whatsappHash: user.whatsappHash };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        plan: user.plan,
      },
    };
  }
}

