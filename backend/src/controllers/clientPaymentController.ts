import { Request, Response } from 'express';
import db from '../config/db';

export const getAllClientPayments = async (req: Request, res: Response) => {
  try {
    const { role, franchiseId } = req.user!;
    const { clientId, status, method, page = 1, limit = 20 } = req.query;
    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);
    const offset = (pageNumber - 1) * limitNumber;

    let query = `SELECT cp.*, c.name as client_name, c.franchise_id
                 FROM client_payments cp
                 LEFT JOIN clients c ON cp.client_id = c.id
                 WHERE 1=1`;
    const params: unknown[] = [];
    let idx = 1;

    if (role === 'FRANCHISE_ADMIN' || role === 'EMPLOYEE') {
      query += ` AND c.franchise_id = $${idx++}`;
      params.push(franchiseId);
    }
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

export const getClientPaymentById = async (req: Request, res: Response) => {
  try {
    const { role, franchiseId } = req.user!;
    const id = parseInt(req.params.id);

    let query = `SELECT cp.*, c.name as client_name, c.franchise_id
                 FROM client_payments cp
                 LEFT JOIN clients c ON cp.client_id = c.id
                 WHERE cp.id = $1`;
    const params: unknown[] = [id];

    if (role === 'FRANCHISE_ADMIN' || role === 'EMPLOYEE') {
      query += ` AND c.franchise_id = $2`;
      params.push(franchiseId);
    }

    const result = await db.query(query, params);
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

export const createClientPayment = async (req: Request, res: Response) => {
  try {
    const { role, franchiseId } = req.user!;
    const { client_id, order_id, amount, method, gateway, due_date } = req.body;

    if (!client_id || !amount || !method) {
      res.status(400).json({ message: 'Campos obrigatórios ausentes.' });
      return;
    }

    if (role !== 'SUPER_ADMIN') {
      const clientCheck = await db.query(
        'SELECT franchise_id FROM clients WHERE id = $1',
        [client_id]
      );
      if (clientCheck.rows.length === 0 || clientCheck.rows[0].franchise_id !== franchiseId) {
        res.status(403).json({ message: 'Acesso negado: cliente não pertence à sua franquia.' });
        return;
      }
    }

    const result = await db.query(
      `INSERT INTO client_payments (client_id, order_id, amount, method, gateway, due_date)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [client_id, order_id || null, amount, method, gateway || null, due_date || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    res.status(500).json({ message: 'Erro ao criar pagamento.' });
  }
};

export const updateClientPaymentStatus = async (req: Request, res: Response) => {
  try {
    const { role, franchiseId } = req.user!;
    const id = parseInt(req.params.id);
    const { status, paid_at } = req.body;

    if (!status) {
      res.status(400).json({ message: 'Status é obrigatório.' });
      return;
    }

    if (role !== 'SUPER_ADMIN') {
      const check = await db.query(
        `SELECT c.franchise_id FROM client_payments cp
         JOIN clients c ON cp.client_id = c.id
         WHERE cp.id = $1`,
        [id]
      );
      if (check.rows.length === 0 || check.rows[0].franchise_id !== franchiseId) {
        res.status(403).json({ message: 'Acesso negado.' });
        return;
      }
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
