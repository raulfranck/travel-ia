import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { createHash } from 'crypto';
import { UserService } from '../user/user.service';
import { TravelService } from '../travel/travel.service';

interface MetaWebhookMessage {
  from: string;
  id: string;
  timestamp: string;
  text?: {
    body: string;
  };
  type: string;
}

/**
 * Service para integração com Meta WhatsApp Cloud API
 * 
 * Vantagens:
 * - Funciona com números brasileiros
 * - 1000 conversas grátis/mês
 * - API oficial do WhatsApp
 * - Sem restrições geográficas
 */
@Injectable()
export class MetaWhatsAppService {
  private readonly logger = new Logger(MetaWhatsAppService.name);
  private readonly apiUrl = 'https://graph.facebook.com/v18.0';

  constructor(
    private readonly userService: UserService,
    private readonly travelService: TravelService,
  ) {}

  /**
   * Envia mensagem via Meta WhatsApp Cloud API
   * @param to Número de telefone (formato: 5511999999999)
   * @param message Texto da mensagem
   */
  async sendMessage(to: string, message: string): Promise<void> {
    const phoneNumberId = process.env.META_PHONE_NUMBER_ID;
    const accessToken = process.env.META_ACCESS_TOKEN;

    if (!phoneNumberId || !accessToken) {
      throw new Error('Meta WhatsApp credentials not configured in .env');
    }

    try {
      const response = await axios.post(
        `${this.apiUrl}/${phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: to.replace(/\D/g, ''), // Remove caracteres não numéricos
          type: 'text',
          text: {
            preview_url: false,
            body: message,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(`Mensagem enviada para ${to} via Meta`);
      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Erro ao enviar mensagem via Meta: ${errorMessage}`);
      
      if (axios.isAxiosError(error)) {
        this.logger.error(`Response: ${JSON.stringify(error.response?.data)}`);
      }
      
      throw error;
    }
  }

  /**
   * Processa webhook do Meta WhatsApp
   * @param body Payload do webhook
   */
  async handleWebhook(body: any): Promise<{ success: boolean }> {
    try {
      if (body.object === 'whatsapp_business_account') {
        const entries = body.entry || [];

        for (const entry of entries) {
          const changes = entry.changes || [];

          for (const change of changes) {
            if (change.field === 'messages') {
              const value = change.value;

              // Processar mensagens recebidas
              if (value.messages) {
                for (const message of value.messages) {
                  await this.processMessage(message);
                }
              }

              // Processar status de mensagens (entregue, lido, etc)
              if (value.statuses) {
                this.logger.log(`Status update: ${JSON.stringify(value.statuses)}`);
              }
            }
          }
        }
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Erro ao processar webhook Meta: ${errorMessage}`);
      return { success: false };
    }
  }

  /**
   * Verifica webhook (Meta envia GET request na configuração)
   * @param mode Modo de verificação
   * @param token Token de verificação
   * @param challenge Challenge string
   */
  verifyWebhook(
    mode: string,
    token: string,
    challenge: string,
  ): string | { error: string } {
    const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN || 'my_verify_token';

    if (mode === 'subscribe' && token === verifyToken) {
      this.logger.log('Webhook Meta verificado com sucesso');
      return challenge;
    } else {
      this.logger.error('Falha na verificação do webhook Meta');
      return { error: 'Verification failed' };
    }
  }

  /**
   * Processa mensagem individual
   * @param message Mensagem do webhook
   */
  private async processMessage(message: MetaWebhookMessage): Promise<void> {
    const from = message.from;
    const messageBody = message.text?.body || '';
    const messageType = message.type;

    this.logger.log(`Mensagem recebida de ${from} (${messageType}): ${messageBody}`);

    // Ignora mensagens que não são texto por enquanto
    if (messageType !== 'text') {
      this.logger.log(`Tipo de mensagem não suportado: ${messageType}`);
      return;
    }

    try {
      // Hash do número para privacidade
      const whatsappHash = this.hashPhoneNumber(from);

      // Busca ou cria usuário
      let user = await this.userService.findByWhatsappHash(whatsappHash);
      
      if (!user) {
        user = await this.userService.create({ whatsappHash, whatsappNumber: from });
      }

      // Processa comando e gera resposta
      const response = await this.processCommand(user, messageBody);
      
      // Envia resposta
      await this.sendMessage(from, response);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Erro ao processar mensagem: ${errorMessage}`);
      
      // Envia mensagem de erro amigável
      await this.sendMessage(
        from,
        'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente em alguns instantes.',
      );
    }
  }

  /**
   * Processa mensagem do usuário (público para uso do WebChat)
   * @param userId ID do usuário (hash WhatsApp ou userID do chat)
   * @param message Texto da mensagem
   */
  async processUserMessage(userId: string, message: string): Promise<string> {
    try {
      // Para WebChat, usa o próprio userId como hash
    const whatsappHash = userId;
    
    // Busca ou cria usuário
    let user = await this.userService.findByWhatsappHash(whatsappHash);
    
    if (!user) {
      user = await this.userService.create({ 
        whatsappHash,
        whatsappNumber: userId.startsWith('+') ? userId : undefined, // Só se for número real
        hasConsented: true // WebChat já aceita implicitamente
      });
    }

      // Processa comando e gera resposta
      return await this.processCommand(user, message);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Erro ao processar mensagem: ${errorMessage}`);
      return 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.';
    }
  }

  /**
   * Processa comandos do usuário
   * @param user Usuário que enviou a mensagem
   * @param message Texto da mensagem
   */
  private async processCommand(user: any, message: string): Promise<string> {
    const lowerMessage = message.toLowerCase().trim();

    // Comando: /start ou saudações - Onboarding
    if (
      lowerMessage === '/start' ||
      lowerMessage === 'oi' ||
      lowerMessage === 'olá' ||
      lowerMessage === 'ola' ||
      lowerMessage === 'iniciar'
    ) {
      if (!user.hasConsented) {
        return this.getConsentMessage();
      }
      return this.getWelcomeMessage(user);
    }

    // Consentimento
    if (lowerMessage === 'aceito' && !user.hasConsented) {
      await this.userService.giveConsent(user.id);
      return this.getWelcomeMessage(user);
    }

    // Comando: /help
    if (lowerMessage === '/help' || lowerMessage === 'ajuda') {
      return this.getHelpMessage();
    }

    // Se usuário não deu consentimento
    if (!user.hasConsented) {
      return 'Por favor, digite "aceito" para concordar com nossos termos e começar a usar o TravelBot Pro! 🚀';
    }

    // Comando: /nova viagem
    if (lowerMessage === '/nova' || lowerMessage.startsWith('/nova') || lowerMessage.includes('planejar viagem')) {
      return `🗺️ *Vamos criar sua viagem!*

Para criar uma viagem, me conte:

📍 Destino
📅 Datas (início e fim)
👥 Quantas pessoas
💰 Orçamento estimado

Exemplo: "Quero ir para Paris de 10/03 a 20/03, somos 2 pessoas, orçamento de R$ 15.000"`;
    }

    // Comando: /viagens
    if (lowerMessage === '/viagens' || lowerMessage === '/trips') {
      return `📋 *Suas Viagens*

Você ainda não tem viagens cadastradas.

Digite /nova para criar sua primeira viagem! ✈️`;
    }

    // Comando: /gastos
    if (lowerMessage === '/gastos' || lowerMessage === '/expenses') {
      return `💰 *Gestão de Gastos*

Você ainda não tem despesas registradas.

Envie uma foto do comprovante para registrar automaticamente (OCR)!`;
    }

    // Comando: /upgrade
    if (lowerMessage === '/upgrade' || lowerMessage.includes('plano')) {
      return this.getUpgradeMessage(user);
    }

    // Verifica limite do plano
    const canCreateTrip = await this.userService.canCreateTrip(user.id);
    if (!canCreateTrip) {
      return this.getUpgradeMessage(user);
    }

    // Processamento de linguagem natural para criar viagem
    // (Aqui você pode integrar com OpenAI para entender a intenção)
    return `Entendi! Estou processando sua solicitação... 🤖

Digite /help para ver todos os comandos disponíveis ou continue conversando naturalmente comigo!`;
  }

  /**
   * Gera hash do número de telefone para privacidade
   * @param phoneNumber Número de telefone
   */
  private hashPhoneNumber(phoneNumber: string): string {
    return createHash('sha256').update(phoneNumber).digest('hex');
  }

  /**
   * Mensagens do sistema
   */
  private getConsentMessage(): string {
    return `🌍 *Bem-vindo ao TravelBot Pro!*

Antes de começar, precisamos do seu consentimento para:
• Processar seus dados de viagem
• Armazenar informações de forma segura
• Enviar notificações relevantes

Seus dados são protegidos conforme LGPD/GDPR.

Digite *"aceito"* para continuar ou /help para mais informações.`;
  }

  private getWelcomeMessage(user: any): string {
    return `🎉 Olá${user.name ? `, ${user.name}` : ''}!

Sou seu assistente de viagens inteligente! 🤖✈️

Posso te ajudar a:
✅ Planejar viagens personalizadas
💰 Gerenciar despesas
🗺️ Criar roteiros detalhados
🏨 Encontrar hotéis e voos

Digite /nova para começar uma viagem ou /help para ver todos os comandos.

Plano atual: *${user.plan.toUpperCase()}*`;
  }

  private getHelpMessage(): string {
    return `📚 *Comandos disponíveis:*

*🚀 Viagens*
/nova - Criar nova viagem
/viagens - Ver suas viagens
/gastos - Ver despesas

*⚙️ Configurações*
/upgrade - Melhorar seu plano

*💬 Geral*
/start - Voltar ao início
/help - Mostrar esta ajuda

*Ou converse naturalmente comigo!*
Você pode simplesmente me dizer para onde quer viajar, quando, e eu te ajudo a planejar tudo! 🎉

Exemplo:
_"Quero ir para Paris em maio"_
_"Preciso de um roteiro para o Nordeste"_`;
  }

  private getUpgradeMessage(user: any): string {
    const planLimits: Record<string, string> = {
      free: '1 viagem/mês',
      basic: '10 viagens/mês',
      pro: 'viagens ilimitadas',
    };

    return `⚠️ Você atingiu o limite do plano ${user.plan.toUpperCase()}!

Limite atual: ${planLimits[user.plan as keyof typeof planLimits]}

💎 Upgrade seus planos:
• BASIC - R$ 19/mês - 10 viagens
• PRO - R$ 49/mês - Ilimitado + features extras

Para fazer upgrade, acesse: https://travelbot.pro/upgrade

Digite /help para ver outros comandos disponíveis.`;
  }
}

