import { Request, Response } from 'express';
import db from '../config/db';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: 'SUPER_ADMIN' | 'FRANCHISE_ADMIN' | 'EMPLOYEE';
    franchiseId: number | null;
  };
}

// Listar todas as categorias
export const getAllCategories = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { role, franchiseId } = req.user!;

  try {
    let query = `
      SELECT c.*, f.name as franchise_name,
             (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) as products_count
      FROM categories c
      LEFT JOIN franchises f ON c.franchise_id = f.id
    `;
    const queryParams: any[] = [];

    // FRANCHISE_ADMIN só vê categorias da sua franquia
    if (role === 'FRANCHISE_ADMIN') {
      if (franchiseId !== null && franchiseId !== undefined) {
        query += ' WHERE c.franchise_id = $1';
        queryParams.push(franchiseId);
      } else {
        res.status(403).json({ message: 'Usuário não associado a uma franquia.' });
        return;
      }
    }

    query += ' ORDER BY c.name ASC';

    const result = await db.query(query, queryParams);
    res.status(200).json(result.rows);
    return;
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar categorias.' });
    return;
  }
};

// Buscar categoria por ID
export const getCategoryById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { role, franchiseId } = req.user!;
  const categoryId = parseInt(req.params.id);

  try {
    let query = `
      SELECT c.*, f.name as franchise_name
      FROM categories c
      LEFT JOIN franchises f ON c.franchise_id = f.id
      WHERE c.id = $1
    `;
    const queryParams = [categoryId];

    // FRANCHISE_ADMIN só pode ver categorias da sua franquia
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
      res.status(404).json({ message: 'Categoria não encontrada.' });
      return;
    }

    res.status(200).json(result.rows[0]);
    return;
  } catch (error) {
    console.error('Erro ao buscar categoria:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar categoria.' });
    return;
  }
};

// Criar nova categoria
export const createCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { role, franchiseId } = req.user!;
  const { name, description, targetFranchiseId } = req.body;

  // Validações
  if (!name) {
    res.status(400).json({ message: 'Nome é obrigatório.' });
    return;
  }

  try {
    // Determinar a franquia da categoria
    let finalFranchiseId = targetFranchiseId;
    
    if (role === 'FRANCHISE_ADMIN') {
      // FRANCHISE_ADMIN só pode criar categorias para sua própria franquia
      if (targetFranchiseId && targetFranchiseId !== franchiseId) {
        res.status(403).json({ message: 'Você só pode criar categorias para sua própria franquia.' });
        return;
      }
      finalFranchiseId = franchiseId || null;
    } else if (role === 'SUPER_ADMIN') {
      // SUPER_ADMIN pode criar categorias para qualquer franquia
      if (!targetFranchiseId) {
        res.status(400).json({ message: 'Franquia deve ser especificada.' });
        return;
      }
    }

    // Inserir categoria
    const newCategoryResult = await db.query(
      `INSERT INTO categories (name, description, franchise_id) 
       VALUES ($1, $2, $3) 
       RETURNING id, name, description, franchise_id, is_active, created_at`,
      [name, description, finalFranchiseId]
    );

    res.status(201).json(newCategoryResult.rows[0]);
    return;
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao criar categoria.' });
    return;
  }
};

// Atualizar categoria
export const updateCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { role, franchiseId } = req.user!;
  const categoryId = parseInt(req.params.id);
  const { name, description, is_active, targetFranchiseId } = req.body;

  try {
    // Verificar se a categoria existe e tem permissão para editá-la
    let checkQuery = 'SELECT id, franchise_id FROM categories WHERE id = $1';
    const checkParams = [categoryId];

    if (role === 'FRANCHISE_ADMIN') {
      if (franchiseId !== null && franchiseId !== undefined) {
        checkQuery += ' AND franchise_id = $2';
        checkParams.push(franchiseId);
      } else {
        res.status(403).json({ message: 'Usuário não associado a uma franquia.' });
        return;
      }
    }

    const existingCategory = await db.query(checkQuery, checkParams);
    if (existingCategory.rows.length === 0) {
      res.status(404).json({ message: 'Categoria não encontrada ou sem permissão.' });
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
    updateParams.push(categoryId);
    const updateQuery = `UPDATE categories SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`;

    await db.query(updateQuery, updateParams);

    // Buscar categoria atualizada
    const updatedCategory = await db.query(
      'SELECT * FROM categories WHERE id = $1',
      [categoryId]
    );

    res.status(200).json(updatedCategory.rows[0]);
    return;
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao atualizar categoria.' });
    return;
  }
};

// Deletar categoria
export const deleteCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { role, franchiseId } = req.user!;
  const categoryId = parseInt(req.params.id);

  try {
    // Verificar se a categoria existe e tem permissão para deletá-la
    let checkQuery = 'SELECT id, franchise_id FROM categories WHERE id = $1';
    const checkParams = [categoryId];

    if (role === 'FRANCHISE_ADMIN') {
      if (franchiseId !== null && franchiseId !== undefined) {
        checkQuery += ' AND franchise_id = $2';
        checkParams.push(franchiseId);
      } else {
        res.status(403).json({ message: 'Usuário não associado a uma franquia.' });
        return;
      }
    }

    const existingCategory = await db.query(checkQuery, checkParams);
    if (existingCategory.rows.length === 0) {
      res.status(404).json({ message: 'Categoria não encontrada ou sem permissão.' });
      return;
    }

    // Verificar se há produtos usando esta categoria
    const productsUsingCategory = await db.query(
      'SELECT COUNT(*) as count FROM products WHERE category_id = $1',
      [categoryId]
    );

    if (parseInt(productsUsingCategory.rows[0].count) > 0) {
      res.status(400).json({ message: 'Não é possível excluir uma categoria que possui produtos associados.' });
      return;
    }

    // Deletar categoria
    await db.query('DELETE FROM categories WHERE id = $1', [categoryId]);

    res.status(200).json({ message: 'Categoria deletada com sucesso.' });
    return;
  } catch (error) {
    console.error('Erro ao deletar categoria:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao deletar categoria.' });
    return;
  }
}; 