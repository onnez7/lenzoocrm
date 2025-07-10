import { api } from '@/config/api';

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  cost?: number;
  stock_quantity: number;
  min_stock: number;
  category_id?: number;
  brand_id?: number;
  category_name?: string;
  brand_name?: string;
  sku?: string;
  model?: string;
  barcode?: string;
  status: string;
  franchise_id?: number;
  franchise_name?: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateProductData {
  name: string;
  description?: string;
  price: number;
  cost?: number;
  stock_quantity?: number;
  min_stock?: number;
  category_id?: number;
  brand_id?: number;
  sku?: string;
  model?: string;
  barcode?: string;
  targetFranchiseId?: number;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  targetFranchiseId?: number;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  active: number;
  inactive: number;
}

class ProductService {
  // Listar produtos com paginação
  async getProducts(page: number = 1, limit: number = 20, search?: string, franchiseId?: number): Promise<ProductsResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (search) {
        params.append('search', search);
      }

      if (franchiseId) {
        params.append('franchiseId', franchiseId.toString());
      }

      const response = await api.get(`/products?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      throw error;
    }
  }

  // Buscar produto por ID
  async getProductById(id: number): Promise<Product> {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      throw error;
    }
  }

  // Criar novo produto
  async createProduct(data: CreateProductData): Promise<Product> {
    try {
      const response = await api.post('/products', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      throw error;
    }
  }

  // Atualizar produto
  async updateProduct(id: number, data: UpdateProductData): Promise<Product> {
    try {
      const response = await api.put(`/products/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      throw error;
    }
  }

  // Deletar produto
  async deleteProduct(id: number): Promise<void> {
    try {
      await api.delete(`/products/${id}`);
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      throw error;
    }
  }

  // Buscar produtos da franquia (para FRANCHISE_ADMIN)
  async getFranchiseProducts(page: number = 1, limit: number = 20, search?: string): Promise<ProductsResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (search) {
        params.append('search', search);
      }

      const response = await api.get(`/franchise/products?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar produtos da franquia:', error);
      throw error;
    }
  }

  // Buscar produto da franquia por ID
  async getFranchiseProductById(id: number): Promise<Product> {
    try {
      const response = await api.get(`/franchise/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar produto da franquia:', error);
      throw error;
    }
  }

  // Criar produto na franquia
  async createFranchiseProduct(data: CreateProductData): Promise<Product> {
    try {
      const response = await api.post('/franchise/products', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar produto na franquia:', error);
      throw error;
    }
  }

  // Atualizar produto da franquia
  async updateFranchiseProduct(id: number, data: UpdateProductData): Promise<Product> {
    try {
      const response = await api.put(`/franchise/products/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar produto da franquia:', error);
      throw error;
    }
  }

  // Deletar produto da franquia
  async deleteFranchiseProduct(id: number): Promise<void> {
    try {
      await api.delete(`/franchise/products/${id}`);
    } catch (error) {
      console.error('Erro ao deletar produto da franquia:', error);
      throw error;
    }
  }
}

export default new ProductService(); 