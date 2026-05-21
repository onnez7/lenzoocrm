import { apiUrl } from "@/config/api";

export interface AdminStats {
  totalFranchises: number;
  activeFranchises: number;
  totalUsers: number;
  totalProducts: number;
  totalSales: number;
  totalRevenue: number;
  monthlyRevenue: number;
  pendingReceivables: number;
  pendingPayables: number;
  recentActivity: any[];
  topPerformers: any[];
  criticalAlerts: any[];
}

export interface RevenueData {
  month: string;
  revenue: number;
  franchises: number;
}

const adminService = {
  // Buscar estatísticas gerais do sistema
  async getAdminStats(): Promise<AdminStats> {
    const response = await fetch(`${apiUrl('/admin/stats')}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('lenzooToken')}`
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar estatísticas');
    }

    return response.json();
  },

  // Buscar dados de receita mensal
  async getRevenueData(): Promise<RevenueData[]> {
    const response = await fetch(`${apiUrl('/admin/revenue')}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('lenzooToken')}`
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar dados de receita');
    }

    return response.json();
  },

  // Buscar atividade recente
  async getRecentActivity(): Promise<any[]> {
    const response = await fetch(`${apiUrl('/admin/activity')}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('lenzooToken')}`
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar atividade recente');
    }

    return response.json();
  },

  // Buscar top performers
  async getTopPerformers(): Promise<any[]> {
    const response = await fetch(`${apiUrl('/admin/top-performers')}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('lenzooToken')}`
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar top performers');
    }

    return response.json();
  },

  // Buscar alertas críticos
  async getCriticalAlerts(): Promise<any[]> {
    const response = await fetch(`${apiUrl('/admin/alerts')}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('lenzooToken')}`
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar alertas');
    }

    return response.json();
  }
};

export default adminService; 