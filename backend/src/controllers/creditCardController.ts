import { Request, Response } from 'express';
import db from '../config/db';

interface CreditCard {
  id: number;
  franchise_id: number;
  card_name: string;
  bank_name: string;
  last_four_digits: string;
  brand: 'visa' | 'mastercard' | 'elo' | 'amex' | 'hipercard';
  limit_amount: number;
  available_limit: number;
  due_date: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface CreateCreditCardData {
  card_name: string;
  bank_name: string;
  last_four_digits: string;
  brand: 'visa' | 'mastercard' | 'elo' | 'amex' | 'hipercard';
  limit_amount: number;
  due_date: number;
}

interface UpdateCreditCardData {
  card_name?: string;
  bank_name?: string;
  last_four_digits?: string;
  brand?: 'visa' | 'mastercard' | 'elo' | 'amex' | 'hipercard';
  limit_amount?: number;
  available_limit?: number;
  due_date?: number;
  is_active?: boolean;
}

class CreditCardController {
  // Buscar todos os cartões de crédito
  async getCreditCards(req: Request, res: Response) {
    try {
      const franchiseId = (req.user as any).franchiseId;

      const result = await db.query(
        'SELECT * FROM credit_cards WHERE franchise_id = $1 ORDER BY card_name ASC',
        [franchiseId]
      );

      res.json(result.rows);
    } catch (error) {
      console.error('Erro ao buscar cartões de crédito:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // Buscar cartão de crédito por ID
  async getCreditCardById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const franchiseId = (req.user as any).franchiseId;

      const result = await db.query(
        'SELECT * FROM credit_cards WHERE id = $1 AND franchise_id = $2',
        [id, franchiseId]
      );

      if (!result.rows.length) {
        return res.status(404).json({ message: 'Cartão de crédito não encontrado' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao buscar cartão de crédito:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // Criar novo cartão de crédito
  async createCreditCard(req: Request, res: Response) {
    try {
      const franchiseId = (req.user as any).franchiseId;
      const data: CreateCreditCardData = req.body;

      // Validações
      if (!data.card_name || !data.bank_name || !data.last_four_digits || !data.brand) {
        return res.status(400).json({ message: 'Todos os campos obrigatórios devem ser preenchidos' });
      }

      if (data.limit_amount <= 0) {
        return res.status(400).json({ message: 'Limite deve ser maior que zero' });
      }

      if (data.due_date < 1 || data.due_date > 31) {
        return res.status(400).json({ message: 'Data de vencimento deve estar entre 1 e 31' });
      }

      const result = await db.query(
        `INSERT INTO credit_cards 
         (franchise_id, card_name, bank_name, last_four_digits, brand, limit_amount, available_limit, due_date) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          franchiseId,
          data.card_name,
          data.bank_name,
          data.last_four_digits,
          data.brand,
          data.limit_amount,
          data.limit_amount, // available_limit inicial igual ao limit_amount
          data.due_date
        ]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao criar cartão de crédito:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // Atualizar cartão de crédito
  async updateCreditCard(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const franchiseId = (req.user as any).franchiseId;
      const data: UpdateCreditCardData = req.body;

      // Verificar se o cartão de crédito existe e pertence à franquia
      const checkResult = await db.query(
        'SELECT * FROM credit_cards WHERE id = $1 AND franchise_id = $2',
        [id, franchiseId]
      );

      if (!checkResult.rows.length) {
        return res.status(404).json({ message: 'Cartão de crédito não encontrado' });
      }

      // Construir query de atualização dinamicamente
      const updateFields = [];
      const updateValues = [];
      let paramIndex = 1;

      if (data.card_name !== undefined) {
        updateFields.push(`card_name = $${paramIndex++}`);
        updateValues.push(data.card_name);
      }
      if (data.bank_name !== undefined) {
        updateFields.push(`bank_name = $${paramIndex++}`);
        updateValues.push(data.bank_name);
      }
      if (data.last_four_digits !== undefined) {
        updateFields.push(`last_four_digits = $${paramIndex++}`);
        updateValues.push(data.last_four_digits);
      }
      if (data.brand !== undefined) {
        updateFields.push(`brand = $${paramIndex++}`);
        updateValues.push(data.brand);
      }
      if (data.limit_amount !== undefined) {
        if (data.limit_amount <= 0) {
          return res.status(400).json({ message: 'Limite deve ser maior que zero' });
        }
        updateFields.push(`limit_amount = $${paramIndex++}`);
        updateValues.push(data.limit_amount);
      }
      if (data.available_limit !== undefined) {
        if (data.available_limit < 0) {
          return res.status(400).json({ message: 'Limite disponível não pode ser negativo' });
        }
        updateFields.push(`available_limit = $${paramIndex++}`);
        updateValues.push(data.available_limit);
      }
      if (data.due_date !== undefined) {
        if (data.due_date < 1 || data.due_date > 31) {
          return res.status(400).json({ message: 'Data de vencimento deve estar entre 1 e 31' });
        }
        updateFields.push(`due_date = $${paramIndex++}`);
        updateValues.push(data.due_date);
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
        `UPDATE credit_cards SET ${updateFields.join(', ')} WHERE id = $${paramIndex++} AND franchise_id = $${paramIndex} RETURNING *`,
        updateValues
      );

      // Buscar o cartão de crédito atualizado
      const result = await db.query(
        'SELECT * FROM credit_cards WHERE id = $1',
        [id]
      );

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao atualizar cartão de crédito:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // Deletar cartão de crédito
  async deleteCreditCard(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const franchiseId = (req.user as any).franchiseId;

      // Verificar se o cartão de crédito existe e pertence à franquia
      const result = await db.query(
        'SELECT * FROM credit_cards WHERE id = $1 AND franchise_id = $2',
        [id, franchiseId]
      );

      if (!result.rows.length) {
        return res.status(404).json({ message: 'Cartão de crédito não encontrado' });
      }

      await db.query(
        'DELETE FROM credit_cards WHERE id = $1 AND franchise_id = $2',
        [id, franchiseId]
      );

      res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar cartão de crédito:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // Atualizar limite disponível
  async updateAvailableLimit(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const franchiseId = (req.user as any).franchiseId;
      const { available_limit } = req.body;

      if (available_limit < 0) {
        return res.status(400).json({ message: 'Limite disponível não pode ser negativo' });
      }

      // Verificar se o cartão de crédito existe e pertence à franquia
      const checkResult = await db.query(
        'SELECT * FROM credit_cards WHERE id = $1 AND franchise_id = $2',
        [id, franchiseId]
      );

      if (!checkResult.rows.length) {
        return res.status(404).json({ message: 'Cartão de crédito não encontrado' });
      }

      const card = checkResult.rows[0];

      if (available_limit > card.limit_amount) {
        return res.status(400).json({ message: 'Limite disponível não pode ser maior que o limite total' });
      }

      await db.query(
        'UPDATE credit_cards SET available_limit = $1 WHERE id = $2 AND franchise_id = $3 RETURNING *',
        [available_limit, id, franchiseId]
      );

      // Buscar o cartão de crédito atualizado
      const result = await db.query(
        'SELECT * FROM credit_cards WHERE id = $1',
        [id]
      );

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao atualizar limite disponível:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // Buscar estatísticas
  async getCreditCardStats(req: Request, res: Response) {
    try {
      const franchiseId = (req.user as any).franchiseId;

      const result = await db.query(
        `SELECT 
          COUNT(*) as total_cards,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active_cards,
          SUM(limit_amount) as total_limit,
          SUM(available_limit) as total_available_limit,
          AVG(limit_amount) as average_limit
        FROM credit_cards 
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

export default new CreditCardController(); 