import { Request, Response } from 'express';
import db from '../config/db';

interface Receivable {
  id: number;
  franchise_id: number;
  description: string;
  amount: number;
  due_date: Date;
  status: 'pending' | 'paid' | 'overdue';
  category: string;
  client_name: string;
  invoice_number?: string;
  payment_method: 'bank_transfer' | 'credit_card' | 'cash' | 'pix';
  bank_account_id?: number;
  credit_card_id?: number;
  paid_at?: Date;
  created_at: Date;
  updated_at: Date;
}

interface CreateReceivableData {
  description: string;
  amount: number;
  due_date: string;
  category: string;
  client_name: string;
  invoice_number?: string;
  payment_method?: 'bank_transfer' | 'credit_card' | 'cash' | 'pix';
  bank_account_id?: number;
  credit_card_id?: number;
}

interface UpdateReceivableData {
  description?: string;
  amount?: number;
  due_date?: string;
  status?: 'pending' | 'paid' | 'overdue';
  category?: string;
  client_name?: string;
  invoice_number?: string;
  payment_method?: 'bank_transfer' | 'credit_card' | 'cash' | 'pix';
  bank_account_id?: number;
  credit_card_id?: number;
}

class ReceivableController {
  // Buscar todas as contas a receber
  async getReceivables(req: Request, res: Response) {
    try {
      const franchiseId = (req.user as any).franchiseId;
      const { status, category } = req.query;

      let query = 'SELECT * FROM receivables WHERE franchise_id = $1';
      const params: any[] = [franchiseId];

      if (status && status !== 'all') {
        query += ' AND status = $2';
        params.push(status as string);
      }

      if (category && category !== 'all') {
        const paramIndex = params.length + 1;
        query += ` AND category = $${paramIndex}`;
        params.push(category as string);
      }

      query += ' ORDER BY due_date ASC';

      const result = await db.query(query, params);

      return res.json(result.rows);
    } catch (error) {
      console.error('Erro ao buscar contas a receber:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // Buscar conta a receber por ID
  async getReceivableById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const franchiseId = (req.user as any).franchiseId;

      const result = await db.query(
        'SELECT * FROM receivables WHERE id = $1 AND franchise_id = $2',
        [id, franchiseId]
      );

      if (!result.rows.length) {
        return res.status(404).json({ message: 'Conta a receber não encontrada' });
      }

      return res.json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao buscar conta a receber:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // Criar nova conta a receber
  async createReceivable(req: Request, res: Response) {
    try {
      const franchiseId = (req.user as any).franchiseId;
      const data: CreateReceivableData = req.body;

      // Validações
      if (!data.description || !data.amount || !data.due_date || !data.client_name || !data.category) {
        return res.status(400).json({ message: 'Todos os campos obrigatórios devem ser preenchidos' });
      }

      if (data.amount <= 0) {
        return res.status(400).json({ message: 'Valor deve ser maior que zero' });
      }

      const result = await db.query(
        `INSERT INTO receivables 
         (franchise_id, description, amount, due_date, category, client_name, invoice_number, payment_method, bank_account_id, credit_card_id) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [
          franchiseId,
          data.description,
          data.amount,
          data.due_date,
          data.category,
          data.client_name,
          data.invoice_number || null,
          data.payment_method || 'bank_transfer',
          data.bank_account_id || null,
          data.credit_card_id || null
        ]
      );

      return res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao criar conta a receber:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // Atualizar conta a receber
  async updateReceivable(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const franchiseId = (req.user as any).franchiseId;
      const data: UpdateReceivableData = req.body;

      // Verificar se a conta a receber existe e pertence à franquia
      const checkResult = await db.query(
        'SELECT * FROM receivables WHERE id = $1 AND franchise_id = $2',
        [id, franchiseId]
      );

      if (!checkResult.rows.length) {
        return res.status(404).json({ message: 'Conta a receber não encontrada' });
      }

      // Construir query de atualização dinamicamente
      const updateFields = [];
      const updateValues = [];
      let paramIndex = 1;

      if (data.description !== undefined) {
        updateFields.push(`description = $${paramIndex++}`);
        updateValues.push(data.description);
      }
      if (data.amount !== undefined) {
        if (data.amount <= 0) {
          return res.status(400).json({ message: 'Valor deve ser maior que zero' });
        }
        updateFields.push(`amount = $${paramIndex++}`);
        updateValues.push(data.amount);
      }
      if (data.due_date !== undefined) {
        updateFields.push(`due_date = $${paramIndex++}`);
        updateValues.push(data.due_date);
      }
      if (data.status !== undefined) {
        updateFields.push(`status = $${paramIndex++}`);
        updateValues.push(data.status);
      }
      if (data.category !== undefined) {
        updateFields.push(`category = $${paramIndex++}`);
        updateValues.push(data.category);
      }
      if (data.client_name !== undefined) {
        updateFields.push(`client_name = $${paramIndex++}`);
        updateValues.push(data.client_name);
      }
      if (data.invoice_number !== undefined) {
        updateFields.push(`invoice_number = $${paramIndex++}`);
        updateValues.push(data.invoice_number);
      }
      if (data.payment_method !== undefined) {
        updateFields.push(`payment_method = $${paramIndex++}`);
        updateValues.push(data.payment_method);
      }
      if (data.bank_account_id !== undefined) {
        updateFields.push(`bank_account_id = $${paramIndex++}`);
        updateValues.push(data.bank_account_id);
      }
      if (data.credit_card_id !== undefined) {
        updateFields.push(`credit_card_id = $${paramIndex++}`);
        updateValues.push(data.credit_card_id);
      }

      if (updateFields.length === 0) {
        return res.status(400).json({ message: 'Nenhum campo para atualizar' });
      }

      updateValues.push(id, franchiseId);

      await db.query(
        `UPDATE receivables SET ${updateFields.join(', ')} WHERE id = $${paramIndex++} AND franchise_id = $${paramIndex} RETURNING *`,
        updateValues
      );

      // Buscar a conta a receber atualizada
      const result = await db.query(
        'SELECT * FROM receivables WHERE id = $1',
        [id]
      );

      return res.json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao atualizar conta a receber:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // Deletar conta a receber
  async deleteReceivable(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const franchiseId = (req.user as any).franchiseId;

      // Verificar se a conta a receber existe e pertence à franquia
      const result = await db.query(
        'SELECT * FROM receivables WHERE id = $1 AND franchise_id = $2',
        [id, franchiseId]
      );

      if (!result.rows.length) {
        return res.status(404).json({ message: 'Conta a receber não encontrada' });
      }

      await db.query(
        'DELETE FROM receivables WHERE id = $1 AND franchise_id = $2',
        [id, franchiseId]
      );

      return res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar conta a receber:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // Marcar como pago
  async markAsPaid(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const franchiseId = (req.user as any).franchiseId;
      const { payment_date, payment_method, bank_account_id, credit_card_id } = req.body;

      // Verificar se a conta a receber existe e pertence à franquia
      const checkResult = await db.query(
        'SELECT * FROM receivables WHERE id = $1 AND franchise_id = $2',
        [id, franchiseId]
      );

      if (!checkResult.rows.length) {
        return res.status(404).json({ message: 'Conta a receber não encontrada' });
      }

      const receivable = checkResult.rows[0];

      if (receivable.status === 'paid') {
        return res.status(400).json({ message: 'Conta a receber já está paga' });
      }

      // Atualizar status para pago
      await db.query(
        `UPDATE receivables 
         SET status = 'paid', 
             payment_date = $1, 
             payment_method = $2,
             bank_account_id = $3,
             credit_card_id = $4
         WHERE id = $5 AND franchise_id = $6`,
        [
          payment_date || new Date(),
          payment_method || 'bank_transfer',
          bank_account_id || null,
          credit_card_id || null,
          id,
          franchiseId
        ]
      );

      // Buscar a conta a receber atualizada
      const result = await db.query(
        'SELECT * FROM receivables WHERE id = $1',
        [id]
      );

      return res.json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao marcar como pago:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // Buscar clientes para o formulário
  async getClients(req: Request, res: Response) {
    try {
      const franchiseId = (req.user as any).franchiseId;

      const result = await db.query(
        'SELECT id, name, cpf FROM clients WHERE franchise_id = $1 ORDER BY name ASC',
        [franchiseId]
      );

      return res.json(result.rows);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // Buscar parcelas pendentes de um cliente
  async getClientInstallments(req: Request, res: Response) {
    try {
      const { clientId } = req.params;
      const franchiseId = (req.user as any).franchiseId;

      const result = await db.query(
        `SELECT r.*, so.order_number, so.total_amount as order_total
         FROM receivables r
         LEFT JOIN service_orders so ON r.invoice_number = so.order_number
         WHERE r.franchise_id = $1 
         AND r.client_name = (SELECT name FROM clients WHERE id = $2 AND franchise_id = $1)
         AND r.status = 'pending'
         AND r.description LIKE '%Parcela%'
         ORDER BY r.due_date ASC`,
        [franchiseId, clientId]
      );

      return res.json(result.rows);
    } catch (error) {
      console.error('Erro ao buscar parcelas do cliente:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // Buscar estatísticas detalhadas
  async getReceivableStats(req: Request, res: Response) {
    try {
      const franchiseId = (req.user as any).franchiseId;

      const result = await db.query(
        `SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
          COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid,
          COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue,
          SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_amount,
          SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as paid_amount,
          SUM(CASE WHEN status = 'overdue' THEN amount ELSE 0 END) as overdue_amount,
          COUNT(CASE WHEN description LIKE '%Parcela%' THEN 1 END) as installments_count,
          SUM(CASE WHEN description LIKE '%Parcela%' AND status = 'pending' THEN amount ELSE 0 END) as installments_pending_amount
        FROM receivables 
        WHERE franchise_id = $1`,
        [franchiseId]
      );

      return res.json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
}

export default new ReceivableController(); 