import { api } from '@/config/api';

export interface Payable {
  id: number;
  franchise_id: number;
  description: string;
  amount: number;
  due_date: string;
  supplier: string;
  category: 'utilities' | 'rent' | 'supplies' | 'services' | 'taxes' | 'other';
  payment_method: 'bank_transfer' | 'credit_card' | 'pix' | 'cash' | 'check';
  status: 'pending' | 'paid' | 'overdue';
  payment_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePayableData {
  description: string;
  amount: number;
  due_date: string;
  supplier: string;
  category: 'utilities' | 'rent' | 'supplies' | 'services' | 'taxes' | 'other';
  payment_method: 'bank_transfer' | 'credit_card' | 'pix' | 'cash' | 'check';
  notes?: string;
}

export interface UpdatePayableData {
  description?: string;
  amount?: number;
  due_date?: string;
  supplier?: string;
  category?: 'utilities' | 'rent' | 'supplies' | 'services' | 'taxes' | 'other';
  payment_method?: 'bank_transfer' | 'credit_card' | 'pix' | 'cash' | 'check';
  is_paid?: boolean;
  notes?: string;
}

export interface PayableStats {
  total: number;
  pending_count: number;
  paid_count: number;
  overdue_count: number;
  pending_amount: number;
  paid_amount: number;
  overdue_amount: number;
}

class PayableService {
  // Buscar todas as contas a pagar
  async getPayables(): Promise<Payable[]> {
    const response = await api.get('/payables');
    return response.data;
  }

  // Buscar conta a pagar por ID
  async getPayableById(id: number): Promise<Payable> {
    const response = await api.get(`/payables/${id}`);
    return response.data;
  }

  // Criar nova conta a pagar
  async createPayable(data: CreatePayableData): Promise<Payable> {
    const response = await api.post('/payables', data);
    return response.data;
  }

  // Atualizar conta a pagar
  async updatePayable(id: number, data: UpdatePayableData): Promise<Payable> {
    const response = await api.put(`/payables/${id}`, data);
    return response.data;
  }

  // Deletar conta a pagar
  async deletePayable(id: number): Promise<void> {
    await api.delete(`/payables/${id}`);
  }

  // Marcar como paga
  async markAsPaid(id: number): Promise<Payable> {
    const response = await api.put(`/payables/${id}/paid`, {});
    return response.data;
  }

  // Obter estatísticas
  async getPayableStats(): Promise<any> {
    const response = await api.get('/payables/stats');
    return response.data;
  }

  // Formatar categoria
  getCategoryLabel(category: string): string {
    switch (category) {
      case 'utilities': return 'Serviços Públicos';
      case 'rent': return 'Aluguel';
      case 'supplies': return 'Fornecimentos';
      case 'services': return 'Serviços';
      case 'taxes': return 'Impostos';
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
      return 'Paga';
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

  // Categorias disponíveis
  getCategories(): string[] {
    return [
      'Produtos',
      'Serviços',
      'Utilidades',
      'Equipamentos',
      'Aluguel',
      'Impostos',
      'Salários',
      'Marketing',
      'Outros'
    ];
  }

  // Métodos de pagamento
  getPaymentMethods(): { value: string; label: string }[] {
    return [
      { value: 'bank_transfer', label: 'Transferência Bancária' },
      { value: 'credit_card', label: 'Cartão de Crédito' },
      { value: 'cash', label: 'Dinheiro' },
      { value: 'pix', label: 'PIX' }
    ];
  }
}

export default new PayableService(); 