import { api } from '@/config/api';

export interface Appointment {
  id: number;
  client_id: number;
  employee_id: number;
  service: string;
  appointment_date: string;
  appointment_time: string;
  status: 'agendado' | 'confirmado' | 'em_andamento' | 'concluido' | 'cancelado';
  observations?: string;
  franchise_id: number;
  created_at: string;
  updated_at: string;
  // Campos relacionados
  client_name?: string;
  client_phone?: string;
  employee_name?: string;
}

export interface CreateAppointmentData {
  client_id: number;
  employee_id?: number;
  service: string;
  appointment_date: string;
  appointment_time: string;
  observations?: string;
}

export interface UpdateAppointmentData {
  client_id?: number;
  employee_id?: number;
  service?: string;
  appointment_date?: string;
  appointment_time?: string;
  status?: 'agendado' | 'confirmado' | 'em_andamento' | 'concluido' | 'cancelado';
  observations?: string;
}

class AppointmentService {
  // Buscar todos os agendamentos
  async getAppointments(): Promise<Appointment[]> {
    const response = await api.get('/appointments');
    return response.data;
  }

  // Buscar agendamento por ID
  async getAppointmentById(id: number): Promise<Appointment> {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  }

  // Criar novo agendamento
  async createAppointment(data: CreateAppointmentData): Promise<Appointment> {
    const response = await api.post('/appointments', data);
    return response.data;
  }

  // Atualizar agendamento
  async updateAppointment(id: number, data: UpdateAppointmentData): Promise<Appointment> {
    const response = await api.put(`/appointments/${id}`, data);
    return response.data;
  }

  // Deletar agendamento
  async deleteAppointment(id: number): Promise<void> {
    await api.delete(`/appointments/${id}`);
  }

  // Buscar agendamentos por data
  async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    const response = await api.get(`/appointments/date/${date}`);
    return response.data;
  }

  // Buscar agendamentos por funcionário
  async getAppointmentsByEmployee(employeeId: number): Promise<Appointment[]> {
    const response = await api.get(`/appointments/employee/${employeeId}`);
    return response.data;
  }

  // Buscar clientes (para o formulário)
  async getClients() {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token não encontrado');
    const response = await api.get('/clients', {
      headers: { Authorization: `Bearer ${token}` }
    });
    // A API retorna { clients: [...], pagination: {...}, stats: {...} }
    return response.data.clients || [];
  }

  // Buscar funcionários (para o formulário)
  async getEmployees() {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token não encontrado');
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userRole = payload.role;
    const endpoint = userRole === 'SUPER_ADMIN' ? '/employees' : '/employees/franchise';
    const response = await api.get(endpoint, {
      headers: { Authorization: `Bearer ${token}` }
    });
    // A API retorna { employees: [...], pagination: {...}, stats: {...} }
    return response.data.employees || [];
  }

  // Serviços disponíveis
  getServices() {
    return [
      "Consulta Oftalmológica",
      "Exame de Vista",
      "Adaptação de Lentes",
      "Manutenção de Óculos",
      "Teste de Lentes de Contato",
      "Exame de Fundo de Olho"
    ];
  }

  // Status disponíveis
  getStatuses() {
    return [
      { value: 'agendado', label: 'Agendado' },
      { value: 'confirmado', label: 'Confirmado' },
      { value: 'em_andamento', label: 'Em Andamento' },
      { value: 'concluido', label: 'Concluído' },
      { value: 'cancelado', label: 'Cancelado' }
    ];
  }

  // Formatar data para exibição
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  // Formatar hora para exibição
  formatTime(time: string): string {
    return time.substring(0, 5); // Remove segundos se houver
  }

  // Formatar data e hora para exibição
  formatDateTime(date: string, time: string): string {
    const dateObj = new Date(`${date}T${time}`);
    return dateObj.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Obter cor do status
  getStatusColor(status: string): string {
    switch (status) {
      case 'confirmado': return 'bg-green-100 text-green-800';
      case 'agendado': return 'bg-blue-100 text-blue-800';
      case 'em_andamento': return 'bg-yellow-100 text-yellow-800';
      case 'concluido': return 'bg-gray-100 text-gray-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  // Obter variante do badge do status
  getStatusVariant(status: string): "default" | "secondary" | "outline" | "destructive" {
    switch (status) {
      case 'confirmado': return 'default';
      case 'agendado': return 'secondary';
      case 'em_andamento': return 'outline';
      case 'concluido': return 'default';
      case 'cancelado': return 'destructive';
      default: return 'secondary';
    }
  }

  // Obter label do status
  getStatusLabel(status: string): string {
    switch (status) {
      case 'agendado': return 'Agendado';
      case 'confirmado': return 'Confirmado';
      case 'em_andamento': return 'Em Andamento';
      case 'concluido': return 'Concluído';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  }
}

export default new AppointmentService(); 