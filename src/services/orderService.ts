import { api } from '@/config/api';

export interface OrderItem {
  id?: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface ServiceOrder {
  id: number;
  order_number: string;
  client_id: number;
  client_name: string;
  employee_id: number;
  employee_name: string;
  session_id: number;
  session_code?: string;
  session_status?: 'open' | 'closed';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  total_amount: number;
  description: string;
  notes: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  // Campos de finalização
  payment_method?: 'cash' | 'card' | 'pix';
  total_paid?: number;
  product_delivered?: boolean;
  card_installments?: number;
  card_interest?: number;
  cancellation_reason?: string;
}

export interface CreateOrderData {
  client_id: number;
  items: OrderItem[];
  description?: string;
  notes?: string;
}

export interface FinalizationData {
  paymentMethod: 'cash' | 'card' | 'pix';
  cardInstallments?: number;
  cardInterest?: number;
  totalPaid: number;
  productDelivered: boolean;
  status: 'completed' | 'in_progress' | 'cancelled';
  cancellationReason?: string;
  observations?: string;
}

export const orderService = {
  // Buscar todas as ordens
  async getOrders(): Promise<ServiceOrder[]> {
    const response = await api.get('/orders');
    return response.data;
  },

  // Buscar ordem por ID
  async getOrder(id: number): Promise<ServiceOrder> {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Criar nova ordem
  async createOrder(data: CreateOrderData): Promise<ServiceOrder> {
    const response = await api.post('/orders', data);
    return response.data;
  },

  // Atualizar ordem
  async updateOrder(id: number, data: Partial<CreateOrderData>): Promise<ServiceOrder> {
    const response = await api.put(`/orders/${id}`, data);
    return response.data;
  },

  // Excluir ordem
  async deleteOrder(id: number): Promise<void> {
    await api.delete(`/orders/${id}`);
  },

  // Atualizar status da ordem
  async updateStatus(id: number, status: ServiceOrder['status']): Promise<ServiceOrder> {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data;
  },

  // Finalizar ordem (apenas no caixa)
  async finalizeOrder(orderId: number, finalizationData: FinalizationData): Promise<void> {
    try {
      const response = await api.post(`/orders/${orderId}/finalize`, finalizationData);
      return response.data;
    } catch (error) {
      console.error('Erro ao finalizar ordem:', error);
      throw error;
    }
  }
}; 