import axios from 'axios';

export interface Opportunity {
  id: number;
  client_id: number;
  client_name?: string;
  client_phone?: string;
  client_email?: string;
  title: string;
  value: number;
  stage: string;
  probability: number;
  responsible_id?: number;
  status: string;
  expected_close?: string;
  origin?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateOpportunityPayload {
  client_id: number;
  title: string;
  value: number;
  stage: string;
  probability?: number;
  responsible_id?: number;
  status?: string;
  expected_close?: string;
  origin?: string;
  notes?: string;
}

export interface UpdateOpportunityPayload extends CreateOpportunityPayload {}

const API_URL = '/api/opportunities';

export const opportunityService = {
  async getAll(token: string, params?: any): Promise<Opportunity[]> {
    const res = await axios.get(API_URL, {
      params,
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },
  async getById(id: number, token: string): Promise<Opportunity> {
    const res = await axios.get(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },
  async create(data: CreateOpportunityPayload, token: string): Promise<Opportunity> {
    const res = await axios.post(API_URL, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },
  async update(id: number, data: UpdateOpportunityPayload, token: string): Promise<Opportunity> {
    const res = await axios.put(`${API_URL}/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },
  async moveStage(id: number, stage: string, token: string): Promise<Opportunity> {
    const res = await axios.patch(`${API_URL}/${id}/stage`, { stage }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },
  async delete(id: number, token: string): Promise<void> {
    await axios.delete(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}; 