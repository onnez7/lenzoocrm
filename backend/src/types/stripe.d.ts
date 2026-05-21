declare module 'stripe' {
  export interface Subscription {
    id: string;
    customer: string;
    items: {
      data: Array<{
        id: string;
        price: {
          id: string;
        };
      }>;
    };
    status: string;
    current_period_start: number;
    current_period_end: number;
    trial_end?: number;
    cancel_at_period_end: boolean;
  }

  export interface Customer {
    id: string;
    email: string;
    name: string;
    metadata: any;
  }

  export interface Product {
    id: string;
    name: string;
    description: string;
  }

  export interface Price {
    id: string;
    product: string;
    unit_amount: number;
    currency: string;
    recurring: {
      interval: 'month' | 'year';
      interval_count: number;
    };
  }

  export interface Invoice {
    id: string;
    subscription: string;
    payment_intent: string;
    amount_paid: number;
    amount_due: number;
    next_payment_attempt?: number;
  }

  export interface Event {
    type: string;
    data: {
      object: any;
    };
  }

  export interface CheckoutSession {
    id: string;
    url?: string;
  }

  export class Stripe {
    constructor(secretKey: string, config?: { apiVersion: string });
    
    customers: {
      create(data: any): Promise<Customer>;
    };
    
    products: {
      create(data: any): Promise<Product>;
    };
    
    prices: {
      create(data: any): Promise<Price>;
    };
    
    subscriptions: {
      create(data: any): Promise<Subscription>;
      retrieve(id: string): Promise<Subscription>;
      update(id: string, data: any): Promise<Subscription>;
      cancel(id: string): Promise<Subscription>;
    };
    
    checkout: {
      sessions: {
        create(data: any): Promise<CheckoutSession>;
      };
    };
    
    webhooks: {
      constructEvent(payload: any, signature: string, secret: string): Event;
    };
  }
} 