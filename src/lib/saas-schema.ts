// SaaS Admin Types for Lenzoo System

export interface Tenant {
  id: string;
  name: string;
  cnpj: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  logo?: string;
  subscriptionId?: string;
  plan: 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'inactive' | 'suspended' | 'trial';
  trialEndsAt?: Date;
  subscriptionEndsAt?: Date;
  maxUsers: number;
  maxStores: number;
  features: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: string;
  tenantId: string;
  stripeSubscriptionId?: string;
  plan: 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  amount: number;
  currency: 'BRL';
  interval: 'month' | 'year';
  features: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: 'BRL';
  interval: 'month' | 'year';
  maxUsers: number;
  maxStores: number;
  features: string[];
  stripePriceId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'support';
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantUsage {
  tenantId: string;
  users: number;
  stores: number;
  invoices: number;
  products: number;
  storage: number; // in MB
  apiCalls: number;
  month: string; // YYYY-MM
  createdAt: Date;
}

export interface Payment {
  id: string;
  tenantId: string;
  subscriptionId: string;
  stripePaymentId?: string;
  amount: number;
  currency: 'BRL';
  status: 'succeeded' | 'pending' | 'failed' | 'canceled';
  method: string;
  paidAt?: Date;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mock data
export const mockPlans: Plan[] = [
  {
    id: '1',
    name: 'Básico',
    description: 'Ideal para óticas pequenas',
    price: 99.90,
    currency: 'BRL',
    interval: 'month',
    maxUsers: 3,
    maxStores: 1,
    features: ['Gestão de clientes', 'Controle de estoque', 'Vendas básicas'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Premium',
    description: 'Para óticas em crescimento',
    price: 199.90,
    currency: 'BRL',
    interval: 'month',
    maxUsers: 10,
    maxStores: 3,
    features: ['Todos os recursos básicos', 'CRM avançado', 'Relatórios detalhados', 'API'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    name: 'Enterprise',
    description: 'Para redes de óticas',
    price: 399.90,
    currency: 'BRL',
    interval: 'month',
    maxUsers: -1,
    maxStores: -1,
    features: ['Todos os recursos', 'Usuários ilimitados', 'Lojas ilimitadas', 'Suporte prioritário'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const mockTenants: Tenant[] = [
  {
    id: '1',
    name: 'Ótica Visão Clara',
    cnpj: '12.345.678/0001-90',
    email: 'contato@oticavisaoclara.com.br',
    phone: '(11) 9999-8888',
    plan: 'premium',
    status: 'active',
    maxUsers: 10,
    maxStores: 3,
    features: ['crm', 'api', 'reports'],
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Ótica Moderna',
    cnpj: '98.765.432/0001-10',
    email: 'admin@oticamoderna.com.br',
    phone: '(21) 7777-6666',
    plan: 'basic',
    status: 'trial',
    trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    maxUsers: 3,
    maxStores: 1,
    features: ['basic'],
    isActive: true,
    createdAt: new Date('2024-06-20'),
    updatedAt: new Date(),
  },
];
