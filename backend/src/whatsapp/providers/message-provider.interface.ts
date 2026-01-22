/**
 * Interface para providers de mensagens
 * Permite trocar entre diferentes implementações (Meta, WebChat, etc)
 */
export interface IMessageProvider {
  /**
   * Nome do provider (para logs e identificação)
   */
  readonly name: string;

  /**
   * Envia mensagem para um destinatário
   * @param to Identificador do destinatário (número WhatsApp, userID, etc)
   * @param message Texto da mensagem
   */
  sendMessage(to: string, message: string): Promise<void>;

  /**
   * Processa mensagem recebida
   * @param data Dados da mensagem recebida (formato varia por provider)
   */
  handleIncomingMessage(data: any): Promise<void>;

  /**
   * Verifica se o provider está configurado e pronto
   */
  isConfigured(): boolean;
}
