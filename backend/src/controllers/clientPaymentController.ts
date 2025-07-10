import { Request, Response } from 'express';
import db from '../config/db';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: 'SUPER_ADMIN' | 'FRANCHISE_ADMIN' | 'EMPLOYEE';
    franchiseId: number | null;
  };
}

// Listar pagamentos de clientes (com filtro por cliente, status, método, etc)
export const getAllClientPayments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { clientId, status, method, page = 1, limit = 20 } = req.query;
    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);
    const offset = (pageNumber - 1) * limitNumber;
    let query = `SELECT cp.*, c.name as client_name FROM client_payments cp LEFT JOIN clients c ON cp.client_id = c.id WHERE 1=1`;
    const params: any[] = [];
    let idx = 1;
    if (clientId) {
      query += ` AND cp.client_id = $${idx++}`;
      params.push(clientId);
    }
    if (status) {
      query += ` AND cp.status = $${idx++}`;
      params.push(status);
    }
    if (method) {
      query += ` AND cp.method = $${idx++}`;
      params.push(method);
    }
    query += ` ORDER BY cp.created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
    params.push(limitNumber, offset);
    const result = await db.query(query, params);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar pagamentos de clientes:', error);
    res.status(500).json({ message: 'Erro ao buscar pagamentos de clientes.' });
  }
};

// Buscar pagamento por ID
export const getClientPaymentById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = await db.query('SELECT * FROM client_payments WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Pagamento não encontrado.' });
      return;
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar pagamento:', error);
    res.status(500).json({ message: 'Erro ao buscar pagamento.' });
  }
};

// Criar novo pagamento de cliente
export const createClientPayment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { client_id, order_id, amount, method, gateway, due_date } = req.body;
    if (!client_id || !amount || !method) {
      res.status(400).json({ message: 'Campos obrigatórios ausentes.' });
      return;
    }
    const result = await db.query(
      `INSERT INTO client_payments (client_id, order_id, amount, method, gateway, due_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [client_id, order_id || null, amount, method, gateway || null, due_date || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    res.status(500).json({ message: 'Erro ao criar pagamento.' });
  }
};

// Atualizar status do pagamento
export const updateClientPaymentStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { status, paid_at } = req.body;
    if (!status) {
      res.status(400).json({ message: 'Status é obrigatório.' });
      return;
    }
    const result = await db.query(
      `UPDATE client_payments SET status = $1, paid_at = $2, updated_at = NOW() WHERE id = $3 RETURNING *`,
      [status, paid_at || null, id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Pagamento não encontrado.' });
      return;
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar status do pagamento:', error);
    res.status(500).json({ message: 'Erro ao atualizar status do pagamento.' });
  }
}; 