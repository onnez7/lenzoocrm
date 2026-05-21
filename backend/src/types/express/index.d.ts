// Este arquivo estende a definição de tipos do Express
declare namespace Express {
  export interface Request {
    user?: {
      id: number;
      role: 'SUPER_ADMIN' | 'FRANCHISE_ADMIN' | 'EMPLOYEE';
      franchiseId: number | null;
    };
  }
}