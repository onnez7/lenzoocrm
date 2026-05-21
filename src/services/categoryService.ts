import { api } from '@/config/api';

export interface Category {
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

export interface CreateCategoryData {
  name: string;
  description?: string;
  targetFranchiseId?: number;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {
  is_active?: boolean;
  targetFranchiseId?: number;
}

class CategoryService {
  // Listar todas as categorias
  async getCategories(): Promise<Category[]> {
    try {
      const response = await api.get('/categories');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      throw error;
    }
  }

  // Buscar categoria por ID
  async getCategoryById(id: number): Promise<Category> {
    try {
      const response = await api.get(`/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar categoria:', error);
      throw error;
    }
  }

  // Criar nova categoria
  async createCategory(data: CreateCategoryData): Promise<Category> {
    try {
      const response = await api.post('/categories', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      throw error;
    }
  }

  // Atualizar categoria
  async updateCategory(id: number, data: UpdateCategoryData): Promise<Category> {
    try {
      const response = await api.put(`/categories/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      throw error;
    }
  }

  // Deletar categoria
  async deleteCategory(id: number): Promise<void> {
    try {
      await api.delete(`/categories/${id}`);
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      throw error;
    }
  }

  // Buscar categorias da franquia (para FRANCHISE_ADMIN)
  async getFranchiseCategories(): Promise<Category[]> {
    try {
      const response = await api.get('/franchise/categories');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar categorias da franquia:', error);
      throw error;
    }
  }

  // Buscar categoria da franquia por ID
  async getFranchiseCategoryById(id: number): Promise<Category> {
    try {
      const response = await api.get(`/franchise/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar categoria da franquia:', error);
      throw error;
    }
  }

  // Criar categoria na franquia
  async createFranchiseCategory(data: CreateCategoryData): Promise<Category> {
    try {
      const response = await api.post('/franchise/categories', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar categoria na franquia:', error);
      throw error;
    }
  }

  // Atualizar categoria da franquia
  async updateFranchiseCategory(id: number, data: UpdateCategoryData): Promise<Category> {
    try {
      const response = await api.put(`/franchise/categories/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar categoria da franquia:', error);
      throw error;
    }
  }

  // Deletar categoria da franquia
  async deleteFranchiseCategory(id: number): Promise<void> {
    try {
      await api.delete(`/franchise/categories/${id}`);
    } catch (error) {
      console.error('Erro ao deletar categoria da franquia:', error);
      throw error;
    }
  }
}

export default new CategoryService(); 