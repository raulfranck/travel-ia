import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller';
import { WebChatProvider } from './web-chat.provider';
import { ChatMessage } from './entities/chat-message.entity';
import { WhatsappModule } from '../whatsapp/whatsapp.module';

/**
 * ChatModule - Módulo isolado para desenvolvimento
 * 
 * ⚠️ REMOVER EM PRODUÇÃO:
 * 1. Deletar pasta backend/src/chat
 * 2. Remover import em app.module.ts
 * 3. Remover ChatMessage das entities em database.config.ts
 * 4. Deletar pasta frontend/app/chat
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([ChatMessage]),
    WhatsappModule, // Reutiliza a lógica do bot
  ],
  controllers: [ChatController],
  providers: [WebChatProvider],
  exports: [WebChatProvider],
})
export class ChatModule {}
