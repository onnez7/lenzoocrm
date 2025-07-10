import { Request, Response } from 'express';
import db from '../config/db';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: 'SUPER_ADMIN' | 'FRANCHISE_ADMIN' | 'EMPLOYEE';
    franchiseId: number | null;
  };
}

// Registrar movimentação de estoque
export const registerStockMovement = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { user } = req;
  const {
    product_id,
    movement_type, // 'entry', 'exit', 'adjustment'
    quantity,
    unit_cost,
    reason,
    reference_number,
    supplier,
    customer,
    notes
  } = req.body;

  if (!product_id || !movement_type || !quantity) {
    res.status(400).json({ message: 'Campos obrigatórios: product_id, movement_type, quantity.' });
    return;
  }

  try {
    // Determinar franquia
    let franchiseId = user?.franchiseId;
    if (user?.role === 'SUPER_ADMIN' && req.body.franchise_id) {
      franchiseId = req.body.franchise_id;
    }
    if (!franchiseId) {
      res.status(400).json({ message: 'Franquia não informada.' });
      return;
    }

    // Chamar função do banco para registrar movimentação
    const result = await db.query(
      `SELECT register_stock_movement($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) as movement_id`,
      [
        product_id,
        franchiseId,
        user?.id,
        movement_type,
        quantity,
        unit_cost,
        reason,
        reference_number,
        supplier,
        customer,
        notes
      ]
    );
    const movementId = result.rows[0].movement_id;
    // Buscar movimentação criada
    const movement = await db.query('SELECT * FROM stock_movements WHERE id = $1', [movementId]);
    res.status(201).json(movement.rows[0]);
    return;
  } catch (error: any) {
    console.error('Erro ao registrar movimentação de estoque:', error);
    res.status(500).json({ message: error.message || 'Erro ao registrar movimentação de estoque.' });
    return;
  }
};

// Listar histórico de movimentações
export const listStockMovements = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { user } = req;
  const { product_id, movement_type, start_date, end_date, limit = 50, offset = 0 } = req.query;

  try {
    let query = `
      SELECT m.*, p.name as product_name, p.sku, p.model, p.barcode, b.name as brand_name, c.name as category_name, u.name as user_name
      FROM stock_movements m
      LEFT JOIN products p ON m.product_id = p.id
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON m.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    // Filtrar por franquia
    if (user?.role === 'FRANCHISE_ADMIN') {
      query += ` AND m.franchise_id = $${paramIndex++}`;
      params.push(user.franchiseId);
    } else if (user?.role === 'SUPER_ADMIN' && req.query.franchise_id) {
      query += ` AND m.franchise_id = $${paramIndex++}`;
      params.push(req.query.franchise_id);
    }

    if (product_id) {
      query += ` AND m.product_id = $${paramIndex++}`;
      params.push(product_id);
    }
    if (movement_type) {
      query += ` AND m.movement_type = $${paramIndex++}`;
      params.push(movement_type);
    }
    if (start_date) {
      query += ` AND m.movement_date >= $${paramIndex++}`;
      params.push(start_date);
    }
    if (end_date) {
      query += ` AND m.movement_date <= $${paramIndex++}`;
      params.push(end_date);
    }

    query += ` ORDER BY m.movement_date DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    res.status(200).json(result.rows);
    return;
  } catch (error: any) {
    console.error('Erro ao listar movimentações de estoque:', error);
    res.status(500).json({ message: error.message || 'Erro ao listar movimentações de estoque.' });
    return;
  }
};

// Detalhes de uma movimentação
export const getStockMovementById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { user } = req;
  const { id } = req.params;

  try {
    let query = `
      SELECT m.*, p.name as product_name, p.sku, p.model, p.barcode, b.name as brand_name, c.name as category_name, u.name as user_name
      FROM stock_movements m
      LEFT JOIN products p ON m.product_id = p.id
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON m.user_id = u.id
      WHERE m.id = $1
    `;
    const params: any[] = [id];

    // Filtrar por franquia
    if (user?.role === 'FRANCHISE_ADMIN') {
      query += ' AND m.franchise_id = $2';
      params.push(user.franchiseId);
    }

    const result = await db.query(query, params);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Movimentação não encontrada.' });
      return;
    }
    res.status(200).json(result.rows[0]);
    return;
  } catch (error: any) {
    console.error('Erro ao buscar movimentação:', error);
    res.status(500).json({ message: error.message || 'Erro ao buscar movimentação.' });
    return;
  }
}; 