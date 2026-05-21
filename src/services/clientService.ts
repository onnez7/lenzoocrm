import { api } from '@/config/api';

export interface Client {
  id: number;
  franchise_id: number | null;
  name: string;
  email: string | null;
  phone: string | null;
  cpf: string | null;
  birth_date: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  notes: string | null;
  franchise_name: string | null;
  total_purchases?: number;
  appointments_count?: number;
  last_visit?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientDetails extends Client {
  prescriptions: Prescription[];
  appointments: Appointment[];
  totalPurchases: number;
  lastVisit: string | null;
}

export interface Prescription {
  id: number;
  client_id: number;
  date: string;
  doctor: string;
  right_eye_spherical: number | null;
  right_eye_cylindrical: number | null;
  right_eye_axis: number | null;
  right_eye_addition: number | null;
  left_eye_spherical: number | null;
  left_eye_cylindrical: number | null;
  left_eye_axis: number | null;
  left_eye_addition: number | null;
  pd: string | null;
  height: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: number;
  client_id: number;
  franchise_id: number | null;
  date: string;
  time: string;
  type: string;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateClientData {
  name: string;
  email?: string;
  phone?: string;
  cpf?: string;
  birthDate?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  notes?: string;
  targetFranchiseId?: number;
}

export interface UpdateClientData extends Partial<CreateClientData> {}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ClientsStats {
  total: number;
  active: number;
  inactive: number;
}

export interface ClientsResponse {
  clients: Client[];
  pagination: PaginationInfo;
  stats: ClientsStats;
}

export interface GetAllClientsParams {
  page?: number;
  limit?: number;
  search?: string;
}

class ClientService {
  // Listar todos os clientes com paginação
  async getAllClients(params: GetAllClientsParams = {}): Promise<ClientsResponse> {
    const { page = 1, limit = 20, search = '' } = params;
    const response = await api.get('/clients', {
      params: { page, limit, search }
    });
    return response.data;
  }

  // Buscar cliente por ID
  async getClientById(id: number): Promise<ClientDetails> {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  }

  // Criar novo cliente
  async createClient(data: CreateClientData): Promise<Client> {
    const response = await api.post('/clients', data);
    return response.data;
  }

  // Atualizar cliente
  async updateClient(id: number, data: UpdateClientData): Promise<Client> {
    const response = await api.put(`/clients/${id}`, data);
    return response.data;
  }

  // Deletar cliente
  async deleteClient(id: number): Promise<void> {
    await api.delete(`/clients/${id}`);
  }
}

export const clientService = new ClientService(); 