import { Request, Response } from 'express';
import db from '../config/db';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: 'SUPER_ADMIN' | 'FRANCHISE_ADMIN' | 'EMPLOYEE';
    franchiseId: number | null;
  };
}

// Buscar sessão de caixa aberta para a franquia do usuário
export const getOpenCashierSession = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { franchiseId } = req.user!;
  if (!franchiseId) {
    res.status(400).json({ message: 'Usuário não está associado a uma franquia.' });
    return;
  }
  try {
    const result = await db.query(
      `SELECT cs.*, e.name as employee_name 
       FROM cashier_sessions cs 
       LEFT JOIN employees e ON cs.employee_id = e.id 
       WHERE cs.franchise_id = $1 AND cs.status = 'open' 
       ORDER BY cs.open_time DESC LIMIT 1`,
      [franchiseId]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Nenhum caixa aberto encontrado para esta franquia.' });
      return;
    }
    res.status(200).json({ session: result.rows[0] });
    return;
  } catch (error) {
    console.error('Erro ao buscar sessão de caixa aberta:', error);
    res.status(500).json({ message: 'Erro ao buscar sessão de caixa aberta.' });
    return;
  }
};

// Abrir sessão de caixa
export const openCashierSession = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { franchiseId } = req.user!;
  const { employee_id, initial_amount, notes } = req.body;

  if (!franchiseId) {
    res.status(400).json({ message: 'Usuário não está associado a uma franquia.' });
    return;
  }

  try {
    // Verificar se já existe uma sessão aberta
    const existingSession = await findOpenCashierSession(franchiseId);
    if (existingSession) {
      res.status(400).json({ message: 'Já existe uma sessão de caixa aberta para esta franquia.' });
      return;
    }

    // Gerar código da sessão
    const sessionCode = `CS-${Date.now().toString().slice(-6)}`;

    // Inserir nova sessão
    const result = await db.query(
      `INSERT INTO cashier_sessions 
       (session_code, employee_id, franchise_id, open_time, initial_amount, notes, status, created_at, updated_at) 
       VALUES ($1, $2, $3, NOW(), $4, $5, 'open', NOW(), NOW()) 
       RETURNING *`,
      [sessionCode, employee_id, franchiseId, initial_amount, notes || null]
    );

    // Buscar dados do funcionário
    const employeeResult = await db.query(
      'SELECT name FROM employees WHERE id = $1',
      [employee_id]
    );

    const session = result.rows[0];
    session.employee_name = employeeResult.rows[0]?.name || 'Funcionário';

    res.status(201).json(session);
  } catch (error) {
    console.error('Erro ao abrir sessão de caixa:', error);
    res.status(500).json({ message: 'Erro ao abrir sessão de caixa.' });
  }
};

// Fechar sessão de caixa
export const closeCashierSession = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { franchiseId } = req.user!;
  const { cash_amount, card_amount, pix_amount, notes } = req.body;

  if (!franchiseId) {
    res.status(400).json({ message: 'Usuário não está associado a uma franquia.' });
    return;
  }

  try {
    // Buscar sessão aberta
    const session = await findOpenCashierSession(franchiseId);
    if (!session) {
      res.status(400).json({ message: 'Não há sessão de caixa aberta para fechar.' });
      return;
    }

    const totalCounted = cash_amount + card_amount + pix_amount;
    const expectedTotal = session.initial_amount + session.total_sales;
    const difference = totalCounted - expectedTotal;

    // Atualizar sessão
    const result = await db.query(
      `UPDATE cashier_sessions 
       SET close_time = NOW(), 
           final_amount = $1, 
           difference = $2, 
           status = 'closed', 
           notes = $3, 
           updated_at = NOW() 
       WHERE id = $4 
       RETURNING *`,
      [totalCounted, difference, notes || null, session.id]
    );

    // Buscar ordens parceladas da sessão para criar contas a receber
    const parceledOrders = await db.query(
      `SELECT so.*, c.name as client_name, c.id as client_id
       FROM service_orders so
       LEFT JOIN clients c ON so.client_id = c.id
       WHERE so.session_id = $1 AND so.payment_method = 'installments' AND so.status = 'completed'`,
      [session.id]
    );

    // Criar contas a receber para ordens parceladas
    for (const order of parceledOrders.rows) {
      const installmentAmount = order.total_amount / order.installments;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30); // Primeira parcela vence em 30 dias

      for (let i = 1; i <= order.installments; i++) {
        await db.query(
          `INSERT INTO receivables 
           (franchise_id, description, amount, due_date, category, client_name, invoice_number, notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            franchiseId,
            `Parcela ${i}/${order.installments} - ${order.order_number}`,
            installmentAmount,
            dueDate.toISOString().split('T')[0],
            'Vendas Parceladas',
            order.client_name,
            order.order_number,
            `Parcela ${i} de ${order.installments} da ordem ${order.order_number}`
          ]
        );

        // Próxima parcela vence em 30 dias
        dueDate.setDate(dueDate.getDate() + 30);
      }
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao fechar sessão de caixa:', error);
    res.status(500).json({ message: 'Erro ao fechar sessão de caixa.' });
  }
};

// Buscar histórico de sessões
export const getCashierHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { franchiseId } = req.user!;

  if (!franchiseId) {
    res.status(400).json({ message: 'Usuário não está associado a uma franquia.' });
    return;
  }

  try {
    const result = await db.query(
      `SELECT cs.*, e.name as employee_name 
       FROM cashier_sessions cs 
       LEFT JOIN employees e ON cs.employee_id = e.id 
       WHERE cs.franchise_id = $1 
       ORDER BY cs.open_time DESC`,
      [franchiseId]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar histórico de caixa:', error);
    res.status(500).json({ message: 'Erro ao buscar histórico de caixa.' });
  }
};

// Registrar sangria
export const registerSangria = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { session_id, amount, description } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO cashier_sangrias 
       (session_id, amount, description, created_at) 
       VALUES ($1, $2, $3, NOW()) 
       RETURNING *`,
      [session_id, amount, description]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao registrar sangria:', error);
    res.status(500).json({ message: 'Erro ao registrar sangria.' });
  }
};

// Buscar sangrias de uma sessão
export const getSangrias = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { sessionId } = req.params;

  try {
    const result = await db.query(
      'SELECT * FROM cashier_sangrias WHERE session_id = $1 ORDER BY created_at DESC',
      [sessionId]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar sangrias:', error);
    res.status(500).json({ message: 'Erro ao buscar sangrias.' });
  }
};

// Buscar sangrias do caixa
export const getSangriasFromCashier = async (req: Request, res: Response) => {
  try {
    const franchiseId = (req.user as any).franchiseId;

    const result = await db.query(
      `SELECT 
        id,
        amount,
        reason,
        created_at,
        updated_at
      FROM cashier_sangrias 
      WHERE franchise_id = $1
      ORDER BY created_at DESC`,
      [franchiseId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar sangrias:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Função utilitária para uso em outros controllers
export const findOpenCashierSession = async (franchiseId: number) => {
  const result = await db.query(
    `SELECT * FROM cashier_sessions WHERE franchise_id = $1 AND status = 'open' ORDER BY open_time DESC LIMIT 1`,
    [franchiseId]
  );
  return result.rows[0] || null;
};

// Buscar todas as sangrias da franquia
export const getAllSangrias = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { franchiseId } = req.user!;
  if (!franchiseId) {
    res.status(400).json({ message: 'Usuário não está associado a uma franquia.' });
    return;
  }
  try {
    const result = await db.query(
      `SELECT * FROM cashier_sangrias WHERE franchise_id = $1 ORDER BY created_at DESC`,
      [franchiseId]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar todas as sangrias:', error);
    res.status(500).json({ message: 'Erro ao buscar todas as sangrias.' });
  }
}; 