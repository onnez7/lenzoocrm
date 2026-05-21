import { api } from '@/config/api';

export interface CashierSession {
  id: number;
  session_code: string;
  employee_id: number;
  employee_name: string;
  franchise_id: number;
  open_time: string;
  close_time: string | null;
  initial_amount: number;
  final_amount: number | null;
  cash_sales: number;
  card_sales: number;
  pix_sales: number;
  total_sales: number;
  difference: number | null;
  status: 'open' | 'closed';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OpenCashierResponse {
  session: CashierSession | null;
  message: string;
}

export interface OpenCashierData {
  employee_id: number;
  initial_amount: number;
  notes?: string;
}

export interface CloseCashierData {
  cash_amount: number;
  card_amount: number;
  pix_amount: number;
  notes?: string;
}

export interface SangriaData {
  session_id: number;
  amount: number;
  description: string;
}

export const cashierService = {
  // Verificar se há caixa aberto
  async checkOpenSession(): Promise<OpenCashierResponse> {
    try {
      const response = await api.get('/cashier/open-session');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return { session: null, message: 'Nenhuma sessão de caixa aberta encontrada.' };
      }
      throw error;
    }
  },

  // Abrir caixa
  async openCashier(data: OpenCashierData): Promise<CashierSession> {
    const response = await api.post('/cashier/open', data);
    return response.data;
  },

  // Fechar caixa
  async closeCashier(data: CloseCashierData): Promise<CashierSession> {
    const response = await api.post('/cashier/close', data);
    return response.data;
  },

  // Buscar histórico de sessões
  async getHistory(): Promise<CashierSession[]> {
    const response = await api.get('/cashier/history');
    return response.data;
  },

  // Registrar sangria
  async registerSangria(data: SangriaData): Promise<void> {
    await api.post('/cashier/sangria', data);
  },

  // Buscar sangrias de uma sessão
  async getSangrias(sessionId: number): Promise<any[]> {
    const response = await api.get(`/cashier/sessions/${sessionId}/sangrias`);
    return response.data;
  },

  // Buscar sessão por ID
  async getSessionById(sessionId: number): Promise<CashierSession> {
    const response = await api.get(`/cashier/sessions/${sessionId}`);
    return response.data;
  }
}; 