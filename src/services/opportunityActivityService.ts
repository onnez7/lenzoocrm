import axios from 'axios';

export interface OpportunityActivity {
  id: number;
  opportunity_id: number;
  title: string;
  description?: string;
  activity_type: 'task' | 'call' | 'email' | 'meeting' | 'note';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  due_time?: string;
  assigned_to?: number;
  assigned_to_name?: string;
  created_by: number;
  created_by_name?: string;
  completed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateActivityPayload {
  title: string;
  description?: string;
  activity_type?: 'task' | 'call' | 'email' | 'meeting' | 'note';
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  due_time?: string;
  assigned_to?: number;
  notes?: string;
}

export interface UpdateActivityPayload extends CreateActivityPayload {}

const API_URL = '/api';

export const opportunityActivityService = {
  // Buscar todas as atividades de uma oportunidade
  async getOpportunityActivities(opportunityId: number, token: string, params?: any): Promise<OpportunityActivity[]> {
    const res = await axios.get(`${API_URL}/opportunities/${opportunityId}/activities`, {
      params,
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  // Buscar atividade por ID
  async getActivityById(id: number, token: string): Promise<OpportunityActivity> {
    const res = await axios.get(`${API_URL}/activities/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  // Criar nova atividade
  async createActivity(opportunityId: number, data: CreateActivityPayload, token: string): Promise<OpportunityActivity> {
    const res = await axios.post(`${API_URL}/opportunities/${opportunityId}/activities`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  // Atualizar atividade
  async updateActivity(id: number, data: UpdateActivityPayload, token: string): Promise<OpportunityActivity> {
    const res = await axios.put(`${API_URL}/activities/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  // Atualizar status da atividade
  async updateActivityStatus(id: number, status: string, token: string): Promise<OpportunityActivity> {
    const res = await axios.patch(`${API_URL}/activities/${id}/status`, { status }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  // Deletar atividade
  async deleteActivity(id: number, token: string): Promise<void> {
    await axios.delete(`${API_URL}/activities/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}; 