import { api } from '@/config/api';

export interface Receivable {
  id: number;
  franchise_id: number;
  description: string;
  amount: number;
  due_date: string;
  client_name: string;
  category: 'sales' | 'services' | 'consultations' | 'rentals' | 'other';
  payment_method: 'bank_transfer' | 'credit_card' | 'pix' | 'cash' | 'check';
  status: 'pending' | 'paid' | 'overdue';
  payment_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateReceivableData {
  description: string;
  amount: number;
  due_date: string;
  client_name: string;
  category: 'sales' | 'services' | 'consultations' | 'rentals' | 'other';
  payment_method: 'bank_transfer' | 'credit_card' | 'pix' | 'cash' | 'check';
  notes?: string;
}

export interface UpdateReceivableData {
  description?: string;
  amount?: number;
  due_date?: string;
  client_name?: string;
  category?: 'sales' | 'services' | 'consultations' | 'rentals' | 'other';
  payment_method?: 'bank_transfer' | 'credit_card' | 'pix' | 'cash' | 'check';
  is_received?: boolean;
  notes?: string;
}

export interface ReceivableStats {
  total: number;
  pending_count: number;
  paid_count: number;
  overdue_count: number;
  partial_count: number;
  total_amount: number;
  total_paid: number;
  total_pending: number;
}

class ReceivableService {
  // Buscar todas as contas a receber
  async getReceivables(): Promise<Receivable[]> {
    const response = await api.get('/receivables');
    return response.data;
  }

  // Buscar conta a receber por ID
  async getReceivableById(id: number): Promise<Receivable> {
    const response = await api.get(`/receivables/${id}`);
    return response.data;
  }

  // Criar nova conta a receber
  async createReceivable(data: CreateReceivableData): Promise<Receivable> {
    const response = await api.post('/receivables', data);
    return response.data;
  }

  // Atualizar conta a receber
  async updateReceivable(id: number, data: UpdateReceivableData): Promise<Receivable> {
    const response = await api.put(`/receivables/${id}`, data);
    return response.data;
  }

  // Deletar conta a receber
  async deleteReceivable(id: number): Promise<void> {
    await api.delete(`/receivables/${id}`);
  }

  // Marcar como recebida
  async markAsReceived(id: number): Promise<Receivable> {
    const response = await api.put(`/receivables/${id}/paid`, {});
    return response.data;
  }

  // Obter estatísticas
  async getReceivableStats(): Promise<any> {
    const response = await api.get('/receivables/stats');
    return response.data;
  }

  // Formatar categoria
  getCategoryLabel(category: string): string {
    switch (category) {
      case 'sales': return 'Vendas';
      case 'services': return 'Serviços';
      case 'consultations': return 'Consultas';
      case 'rentals': return 'Aluguel';
      case 'other': return 'Outros';
      default: return category;
    }
  }

  // Formatar método de pagamento
  getPaymentMethodLabel(method: string): string {
    switch (method) {
      case 'bank_transfer': return 'Transferência';
      case 'credit_card': return 'Cartão de Crédito';
      case 'pix': return 'PIX';
      case 'cash': return 'Dinheiro';
      case 'check': return 'Cheque';
      default: return method;
    }
  }

  // Formatar valor monetário
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  // Formatar data
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR');
  }

  // Obter cor do status
  getStatusColor(status: string, dueDate: string): string {
    if (status === 'paid') {
      return 'bg-green-100 text-green-800';
    }
    const due = new Date(dueDate);
    const today = new Date();
    if (due < today) {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-yellow-100 text-yellow-800';
  }

  // Obter label do status
  getStatusLabel(status: string, dueDate: string): string {
    if (status === 'paid') {
      return 'Recebida';
    }
    const due = new Date(dueDate);
    const today = new Date();
    if (due < today) {
      return 'Vencida';
    }
    return 'Pendente';
  }

  // Verificar se está vencida
  isOverdue(status: string, dueDate: string): boolean {
    return status !== 'paid' && new Date(dueDate) < new Date();
  }

  // Calcular valor pendente
  getPendingAmount(receivable: Receivable): number {
    return receivable.amount - receivable.paid_amount;
  }

  // Formas de parcelamento
  getInstallmentOptions(): { value: string; label: string }[] {
    return [
      { value: '1x', label: 'À vista' },
      { value: '2x', label: '2x sem juros' },
      { value: '3x', label: '3x sem juros' },
      { value: '4x', label: '4x sem juros' },
      { value: '6x', label: '6x sem juros' },
      { value: '12x', label: '12x com juros' }
    ];
  }

  // Métodos de pagamento
  getPaymentMethods(): { value: string; label: string }[] {
    return [
      { value: 'cash', label: 'Dinheiro' },
      { value: 'credit_card', label: 'Cartão de Crédito' },
      { value: 'debit_card', label: 'Cartão de Débito' },
      { value: 'pix', label: 'PIX' },
      { value: 'bank_transfer', label: 'Transferência Bancária' }
    ];
  }

  // Buscar clientes para formulário
  async getClients(): Promise<any[]> {
    const response = await api.get('/receivables/clients');
    return response.data;
  }

  // Buscar parcelas pendentes de um cliente
  async getClientInstallments(clientId: number): Promise<any[]> {
    const response = await api.get(`/receivables/client/${clientId}/installments`);
    return response.data;
  }

  // Obter estatísticas detalhadas
  async getDetailedStats(): Promise<any> {
    const response = await api.get('/receivables/stats');
    return response.data;
  }
}

export default new ReceivableService(); 