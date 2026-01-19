import { Injectable, Logger } from '@nestjs/common';
import * as Mixpanel from 'mixpanel';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  private mixpanel: Mixpanel.Mixpanel | null = null;

  constructor() {
    const token = process.env.MIXPANEL_TOKEN;
    if (token) {
      this.mixpanel = Mixpanel.init(token);
    }
  }

  trackEvent(userId: string, eventName: string, properties?: Record<string, any>) {
    if (!this.mixpanel) {
      this.logger.warn('Mixpanel não configurado');
      return;
    }

    try {
      this.mixpanel.track(eventName, {
        distinct_id: userId,
        ...properties,
      });
      this.logger.log(`Evento rastreado: ${eventName} para usuário ${userId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Erro ao rastrear evento: ${errorMessage}`);
    }
  }

  identifyUser(userId: string, traits: Record<string, any>) {
    if (!this.mixpanel) return;

    try {
      this.mixpanel.people.set(userId, traits);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Erro ao identificar usuário: ${errorMessage}`);
    }
  }
}

