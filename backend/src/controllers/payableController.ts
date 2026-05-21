import { Request, Response } from 'express';
import db from '../config/db';

interface Payable {
  id: number;
  franchise_id: number;
  description: string;
  amount: number;
  due_date: Date;
  status: 'pending' | 'paid' | 'overdue';
  supplier: string;
  category: string;
  invoice_number?: string;
  payment_method: 'bank_transfer' | 'credit_card' | 'cash' | 'pix';
  bank_account_id?: number;
  credit_card_id?: number;
  paid_at?: Date;
  created_at: Date;
  updated_at: Date;
}

interface CreatePayableData {
  description: string;
  amount: number;
  due_date: string;
  supplier: string;
  category: string;
  invoice_number?: string;
  payment_method?: 'bank_transfer' | 'credit_card' | 'cash' | 'pix';
  bank_account_id?: number;
  credit_card_id?: number;
}

interface UpdatePayableData {
  description?: string;
  amount?: number;
  due_date?: string;
  status?: 'pending' | 'paid' | 'overdue';
  supplier?: string;
  category?: string;
  invoice_number?: string;
  payment_method?: 'bank_transfer' | 'credit_card' | 'cash' | 'pix';
  bank_account_id?: number;
  credit_card_id?: number;
}

class PayableController {
  // Buscar todas as contas a pagar
  async getPayables(req: Request, res: Response) {
    try {
      const franchiseId = (req.user as any).franchiseId;
      const { status, category } = req.query;

      let query = 'SELECT * FROM payables WHERE franchise_id = $1';
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
      console.error('Erro ao buscar contas a pagar:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // Buscar conta a pagar por ID
  async getPayableById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const franchiseId = (req.user as any).franchiseId;

      const result = await db.query(
        'SELECT * FROM payables WHERE id = $1 AND franchise_id = $2',
        [id, franchiseId]
      );

      if (!result.rows.length) {
        return res.status(404).json({ message: 'Conta a pagar não encontrada' });
      }

      return res.json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao buscar conta a pagar:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // Criar nova conta a pagar
  async createPayable(req: Request, res: Response) {
    try {
      const franchiseId = (req.user as any).franchiseId;
      const data: CreatePayableData = req.body;

      // Validações
      if (!data.description || !data.amount || !data.due_date || !data.supplier || !data.category) {
        return res.status(400).json({ message: 'Todos os campos obrigatórios devem ser preenchidos' });
      }

      if (data.amount <= 0) {
        return res.status(400).json({ message: 'Valor deve ser maior que zero' });
      }

      const result = await db.query(
        `INSERT INTO payables 
         (franchise_id, description, amount, due_date, supplier, category, invoice_number, payment_method, bank_account_id, credit_card_id) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [
          franchiseId,
          data.description,
          data.amount,
          data.due_date,
          data.supplier,
          data.category,
          data.invoice_number || null,
          data.payment_method || 'bank_transfer',
          data.bank_account_id || null,
          data.credit_card_id || null
        ]
      );

      return res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao criar conta a pagar:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // Atualizar conta a pagar
  async updatePayable(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const franchiseId = (req.user as any).franchiseId;
      const data: UpdatePayableData = req.body;

      // Verificar se a conta a pagar existe e pertence à franquia
      const checkResult = await db.query(
        'SELECT * FROM payables WHERE id = $1 AND franchise_id = $2',
        [id, franchiseId]
      );

      if (!checkResult.rows.length) {
        return res.status(404).json({ message: 'Conta a pagar não encontrada' });
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
      if (data.supplier !== undefined) {
        updateFields.push(`supplier = $${paramIndex++}`);
        updateValues.push(data.supplier);
      }
      if (data.category !== undefined) {
        updateFields.push(`category = $${paramIndex++}`);
        updateValues.push(data.category);
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
        `UPDATE payables SET ${updateFields.join(', ')} WHERE id = $${paramIndex++} AND franchise_id = $${paramIndex} RETURNING *`,
        updateValues
      );

      // Buscar a conta a pagar atualizada
      const result = await db.query(
        'SELECT * FROM payables WHERE id = $1',
        [id]
      );

      return res.json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao atualizar conta a pagar:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // Deletar conta a pagar
  async deletePayable(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const franchiseId = (req.user as any).franchiseId;

      // Verificar se a conta a pagar existe e pertence à franquia
      const result = await db.query(
        'SELECT * FROM payables WHERE id = $1 AND franchise_id = $2',
        [id, franchiseId]
      );

      if (!result.rows.length) {
        return res.status(404).json({ message: 'Conta a pagar não encontrada' });
      }

      await db.query(
        'DELETE FROM payables WHERE id = $1 AND franchise_id = $2',
        [id, franchiseId]
      );

      return res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar conta a pagar:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // Marcar como pago
  async markAsPaid(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const franchiseId = (req.user as any).franchiseId;
      const { payment_date, payment_method, bank_account_id, credit_card_id } = req.body;

      // Verificar se a conta a pagar existe e pertence à franquia
      const checkResult = await db.query(
        'SELECT * FROM payables WHERE id = $1 AND franchise_id = $2',
        [id, franchiseId]
      );

      if (!checkResult.rows.length) {
        return res.status(404).json({ message: 'Conta a pagar não encontrada' });
      }

      const payable = checkResult.rows[0];

      if (payable.status === 'paid') {
        return res.status(400).json({ message: 'Conta a pagar já está paga' });
      }

      // Atualizar status para pago
      await db.query(
        `UPDATE payables 
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

      // Buscar a conta a pagar atualizada
      const result = await db.query(
        'SELECT * FROM payables WHERE id = $1',
        [id]
      );

      return res.json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao marcar como pago:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // Buscar estatísticas
  async getPayableStats(req: Request, res: Response) {
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
          SUM(CASE WHEN status = 'overdue' THEN amount ELSE 0 END) as overdue_amount
        FROM payables 
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

export default new PayableController(); 