import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { createHash } from 'crypto';
import OpenAI from 'openai';
import { UserService } from '../user/user.service';
import { TravelService } from '../travel/travel.service';
import { ExpenseService } from '../expense/expense.service';
import { AuthService } from '../auth/auth.service';

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
  private openai: OpenAI;

  constructor(
    private readonly userService: UserService,
    private readonly travelService: TravelService,
    private readonly expenseService: ExpenseService,
    private readonly authService: AuthService,
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

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

    // Comando: /dashboard
    if (lowerMessage === '/dashboard' || lowerMessage === '/painel' || lowerMessage.includes('dashboard') || lowerMessage.includes('painel')) {
      try {
        const token = await this.authService.generateDashboardToken(user.id);
        const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/${token}`;
        
        return `📊 *Acesse seu Dashboard Personalizado*

🔗 ${dashboardUrl}

Este link é válido por 30 dias e mostra:
✅ Todas as suas viagens
✅ Gastos em tempo real
✅ Gráficos e estatísticas
✅ Orçamento vs Realizado

Salve o link para acessar quando quiser! 🔖`;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`Erro ao gerar token do dashboard: ${errorMessage}`);
        return 'Desculpe, ocorreu um erro ao gerar seu link do dashboard. Tente novamente.';
      }
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

    // Conversa natural - usar IA para processar
    try {
      const intent = await this.detectIntent(message);
      
      if (intent.type === 'plan_trip') {
        const tripData = await this.extractTripData(message);
        
        if (this.isCompleteTripData(tripData)) {
          return await this.createTripWithAI(user, tripData);
        } else {
          return this.askForMissingInfo(tripData);
        }
      }
      
      if (intent.type === 'check_trips') {
        const trips = await this.travelService.findAll(user.id);
        
        if (trips.length === 0) {
          return '📋 Você ainda não tem viagens cadastradas.\n\nDigite algo como "Quero ir para Paris" para começar! ✈️';
        }
        
        return `📋 Suas Viagens (${trips.length}):\n\n` + 
          trips.map((t, i) => `${i + 1}. ${t.destination} - ${t.status}`).join('\n');
      }

      if (intent.type === 'track_expense') {
        const expenseData = await this.extractExpenseData(message);
        
        if (this.isCompleteExpenseData(expenseData)) {
          return await this.createExpenseWithAI(user, expenseData);
        } else {
          return 'Nao consegui identificar o valor do gasto. Por favor, me diga o valor, o que foi e onde gastou. Exemplo: "Gastei R$ 50 no Uber"';
        }
      }
      
      // Resposta natural para perguntas gerais
      return await this.generateNaturalResponse(message);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Erro na IA: ${errorMessage}`);
      return 'Entendi! Estou processando sua solicitação... 🤖\n\nDigite /help para ver todos os comandos disponíveis ou continue conversando naturalmente comigo!';
    }
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

  /**
   * Detecta a intenção do usuário usando IA
   */
  private async detectIntent(message: string): Promise<{
    type: 'plan_trip' | 'track_expense' | 'check_trips' | 'general_question' | 'other';
    confidence: number;
    data?: any;
  }> {
    const response = await this.openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [{
        role: 'system',
        content: `Você é um classificador de intenções. Analise a mensagem e retorne JSON:
{
  "type": "plan_trip" | "track_expense" | "check_trips" | "general_question" | "other",
  "confidence": 0.0-1.0
}

plan_trip: usuário quer planejar/criar uma viagem
track_expense: usuário quer registrar um gasto
check_trips: usuário quer ver suas viagens
general_question: pergunta geral sobre viagens
other: outro assunto`
      }, {
        role: 'user',
        content: message
      }],
      response_format: { type: 'json_object' },
      temperature: 0.3
    });
    
    return JSON.parse(response.choices[0].message.content || '{}');
  }

  /**
   * Extrai dados de viagem da mensagem usando IA
   */
  private async extractTripData(message: string): Promise<{
    destination?: string;
    startDate?: string;
    endDate?: string;
    numberOfPeople?: number;
    estimatedBudget?: number;
  }> {
    const response = await this.openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [{
        role: 'system',
        content: `Extraia dados de viagem do texto em JSON:
{
  "destination": "cidade/país" ou null,
  "startDate": "YYYY-MM-DD" ou null,
  "endDate": "YYYY-MM-DD" ou null,
  "numberOfPeople": número ou null,
  "estimatedBudget": valor em BRL ou null
}

Inferências permitidas:
- Se mencionar "em março" e estamos em janeiro 2026, assuma março de 2026
- Se mencionar duração (ex: "7 dias"), calcule endDate baseado em startDate
- Normalize nomes de cidades (ex: "rio" -> "Rio de Janeiro")`
      }, {
        role: 'user',
        content: message
      }],
      response_format: { type: 'json_object' },
      temperature: 0.2
    });
    
    return JSON.parse(response.choices[0].message.content || '{}');
  }

  /**
   * Cria viagem e gera roteiro usando IA
   */
  private async createTripWithAI(user: any, tripData: any): Promise<string> {
    try {
      // Criar viagem no banco
      const trip = await this.travelService.createTrip({
        userId: user.id,
        destination: tripData.destination,
        startDate: new Date(tripData.startDate),
        endDate: new Date(tripData.endDate),
        numberOfPeople: tripData.numberOfPeople,
        estimatedBudget: tripData.estimatedBudget
      });
      
      // Gerar roteiro via IA
      const updatedTrip = await this.travelService.generateItinerary(trip.id);
      
      // Formatar resposta
      const days = Math.ceil((new Date(tripData.endDate).getTime() - new Date(tripData.startDate).getTime()) / (1000 * 60 * 60 * 24));
      
      return `✅ Viagem criada com sucesso!

📍 Destino: ${tripData.destination}
📅 Período: ${days} dias
👥 Pessoas: ${tripData.numberOfPeople}
💰 Orçamento: R$ ${tripData.estimatedBudget?.toLocaleString('pt-BR')}

${updatedTrip.itinerary}

💡 Digite /viagens para ver todas as suas viagens!`;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Erro ao criar viagem: ${errorMessage}`);
      return 'Desculpe, ocorreu um erro ao criar sua viagem. Tente novamente.';
    }
  }

  /**
   * Verifica se todos os dados necessários foram fornecidos
   */
  private isCompleteTripData(data: any): boolean {
    return !!(data.destination && data.startDate && data.endDate && data.numberOfPeople);
  }

  /**
   * Retorna mensagem pedindo informações faltantes
   */
  private askForMissingInfo(data: any): string {
    const missing: string[] = [];
    
    if (!data.destination) missing.push('📍 Destino');
    if (!data.startDate) missing.push('📅 Data de início');
    if (!data.endDate) missing.push('📅 Data de fim');
    if (!data.numberOfPeople) missing.push('👥 Número de pessoas');
    
    return `Para criar sua viagem, preciso de mais algumas informações:

${missing.join('\n')}

Por favor, me conte ${missing.length > 1 ? 'essas informações' : 'essa informação'}! 😊`;
  }

  /**
   * Gera resposta natural usando IA para perguntas gerais
   */
  private async generateNaturalResponse(message: string): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [{
        role: 'system',
        content: `Você é o TravelBot Pro, um assistente de viagens brasileiro amigável.
Responda de forma concisa (máximo 200 caracteres) e natural.
Use emojis apropriados.
Seja útil e encoraje o usuário a planejar viagens.`
      }, {
        role: 'user',
        content: message
      }],
      max_tokens: 100,
      temperature: 0.8
    });
    
    return response.choices[0].message.content + '\n\n💡 Digite /help para ver o que posso fazer!';
  }

  // ========== Expense Management Methods ==========

  private async extractExpenseData(message: string): Promise<any> {
    try {
      const prompt = `Extraia informacoes de gasto da mensagem do usuario.

Mensagem: "${message}"

Retorne JSON com:
{
  "amount": valor numerico em reais,
  "category": "accommodation" | "transportation" | "food" | "entertainment" | "shopping" | "other",
  "description": descricao curta,
  "date": data no formato YYYY-MM-DD (hoje se nao especificado)
}

Categorias:
- accommodation: hotel, hostel, airbnb
- transportation: uber, taxi, onibus, metro, aviao
- food: restaurante, lanche, mercado, comida
- entertainment: passeio, ingresso, tour
- shopping: compras, lojas
- other: outros gastos

Exemplos:
"Gastei 50 reais no Uber" -> {"amount": 50, "category": "transportation", "description": "Uber", "date": "${new Date().toISOString().split('T')[0]}"}
"Paguei 150 no restaurante ontem" -> {"amount": 150, "category": "food", "description": "Restaurante", "date": "${new Date(Date.now() - 86400000).toISOString().split('T')[0]}"}`;

      const response = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('Resposta vazia da IA');
      }

      return JSON.parse(content);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Erro ao extrair dados de gasto: ${errorMessage}`);
      return {};
    }
  }

  private isCompleteExpenseData(data: any): boolean {
    return !!(data.amount && data.category && data.description);
  }

  private async createExpenseWithAI(user: any, expenseData: any): Promise<string> {
    try {
      // Busca ultima viagem do usuario
      const trips = await this.travelService.findAll(user.id);
      
      if (trips.length === 0) {
        return 'Voce ainda nao tem viagens cadastradas. Crie uma viagem primeiro!';
      }

      // Pega a viagem mais recente ou a proxima
      const activeTrip = trips.find(t => {
        const now = new Date();
        const start = new Date(t.startDate);
        const end = new Date(t.endDate);
        return now >= start && now <= end;
      }) || trips[0];

      // Cria gasto
      await this.expenseService.create({
        tripId: activeTrip.id,
        amount: expenseData.amount,
        currency: 'BRL',
        category: expenseData.category,
        description: expenseData.description,
        date: new Date(expenseData.date || new Date()),
      });

      // Calcula total de gastos da viagem
      const tripExpenses = await this.expenseService.findAll(activeTrip.id);
      const totalSpent = tripExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
      const budget = Number(activeTrip.estimatedBudget || 0);
      const remaining = budget - totalSpent;
      const percentUsed = budget > 0 ? (totalSpent / budget * 100) : 0;

      return `✅ Gasto registrado com sucesso!

💰 Valor: R$ ${expenseData.amount.toLocaleString('pt-BR')}
📁 Categoria: ${this.translateCategory(expenseData.category)}
📝 Descricao: ${expenseData.description}
🗓️ Viagem: ${activeTrip.destination}

💵 Total gasto: R$ ${totalSpent.toLocaleString('pt-BR')}
💼 Orcamento: R$ ${budget.toLocaleString('pt-BR')}
📊 Usado: ${percentUsed.toFixed(1)}%
${remaining >= 0 ? `✅ Restante: R$ ${remaining.toLocaleString('pt-BR')}` : `⚠️ Acima do orcamento: R$ ${Math.abs(remaining).toLocaleString('pt-BR')}`}

Digite /dashboard para ver o painel completo!`;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Erro ao criar gasto: ${errorMessage}`);
      return 'Desculpe, ocorreu um erro ao registrar seu gasto. Tente novamente.';
    }
  }

  private translateCategory(category: string): string {
    const translations: Record<string, string> = {
      accommodation: 'Hospedagem',
      transportation: 'Transporte',
      food: 'Alimentacao',
      entertainment: 'Entretenimento',
      shopping: 'Compras',
      other: 'Outros',
    };
    return translations[category] || category;
  }
}

