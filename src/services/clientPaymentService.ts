import axios from 'axios';

export interface ClientPayment {
  id: number;
  client_id: number;
  order_id?: number;
  amount: number;
  status: string;
  method: string;
  gateway?: string;
  external_id?: string;
  due_date?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
  client_name?: string;
}

export interface CreateClientPaymentPayload {
  client_id: number;
  order_id?: number;
  amount: number;
  method: string;
  gateway?: string;
  due_date?: string;
}

export interface UpdateClientPaymentStatusPayload {
  status: string;
  paid_at?: string;
}

const API_URL = '/api/client-payments';

export const clientPaymentService = {
  async getAll(token: string, params?: any): Promise<ClientPayment[]> {
    const res = await axios.get(API_URL, {
      params,
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },
  async getById(id: number, token: string): Promise<ClientPayment> {
    const res = await axios.get(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },
  async create(data: CreateClientPaymentPayload, token: string): Promise<ClientPayment> {
    const res = await axios.post(API_URL, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },
  async updateStatus(id: number, data: UpdateClientPaymentStatusPayload, token: string): Promise<ClientPayment> {
    const res = await axios.patch(`${API_URL}/${id}/status`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  }
}; 