import { api } from '@/config/api';

export interface Brand {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  franchise_id?: number;
  franchise_name?: string;
  products_count?: number;
  created_at: string;
  updated_at?: string;
}

export interface CreateBrandData {
  name: string;
  description?: string;
  targetFranchiseId?: number;
}

export interface UpdateBrandData extends Partial<CreateBrandData> {
  is_active?: boolean;
  targetFranchiseId?: number;
}

class BrandService {
  // Listar todas as marcas
  async getBrands(): Promise<Brand[]> {
    try {
      const response = await api.get('/brands');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar marcas:', error);
      throw error;
    }
  }

  // Buscar marca por ID
  async getBrandById(id: number): Promise<Brand> {
    try {
      const response = await api.get(`/brands/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar marca:', error);
      throw error;
    }
  }

  // Criar nova marca
  async createBrand(data: CreateBrandData): Promise<Brand> {
    try {
      const response = await api.post('/brands', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar marca:', error);
      throw error;
    }
  }

  // Atualizar marca
  async updateBrand(id: number, data: UpdateBrandData): Promise<Brand> {
    try {
      const response = await api.put(`/brands/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar marca:', error);
      throw error;
    }
  }

  // Deletar marca
  async deleteBrand(id: number): Promise<void> {
    try {
      await api.delete(`/brands/${id}`);
    } catch (error) {
      console.error('Erro ao deletar marca:', error);
      throw error;
    }
  }

  // Buscar marcas da franquia (para FRANCHISE_ADMIN)
  async getFranchiseBrands(): Promise<Brand[]> {
    try {
      const response = await api.get('/franchise/brands');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar marcas da franquia:', error);
      throw error;
    }
  }

  // Buscar marca da franquia por ID
  async getFranchiseBrandById(id: number): Promise<Brand> {
    try {
      const response = await api.get(`/franchise/brands/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar marca da franquia:', error);
      throw error;
    }
  }

  // Criar marca na franquia
  async createFranchiseBrand(data: CreateBrandData): Promise<Brand> {
    try {
      const response = await api.post('/franchise/brands', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar marca na franquia:', error);
      throw error;
    }
  }

  // Atualizar marca da franquia
  async updateFranchiseBrand(id: number, data: UpdateBrandData): Promise<Brand> {
    try {
      const response = await api.put(`/franchise/brands/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar marca da franquia:', error);
      throw error;
    }
  }

  // Deletar marca da franquia
  async deleteFranchiseBrand(id: number): Promise<void> {
    try {
      await api.delete(`/franchise/brands/${id}`);
    } catch (error) {
      console.error('Erro ao deletar marca da franquia:', error);
      throw error;
    }
  }
}

export default new BrandService(); 