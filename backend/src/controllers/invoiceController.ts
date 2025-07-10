import { Request, Response } from 'express';
import db from '../config/db';

interface Invoice {
  id: number;
  franchise_id: number;
  invoice_number: string;
  client_name: string;
  client_document?: string;
  amount: number;
  issue_date: Date;
  due_date: Date;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  payment_method?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

interface CreateInvoiceData {
  invoice_number: string;
  client_name: string;
  client_document?: string;
  amount: number;
  issue_date: string;
  due_date: string;
  payment_method?: string;
  notes?: string;
}

interface UpdateInvoiceData {
  invoice_number?: string;
  client_name?: string;
  client_document?: string;
  amount?: number;
  issue_date?: string;
  due_date?: string;
  status?: 'pending' | 'paid' | 'overdue' | 'cancelled';
  payment_method?: string;
  notes?: string;
}

class InvoiceController {
  // Buscar todas as notas fiscais
  async getInvoices(req: Request, res: Response) {
    try {
      const franchiseId = (req.user as any).franchiseId;
      const { status, client_name } = req.query;

      let query = 'SELECT * FROM invoices WHERE franchise_id = $1';
      const params: any[] = [franchiseId];

      if (status && status !== 'all') {
        query += ' AND status = $2';
        params.push(status as string);
      }

      if (client_name) {
        const paramIndex = params.length + 1;
        query += ` AND client_name ILIKE $${paramIndex}`;
        params.push(`%${client_name}%`);
      }

      query += ' ORDER BY issue_date DESC';

      const result = await db.query(query, params);

      res.json(result.rows);
    } catch (error) {
      console.error('Erro ao buscar notas fiscais:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // Buscar nota fiscal por ID
  async getInvoiceById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const franchiseId = (req.user as any).franchiseId;

      const result = await db.query(
        'SELECT * FROM invoices WHERE id = $1 AND franchise_id = $2',
        [id, franchiseId]
      );

      if (!result.rows.length) {
        return res.status(404).json({ message: 'Nota fiscal não encontrada' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao buscar nota fiscal:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // Criar nova nota fiscal
  async createInvoice(req: Request, res: Response) {
    try {
      const franchiseId = (req.user as any).franchiseId;
      const data: CreateInvoiceData = req.body;

      // Validações
      if (!data.invoice_number || !data.client_name || !data.amount || !data.issue_date || !data.due_date) {
        return res.status(400).json({ message: 'Todos os campos obrigatórios devem ser preenchidos' });
      }

      if (data.amount <= 0) {
        return res.status(400).json({ message: 'Valor deve ser maior que zero' });
      }

      // Verificar se o número da nota fiscal já existe
      const existingResult = await db.query(
        'SELECT * FROM invoices WHERE invoice_number = $1 AND franchise_id = $2',
        [data.invoice_number, franchiseId]
      );

      if (existingResult.rows.length > 0) {
        return res.status(400).json({ message: 'Número da nota fiscal já existe' });
      }

      const result = await db.query(
        `INSERT INTO invoices 
         (franchise_id, invoice_number, client_name, client_document, amount, issue_date, due_date, payment_method, notes) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          franchiseId,
          data.invoice_number,
          data.client_name,
          data.client_document || null,
          data.amount,
          data.issue_date,
          data.due_date,
          data.payment_method || null,
          data.notes || null
        ]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao criar nota fiscal:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // Atualizar nota fiscal
  async updateInvoice(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const franchiseId = (req.user as any).franchiseId;
      const data: UpdateInvoiceData = req.body;

      // Verificar se a nota fiscal existe e pertence à franquia
      const checkResult = await db.query(
        'SELECT * FROM invoices WHERE id = $1 AND franchise_id = $2',
        [id, franchiseId]
      );

      if (!checkResult.rows.length) {
        return res.status(404).json({ message: 'Nota fiscal não encontrada' });
      }

      // Construir query de atualização dinamicamente
      const updateFields = [];
      const updateValues = [];
      let paramIndex = 1;

      if (data.invoice_number !== undefined) {
        // Verificar se o novo número já existe (exceto para esta nota fiscal)
        const existingResult = await db.query(
          'SELECT * FROM invoices WHERE invoice_number = $1 AND franchise_id = $2 AND id != $3',
          [data.invoice_number, franchiseId, id]
        );

        if (existingResult.rows.length > 0) {
          return res.status(400).json({ message: 'Número da nota fiscal já existe' });
        }

        updateFields.push(`invoice_number = $${paramIndex++}`);
        updateValues.push(data.invoice_number);
      }
      if (data.client_name !== undefined) {
        updateFields.push(`client_name = $${paramIndex++}`);
        updateValues.push(data.client_name);
      }
      if (data.client_document !== undefined) {
        updateFields.push(`client_document = $${paramIndex++}`);
        updateValues.push(data.client_document);
      }
      if (data.amount !== undefined) {
        if (data.amount <= 0) {
          return res.status(400).json({ message: 'Valor deve ser maior que zero' });
        }
        updateFields.push(`amount = $${paramIndex++}`);
        updateValues.push(data.amount);
      }
      if (data.issue_date !== undefined) {
        updateFields.push(`issue_date = $${paramIndex++}`);
        updateValues.push(data.issue_date);
      }
      if (data.due_date !== undefined) {
        updateFields.push(`due_date = $${paramIndex++}`);
        updateValues.push(data.due_date);
      }
      if (data.status !== undefined) {
        updateFields.push(`status = $${paramIndex++}`);
        updateValues.push(data.status);
      }
      if (data.payment_method !== undefined) {
        updateFields.push(`payment_method = $${paramIndex++}`);
        updateValues.push(data.payment_method);
      }
      if (data.notes !== undefined) {
        updateFields.push(`notes = $${paramIndex++}`);
        updateValues.push(data.notes);
      }

      if (updateFields.length === 0) {
        return res.status(400).json({ message: 'Nenhum campo para atualizar' });
      }

      updateValues.push(id, franchiseId);

      await db.query(
        `UPDATE invoices SET ${updateFields.join(', ')} WHERE id = $${paramIndex++} AND franchise_id = $${paramIndex} RETURNING *`,
        updateValues
      );

      // Buscar a nota fiscal atualizada
      const result = await db.query(
        'SELECT * FROM invoices WHERE id = $1',
        [id]
      );

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao atualizar nota fiscal:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // Deletar nota fiscal
  async deleteInvoice(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const franchiseId = (req.user as any).franchiseId;

      // Verificar se a nota fiscal existe e pertence à franquia
      const result = await db.query(
        'SELECT * FROM invoices WHERE id = $1 AND franchise_id = $2',
        [id, franchiseId]
      );

      if (!result.rows.length) {
        return res.status(404).json({ message: 'Nota fiscal não encontrada' });
      }

      await db.query(
        'DELETE FROM invoices WHERE id = $1 AND franchise_id = $2',
        [id, franchiseId]
      );

      res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar nota fiscal:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // Marcar como pago
  async markAsPaid(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const franchiseId = (req.user as any).franchiseId;
      const { payment_method } = req.body;

      // Verificar se a nota fiscal existe e pertence à franquia
      const checkResult = await db.query(
        'SELECT * FROM invoices WHERE id = $1 AND franchise_id = $2',
        [id, franchiseId]
      );

      if (!checkResult.rows.length) {
        return res.status(404).json({ message: 'Nota fiscal não encontrada' });
      }

      const invoice = checkResult.rows[0];

      if (invoice.status === 'paid') {
        return res.status(400).json({ message: 'Nota fiscal já está paga' });
      }

      // Atualizar status para pago
      await db.query(
        `UPDATE invoices 
         SET status = 'paid', 
             payment_method = $1
         WHERE id = $2 AND franchise_id = $3`,
        [
          payment_method || 'bank_transfer',
          id,
          franchiseId
        ]
      );

      // Buscar a nota fiscal atualizada
      const result = await db.query(
        'SELECT * FROM invoices WHERE id = $1',
        [id]
      );

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao marcar como pago:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // Baixar nota fiscal (PDF)
  async downloadInvoice(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const franchiseId = (req.user as any).franchiseId;

      // Verificar se a nota existe e pertence à franquia
      const existingResult = await db.query(
        'SELECT * FROM invoices WHERE id = $1 AND franchise_id = $2',
        [id, franchiseId]
      );

      if (!existingResult.rows.length) {
        return res.status(404).json({ message: 'Nota fiscal não encontrada' });
      }

      // Aqui você implementaria a geração do PDF
      // Por enquanto, retornamos um JSON com os dados da nota
      res.json({
        message: 'Download da nota fiscal',
        invoice: existingResult.rows[0]
      });
    } catch (error) {
      console.error('Erro ao baixar nota fiscal:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // Obter estatísticas
  async getInvoiceStats(req: Request, res: Response) {
    try {
      const franchiseId = (req.user as any).franchiseId;

      const result = await db.query(
        `SELECT 
          COUNT(*) as total_invoices,
          COUNT(CASE WHEN is_paid = true THEN 1 END) as paid_invoices,
          COUNT(CASE WHEN is_paid = false THEN 1 END) as pending_invoices,
          SUM(amount) as total_amount,
          SUM(CASE WHEN is_paid = true THEN amount ELSE 0 END) as paid_amount,
          SUM(CASE WHEN is_paid = false THEN amount ELSE 0 END) as pending_amount
         FROM invoices 
         WHERE franchise_id = $1`,
        [franchiseId]
      );

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
}

export default new InvoiceController(); 