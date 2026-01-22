import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { IMessageProvider } from './message-provider.interface';

/**
 * Provider para Meta WhatsApp Cloud API
 * Usado em PRODUÇÃO quando Meta aprovar
 */
@Injectable()
export class MetaWhatsAppProvider implements IMessageProvider {
  private readonly logger = new Logger(MetaWhatsAppProvider.name);
  private readonly apiUrl = 'https://graph.facebook.com/v18.0';
  readonly name = 'Meta WhatsApp Cloud API';

  /**
   * Envia mensagem via Meta WhatsApp Cloud API
   */
  async sendMessage(to: string, message: string): Promise<void> {
    const accessToken = process.env.META_ACCESS_TOKEN;
    const phoneNumberId = process.env.META_PHONE_NUMBER_ID;

    if (!this.isConfigured()) {
      throw new Error('Meta WhatsApp provider not configured');
    }

    try {
      await axios.post(
        `${this.apiUrl}/${phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to,
          type: 'text',
          text: { body: message },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(`Meta: Message sent to ${to}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Meta: Error sending message: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Processa webhook do Meta
   */
  async handleIncomingMessage(data: any): Promise<void> {
    // Implementação será feita pelo MetaWhatsAppService
    this.logger.log('Meta: Incoming message received');
  }

  /**
   * Verifica se está configurado
   */
  isConfigured(): boolean {
    return !!(
      process.env.META_ACCESS_TOKEN &&
      process.env.META_PHONE_NUMBER_ID &&
      process.env.META_WEBHOOK_VERIFY_TOKEN
    );
  }
}
