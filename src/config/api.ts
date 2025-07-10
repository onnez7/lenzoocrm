import axios from 'axios';

// Configuração da API
export const API_BASE_URL = 'http://localhost:3001/api';

// Instância do axios configurada
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lenzooToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('lenzooToken');
      localStorage.removeItem('lenzooUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Função para construir URLs da API
export const apiUrl = (endpoint: string) => `${API_BASE_URL}${endpoint}`; 