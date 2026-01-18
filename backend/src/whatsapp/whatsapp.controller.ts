import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { MetaWhatsAppService } from './meta-whatsapp.service';

@Controller('whatsapp')
export class WhatsappController {
  constructor(
    private readonly metaWhatsappService: MetaWhatsAppService,
  ) {}

  /**
   * Webhook Meta - GET (verificação)
   * Meta envia GET request para verificar o webhook durante a configuração
   */
  @Get('webhook')
  verifyMetaWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {
    return this.metaWhatsappService.verifyWebhook(mode, token, challenge);
  }

  /**
   * Webhook Meta - POST
   * Recebe mensagens via Meta WhatsApp Cloud API
   */
  @Post('webhook')
  async handleMetaWebhook(@Body() body: any) {
    return this.metaWhatsappService.handleWebhook(body);
  }

  /**
   * Health check
   * Verifica se o serviço está funcionando e se as credenciais estão configuradas
   */
  @Get('health')
  healthCheck() {
    const metaConfigured = !!(
      process.env.META_ACCESS_TOKEN && 
      process.env.META_PHONE_NUMBER_ID
    );

    return { 
      status: 'ok', 
      service: 'whatsapp',
      provider: 'meta',
      configured: metaConfigured,
    };
  }
}
