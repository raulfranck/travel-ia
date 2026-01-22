import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IMessageProvider } from '../whatsapp/providers/message-provider.interface';
import { ChatMessage } from './entities/chat-message.entity';

/**
 * Provider para WebChat (DESENVOLVIMENTO)
 * Armazena mensagens no banco e permite chat em tempo real
 * 
 * ⚠️ REMOVER EM PRODUÇÃO - Apenas para desenvolvimento
 */
@Injectable()
export class WebChatProvider implements IMessageProvider {
  private readonly logger = new Logger(WebChatProvider.name);
  readonly name = 'WebChat (Development)';

  constructor(
    @InjectRepository(ChatMessage)
    private readonly chatMessageRepository: Repository<ChatMessage>,
  ) {}

  /**
   * Envia mensagem do bot (salva no banco)
   */
  async sendMessage(to: string, message: string): Promise<void> {
    try {
      await this.chatMessageRepository.save({
        userId: to,
        sender: 'bot',
        message,
        read: false,
      });

      this.logger.log(`WebChat: Message sent to ${to}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`WebChat: Error sending message: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Processa mensagem recebida do usuário
   */
  async handleIncomingMessage(data: { userId: string; message: string }): Promise<void> {
    try {
      await this.chatMessageRepository.save({
        userId: data.userId,
        sender: 'user',
        message: data.message,
        read: false,
      });

      this.logger.log(`WebChat: Message received from ${data.userId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`WebChat: Error handling message: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * WebChat sempre está configurado (não precisa de credenciais)
   */
  isConfigured(): boolean {
    return true;
  }

  /**
   * Busca mensagens de um usuário
   */
  async getMessages(userId: string, limit: number = 50): Promise<ChatMessage[]> {
    return this.chatMessageRepository.find({
      where: { userId },
      order: { timestamp: 'ASC' },
      take: limit,
    });
  }

  /**
   * Marca mensagens como lidas
   */
  async markAsRead(userId: string): Promise<void> {
    await this.chatMessageRepository.update(
      { userId, read: false },
      { read: true },
    );
  }

  /**
   * Limpa mensagens antigas (manutenção)
   */
  async clearOldMessages(daysOld: number = 7): Promise<void> {
    const date = new Date();
    date.setDate(date.getDate() - daysOld);

    await this.chatMessageRepository
      .createQueryBuilder()
      .delete()
      .where('timestamp < :date', { date })
      .execute();

    this.logger.log(`WebChat: Cleared messages older than ${daysOld} days`);
  }
}
