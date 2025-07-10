import { Request, Response } from 'express';
import db from '../config/db';
import { Pool } from 'pg';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: 'SUPER_ADMIN' | 'FRANCHISE_ADMIN' | 'EMPLOYEE';
    franchiseId: number | null;
  };
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Listar todas as franquias (apenas SUPER_ADMIN)
export const getAllFranchises = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const result = await db.query(`
      SELECT f.*, 
             COUNT(u.id) as user_count,
             COUNT(p.id) as product_count,
             COUNT(c.id) as client_count
      FROM franchises f
      LEFT JOIN users u ON f.id = u.franchise_id
      LEFT JOIN products p ON f.id = p.franchise_id
      LEFT JOIN clients c ON f.id = c.franchise_id
      GROUP BY f.id
      ORDER BY f.name ASC
    `);
    
    res.status(200).json(result.rows);
    return;
  } catch (error) {
    console.error('Erro ao buscar franquias:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar franquias.' });
    return;
  }
};

// Buscar franquia por ID
export const getFranchiseById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const franchiseId = parseInt(req.params.id);

  try {
    const result = await db.query(`
      SELECT f.*, 
             COUNT(u.id) as user_count,
             COUNT(p.id) as product_count,
             COUNT(c.id) as client_count
      FROM franchises f
      LEFT JOIN users u ON f.id = u.franchise_id
      LEFT JOIN products p ON f.id = p.franchise_id
      LEFT JOIN clients c ON f.id = c.franchise_id
      WHERE f.id = $1
      GROUP BY f.id
    `, [franchiseId]);

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Franquia não encontrada.' });
      return;
    }

    res.status(200).json(result.rows[0]);
    return;
  } catch (error) {
    console.error('Erro ao buscar franquia:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar franquia.' });
    return;
  }
};

// Criar nova franquia
export const createFranchise = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { name, cnpj, address, phone, email } = req.body;

  if (!name) {
    res.status(400).json({ message: 'Nome da franquia é obrigatório.' });
    return;
  }

  try {
    // Verificar se CNPJ já existe
    if (cnpj) {
      const existingFranchise = await db.query('SELECT id FROM franchises WHERE cnpj = $1', [cnpj]);
      if (existingFranchise.rows.length > 0) {
        res.status(409).json({ message: 'CNPJ já cadastrado.' });
        return;
      }
    }

    const result = await db.query(
      'INSERT INTO franchises (name, cnpj, address, phone, email) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, cnpj, address, phone, email]
    );

    res.status(201).json(result.rows[0]);
    return;
  } catch (error) {
    console.error('Erro ao criar franquia:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao criar franquia.' });
    return;
  }
};

// Atualizar franquia
export const updateFranchise = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const franchiseId = parseInt(req.params.id);
  const { name, address, status, cnpj, email, phone, city, state } = req.body;

  try {
    // Verificar se franquia existe
    const existingFranchise = await db.query('SELECT id FROM franchises WHERE id = $1', [franchiseId]);
    if (existingFranchise.rows.length === 0) {
      res.status(404).json({ message: 'Franquia não encontrada.' });
      return;
    }

    // Construir query dinamicamente baseada nos campos fornecidos
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updateFields.push(`name = $${paramIndex++}`);
      updateValues.push(name);
    }

    if (address !== undefined) {
      updateFields.push(`address = $${paramIndex++}`);
      updateValues.push(address);
    }

    if (status !== undefined) {
      updateFields.push(`status = $${paramIndex++}`);
      updateValues.push(status);
    }

    if (cnpj !== undefined) {
      updateFields.push(`cnpj = $${paramIndex++}`);
      updateValues.push(cnpj);
    }

    if (email !== undefined) {
      updateFields.push(`email = $${paramIndex++}`);
      updateValues.push(email);
    }

    if (phone !== undefined) {
      updateFields.push(`phone = $${paramIndex++}`);
      updateValues.push(phone);
    }

    if (city !== undefined) {
      updateFields.push(`city = $${paramIndex++}`);
      updateValues.push(city);
    }

    if (state !== undefined) {
      updateFields.push(`state = $${paramIndex++}`);
      updateValues.push(state);
    }

    if (updateFields.length === 0) {
      res.status(400).json({ message: 'Nenhum campo válido fornecido para atualização.' });
      return;
    }

    updateValues.push(franchiseId);
    const query = `UPDATE franchises SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

    const result = await db.query(query, updateValues);

    res.status(200).json(result.rows[0]);
    return;
  } catch (error) {
    console.error('Erro ao atualizar franquia:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao atualizar franquia.' });
    return;
  }
};

// Deletar franquia
export const deleteFranchise = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const franchiseId = parseInt(req.params.id);

  try {
    // Verificar se franquia existe
    const existingFranchise = await db.query('SELECT id FROM franchises WHERE id = $1', [franchiseId]);
    if (existingFranchise.rows.length === 0) {
      res.status(404).json({ message: 'Franquia não encontrada.' });
      return;
    }

    // Verificar se há usuários associados
    const usersCheck = await db.query('SELECT id FROM users WHERE franchise_id = $1', [franchiseId]);
    if (usersCheck.rows.length > 0) {
      res.status(400).json({ message: 'Não é possível deletar uma franquia que possui usuários associados.' });
      return;
    }

    await db.query('DELETE FROM franchises WHERE id = $1', [franchiseId]);

    res.status(200).json({ message: 'Franquia deletada com sucesso.' });
    return;
  } catch (error) {
    console.error('Erro ao deletar franquia:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao deletar franquia.' });
    return;
  }
};

export const getFranchiseMembers = async (req: Request, res: Response) => {
  try {
    const franchiseId = parseInt(req.params.id);
    const result = await pool.query(
      `SELECT id, name, email, role, avatar FROM users WHERE franchise_id = $1 ORDER BY name`,
      [franchiseId]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar membros da franquia:', error);
    res.status(500).json({ message: 'Erro ao buscar membros.' });
  }
}; 