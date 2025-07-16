import { Request, Response } from 'express';
import db from '../config/db';

interface BankAccount {
  id: number;
  franchise_id: number;
  bank_name: string;
  account_type: 'checking' | 'savings' | 'business';
  account_number: string;
  agency: string;
  balance: number;
  pix_key?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface CreateBankAccountData {
  bank_name: string;
  account_type: 'checking' | 'savings' | 'business';
  account_number: string;
  agency: string;
  balance: number;
  pix_key?: string;
}

interface UpdateBankAccountData {
  bank_name?: string;
  account_type?: 'checking' | 'savings' | 'business';
  account_number?: string;
  agency?: string;
  balance?: number;
  pix_key?: string;
  is_active?: boolean;
}

class BankAccountController {
  // Buscar todas as contas bancárias
  async getBankAccounts(req: Request, res: Response) {
    try {
      const franchiseId = (req.user as any).franchiseId;

      const result = await db.query(
        'SELECT * FROM bank_accounts WHERE franchise_id = $1 ORDER BY bank_name ASC',
        [franchiseId]
      );

      return res.json(result.rows);
    } catch (error) {
      console.error('Erro ao buscar contas bancárias:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // Buscar conta bancária por ID
  async getBankAccountById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const franchiseId = (req.user as any).franchiseId;

      const result = await db.query(
        'SELECT * FROM bank_accounts WHERE id = $1 AND franchise_id = $2',
        [id, franchiseId]
      );

      if (!result.rows.length) {
        return res.status(404).json({ message: 'Conta bancária não encontrada' });
      }

      return res.json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao buscar conta bancária:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // Criar nova conta bancária
  async createBankAccount(req: Request, res: Response) {
    try {
      const franchiseId = (req.user as any).franchiseId;
      const data: CreateBankAccountData = req.body;

      // Validações
      if (!data.bank_name || !data.account_type || !data.account_number || !data.agency) {
        return res.status(400).json({ message: 'Todos os campos obrigatórios devem ser preenchidos' });
      }

      if (data.balance < 0) {
        return res.status(400).json({ message: 'Saldo não pode ser negativo' });
      }

      const result = await db.query(
        `INSERT INTO bank_accounts 
         (franchise_id, bank_name, account_type, account_number, agency, balance, pix_key) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          franchiseId,
          data.bank_name,
          data.account_type,
          data.account_number,
          data.agency,
          data.balance || 0,
          data.pix_key || null
        ]
      );

      return res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao criar conta bancária:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // Atualizar conta bancária
  async updateBankAccount(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const franchiseId = (req.user as any).franchiseId;
      const data: UpdateBankAccountData = req.body;

      // Verificar se a conta bancária existe e pertence à franquia
      const checkResult = await db.query(
        'SELECT * FROM bank_accounts WHERE id = $1 AND franchise_id = $2',
        [id, franchiseId]
      );

      if (!checkResult.rows.length) {
        return res.status(404).json({ message: 'Conta bancária não encontrada' });
      }

      // Construir query de atualização dinamicamente
      const updateFields = [];
      const updateValues = [];
      let paramIndex = 1;

      if (data.bank_name !== undefined) {
        updateFields.push(`bank_name = $${paramIndex++}`);
        updateValues.push(data.bank_name);
      }
      if (data.account_type !== undefined) {
        updateFields.push(`account_type = $${paramIndex++}`);
        updateValues.push(data.account_type);
      }
      if (data.account_number !== undefined) {
        updateFields.push(`account_number = $${paramIndex++}`);
        updateValues.push(data.account_number);
      }
      if (data.agency !== undefined) {
        updateFields.push(`agency = $${paramIndex++}`);
        updateValues.push(data.agency);
      }
      if (data.balance !== undefined) {
        if (data.balance < 0) {
          return res.status(400).json({ message: 'Saldo não pode ser negativo' });
        }
        updateFields.push(`balance = $${paramIndex++}`);
        updateValues.push(data.balance);
      }
      if (data.pix_key !== undefined) {
        updateFields.push(`pix_key = $${paramIndex++}`);
        updateValues.push(data.pix_key);
      }
      if (data.is_active !== undefined) {
        updateFields.push(`is_active = $${paramIndex++}`);
        updateValues.push(data.is_active);
      }

      if (updateFields.length === 0) {
        return res.status(400).json({ message: 'Nenhum campo para atualizar' });
      }

      updateValues.push(id, franchiseId);

      await db.query(
        `UPDATE bank_accounts SET ${updateFields.join(', ')} WHERE id = $${paramIndex++} AND franchise_id = $${paramIndex} RETURNING *`,
        updateValues
      );

      // Buscar a conta bancária atualizada
      const result = await db.query(
        'SELECT * FROM bank_accounts WHERE id = $1',
        [id]
      );

      return res.json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao atualizar conta bancária:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // Deletar conta bancária
  async deleteBankAccount(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const franchiseId = (req.user as any).franchiseId;

      // Verificar se a conta bancária existe e pertence à franquia
      const result = await db.query(
        'SELECT * FROM bank_accounts WHERE id = $1 AND franchise_id = $2',
        [id, franchiseId]
      );

      if (!result.rows.length) {
        return res.status(404).json({ message: 'Conta bancária não encontrada' });
      }

      await db.query(
        'DELETE FROM bank_accounts WHERE id = $1 AND franchise_id = $2',
        [id, franchiseId]
      );

      return res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar conta bancária:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // Atualizar saldo
  async updateBalance(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const franchiseId = (req.user as any).franchiseId;
      const { balance } = req.body;

      if (balance < 0) {
        return res.status(400).json({ message: 'Saldo não pode ser negativo' });
      }

      // Verificar se a conta bancária existe e pertence à franquia
      const checkResult = await db.query(
        'SELECT * FROM bank_accounts WHERE id = $1 AND franchise_id = $2',
        [id, franchiseId]
      );

      if (!checkResult.rows.length) {
        return res.status(404).json({ message: 'Conta bancária não encontrada' });
      }

      await db.query(
        'UPDATE bank_accounts SET balance = $1 WHERE id = $2 AND franchise_id = $3 RETURNING *',
        [balance, id, franchiseId]
      );

      // Buscar a conta bancária atualizada
      const result = await db.query(
        'SELECT * FROM bank_accounts WHERE id = $1',
        [id]
      );

      return res.json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao atualizar saldo:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // Buscar estatísticas
  async getBankAccountStats(req: Request, res: Response) {
    try {
      const franchiseId = (req.user as any).franchiseId;

      const result = await db.query(
        `SELECT 
          COUNT(*) as total_accounts,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active_accounts,
          SUM(balance) as total_balance,
          AVG(balance) as average_balance
        FROM bank_accounts 
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

export default new BankAccountController(); 