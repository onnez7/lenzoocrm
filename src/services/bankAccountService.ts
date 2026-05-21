import { api } from '@/config/api';

export interface BankAccount {
  id: number;
  franchise_id: number;
  bank_name: string;
  account_type: 'checking' | 'savings' | 'business';
  account_number: string;
  agency: string;
  balance: number;
  is_active: boolean;
  pix_key?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBankAccountData {
  bank_name: string;
  account_type: 'checking' | 'savings' | 'business';
  account_number: string;
  agency: string;
  balance?: number;
  pix_key?: string;
}

export interface UpdateBankAccountData {
  bank_name?: string;
  account_type?: 'checking' | 'savings' | 'business';
  account_number?: string;
  agency?: string;
  balance?: number;
  is_active?: boolean;
  pix_key?: string;
}

class BankAccountService {
  // Buscar todas as contas bancárias
  async getBankAccounts(): Promise<BankAccount[]> {
    const response = await api.get('/bank-accounts');
    return response.data;
  }

  // Buscar conta bancária por ID
  async getBankAccountById(id: number): Promise<BankAccount> {
    const response = await api.get(`/bank-accounts/${id}`);
    return response.data;
  }

  // Criar nova conta bancária
  async createBankAccount(data: CreateBankAccountData): Promise<BankAccount> {
    const response = await api.post('/bank-accounts', data);
    return response.data;
  }

  // Atualizar conta bancária
  async updateBankAccount(id: number, data: UpdateBankAccountData): Promise<BankAccount> {
    const response = await api.put(`/bank-accounts/${id}`, data);
    return response.data;
  }

  // Deletar conta bancária
  async deleteBankAccount(id: number): Promise<void> {
    await api.delete(`/bank-accounts/${id}`);
  }

  // Atualizar saldo da conta
  async updateBalance(id: number, amount: number, type: 'credit' | 'debit'): Promise<any> {
    const response = await api.put(`/bank-accounts/${id}/balance`, { amount, type });
    return response.data;
  }

  // Formatar tipo de conta
  getAccountTypeLabel(type: string): string {
    switch (type) {
      case 'checking': return 'Conta Corrente';
      case 'savings': return 'Poupança';
      case 'business': return 'Conta Empresarial';
      default: return type;
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
    return isActive ? 'Ativa' : 'Inativa';
  }
}

export default new BankAccountService(); 