import { api } from '@/config/api';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  franchiseId?: number;
  avatar?: string;
  bio?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  lastLogin?: string;
  isActive: boolean;
  franchise_name?: string;
}

export interface UserSettings {
  theme: "light" | "dark" | "system";
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    appointments: boolean;
    sales: boolean;
    stock: boolean;
    system: boolean;
  };
  privacy: {
    profileVisible: boolean;
    activityVisible: boolean;
    onlineStatus: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: number;
    loginNotifications: boolean;
  };
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

class UserService {
  // Buscar perfil do usuário
  async getUserProfile(token: string): Promise<UserProfile> {
    const response = await api.get('/users/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // Atualizar perfil do usuário
  async updateUserProfile(data: Partial<UserProfile>, token: string): Promise<UserProfile> {
    const response = await api.put('/users/profile', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // Buscar configurações do usuário
  async getUserSettings(token: string): Promise<UserSettings> {
    const response = await api.get('/users/settings', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // Atualizar configurações do usuário
  async updateUserSettings(data: Partial<UserSettings>, token: string): Promise<UserSettings> {
    const response = await api.put('/users/settings', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // Alterar senha
  async changePassword(data: ChangePasswordData, token: string): Promise<{ message: string }> {
    const response = await api.post('/users/change-password', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // Upload de avatar
  async uploadAvatar(file: File, token: string): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await api.post('/users/avatar', formData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  // Buscar todos os usuários (apenas para SUPER_ADMIN)
  async getAllUsers(token: string): Promise<UserProfile[]> {
    const response = await api.get('/users', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // Buscar usuário por ID
  async getUserById(id: number, token: string): Promise<UserProfile> {
    const response = await api.get(`/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // Criar usuário
  async createUser(data: Partial<UserProfile> & { password: string }, token: string): Promise<UserProfile> {
    const response = await api.post('/users', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // Atualizar usuário
  async updateUser(id: number, data: Partial<UserProfile>, token: string): Promise<UserProfile> {
    const response = await api.put(`/users/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // Deletar usuário
  async deleteUser(id: number, token: string): Promise<{ message: string }> {
    const response = await api.delete(`/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
}

export const userService = new UserService(); 