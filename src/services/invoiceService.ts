import { api } from '@/config/api';

export interface Invoice {
  id: number;
  franchise_id: number;
  invoice_number: string;
  client_name: string;
  client_document: string;
  amount: number;
  issue_date: string;
  due_date: string;
  description: string;
  is_paid: boolean;
  paid_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateInvoiceData {
  invoice_number: string;
  client_name: string;
  client_document: string;
  amount: number;
  issue_date: string;
  due_date: string;
  description: string;
  notes?: string;
}

export interface UpdateInvoiceData {
  invoice_number?: string;
  client_name?: string;
  client_document?: string;
  amount?: number;
  issue_date?: string;
  due_date?: string;
  description?: string;
  is_paid?: boolean;
  notes?: string;
}

export interface InvoiceStats {
  total: number;
  pending_count: number;
  paid_count: number;
  overdue_count: number;
  pending_amount: number;
  paid_amount: number;
  overdue_amount: number;
}

class InvoiceService {
  // Buscar todas as notas fiscais
  async getInvoices(): Promise<Invoice[]> {
    const response = await api.get('/invoices');
    return response.data;
  }

  // Buscar nota fiscal por ID
  async getInvoiceById(id: number): Promise<Invoice> {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  }

  // Criar nova nota fiscal
  async createInvoice(data: CreateInvoiceData): Promise<Invoice> {
    const response = await api.post('/invoices', data);
    return response.data;
  }

  // Atualizar nota fiscal
  async updateInvoice(id: number, data: UpdateInvoiceData): Promise<Invoice> {
    const response = await api.put(`/invoices/${id}`, data);
    return response.data;
  }

  // Deletar nota fiscal
  async deleteInvoice(id: number): Promise<void> {
    await api.delete(`/invoices/${id}`);
  }

  // Marcar como paga
  async markAsPaid(id: number): Promise<Invoice> {
    const response = await api.put(`/invoices/${id}/mark-paid`);
    return response.data;
  }

  // Baixar nota fiscal (PDF)
  async downloadInvoice(id: number): Promise<Blob> {
    const response = await api.get(`/invoices/${id}/download`, {
      responseType: 'blob'
    });
    return response.data;
  }

  // Obter estatísticas
  async getInvoiceStats(): Promise<any> {
    const response = await api.get('/invoices/stats');
    return response.data;
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
  getStatusColor(isPaid: boolean, dueDate: string): string {
    if (isPaid) {
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
  getStatusLabel(isPaid: boolean, dueDate: string): string {
    if (isPaid) {
      return 'Paga';
    }
    const due = new Date(dueDate);
    const today = new Date();
    if (due < today) {
      return 'Vencida';
    }
    return 'Pendente';
  }

  // Formatar tamanho do arquivo
  formatFileSize(bytes?: number): string {
    if (!bytes) return '0 Bytes';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  // Verificar se está vencida
  isOverdue(dueDate: string): boolean {
    return new Date(dueDate) < new Date();
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
      'Outros'
    ];
  }
}

export default new InvoiceService(); 