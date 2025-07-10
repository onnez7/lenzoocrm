import { Request, Response } from 'express';
import db from '../config/db';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: 'SUPER_ADMIN' | 'FRANCHISE_ADMIN' | 'EMPLOYEE';
    franchiseId: number | null;
  };
}

// Listar todos os produtos (com filtro por franquia, paginação e busca)
export const getAllProducts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { role, franchiseId } = req.user!;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const search = req.query.search as string;
  const targetFranchiseId = req.query.franchiseId ? parseInt(req.query.franchiseId as string) : null;

  const offset = (page - 1) * limit;

  try {
    // Construir condições WHERE
    const whereConditions: string[] = [];
    const queryParams: any[] = [];
    let paramIndex = 1;

    // FRANCHISE_ADMIN só vê produtos da sua franquia
    if (role === 'FRANCHISE_ADMIN') {
      if (franchiseId !== null && franchiseId !== undefined) {
        whereConditions.push(`p.franchise_id = $${paramIndex++}`);
        queryParams.push(franchiseId);
      } else {
        res.status(403).json({ message: 'Usuário não associado a uma franquia.' });
        return;
      }
    } else if (role === 'SUPER_ADMIN' && targetFranchiseId) {
      // SUPER_ADMIN pode filtrar por franquia específica
      whereConditions.push(`p.franchise_id = $${paramIndex++}`);
      queryParams.push(targetFranchiseId);
    }

    // Busca por nome, descrição, marca, SKU, modelo, código de barras ou categoria
    if (search) {
      whereConditions.push(`(
        p.name ILIKE $${paramIndex} OR 
        p.description ILIKE $${paramIndex} OR 
        p.sku ILIKE $${paramIndex} OR 
        p.model ILIKE $${paramIndex} OR 
        p.barcode ILIKE $${paramIndex} OR 
        c.name ILIKE $${paramIndex} OR 
        b.name ILIKE $${paramIndex}
      )`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Query para contar total de produtos
    const countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      ${whereClause}
    `;
    const countResult = await db.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    // Query para contar produtos ativos
    const activeCountQuery = `
      SELECT COUNT(*) as active
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      ${whereClause} ${whereConditions.length > 0 ? 'AND' : 'WHERE'} p.status = 'active'
    `;
    const activeCountResult = await db.query(activeCountQuery, queryParams);
    const active = parseInt(activeCountResult.rows[0].active);

    // Query para contar produtos inativos
    const inactiveCountQuery = `
      SELECT COUNT(*) as inactive
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      ${whereClause} ${whereConditions.length > 0 ? 'AND' : 'WHERE'} p.status = 'inactive'
    `;
    const inactiveCountResult = await db.query(inactiveCountQuery, queryParams);
    const inactive = parseInt(inactiveCountResult.rows[0].inactive);

    // Query principal para buscar produtos
    const productsQuery = `
      SELECT p.*, f.name as franchise_name, c.name as category_name, b.name as brand_name
      FROM products p
      LEFT JOIN franchises f ON p.franchise_id = f.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      ${whereClause}
      ORDER BY p.name ASC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    queryParams.push(limit, offset);

    const result = await db.query(productsQuery, queryParams);

    res.status(200).json({
      products: result.rows,
      total,
      active,
      inactive,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
    return;
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar produtos.' });
    return;
  }
};

// Buscar produto por ID
export const getProductById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { role, franchiseId } = req.user!;
  const productId = parseInt(req.params.id);

  // Validar se o ID é um número válido
  if (isNaN(productId)) {
    res.status(400).json({ message: 'ID do produto deve ser um número válido.' });
    return;
  }

  try {
    let query = `
      SELECT p.*, f.name as franchise_name, c.name as category_name, b.name as brand_name
      FROM products p
      LEFT JOIN franchises f ON p.franchise_id = f.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.id = $1
    `;
    const queryParams = [productId];

    // FRANCHISE_ADMIN só pode ver produtos da sua franquia
    if (role === 'FRANCHISE_ADMIN') {
      if (franchiseId !== null && franchiseId !== undefined) {
        query += ' AND p.franchise_id = $2';
        queryParams.push(franchiseId);
      } else {
        res.status(403).json({ message: 'Usuário não associado a uma franquia.' });
        return;
      }
    }

    const result = await db.query(query, queryParams);

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Produto não encontrado.' });
      return;
    }

    res.status(200).json(result.rows[0]);
    return;
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar produto.' });
    return;
  }
};

// Criar novo produto
export const createProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { role, franchiseId } = req.user!;
  const { 
    name, 
    description, 
    price, 
    cost, 
    stock_quantity, 
    min_stock, 
    category_id, 
    brand_id, 
    sku, 
    model, 
    barcode, 
    targetFranchiseId 
  } = req.body;

  // Validações
  if (!name || !price) {
    res.status(400).json({ message: 'Nome e preço são obrigatórios.' });
    return;
  }

  try {
    // Determinar a franquia do produto
    let finalFranchiseId = targetFranchiseId;
    
    if (role === 'FRANCHISE_ADMIN') {
      // FRANCHISE_ADMIN só pode criar produtos para sua própria franquia
      if (targetFranchiseId && targetFranchiseId !== franchiseId) {
        res.status(403).json({ message: 'Você só pode criar produtos para sua própria franquia.' });
        return;
      }
      finalFranchiseId = franchiseId || null;
    } else if (role === 'SUPER_ADMIN') {
      // SUPER_ADMIN pode criar produtos para qualquer franquia
      if (!targetFranchiseId) {
        res.status(400).json({ message: 'Franquia deve ser especificada.' });
        return;
      }
    }

    // Inserir produto
    const newProductResult = await db.query(
      `INSERT INTO products (name, description, price, cost, stock_quantity, min_stock, category_id, brand_id, sku, model, barcode, franchise_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
       RETURNING id, name, description, price, cost, stock_quantity, min_stock, category_id, brand_id, sku, model, barcode, franchise_id, created_at`,
      [name, description, price, cost, stock_quantity || 0, min_stock || 0, category_id, brand_id, sku, model, barcode, finalFranchiseId]
    );

    res.status(201).json(newProductResult.rows[0]);
    return;
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao criar produto.' });
    return;
  }
};

// Atualizar produto
export const updateProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { role, franchiseId } = req.user!;
  const productId = parseInt(req.params.id);

  // Validar se o ID é um número válido
  if (isNaN(productId)) {
    res.status(400).json({ message: 'ID do produto deve ser um número válido.' });
    return;
  }

  const { 
    name, 
    description, 
    price, 
    cost, 
    stock_quantity, 
    min_stock, 
    category_id, 
    brand_id, 
    sku, 
    model, 
    barcode, 
    targetFranchiseId 
  } = req.body;

  try {
    // Verificar se o produto existe e tem permissão para editá-lo
    let checkQuery = 'SELECT id, franchise_id FROM products WHERE id = $1';
    const checkParams = [productId];

    if (role === 'FRANCHISE_ADMIN') {
      if (franchiseId !== null && franchiseId !== undefined) {
        checkQuery += ' AND franchise_id = $2';
        checkParams.push(franchiseId);
      } else {
        res.status(403).json({ message: 'Usuário não associado a uma franquia.' });
        return;
      }
    }

    const existingProduct = await db.query(checkQuery, checkParams);
    if (existingProduct.rows.length === 0) {
      res.status(404).json({ message: 'Produto não encontrado ou sem permissão.' });
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

    if (price) {
      updateFields.push(`price = $${paramIndex++}`);
      updateParams.push(price);
    }

    if (cost !== undefined) {
      updateFields.push(`cost = $${paramIndex++}`);
      updateParams.push(cost);
    }

    if (stock_quantity !== undefined) {
      updateFields.push(`stock_quantity = $${paramIndex++}`);
      updateParams.push(stock_quantity);
    }

    if (min_stock !== undefined) {
      updateFields.push(`min_stock = $${paramIndex++}`);
      updateParams.push(min_stock);
    }

    if (category_id !== undefined) {
      updateFields.push(`category_id = $${paramIndex++}`);
      updateParams.push(category_id);
    }

    if (brand_id !== undefined) {
      updateFields.push(`brand_id = $${paramIndex++}`);
      updateParams.push(brand_id);
    }

    if (sku !== undefined) {
      updateFields.push(`sku = $${paramIndex++}`);
      updateParams.push(sku);
    }

    if (model !== undefined) {
      updateFields.push(`model = $${paramIndex++}`);
      updateParams.push(model);
    }

    if (barcode !== undefined) {
      updateFields.push(`barcode = $${paramIndex++}`);
      updateParams.push(barcode);
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
    updateParams.push(productId);
    const updateQuery = `UPDATE products SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`;

    await db.query(updateQuery, updateParams);

    // Buscar produto atualizado
    const updatedProduct = await db.query(
      'SELECT * FROM products WHERE id = $1',
      [productId]
    );

    res.status(200).json(updatedProduct.rows[0]);
    return;
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao atualizar produto.' });
    return;
  }
};

// Deletar produto
export const deleteProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { role, franchiseId } = req.user!;
  const productId = parseInt(req.params.id);

  // Validar se o ID é um número válido
  if (isNaN(productId)) {
    res.status(400).json({ message: 'ID do produto deve ser um número válido.' });
    return;
  }

  try {
    // Verificar se o produto existe e tem permissão para deletá-lo
    let checkQuery = 'SELECT id, franchise_id FROM products WHERE id = $1';
    const checkParams = [productId];

    if (role === 'FRANCHISE_ADMIN') {
      if (franchiseId !== null && franchiseId !== undefined) {
        checkQuery += ' AND franchise_id = $2';
        checkParams.push(franchiseId);
      } else {
        res.status(403).json({ message: 'Usuário não associado a uma franquia.' });
        return;
      }
    }

    const existingProduct = await db.query(checkQuery, checkParams);
    if (existingProduct.rows.length === 0) {
      res.status(404).json({ message: 'Produto não encontrado ou sem permissão.' });
      return;
    }

    // Deletar produto
    await db.query('DELETE FROM products WHERE id = $1', [productId]);

    res.status(200).json({ message: 'Produto deletado com sucesso.' });
    return;
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao deletar produto.' });
    return;
  }
}; 