import { Request, Response } from 'express';
import db from '../config/db';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: 'SUPER_ADMIN' | 'FRANCHISE_ADMIN' | 'EMPLOYEE';
    franchiseId: number | null;
  };
}

// Listar todas as marcas
export const getAllBrands = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { role, franchiseId } = req.user!;

  try {
    let query = `
      SELECT b.*, f.name as franchise_name,
             (SELECT COUNT(*) FROM products p WHERE p.brand_id = b.id) as products_count
      FROM brands b
      LEFT JOIN franchises f ON b.franchise_id = f.id
    `;
    const queryParams: any[] = [];

    // FRANCHISE_ADMIN só vê marcas da sua franquia
    if (role === 'FRANCHISE_ADMIN') {
      if (franchiseId !== null && franchiseId !== undefined) {
        query += ' WHERE b.franchise_id = $1';
        queryParams.push(franchiseId);
      } else {
        res.status(403).json({ message: 'Usuário não associado a uma franquia.' });
        return;
      }
    }

    query += ' ORDER BY b.name ASC';

    const result = await db.query(query, queryParams);
    res.status(200).json(result.rows);
    return;
  } catch (error) {
    console.error('Erro ao buscar marcas:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar marcas.' });
    return;
  }
};

// Buscar marca por ID
export const getBrandById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { role, franchiseId } = req.user!;
  const brandId = parseInt(req.params.id);

  try {
    let query = `
      SELECT b.*, f.name as franchise_name
      FROM brands b
      LEFT JOIN franchises f ON b.franchise_id = f.id
      WHERE b.id = $1
    `;
    const queryParams = [brandId];

    // FRANCHISE_ADMIN só pode ver marcas da sua franquia
    if (role === 'FRANCHISE_ADMIN') {
      if (franchiseId !== null && franchiseId !== undefined) {
        query += ' AND b.franchise_id = $2';
        queryParams.push(franchiseId);
      } else {
        res.status(403).json({ message: 'Usuário não associado a uma franquia.' });
        return;
      }
    }

    const result = await db.query(query, queryParams);

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Marca não encontrada.' });
      return;
    }

    res.status(200).json(result.rows[0]);
    return;
  } catch (error) {
    console.error('Erro ao buscar marca:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar marca.' });
    return;
  }
};

// Criar nova marca
export const createBrand = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { role, franchiseId } = req.user!;
  const { name, description, targetFranchiseId } = req.body;

  // Validações
  if (!name) {
    res.status(400).json({ message: 'Nome é obrigatório.' });
    return;
  }

  try {
    // Determinar a franquia da marca
    let finalFranchiseId = targetFranchiseId;
    
    if (role === 'FRANCHISE_ADMIN') {
      // FRANCHISE_ADMIN só pode criar marcas para sua própria franquia
      if (targetFranchiseId && targetFranchiseId !== franchiseId) {
        res.status(403).json({ message: 'Você só pode criar marcas para sua própria franquia.' });
        return;
      }
      finalFranchiseId = franchiseId || null;
    } else if (role === 'SUPER_ADMIN') {
      // SUPER_ADMIN pode criar marcas para qualquer franquia
      if (!targetFranchiseId) {
        res.status(400).json({ message: 'Franquia deve ser especificada.' });
        return;
      }
    }

    // Inserir marca
    const newBrandResult = await db.query(
      `INSERT INTO brands (name, description, franchise_id) 
       VALUES ($1, $2, $3) 
       RETURNING id, name, description, franchise_id, is_active, created_at`,
      [name, description, finalFranchiseId]
    );

    res.status(201).json(newBrandResult.rows[0]);
    return;
  } catch (error) {
    console.error('Erro ao criar marca:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao criar marca.' });
    return;
  }
};

// Atualizar marca
export const updateBrand = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { role, franchiseId } = req.user!;
  const brandId = parseInt(req.params.id);
  const { name, description, is_active, targetFranchiseId } = req.body;

  try {
    // Verificar se a marca existe e tem permissão para editá-la
    let checkQuery = 'SELECT id, franchise_id FROM brands WHERE id = $1';
    const checkParams = [brandId];

    if (role === 'FRANCHISE_ADMIN') {
      if (franchiseId !== null && franchiseId !== undefined) {
        checkQuery += ' AND franchise_id = $2';
        checkParams.push(franchiseId);
      } else {
        res.status(403).json({ message: 'Usuário não associado a uma franquia.' });
        return;
      }
    }

    const existingBrand = await db.query(checkQuery, checkParams);
    if (existingBrand.rows.length === 0) {
      res.status(404).json({ message: 'Marca não encontrada ou sem permissão.' });
      return;
    }

    // Preparar dados para atualização
    const updateFields: string[] = [];
    const updateParams: any[] = [];
    let paramIndex = 1;

    if (name) {
      updateFields.push(`name = $${paramIndex++}`);
      updateParams.push(name);
    }

    if (description !== undefined) {
      updateFields.push(`description = $${paramIndex++}`);
      updateParams.push(description);
    }

    if (is_active !== undefined) {
      updateFields.push(`is_active = $${paramIndex++}`);
      updateParams.push(is_active);
    }

    if (targetFranchiseId && role === 'SUPER_ADMIN') {
      updateFields.push(`franchise_id = $${paramIndex++}`);
      updateParams.push(targetFranchiseId);
    }

    if (updateFields.length === 0) {
      res.status(400).json({ message: 'Nenhum campo para atualizar.' });
      return;
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateParams.push(brandId);
    const updateQuery = `UPDATE brands SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`;

    await db.query(updateQuery, updateParams);

    // Buscar marca atualizada
    const updatedBrand = await db.query(
      'SELECT * FROM brands WHERE id = $1',
      [brandId]
    );

    res.status(200).json(updatedBrand.rows[0]);
    return;
  } catch (error) {
    console.error('Erro ao atualizar marca:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao atualizar marca.' });
    return;
  }
};

// Deletar marca
export const deleteBrand = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { role, franchiseId } = req.user!;
  const brandId = parseInt(req.params.id);

  try {
    // Verificar se a marca existe e tem permissão para deletá-la
    let checkQuery = 'SELECT id, franchise_id FROM brands WHERE id = $1';
    const checkParams = [brandId];

    if (role === 'FRANCHISE_ADMIN') {
      if (franchiseId !== null && franchiseId !== undefined) {
        checkQuery += ' AND franchise_id = $2';
        checkParams.push(franchiseId);
      } else {
        res.status(403).json({ message: 'Usuário não associado a uma franquia.' });
        return;
      }
    }

    const existingBrand = await db.query(checkQuery, checkParams);
    if (existingBrand.rows.length === 0) {
      res.status(404).json({ message: 'Marca não encontrada ou sem permissão.' });
      return;
    }

    // Verificar se há produtos usando esta marca
    const productsUsingBrand = await db.query(
      'SELECT COUNT(*) as count FROM products WHERE brand_id = $1',
      [brandId]
    );

    if (parseInt(productsUsingBrand.rows[0].count) > 0) {
      res.status(400).json({ message: 'Não é possível excluir uma marca que possui produtos associados.' });
      return;
    }

    // Deletar marca
    await db.query('DELETE FROM brands WHERE id = $1', [brandId]);

    res.status(200).json({ message: 'Marca deletada com sucesso.' });
    return;
  } catch (error) {
    console.error('Erro ao deletar marca:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao deletar marca.' });
    return;
  }
}; 