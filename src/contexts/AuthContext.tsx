import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiUrl } from '@/config/api';

// Tipagem para os dados do usuário que virão da API
interface User {
  id: number;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'FRANCHISE_ADMIN' | 'EMPLOYEE';
  franchiseId: number | null;
}

// Tipagem para o valor que o Contexto vai prover
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Ao carregar a aplicação, verifica se há dados no localStorage
    const storedUser = localStorage.getItem('lenzooUser');
    const storedToken = localStorage.getItem('lenzooToken');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    console.log('Tentando fazer login com:', email);
    console.log('URL da API:', apiUrl('/auth/login'));
    
    try {
      const requestBody = JSON.stringify({ email, password });
      console.log('Dados enviados:', requestBody);
      
      const response = await fetch(apiUrl('/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: requestBody,
      });

      console.log('Resposta da API:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro na API:', errorData);
        throw new Error(errorData.message || 'Falha no login');
      }

      const data = await response.json();
      console.log('Dados recebidos:', data);
      
      setUser(data);
      setToken(data.token);

      // Armazena no localStorage para persistir a sessão
      localStorage.setItem('lenzooUser', JSON.stringify(data));
      localStorage.setItem('lenzooToken', data.token);

      console.log('Redirecionando para:', data.role === 'SUPER_ADMIN' ? '/admin' : '/dashboard');
      
      if (data.role === 'SUPER_ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('lenzooUser');
    localStorage.removeItem('lenzooToken');
    navigate('/login');
  };

  const value = { isAuthenticated: !!token, user, token, login, logout, isLoading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

export { AuthProvider, useAuth };