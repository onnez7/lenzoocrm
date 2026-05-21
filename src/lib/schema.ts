
// Mock data types for the application
export interface User {
  id: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'employee';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Store {
  id: string;
  name: string;
  cnpj: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  logo?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Employee {
  id: string;
  userId: string;
  storeId: string;
  name: string;
  position?: string;
  phone?: string;
  address?: string;
  salary?: number;
  hireDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id: string;
  storeId: string;
  name: string;
  email?: string;
  phone?: string;
  cpf?: string;
  birthDate?: Date;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Convention {
  id: string;
  storeId: string;
  name: string;
  code: string;
  discount?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Plan {
  id: string;
  conventionId?: string;
  name: string;
  code: string;
  discount?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductCategory {
  id: string;
  storeId: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  storeId: string;
  categoryId?: string;
  name: string;
  brand?: string;
  model?: string;
  sku?: string;
  barcode?: string;
  description?: string;
  price: number;
  cost?: number;
  minStock: number;
  currentStock: number;
  images?: string[];
  specifications?: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockEntry {
  id: string;
  storeId: string;
  invoiceNumber?: string;
  supplier?: string;
  totalValue?: number;
  entryDate: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockMovement {
  id: string;
  productId: string;
  stockEntryId?: string;
  type: 'entry' | 'exit' | 'adjustment';
  quantity: number;
  reason?: string;
  employeeId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: string;
  storeId: string;
  clientId: string;
  employeeId?: string;
  title: string;
  description?: string;
  appointmentDate: Date;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Prescription {
  id: string;
  clientId: string;
  employeeId?: string;
  rightEye?: Record<string, any>;
  leftEye?: Record<string, any>;
  pd?: number;
  height?: number;
  prescriptionDate?: Date;
  doctorName?: string;
  doctorCrm?: string;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CrmNote {
  id: string;
  clientId: string;
  employeeId: string;
  type: string;
  subject: string;
  content: string;
  followUpDate?: Date;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  storeId: string;
  clientId?: string;
  invoiceNumber: string;
  type: 'sale' | 'purchase' | 'service';
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: 'pending' | 'paid' | 'cancelled';
  dueDate?: Date;
  paidDate?: Date;
  items?: Record<string, any>;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: 'cash' | 'card' | 'pix' | 'transfer';
  status: 'completed' | 'pending' | 'failed';
  transactionId?: string;
  paymentDate: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: string;
  employeeId: string;
  module: string;
  actions: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
