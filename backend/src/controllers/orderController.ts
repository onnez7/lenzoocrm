import { Request, Response } from 'express';
import db from '../config/db';
import { findOpenCashierSession } from './cashierController';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: 'SUPER_ADMIN' | 'FRANCHISE_ADMIN' | 'EMPLOYEE';
    franchiseId: number | null;
  };
}

// Listar todas as ordens de serviço (com filtro por franquia)
export const getAllOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { role, franchiseId } = req.user!;

  try {
    let query = `
      SELECT so.*, 
             c.name as client_name,
             e.name as employee_name,
             f.name as franchise_name,
             cs.session_code,
             cs.status as session_status,
             COUNT(soi.id) as items_count
      FROM service_orders so
      LEFT JOIN clients c ON so.client_id = c.id
      LEFT JOIN employees e ON so.employee_id = e.id
      LEFT JOIN franchises f ON c.franchise_id = f.id
      LEFT JOIN cashier_sessions cs ON so.session_id = cs.id
      LEFT JOIN service_order_items soi ON so.id = soi.order_id
    `;
    const queryParams: any[] = [];

    // FRANCHISE_ADMIN só vê ordens da sua franquia
    if (role === 'FRANCHISE_ADMIN') {
      if (franchiseId !== null && franchiseId !== undefined) {
        query += ' WHERE c.franchise_id = $1';
        queryParams.push(franchiseId);
      } else {
        res.status(403).json({ message: 'Usuário não associado a uma franquia.' });
        return;
      }
    }
    // SUPER_ADMIN vê todas as ordens

    query += ' GROUP BY so.id, c.name, e.name, f.name, cs.session_code, cs.status ORDER BY so.created_at DESC';

    const result = await db.query(query, queryParams);
    res.status(200).json(result.rows);
    return;
  } catch (error) {
    console.error('Erro ao buscar ordens de serviço:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar ordens de serviço.' });
    return;
  }
};

// Buscar ordem de serviço por ID
export const getOrderById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { role, franchiseId } = req.user!;
  const orderId = parseInt(req.params.id);

  try {
    let query = `
      SELECT so.*, 
             c.name as client_name,
             e.name as employee_name,
             f.name as franchise_name
      FROM service_orders so
      LEFT JOIN clients c ON so.client_id = c.id
      LEFT JOIN employees e ON so.employee_id = e.id
      LEFT JOIN franchises f ON c.franchise_id = f.id
      WHERE so.id = $1
    `;
    const queryParams = [orderId];

    // FRANCHISE_ADMIN só pode ver ordens da sua franquia
    if (role === 'FRANCHISE_ADMIN') {
      if (franchiseId !== null && franchiseId !== undefined) {
        query += ' AND c.franchise_id = $2';
        queryParams.push(franchiseId);
      } else {
        res.status(403).json({ message: 'Usuário não associado a uma franquia.' });
        return;
      }
    }

    const result = await db.query(query, queryParams);

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Ordem de serviço não encontrada.' });
      return;
    }

    // Buscar itens da ordem
    const itemsResult = await db.query(
      'SELECT * FROM service_order_items WHERE order_id = $1',
      [orderId]
    );

    const order = { ...result.rows[0], items: itemsResult.rows };
    res.status(200).json(order);
    return;
  } catch (error) {
    console.error('Erro ao buscar ordem de serviço:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar ordem de serviço.' });
    return;
  }
};

// Criar nova ordem de serviço
export const createOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { franchiseId, id: userId } = req.user!;
  const { client_id, items, description, notes } = req.body;

  if (!franchiseId) {
    res.status(400).json({ message: 'Usuário não está associado a uma franquia.' });
    return;
  }
  if (!client_id || !items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ message: 'Dados obrigatórios ausentes.' });
    return;
  }

  // Verificar se há caixa aberto
  const openSession = await findOpenCashierSession(franchiseId);
  if (!openSession) {
    res.status(403).json({ message: 'Não é possível criar ordem de serviço sem caixa aberto.' });
    return;
  }

  try {
    // Buscar o ID do employee baseado no user_id
    const employeeResult = await db.query(
      'SELECT id FROM employees WHERE user_id = $1',
      [userId]
    );
    
    if (employeeResult.rows.length === 0) {
      res.status(400).json({ message: 'Usuário não encontrado na tabela de funcionários.' });
      return;
    }
    
    const employeeId = employeeResult.rows[0].id;

    // Gerar número da ordem
    const orderNumberResult = await db.query('SELECT generate_order_number() as order_number');
    const order_number = orderNumberResult.rows[0].order_number;

    // Calcular total
    const total_amount = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unit_price), 0);

    // Inserir ordem de serviço
    const orderResult = await db.query(
      `INSERT INTO service_orders (order_number, client_id, employee_id, session_id, status, total_amount, description, notes)
       VALUES ($1, $2, $3, $4, 'pending', $5, $6, $7) RETURNING *`,
      [order_number, client_id, employeeId, openSession.id, total_amount, description, notes]
    );
    const order = orderResult.rows[0];

    // Inserir itens
    for (const item of items) {
      await db.query(
        `INSERT INTO service_order_items (order_id, product_id, product_name, quantity, unit_price, total_price)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [order.id, item.product_id, item.product_name, item.quantity, item.unit_price, item.quantity * item.unit_price]
      );
    }

    res.status(201).json({ ...order, items });
    return;
  } catch (error) {
    console.error('Erro ao criar ordem de serviço:', error);
    res.status(500).json({ message: 'Erro ao criar ordem de serviço.' });
    return;
  }
};

// Atualizar ordem de serviço
export const updateOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { role, franchiseId } = req.user!;
  const orderId = parseInt(req.params.id);
  const { description, notes, items } = req.body;

  try {
    // Verificar se a ordem existe e tem permissão para editá-la
    let checkQuery = `
      SELECT so.id, c.franchise_id 
      FROM service_orders so
      LEFT JOIN clients c ON so.client_id = c.id
      WHERE so.id = $1
    `;
    const checkParams = [orderId];

    if (role === 'FRANCHISE_ADMIN') {
      if (franchiseId !== null && franchiseId !== undefined) {
        checkQuery += ' AND c.franchise_id = $2';
        checkParams.push(franchiseId);
      } else {
        res.status(403).json({ message: 'Usuário não associado a uma franquia.' });
        return;
      }
    }

    const existingOrder = await db.query(checkQuery, checkParams);
    if (existingOrder.rows.length === 0) {
      res.status(404).json({ message: 'Ordem de serviço não encontrada ou sem permissão.' });
      return;
    }

    // Preparar dados para atualização
    const updateFields: string[] = [];
    const updateParams: any[] = [];
    let paramIndex = 1;

    if (description !== undefined) {
      updateFields.push(`description = $${paramIndex++}`);
      updateParams.push(description);
    }

    if (notes !== undefined) {
      updateFields.push(`notes = $${paramIndex++}`);
      updateParams.push(notes);
    }

    if (updateFields.length === 0) {
      res.status(400).json({ message: 'Nenhum campo para atualizar.' });
      return;
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateParams.push(orderId);
    const updateQuery = `UPDATE service_orders SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`;

    await db.query(updateQuery, updateParams);

    // Se houver novos itens, atualizar
    if (items && Array.isArray(items)) {
      // Deletar itens existentes
      await db.query('DELETE FROM service_order_items WHERE order_id = $1', [orderId]);

      // Inserir novos itens
      for (const item of items) {
        await db.query(
          `INSERT INTO service_order_items (order_id, product_id, product_name, quantity, unit_price, total_price)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [orderId, item.product_id, item.product_name, item.quantity, item.unit_price, item.quantity * item.unit_price]
        );
      }

      // Recalcular total
      const totalResult = await db.query(
        'SELECT SUM(total_price) as total FROM service_order_items WHERE order_id = $1',
        [orderId]
      );
      const total_amount = totalResult.rows[0].total || 0;

      await db.query(
        'UPDATE service_orders SET total_amount = $1 WHERE id = $2',
        [total_amount, orderId]
      );
    }

    // Buscar ordem atualizada
    const updatedOrder = await getOrderById({ ...req, params: { id: orderId.toString() } } as any, res);
    return;
  } catch (error) {
    console.error('Erro ao atualizar ordem de serviço:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao atualizar ordem de serviço.' });
    return;
  }
};

// Atualizar status da ordem de serviço
export const updateOrderStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { role, franchiseId } = req.user!;
  const orderId = parseInt(req.params.id);
  const { status } = req.body;

  if (!status || !['pending', 'in_progress', 'completed', 'cancelled'].includes(status)) {
    res.status(400).json({ message: 'Status inválido.' });
    return;
  }

  try {
    // Verificar se a ordem existe e tem permissão para editá-la
    let checkQuery = `
      SELECT so.id, so.session_id, c.franchise_id 
      FROM service_orders so
      LEFT JOIN clients c ON so.client_id = c.id
      WHERE so.id = $1
    `;
    const checkParams = [orderId];

    if (role === 'FRANCHISE_ADMIN') {
      if (franchiseId !== null && franchiseId !== undefined) {
        checkQuery += ' AND c.franchise_id = $2';
        checkParams.push(franchiseId);
      } else {
        res.status(403).json({ message: 'Usuário não associado a uma franquia.' });
        return;
      }
    }

    const existingOrder = await db.query(checkQuery, checkParams);
    if (existingOrder.rows.length === 0) {
      res.status(404).json({ message: 'Ordem de serviço não encontrada ou sem permissão.' });
      return;
    }

    const order = existingOrder.rows[0];

    // Verificar se o caixa da sessão está aberto
    if (order.session_id) {
      const sessionResult = await db.query(
        'SELECT status FROM cashier_sessions WHERE id = $1',
        [order.session_id]
      );
      
      if (sessionResult.rows.length > 0 && sessionResult.rows[0].status === 'closed') {
        res.status(403).json({ 
          message: 'Não é possível alterar o status da ordem. O caixa da sessão está fechado.' 
        });
        return;
      }
    }

    // Atualizar status
    await db.query(
      'UPDATE service_orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [status, orderId]
    );

    // Buscar ordem atualizada
    const updatedOrder = await getOrderById({ ...req, params: { id: orderId.toString() } } as any, res);
    return;
  } catch (error) {
    console.error('Erro ao atualizar status da ordem de serviço:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao atualizar status da ordem de serviço.' });
    return;
  }
};

// Deletar ordem de serviço
export const deleteOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { role, franchiseId } = req.user!;
  const orderId = parseInt(req.params.id);

  try {
    // Verificar se a ordem existe e tem permissão para deletá-la
    let checkQuery = `
      SELECT so.id, c.franchise_id 
      FROM service_orders so
      LEFT JOIN clients c ON so.client_id = c.id
      WHERE so.id = $1
    `;
    const checkParams = [orderId];

    if (role === 'FRANCHISE_ADMIN') {
      if (franchiseId !== null && franchiseId !== undefined) {
        checkQuery += ' AND c.franchise_id = $2';
        checkParams.push(franchiseId);
      } else {
        res.status(403).json({ message: 'Usuário não associado a uma franquia.' });
        return;
      }
    }

    const existingOrder = await db.query(checkQuery, checkParams);
    if (existingOrder.rows.length === 0) {
      res.status(404).json({ message: 'Ordem de serviço não encontrada ou sem permissão.' });
      return;
    }

    // Deletar ordem (os itens serão deletados automaticamente devido à CASCADE)
    await db.query('DELETE FROM service_orders WHERE id = $1', [orderId]);

    res.status(200).json({ message: 'Ordem de serviço deletada com sucesso.' });
    return;
  } catch (error) {
    console.error('Erro ao deletar ordem de serviço:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao deletar ordem de serviço.' });
    return;
  }
};

// Finalizar ordem (apenas no caixa)
export const finalizeOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      paymentMethod,
      cardInstallments,
      cardInterest,
      totalPaid,
      productDelivered,
      status,
      cancellationReason,
      observations
    } = req.body;

    // Verificar se a ordem existe e está pendente
    const orderResult = await db.query(
      'SELECT * FROM service_orders WHERE id = $1',
      [id]
    );

    if (!orderResult.rows || orderResult.rows.length === 0) {
      res.status(404).json({ message: 'Ordem não encontrada' });
      return;
    }

    const orderData = orderResult.rows[0];
    
    // Validar regras de negócio para mudança de status
    if (orderData.status === 'pending') {
      // Pendente só pode ir para Em Andamento ou Cancelada
      if (status === 'completed') {
        res.status(400).json({ message: 'Ordem pendente deve primeiro ir para Em Andamento' });
        return;
      }
    } else if (orderData.status === 'in_progress') {
      // Em Andamento só pode ir para Concluída
      if (status === 'cancelled' || status === 'pending') {
        res.status(400).json({ message: 'Ordem em andamento só pode ser concluída' });
        return;
      }
    } else if (orderData.status === 'completed' || orderData.status === 'cancelled') {
      // Concluída e Cancelada não podem mudar
      res.status(400).json({ message: 'Ordem finalizada não pode ter status alterado' });
      return;
    }

    // Verificar se há caixa aberto
    const sessionResult = await db.query(
      'SELECT * FROM cashier_sessions WHERE id = $1 AND status = $2',
      [orderData.session_id, 'open']
    );

    if (!sessionResult.rows || sessionResult.rows.length === 0) {
      res.status(400).json({ message: 'Caixa deve estar aberto para finalizar ordem' });
      return;
    }

    // Atualizar a ordem com os dados de finalização
    const updateFields: string[] = [];
    const updateParams: any[] = [];
    let paramIndex = 1;

    updateFields.push(`status = $${paramIndex++}`);
    updateParams.push(status);
    
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

    // Adicionar dados de pagamento se não for cancelada
    if (status !== 'cancelled') {
      updateFields.push(`payment_method = $${paramIndex++}`);
      updateParams.push(paymentMethod);
      
      updateFields.push(`total_paid = $${paramIndex++}`);
      updateParams.push(totalPaid);
      
      updateFields.push(`product_delivered = $${paramIndex++}`);
      updateParams.push(productDelivered);
      
      if (paymentMethod === 'card') {
        updateFields.push(`card_installments = $${paramIndex++}`);
        updateParams.push(cardInstallments);
        
        updateFields.push(`card_interest = $${paramIndex++}`);
        updateParams.push(cardInterest);
      }
    } else {
      updateFields.push(`cancellation_reason = $${paramIndex++}`);
      updateParams.push(cancellationReason);
    }

    if (observations) {
      updateFields.push(`notes = $${paramIndex++}`);
      updateParams.push(observations);
    }

    updateParams.push(id);
    const updateQuery = `UPDATE service_orders SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`;

    // Atualizar a ordem
    await db.query(updateQuery, updateParams);

    // Atualizar totais da sessão de caixa se não for cancelada
    if (status !== 'cancelled') {
      const paymentAmount = Number(totalPaid);
      
      let cashSales = 0;
      let cardSales = 0;
      let pixSales = 0;

      switch (paymentMethod) {
        case 'cash':
          cashSales = paymentAmount;
          break;
        case 'card':
          cardSales = paymentAmount;
          break;
        case 'pix':
          pixSales = paymentAmount;
          break;
      }

      await db.query(
        `UPDATE cashier_sessions 
         SET cash_sales = cash_sales + $1, 
             card_sales = card_sales + $2, 
             pix_sales = pix_sales + $3, 
             total_sales = total_sales + $4,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $5`,
        [cashSales, cardSales, pixSales, paymentAmount, orderData.session_id]
      );
    }

    res.json({ message: 'Ordem finalizada com sucesso' });
  } catch (error) {
    console.error('Erro ao finalizar ordem:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
}

// Buscar estatísticas de vendas
export const getOrderStats = async (req: Request, res: Response) => {
  try {
    const franchiseId = (req.user as any).franchiseId;

    const result = await db.query(
      `SELECT 
        COUNT(*) as total_orders,
        SUM(total_amount) as total_amount,
        AVG(total_amount) as average_amount,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
        SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END) as completed_amount,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        SUM(CASE WHEN status = 'pending' THEN total_amount ELSE 0 END) as pending_amount,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
        SUM(CASE WHEN status = 'cancelled' THEN total_amount ELSE 0 END) as cancelled_amount
      FROM service_orders 
      WHERE franchise_id = $1`,
      [franchiseId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar estatísticas de vendas:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
}; 