import { Controller, Post, Body, Headers } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-subscription')
  async createSubscription(@Body() body: { userId: string; plan: string }) {
    return this.paymentService.createSubscription(body.userId, body.plan);
  }

  @Post('webhook')
  async handleWebhook(@Body() body: any, @Headers('stripe-signature') signature: string) {
    return this.paymentService.handleStripeWebhook(body, signature);
  }

  @Post('cancel-subscription')
  async cancelSubscription(@Body() body: { userId: string }) {
    return this.paymentService.cancelSubscription(body.userId);
  }
}

