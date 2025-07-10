import { Request, Response } from 'express';
import db from '../config/db';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: 'SUPER_ADMIN' | 'FRANCHISE_ADMIN' | 'EMPLOYEE';
    franchiseId: number | null;
  };
}

// Listar todas as vendas (com filtro por franquia)
export const getAllSales = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { role, franchiseId } = req.user!;

  try {
    let query = `
      SELECT s.*, 
             c.name as client_name,
             u.name as user_name,
             f.name as franchise_name,
             COUNT(si.id) as items_count
      FROM sales s
      LEFT JOIN clients c ON s.client_id = c.id
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN franchises f ON s.franchise_id = f.id
      LEFT JOIN sale_items si ON s.id = si.sale_id
    `;
    const queryParams: any[] = [];

    // FRANCHISE_ADMIN só vê vendas da sua franquia
    if (role === 'FRANCHISE_ADMIN') {
      if (franchiseId !== null && franchiseId !== undefined) {
        query += ' WHERE s.franchise_id = $1';
        queryParams.push(franchiseId);
      } else {
        res.status(403).json({ message: 'Usuário não associado a uma franquia.' });
        return;
      }
    }
    // SUPER_ADMIN vê todas as vendas

    query += ' GROUP BY s.id, c.name, u.name, f.name ORDER BY s.created_at DESC';

    const result = await db.query(query, queryParams);
    res.status(200).json(result.rows);
    return;
  } catch (error) {
    console.error('Erro ao buscar vendas:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar vendas.' });
    return;
  }
};

// Buscar venda por ID
export const getSaleById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { role, franchiseId } = req.user!;
  const saleId = parseInt(req.params.id);

  try {
    let query = `
      SELECT s.*, 
             c.name as client_name,
             u.name as user_name,
             f.name as franchise_name
      FROM sales s
      LEFT JOIN clients c ON s.client_id = c.id
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN franchises f ON s.franchise_id = f.id
      WHERE s.id = $1
    `;
    const queryParams = [saleId];

    // FRANCHISE_ADMIN só pode ver vendas da sua franquia
    if (role === 'FRANCHISE_ADMIN') {
      if (franchiseId !== null && franchiseId !== undefined) {
        query += ' AND s.franchise_id = $2';
        queryParams.push(franchiseId);
      } else {
        res.status(403).json({ message: 'Usuário não associado a uma franquia.' });
        return;
      }
    }

    const result = await db.query(query, queryParams);

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Venda não encontrada.' });
      return;
    }

    // Buscar itens da venda
    const itemsQuery = `
      SELECT si.*, p.name as product_name, p.sku
      FROM sale_items si
      LEFT JOIN products p ON si.product_id = p.id
      WHERE si.sale_id = $1
    `;
    const itemsResult = await db.query(itemsQuery, [saleId]);

    const sale = result.rows[0];
    sale.items = itemsResult.rows;

    res.status(200).json(sale);
    return;
  } catch (error) {
    console.error('Erro ao buscar venda:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar venda.' });
    return;
  }
};

// Criar nova venda
export const createSale = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { role, franchiseId } = req.user!;
  const { client_id, total_amount, payment_method, items, targetFranchiseId } = req.body;

  // Validações
  if (!client_id || !total_amount || !items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ message: 'Dados da venda são obrigatórios.' });
    return;
  }

  try {
    // Determinar a franquia da venda
    let finalFranchiseId = targetFranchiseId;
    
    if (role === 'FRANCHISE_ADMIN') {
      // FRANCHISE_ADMIN só pode criar vendas para sua própria franquia
      if (targetFranchiseId && targetFranchiseId !== franchiseId) {
        res.status(403).json({ message: 'Você só pode criar vendas para sua própria franquia.' });
        return;
      }
      finalFranchiseId = franchiseId || null;
    } else if (role === 'SUPER_ADMIN') {
      // SUPER_ADMIN pode criar vendas para qualquer franquia
      if (!targetFranchiseId) {
        res.status(400).json({ message: 'Franquia deve ser especificada.' });
        return;
      }
    }

    // Iniciar transação
    await db.query('BEGIN');

    // Inserir venda
    const newSaleResult = await db.query(
      `INSERT INTO sales (franchise_id, client_id, user_id, total_amount, payment_method) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id`,
      [finalFranchiseId, client_id, req.user!.id, total_amount, payment_method]
    );

    const saleId = newSaleResult.rows[0].id;

    // Inserir itens da venda
    for (const item of items) {
      await db.query(
        `INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, total_price) 
         VALUES ($1, $2, $3, $4, $5)`,
        [saleId, item.product_id, item.quantity, item.unit_price, item.total_price]
      );

      // Atualizar estoque do produto
      await db.query(
        `UPDATE products 
         SET stock_quantity = stock_quantity - $1 
         WHERE id = $2`,
        [item.quantity, item.product_id]
      );
    }

    await db.query('COMMIT');

    // Buscar venda criada
    const createdSale = await getSaleById({ ...req, params: { id: saleId.toString() } } as any, res);
    return;
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Erro ao criar venda:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao criar venda.' });
    return;
  }
};

// Atualizar venda
export const updateSale = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { role, franchiseId } = req.user!;
  const saleId = parseInt(req.params.id);
  const { total_amount, payment_method, status } = req.body;

  try {
    // Verificar se a venda existe e tem permissão para editá-la
    let checkQuery = 'SELECT id, franchise_id FROM sales WHERE id = $1';
    const checkParams = [saleId];

    if (role === 'FRANCHISE_ADMIN') {
      if (franchiseId !== null && franchiseId !== undefined) {
        checkQuery += ' AND franchise_id = $2';
        checkParams.push(franchiseId);
      } else {
        res.status(403).json({ message: 'Usuário não associado a uma franquia.' });
        return;
      }
    }

    const existingSale = await db.query(checkQuery, checkParams);
    if (existingSale.rows.length === 0) {
      res.status(404).json({ message: 'Venda não encontrada ou sem permissão.' });
      return;
    }

    // Preparar dados para atualização
    const updateFields: string[] = [];
    const updateParams: any[] = [];
    let paramIndex = 1;

    if (total_amount) {
      updateFields.push(`total_amount = $${paramIndex++}`);
      updateParams.push(total_amount);
    }

    if (payment_method) {
      updateFields.push(`payment_method = $${paramIndex++}`);
      updateParams.push(payment_method);
    }

    if (status) {
      updateFields.push(`status = $${paramIndex++}`);
      updateParams.push(status);
    }

    if (updateFields.length === 0) {
      res.status(400).json({ message: 'Nenhum campo para atualizar.' });
      return;
    }

    updateParams.push(saleId);
    const updateQuery = `UPDATE sales SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`;

    await db.query(updateQuery, updateParams);

    // Buscar venda atualizada
    const updatedSale = await getSaleById({ ...req, params: { id: saleId.toString() } } as any, res);
    return;
  } catch (error) {
    console.error('Erro ao atualizar venda:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao atualizar venda.' });
    return;
  }
};

// Deletar venda
export const deleteSale = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { role, franchiseId } = req.user!;
  const saleId = parseInt(req.params.id);

  try {
    // Verificar se a venda existe e tem permissão para deletá-la
    let checkQuery = 'SELECT id, franchise_id FROM sales WHERE id = $1';
    const checkParams = [saleId];

    if (role === 'FRANCHISE_ADMIN') {
      if (franchiseId !== null && franchiseId !== undefined) {
        checkQuery += ' AND franchise_id = $2';
        checkParams.push(franchiseId);
      } else {
        res.status(403).json({ message: 'Usuário não associado a uma franquia.' });
        return;
      }
    }

    const existingSale = await db.query(checkQuery, checkParams);
    if (existingSale.rows.length === 0) {
      res.status(404).json({ message: 'Venda não encontrada ou sem permissão.' });
      return;
    }

    // Iniciar transação
    await db.query('BEGIN');

    // Buscar itens da venda para restaurar estoque
    const itemsResult = await db.query(
      'SELECT product_id, quantity FROM sale_items WHERE sale_id = $1',
      [saleId]
    );

    // Restaurar estoque dos produtos
    for (const item of itemsResult.rows) {
      await db.query(
        `UPDATE products 
         SET stock_quantity = stock_quantity + $1 
         WHERE id = $2`,
        [item.quantity, item.product_id]
      );
    }

    // Deletar itens da venda
    await db.query('DELETE FROM sale_items WHERE sale_id = $1', [saleId]);

    // Deletar venda
    await db.query('DELETE FROM sales WHERE id = $1', [saleId]);

    await db.query('COMMIT');

    res.status(200).json({ message: 'Venda deletada com sucesso.' });
    return;
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Erro ao deletar venda:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao deletar venda.' });
    return;
  }
}; 