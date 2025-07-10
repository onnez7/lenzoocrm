import { api } from '@/config/api';

export interface Employee {
  id: number;
  user_id?: number;
  franchise_id: number;
  role_id?: number;
  name: string;
  email: string;
  phone?: string;
  position?: string;
  salary?: number;
  hire_date: string;
  termination_date?: string;
  status: 'active' | 'inactive' | 'terminated';
  address?: string;
  cpf?: string;
  rg?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  notes?: string;
  role_name?: string;
  franchise_name?: string;
  user_email?: string;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateEmployeeData {
  name: string;
  email: string;
  phone?: string;
  position?: string;
  salary?: number;
  hire_date: string;
  role_id?: number;
  address?: string;
  cpf?: string;
  rg?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  notes?: string;
  targetFranchiseId?: number;
}

export interface UpdateEmployeeData extends Partial<CreateEmployeeData> {
  termination_date?: string;
  status?: 'active' | 'inactive' | 'terminated';
}

export interface EmployeesResponse {
  employees: Employee[];
  total: number;
  active: number;
  inactive: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Funções para SUPER_ADMIN
export const getEmployees = async (
  page: number = 1,
  limit: number = 20,
  search: string = '',
  status?: string,
  franchiseId?: number
): Promise<EmployeesResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
    ...(status && { status }),
    ...(franchiseId && { franchiseId: franchiseId.toString() })
  });

  const response = await api.get(`/employees?${params}`);
  return response.data;
};

export const getEmployeeById = async (id: number): Promise<Employee> => {
  const response = await api.get(`/employees/${id}`);
  return response.data;
};

export const createEmployee = async (data: CreateEmployeeData): Promise<Employee> => {
  const response = await api.post('/employees', data);
  return response.data;
};

export const updateEmployee = async (id: number, data: UpdateEmployeeData): Promise<Employee> => {
  const response = await api.put(`/employees/${id}`, data);
  return response.data;
};

export const deleteEmployee = async (id: number): Promise<void> => {
  await api.delete(`/employees/${id}`);
};

// Funções para FRANCHISE_ADMIN
export const getFranchiseEmployees = async (
  page: number = 1,
  limit: number = 20,
  search: string = '',
  status?: string
): Promise<EmployeesResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
    ...(status && { status })
  });

  const response = await api.get(`/employees/franchise?${params}`);
  return response.data;
};

export const getFranchiseEmployeeById = async (id: number): Promise<Employee> => {
  const response = await api.get(`/employees/franchise/${id}`);
  return response.data;
};

export const createFranchiseEmployee = async (data: CreateEmployeeData): Promise<Employee> => {
  const response = await api.post('/employees/franchise', data);
  return response.data;
};

export const updateFranchiseEmployee = async (id: number, data: UpdateEmployeeData): Promise<Employee> => {
  const response = await api.put(`/employees/franchise/${id}`, data);
  return response.data;
};

export const deleteFranchiseEmployee = async (id: number): Promise<void> => {
  await api.delete(`/employees/franchise/${id}`);
};

// Funções para cargos
export const getRoles = async (): Promise<Role[]> => {
  const response = await api.get('/employees/roles');
  return response.data;
};

const employeeService = {
  // SUPER_ADMIN
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  
  // FRANCHISE_ADMIN
  getFranchiseEmployees,
  getFranchiseEmployeeById,
  createFranchiseEmployee,
  updateFranchiseEmployee,
  deleteFranchiseEmployee,
  
  // Cargos
  getRoles
};

export default employeeService; 