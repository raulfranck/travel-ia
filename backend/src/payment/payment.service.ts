import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { UserService } from '../user/user.service';
import { UserPlan } from '../user/entities/user.entity';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private stripe: Stripe;

  constructor(private readonly userService: UserService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2023-10-16',
    });
  }

  async createSubscription(userId: string, plan: string) {
    const user = await this.userService.findOne(userId);

    try {
      // Cria ou recupera customer
      let customerId = user.stripeCustomerId;
      
      if (!customerId) {
        const customer = await this.stripe.customers.create({
          metadata: { userId: user.id },
        });
        customerId = customer.id;
        await this.userService.update(userId, { stripeCustomerId: customerId });
      }

      // Determina o preço baseado no plano
      const priceId = this.getPriceId(plan);

      // Cria subscription
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      return {
        subscriptionId: subscription.id,
        clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Erro ao criar subscription: ${errorMessage}`);
      throw error;
    }
  }

  async handleStripeWebhook(body: any, signature: string) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

    try {
      const event = this.stripe.webhooks.constructEvent(body, signature, webhookSecret);

      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionCancellation(event.data.object as Stripe.Subscription);
          break;
      }

      return { received: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Webhook error: ${errorMessage}`);
      throw error;
    }
  }

  async cancelSubscription(userId: string) {
    const user = await this.userService.findOne(userId);

    if (!user.stripeSubscriptionId) {
      throw new Error('Usuário não possui subscription ativa');
    }

    await this.stripe.subscriptions.cancel(user.stripeSubscriptionId);

    await this.userService.update(userId, {
      plan: UserPlan.FREE,
      stripeSubscriptionId: undefined,
    });

    return { message: 'Subscription cancelada com sucesso' };
  }

  private async handleSubscriptionUpdate(subscription: Stripe.Subscription) {
    const userId = subscription.metadata.userId;
    
    if (!userId) return;

    const plan = this.mapStripePlanToUserPlan(subscription.items.data[0].price.id);

    await this.userService.update(userId, {
      plan,
      stripeSubscriptionId: subscription.id,
    });
  }

  private async handleSubscriptionCancellation(subscription: Stripe.Subscription) {
    const userId = subscription.metadata.userId;
    
    if (!userId) return;

    await this.userService.update(userId, {
      plan: UserPlan.FREE,
      stripeSubscriptionId: undefined,
    });
  }

  private getPriceId(plan: string): string {
    // Aqui você deve usar seus price IDs reais do Stripe
    const prices: Record<string, string> = {
      basic: 'price_basic_monthly',
      pro: 'price_pro_monthly',
    };
    return prices[plan] || prices.basic;
  }

  private mapStripePlanToUserPlan(priceId: string): UserPlan {
    // Mapeia price IDs para planos
    if (priceId.includes('pro')) return UserPlan.PRO;
    if (priceId.includes('basic')) return UserPlan.BASIC;
    return UserPlan.FREE;
  }
}

