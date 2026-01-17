import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { redisClient, connectRedis } from '../config/redis.config';

interface ItineraryRequest {
  destination: string;
  startDate: Date;
  endDate: Date;
  numberOfPeople: number;
  budget?: number;
}

interface ItineraryResponse {
  text: string;
  structured: any;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateItinerary(request: ItineraryRequest): Promise<ItineraryResponse> {
    // Gera chave de cache
    const cacheKey = this.getCacheKey(request);

    try {
      // Verifica cache
      await connectRedis();
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        this.logger.log('Retornando roteiro do cache');
        return JSON.parse(cached);
      }
    } catch (error) {
      this.logger.warn('Erro ao acessar cache, continuando sem cache');
    }

    // Calcula duração da viagem
    const days = Math.ceil(
      (request.endDate.getTime() - request.startDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Prepara prompt
    const prompt = this.buildItineraryPrompt(request, days);

    this.logger.log(`Gerando roteiro para ${request.destination} (${days} dias)`);

    try {
      // Chama OpenAI
      const completion = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o',
        messages: [
          {
            role: 'system',
            content:
              'Você é um assistente de viagens especializado. Crie roteiros detalhados, personalizados e práticos em português do Brasil.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const itineraryText = completion.choices[0].message.content || '';

      // Estrutura o roteiro
      const structured = this.parseItinerary(itineraryText, days);

      const response: ItineraryResponse = {
        text: itineraryText,
        structured,
      };

      // Salva no cache (24 horas)
      try {
        await redisClient.setEx(cacheKey, 86400, JSON.stringify(response));
      } catch (error) {
        this.logger.warn('Erro ao salvar no cache');
      }

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Erro ao gerar roteiro: ${errorMessage}`);
      throw new Error('Falha ao gerar roteiro. Tente novamente.');
    }
  }

  private buildItineraryPrompt(request: ItineraryRequest, days: number): string {
    const budgetText = request.budget
      ? `com orçamento de R$ ${request.budget.toLocaleString('pt-BR')}`
      : 'sem restrição específica de orçamento';

    return `Crie um roteiro detalhado de viagem com as seguintes informações:

📍 Destino: ${request.destination}
📅 Período: ${days} dias (${request.startDate.toLocaleDateString('pt-BR')} a ${request.endDate.toLocaleDateString('pt-BR')})
👥 Número de pessoas: ${request.numberOfPeople}
💰 Orçamento: ${budgetText}

Por favor, inclua:
1. Resumo da viagem
2. Roteiro dia a dia com atrações principais
3. Sugestões de restaurantes e hospedagem
4. Estimativa de custos por categoria (transporte, alimentação, hospedagem, atrações)
5. Dicas importantes e informações práticas
6. Melhores épocas para visitar

Formato: Texto claro e organizado, com emojis para facilitar a leitura no WhatsApp.`;
  }

  private parseItinerary(text: string, days: number): any {
    // Parse básico do roteiro estruturado
    return {
      days,
      dailyActivities: this.extractDailyActivities(text),
      estimatedCosts: this.extractCosts(text),
      tips: this.extractTips(text),
    };
  }

  private extractDailyActivities(text: string): string[] {
    // Extrai atividades diárias (simplificado)
    const dayRegex = /Dia \d+:.*?(?=Dia \d+:|$)/gs;
    return text.match(dayRegex) || [];
  }

  private extractCosts(text: string): Record<string, number> {
    // Extrai custos (simplificado)
    return {
      accommodation: 0,
      transportation: 0,
      food: 0,
      activities: 0,
    };
  }

  private extractTips(text: string): string[] {
    // Extrai dicas (simplificado)
    return [];
  }

  private getCacheKey(request: ItineraryRequest): string {
    const key = `itinerary:${request.destination}:${request.startDate.toISOString()}:${request.endDate.toISOString()}:${request.numberOfPeople}:${request.budget || 0}`;
    return key.toLowerCase().replace(/\s+/g, '-');
  }
}

