import Stripe from 'stripe';
import { Pool } from 'pg';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export interface StripeCustomer {
  id: string;
  email: string;
  name: string;
  metadata: any;
}

export interface StripeSubscription {
  id: string;
  customer_id: string;
  price_id: string;
  status: string;
  current_period_start: number;
  current_period_end: number;
  trial_end?: number;
  cancel_at_period_end: boolean;
}

export interface StripePrice {
  id: string;
  product_id: string;
  unit_amount: number;
  currency: string;
  recurring: {
    interval: 'month' | 'year';
    interval_count: number;
  };
}

export class StripeService {
  // Criar cliente no Stripe
  static async createCustomer(email: string, name: string, metadata: any = {}): Promise<StripeCustomer> {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata,
      }) as any;

      return {
        id: customer.id,
        email: customer.email!,
        name: customer.name!,
        metadata: customer.metadata,
      };
    } catch (error) {
      console.error('Erro ao criar cliente no Stripe:', error);
      throw new Error('Falha ao criar cliente no Stripe');
    }
  }

  // Criar produto no Stripe
  static async createProduct(name: string, description: string): Promise<string> {
    try {
      const product = await stripe.products.create({
        name,
        description,
      }) as any;

      return product.id;
    } catch (error) {
      console.error('Erro ao criar produto no Stripe:', error);
      throw new Error('Falha ao criar produto no Stripe');
    }
  }

  // Criar preço no Stripe
  static async createPrice(
    productId: string, 
    amount: number, 
    currency: string = 'brl',
    interval: 'month' | 'year' = 'month'
  ): Promise<string> {
    try {
      const price = await stripe.prices.create({
        product: productId,
        unit_amount: Math.round(amount * 100), // Stripe usa centavos
        currency,
        recurring: {
          interval,
        },
      }) as any;

      return price.id;
    } catch (error) {
      console.error('Erro ao criar preço no Stripe:', error);
      throw new Error('Falha ao criar preço no Stripe');
    }
  }

  // Criar assinatura no Stripe
  static async createSubscription(
    customerId: string,
    priceId: string,
    trialDays: number = 0
  ): Promise<StripeSubscription> {
    try {
      const subscriptionData: any = {
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      };

      if (trialDays > 0) {
        subscriptionData.trial_period_days = trialDays;
      }

      const subscription = await stripe.subscriptions.create(subscriptionData) as any;

      return {
        id: subscription.id,
        customer_id: subscription.customer as string,
        price_id: subscription.items.data[0].price.id,
        status: subscription.status,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        trial_end: subscription.trial_end || undefined,
        cancel_at_period_end: subscription.cancel_at_period_end,
      };
    } catch (error) {
      console.error('Erro ao criar assinatura no Stripe:', error);
      throw new Error('Falha ao criar assinatura no Stripe');
    }
  }

  // Cancelar assinatura no Stripe
  static async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd: boolean = true): Promise<void> {
    try {
      if (cancelAtPeriodEnd) {
        await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        });
      } else {
        await stripe.subscriptions.cancel(subscriptionId);
      }
    } catch (error) {
      console.error('Erro ao cancelar assinatura no Stripe:', error);
      throw new Error('Falha ao cancelar assinatura no Stripe');
    }
  }

  // Reativar assinatura no Stripe
  static async reactivateSubscription(subscriptionId: string): Promise<void> {
    try {
      await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false,
      });
    } catch (error) {
      console.error('Erro ao reativar assinatura no Stripe:', error);
      throw new Error('Falha ao reativar assinatura no Stripe');
    }
  }

  // Atualizar assinatura no Stripe
  static async updateSubscription(subscriptionId: string, priceId: string): Promise<StripeSubscription> {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;
      
      await stripe.subscriptions.update(subscriptionId, {
        items: [{
          id: subscription.items.data[0].id,
          price: priceId,
        }],
        proration_behavior: 'create_prorations',
      });

      const updatedSubscription = await stripe.subscriptions.retrieve(subscriptionId) as any;

      return {
        id: updatedSubscription.id,
        customer_id: updatedSubscription.customer as string,
        price_id: updatedSubscription.items.data[0].price.id,
        status: updatedSubscription.status,
        current_period_start: updatedSubscription.current_period_start,
        current_period_end: updatedSubscription.current_period_end,
        trial_end: updatedSubscription.trial_end || undefined,
        cancel_at_period_end: updatedSubscription.cancel_at_period_end,
      };
    } catch (error) {
      console.error('Erro ao atualizar assinatura no Stripe:', error);
      throw new Error('Falha ao atualizar assinatura no Stripe');
    }
  }

  // Buscar assinatura no Stripe
  static async getSubscription(subscriptionId: string): Promise<StripeSubscription> {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;

      return {
        id: subscription.id,
        customer_id: subscription.customer as string,
        price_id: subscription.items.data[0].price.id,
        status: subscription.status,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        trial_end: subscription.trial_end || undefined,
        cancel_at_period_end: subscription.cancel_at_period_end,
      };
    } catch (error) {
      console.error('Erro ao buscar assinatura no Stripe:', error);
      throw new Error('Falha ao buscar assinatura no Stripe');
    }
  }

  // Criar link de pagamento
  static async createCheckoutSession(
    customerId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<string> {
    try {
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [{
          price: priceId,
          quantity: 1,
        }],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        allow_promotion_codes: true,
      }) as any;

      return session.url!;
    } catch (error) {
      console.error('Erro ao criar sessão de checkout:', error);
      throw new Error('Falha ao criar sessão de checkout');
    }
  }

  // Processar webhook do Stripe
  static async handleWebhook(event: any): Promise<void> {
    try {
      switch (event.type) {
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object);
          break;
        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object);
          break;
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object);
          break;
        default:
          console.log(`Evento não tratado: ${event.type}`);
      }
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      throw error;
    }
  }

  private static async handleSubscriptionCreated(subscription: any): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query(
        'UPDATE subscriptions SET status = $1, current_period_start = $2, current_period_end = $3, trial_end_date = $4 WHERE stripe_subscription_id = $5',
        [
          subscription.status,
          new Date(subscription.current_period_start * 1000),
          new Date(subscription.current_period_end * 1000),
          subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
          subscription.id
        ]
      );
    } finally {
      client.release();
    }
  }

  private static async handleSubscriptionUpdated(subscription: any): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query(
        'UPDATE subscriptions SET status = $1, current_period_start = $2, current_period_end = $3, cancel_at_period_end = $4 WHERE stripe_subscription_id = $5',
        [
          subscription.status,
          new Date(subscription.current_period_start * 1000),
          new Date(subscription.current_period_end * 1000),
          subscription.cancel_at_period_end,
          subscription.id
        ]
      );
    } finally {
      client.release();
    }
  }

  private static async handleSubscriptionDeleted(subscription: any): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query(
        'UPDATE subscriptions SET status = $1 WHERE stripe_subscription_id = $2',
        ['canceled', subscription.id]
      );
    } finally {
      client.release();
    }
  }

  private static async handlePaymentSucceeded(invoice: any): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query(
        'UPDATE subscriptions SET last_payment_date = $1, next_billing_date = $2 WHERE stripe_subscription_id = $3',
        [
          new Date(),
          new Date(invoice.next_payment_attempt! * 1000),
          invoice.subscription as string
        ]
      );

      // Registrar pagamento
      await client.query(
        'INSERT INTO subscription_payments (subscription_id, stripe_payment_intent_id, amount, status, payment_method) VALUES ($1, $2, $3, $4, $5)',
        [
          invoice.subscription,
          invoice.payment_intent as string,
          invoice.amount_paid / 100,
          'succeeded',
          'card'
        ]
      );
    } finally {
      client.release();
    }
  }

  private static async handlePaymentFailed(invoice: any): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query(
        'UPDATE subscriptions SET status = $1 WHERE stripe_subscription_id = $2',
        ['past_due', invoice.subscription as string]
      );

      // Registrar tentativa de pagamento falhada
      await client.query(
        'INSERT INTO subscription_payments (subscription_id, stripe_payment_intent_id, amount, status, payment_method) VALUES ($1, $2, $3, $4, $5)',
        [
          invoice.subscription,
          invoice.payment_intent as string,
          invoice.amount_due / 100,
          'failed',
          'card'
        ]
      );
    } finally {
      client.release();
    }
  }
} 