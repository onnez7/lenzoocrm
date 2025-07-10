import { api } from '@/config/api';

export interface StockMovement {
  id: number;
  product_id: number;
  product_name?: string;
  sku?: string;
  model?: string;
  barcode?: string;
  brand_name?: string;
  category_name?: string;
  movement_type: 'entry' | 'exit' | 'adjustment' | 'transfer';
  quantity: number;
  previous_stock: number;
  new_stock: number;
  unit_cost?: number;
  total_cost?: number;
  reason?: string;
  reference_number?: string;
  supplier?: string;
  customer?: string;
  notes?: string;
  movement_date: string;
  user_id?: number;
  user_name?: string;
  franchise_id?: number;
}

export interface RegisterStockMovementData {
  product_id: number;
  movement_type: 'entry' | 'exit' | 'adjustment';
  quantity: number;
  unit_cost?: number;
  reason?: string;
  reference_number?: string;
  supplier?: string;
  customer?: string;
  notes?: string;
  franchise_id?: number;
}

class StockService {
  async registerMovement(data: RegisterStockMovementData): Promise<StockMovement> {
    const response = await api.post('/stock/movements', data);
    return response.data;
  }

  async listMovements(params?: {
    product_id?: number;
    movement_type?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
    franchise_id?: number;
  }): Promise<StockMovement[]> {
    const response = await api.get('/stock/movements', { params });
    return response.data;
  }

  async getMovementById(id: number): Promise<StockMovement> {
    const response = await api.get(`/stock/movements/${id}`);
    return response.data;
  }
}

export default new StockService(); 