import { api } from '@/config/api';

export interface Subscription {
  id: number;
  franchise_id: number;
  franchise_name: string;
  plan_id: number;
  plan_name: string;
  plan_price: number;
  status: string;
  amount: number;
  billing_cycle: string;
  current_period_start: string;
  current_period_end: string;
  trial_end_date?: string;
  cancel_at_period_end: boolean;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  next_billing_date?: string;
  last_payment_date?: string;
  payment_method?: string;
  days_trial_remaining: number;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  price: number;
  max_users: number;
  max_stores: number;
  features: string[];
  is_active: boolean;
  billing_cycle: string;
  trial_days: number;
  is_free: boolean;
  stripe_product_id?: string;
  stripe_price_id?: string;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionMetrics {
  total_subscriptions: number;
  active_subscriptions: number;
  trial_subscriptions: number;
  canceled_subscriptions: number;
  past_due_subscriptions: number;
  mrr: number;
}

export interface CreateSubscriptionData {
  franchise_id: number;
  plan_id: number;
  billing_cycle?: string;
}

export interface UpdateSubscriptionData {
  plan_id: number;
  billing_cycle?: string;
}

export interface CreatePlanData {
  name: string;
  description: string;
  price: number;
  max_users: number;
  max_stores: number;
  features: string[];
  billing_cycle: string;
  trial_days: number;
  is_free: boolean;
}

export interface UpdatePlanData {
  name: string;
  description: string;
  price: number;
  max_users: number;
  max_stores: number;
  features: string[];
  billing_cycle: string;
  trial_days: number;
  is_free: boolean;
  is_active: boolean;
}

export interface CheckoutSessionData {
  subscription_id: number;
  success_url: string;
  cancel_url: string;
}

class SubscriptionService {
  // Buscar todas as assinaturas
  async getAllSubscriptions(token: string): Promise<Subscription[]> {
    const response = await api.get('/subscriptions', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // Buscar assinatura por ID
  async getSubscriptionById(id: number, token: string): Promise<Subscription> {
    const response = await api.get(`/subscriptions/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // Criar nova assinatura
  async createSubscription(data: CreateSubscriptionData, token: string): Promise<Subscription> {
    const response = await api.post('/subscriptions', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // Atualizar assinatura
  async updateSubscription(id: number, data: UpdateSubscriptionData, token: string): Promise<Subscription> {
    const response = await api.put(`/subscriptions/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // Cancelar assinatura
  async cancelSubscription(id: number, cancelAtPeriodEnd: boolean = true, token: string): Promise<Subscription> {
    const response = await api.post(`/subscriptions/${id}/cancel`, { cancel_at_period_end: cancelAtPeriodEnd }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // Reativar assinatura
  async reactivateSubscription(id: number, token: string): Promise<Subscription> {
    const response = await api.post(`/subscriptions/${id}/reactivate`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // Buscar todos os planos
  async getAllPlans(token: string): Promise<SubscriptionPlan[]> {
    const response = await api.get('/subscriptions/plans/all', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // Criar novo plano
  async createPlan(data: CreatePlanData, token: string): Promise<SubscriptionPlan> {
    const response = await api.post('/subscriptions/plans', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // Atualizar plano
  async updatePlan(id: number, data: UpdatePlanData, token: string): Promise<SubscriptionPlan> {
    const response = await api.put(`/subscriptions/plans/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // Buscar métricas
  async getMetrics(token: string): Promise<SubscriptionMetrics> {
    const response = await api.get('/subscriptions/metrics', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // Criar sessão de checkout
  async createCheckoutSession(data: CheckoutSessionData, token: string): Promise<{ checkout_url: string }> {
    const response = await api.post('/subscriptions/checkout', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
}

export const subscriptionService = new SubscriptionService(); 