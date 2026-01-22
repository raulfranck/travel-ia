import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

/**
 * Entidade para armazenar mensagens do chat web
 * APENAS para desenvolvimento - será removida em produção
 */
@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  userId: string; // ID do usuário ou sessão

  @Column({ type: 'enum', enum: ['user', 'bot'] })
  sender: 'user' | 'bot';

  @Column({ type: 'text' })
  message: string;

  @CreateDateColumn()
  timestamp: Date;

  @Column({ type: 'boolean', default: false })
  read: boolean;
}
