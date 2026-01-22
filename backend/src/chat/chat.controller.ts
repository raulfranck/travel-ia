import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { WebChatProvider } from './web-chat.provider';
import { MetaWhatsAppService } from '../whatsapp/meta-whatsapp.service';

/**
 * Controller para WebChat (DESENVOLVIMENTO)
 * 
 * ⚠️ REMOVER EM PRODUÇÃO
 */
@Controller('chat')
export class ChatController {
  constructor(
    private readonly webChatProvider: WebChatProvider,
    private readonly metaWhatsappService: MetaWhatsAppService,
  ) {}

  /**
   * POST /api/chat/send
   * Envia mensagem do usuário para o bot
   */
  @Post('send')
  async sendMessage(@Body() body: { userId: string; message: string }) {
    const { userId, message } = body;

    // Salva mensagem do usuário
    await this.webChatProvider.handleIncomingMessage({ userId, message });

    // Processa com a lógica do bot (mesma do WhatsApp)
    const response = await this.metaWhatsappService.processUserMessage(userId, message);

    // Envia resposta do bot
    await this.webChatProvider.sendMessage(userId, response);

    return { success: true, response };
  }

  /**
   * GET /api/chat/messages/:userId
   * Busca mensagens de um usuário
   */
  @Get('messages/:userId')
  async getMessages(
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
  ) {
    const messages = await this.webChatProvider.getMessages(
      userId,
      limit ? parseInt(limit) : 50,
    );

    return { messages };
  }

  /**
   * POST /api/chat/mark-read/:userId
   * Marca mensagens como lidas
   */
  @Post('mark-read/:userId')
  async markAsRead(@Param('userId') userId: string) {
    await this.webChatProvider.markAsRead(userId);
    return { success: true };
  }

  /**
   * GET /api/chat/health
   * Health check do chat
   */
  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      service: 'webchat',
      mode: 'development',
      warning: 'Remove this module in production',
    };
  }
}
