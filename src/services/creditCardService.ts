import { api } from '@/config/api';

export interface CreditCard {
  id: number;
  franchise_id: number;
  card_name: string;
  bank_name: string;
  last_four_digits: string;
  brand: 'visa' | 'mastercard' | 'elo' | 'amex';
  limit_amount: number;
  available_limit: number;
  due_date: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCreditCardData {
  card_name: string;
  bank_name: string;
  last_four_digits: string;
  brand: 'visa' | 'mastercard' | 'elo' | 'amex';
  limit_amount: number;
  due_date: number;
}

export interface UpdateCreditCardData {
  card_name?: string;
  bank_name?: string;
  last_four_digits?: string;
  brand?: 'visa' | 'mastercard' | 'elo' | 'amex';
  limit_amount?: number;
  due_date?: number;
  is_active?: boolean;
}

class CreditCardService {
  // Buscar todos os cartões de crédito
  async getCreditCards(): Promise<CreditCard[]> {
    const response = await api.get('/credit-cards');
    return response.data;
  }

  // Buscar cartão por ID
  async getCreditCardById(id: number): Promise<CreditCard> {
    const response = await api.get(`/credit-cards/${id}`);
    return response.data;
  }

  // Criar novo cartão de crédito
  async createCreditCard(data: CreateCreditCardData): Promise<CreditCard> {
    const response = await api.post('/credit-cards', data);
    return response.data;
  }

  // Atualizar cartão de crédito
  async updateCreditCard(id: number, data: UpdateCreditCardData): Promise<CreditCard> {
    const response = await api.put(`/credit-cards/${id}`, data);
    return response.data;
  }

  // Deletar cartão de crédito
  async deleteCreditCard(id: number): Promise<void> {
    await api.delete(`/credit-cards/${id}`);
  }

  // Atualizar limite disponível
  async updateAvailableLimit(id: number, amount: number, type: 'credit' | 'debit'): Promise<any> {
    const response = await api.put(`/credit-cards/${id}/limit`, { amount, type });
    return response.data;
  }

  // Formatar bandeira do cartão
  getBrandLabel(brand: string): string {
    switch (brand) {
      case 'visa': return 'Visa';
      case 'mastercard': return 'Mastercard';
      case 'elo': return 'Elo';
      case 'amex': return 'American Express';
      default: return brand;
    }
  }

  // Formatar valor monetário
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  // Obter cor do status
  getStatusColor(isActive: boolean): string {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  }

  // Obter label do status
  getStatusLabel(isActive: boolean): string {
    return isActive ? 'Ativo' : 'Inativo';
  }

  // Calcular percentual de uso do limite
  getUsagePercentage(card: CreditCard): number {
    return ((card.limit_amount - card.available_limit) / card.limit_amount) * 100;
  }

  // Obter cor do percentual de uso
  getUsageColor(percentage: number): string {
    if (percentage < 50) return 'text-green-600';
    if (percentage < 80) return 'text-yellow-600';
    return 'text-red-600';
  }
}

export default new CreditCardService(); 