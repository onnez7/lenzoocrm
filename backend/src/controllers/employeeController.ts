import { Request, Response } from 'express';
import db from '../config/db';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: 'SUPER_ADMIN' | 'FRANCHISE_ADMIN' | 'EMPLOYEE';
    franchiseId: number | null;
  };
}

// Listar todos os funcionários (com filtro por franquia, paginação e busca)
export const getAllEmployees = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { role, franchiseId } = req.user!;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const search = req.query.search as string;
  const status = req.query.status as string;
  const targetFranchiseId = req.query.franchiseId ? parseInt(req.query.franchiseId as string) : null;

  const offset = (page - 1) * limit;

  try {
    // Construir condições WHERE
    const whereConditions: string[] = [];
    const queryParams: any[] = [];
    let paramIndex = 1;

    // FRANCHISE_ADMIN só vê funcionários da sua franquia
    if (role === 'FRANCHISE_ADMIN') {
      if (franchiseId !== null && franchiseId !== undefined) {
        whereConditions.push(`e.franchise_id = $${paramIndex++}`);
        queryParams.push(franchiseId);
      } else {
        res.status(403).json({ message: 'Usuário não associado a uma franquia.' });
        return;
      }
    } else if (role === 'SUPER_ADMIN' && targetFranchiseId) {
      // SUPER_ADMIN pode filtrar por franquia específica
      whereConditions.push(`e.franchise_id = $${paramIndex++}`);
      queryParams.push(targetFranchiseId);
    }

    // Busca por nome, email, telefone ou cargo
    if (search) {
      whereConditions.push(`(
        e.name ILIKE $${paramIndex} OR 
        e.email ILIKE $${paramIndex} OR 
        e.phone ILIKE $${paramIndex} OR 
        e.position ILIKE $${paramIndex} OR
        r.name ILIKE $${paramIndex}
      )`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    // Filtro por status
    if (status) {
      whereConditions.push(`e.status = $${paramIndex++}`);
      queryParams.push(status);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Query para contar total de funcionários
    const countQuery = `
      SELECT COUNT(*) as total
      FROM employees e
      LEFT JOIN roles r ON e.role_id = r.id
      LEFT JOIN franchises f ON e.franchise_id = f.id
      ${whereClause}
    `;
    const countResult = await db.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    // Query para contar funcionários ativos
    const activeCountQuery = `
      SELECT COUNT(*) as active
      FROM employees e
      LEFT JOIN roles r ON e.role_id = r.id
      LEFT JOIN franchises f ON e.franchise_id = f.id
      ${whereClause} ${whereConditions.length > 0 ? 'AND' : 'WHERE'} e.status = 'active'
    `;
    const activeCountResult = await db.query(activeCountQuery, queryParams);
    const active = parseInt(activeCountResult.rows[0].active);

    // Query para contar funcionários inativos
    const inactiveCountQuery = `
      SELECT COUNT(*) as inactive
      FROM employees e
      LEFT JOIN roles r ON e.role_id = r.id
      LEFT JOIN franchises f ON e.franchise_id = f.id
      ${whereClause} ${whereConditions.length > 0 ? 'AND' : 'WHERE'} e.status = 'inactive'
    `;
    const inactiveCountResult = await db.query(inactiveCountQuery, queryParams);
    const inactive = parseInt(inactiveCountResult.rows[0].inactive);

    // Query principal para buscar funcionários
    const employeesQuery = `
      SELECT e.*, r.name as role_name, f.name as franchise_name, u.email as user_email
      FROM employees e
      LEFT JOIN roles r ON e.role_id = r.id
      LEFT JOIN franchises f ON e.franchise_id = f.id
      LEFT JOIN users u ON e.user_id = u.id
      ${whereClause}
      ORDER BY e.name ASC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    queryParams.push(limit, offset);

    const result = await db.query(employeesQuery, queryParams);

    res.status(200).json({
      employees: result.rows,
      total,
      active,
      inactive,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
    return;
  } catch (error) {
    console.error('Erro ao buscar funcionários:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar funcionários.' });
    return;
  }
};

// Buscar funcionário por ID
export const getEmployeeById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { role, franchiseId } = req.user!;
  const employeeId = parseInt(req.params.id);

  try {
    let query = `
      SELECT e.*, r.name as role_name, f.name as franchise_name, u.email as user_email
      FROM employees e
      LEFT JOIN roles r ON e.role_id = r.id
      LEFT JOIN franchises f ON e.franchise_id = f.id
      LEFT JOIN users u ON e.user_id = u.id
      WHERE e.id = $1
    `;
    const queryParams = [employeeId];

    // FRANCHISE_ADMIN só pode ver funcionários da sua franquia
    if (role === 'FRANCHISE_ADMIN') {
      if (franchiseId !== null && franchiseId !== undefined) {
        query += ' AND e.franchise_id = $2';
        queryParams.push(franchiseId);
      } else {
        res.status(403).json({ message: 'Usuário não associado a uma franquia.' });
        return;
      }
    }

    const result = await db.query(query, queryParams);

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Funcionário não encontrado.' });
      return;
    }

    res.status(200).json(result.rows[0]);
    return;
  } catch (error) {
    console.error('Erro ao buscar funcionário:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar funcionário.' });
    return;
  }
};

// Criar novo funcionário
export const createEmployee = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { role, franchiseId } = req.user!;
  const { 
    name, 
    email, 
    phone, 
    position, 
    salary, 
    hire_date, 
    role_id,
    address,
    cpf,
    rg,
    emergency_contact,
    emergency_phone,
    notes,
    targetFranchiseId 
  } = req.body;

  // Validações
  if (!name || !email || !hire_date) {
    res.status(400).json({ message: 'Nome, email e data de admissão são obrigatórios.' });
    return;
  }

  try {
    // Determinar a franquia do funcionário
    let finalFranchiseId = targetFranchiseId;
    
    if (role === 'FRANCHISE_ADMIN') {
      // FRANCHISE_ADMIN só pode criar funcionários para sua própria franquia
      if (targetFranchiseId && targetFranchiseId !== franchiseId) {
        res.status(403).json({ message: 'Você só pode criar funcionários para sua própria franquia.' });
        return;
      }
      finalFranchiseId = franchiseId;
    } else if (role === 'SUPER_ADMIN' && !targetFranchiseId) {
      res.status(400).json({ message: 'Franquia deve ser especificada para SUPER_ADMIN.' });
      return;
    }

    // Verificar se o email já existe
    const existingEmail = await db.query('SELECT id FROM employees WHERE email = $1', [email]);
    if (existingEmail.rows.length > 0) {
      res.status(400).json({ message: 'Email já cadastrado.' });
      return;
    }

    // Verificar se o CPF já existe (se fornecido)
    if (cpf) {
      const existingCpf = await db.query('SELECT id FROM employees WHERE cpf = $1', [cpf]);
      if (existingCpf.rows.length > 0) {
        res.status(400).json({ message: 'CPF já cadastrado.' });
        return;
      }
    }

    // Inserir funcionário
    const result = await db.query(`
      INSERT INTO employees (
        name, email, phone, position, salary, hire_date, role_id, franchise_id,
        address, cpf, rg, emergency_contact, emergency_phone, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `, [
      name, email, phone, position, salary, hire_date, role_id, finalFranchiseId,
      address, cpf, rg, emergency_contact, emergency_phone, notes
    ]);

    res.status(201).json(result.rows[0]);
    return;
  } catch (error) {
    console.error('Erro ao criar funcionário:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao criar funcionário.' });
    return;
  }
};

// Atualizar funcionário
export const updateEmployee = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { role, franchiseId } = req.user!;
  const employeeId = parseInt(req.params.id);
  const { 
    name, 
    email, 
    phone, 
    position, 
    salary, 
    hire_date, 
    termination_date,
    role_id,
    status,
    address,
    cpf,
    rg,
    emergency_contact,
    emergency_phone,
    notes
  } = req.body;

  try {
    // Verificar se o funcionário existe e se o usuário tem permissão
    let checkQuery = 'SELECT franchise_id FROM employees WHERE id = $1';
    const checkParams = [employeeId];

    if (role === 'FRANCHISE_ADMIN') {
      if (franchiseId !== null && franchiseId !== undefined) {
        checkQuery += ' AND franchise_id = $2';
        checkParams.push(franchiseId);
      } else {
        res.status(403).json({ message: 'Usuário não associado a uma franquia.' });
        return;
      }
    }

    const checkResult = await db.query(checkQuery, checkParams);
    if (checkResult.rows.length === 0) {
      res.status(404).json({ message: 'Funcionário não encontrado.' });
      return;
    }

    // Verificar se o email já existe (exceto para o próprio funcionário)
    if (email) {
      const existingEmail = await db.query('SELECT id FROM employees WHERE email = $1 AND id != $2', [email, employeeId]);
      if (existingEmail.rows.length > 0) {
        res.status(400).json({ message: 'Email já cadastrado.' });
        return;
      }
    }

    // Verificar se o CPF já existe (exceto para o próprio funcionário)
    if (cpf) {
      const existingCpf = await db.query('SELECT id FROM employees WHERE cpf = $1 AND id != $2', [cpf, employeeId]);
      if (existingCpf.rows.length > 0) {
        res.status(400).json({ message: 'CPF já cadastrado.' });
        return;
      }
    }

    // Atualizar funcionário
    const result = await db.query(`
      UPDATE employees SET
        name = COALESCE($1, name),
        email = COALESCE($2, email),
        phone = COALESCE($3, phone),
        position = COALESCE($4, position),
        salary = COALESCE($5, salary),
        hire_date = COALESCE($6, hire_date),
        termination_date = COALESCE($7, termination_date),
        role_id = COALESCE($8, role_id),
        status = COALESCE($9, status),
        address = COALESCE($10, address),
        cpf = COALESCE($11, cpf),
        rg = COALESCE($12, rg),
        emergency_contact = COALESCE($13, emergency_contact),
        emergency_phone = COALESCE($14, emergency_phone),
        notes = COALESCE($15, notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $16
      RETURNING *
    `, [
      name, email, phone, position, salary, hire_date, termination_date, role_id, status,
      address, cpf, rg, emergency_contact, emergency_phone, notes, employeeId
    ]);

    res.status(200).json(result.rows[0]);
    return;
  } catch (error) {
    console.error('Erro ao atualizar funcionário:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao atualizar funcionário.' });
    return;
  }
};

// Excluir funcionário
export const deleteEmployee = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { role, franchiseId } = req.user!;
  const employeeId = parseInt(req.params.id);

  try {
    // Verificar se o funcionário existe e se o usuário tem permissão
    let checkQuery = 'SELECT franchise_id FROM employees WHERE id = $1';
    const checkParams = [employeeId];

    if (role === 'FRANCHISE_ADMIN') {
      if (franchiseId !== null && franchiseId !== undefined) {
        checkQuery += ' AND franchise_id = $2';
        checkParams.push(franchiseId);
      } else {
        res.status(403).json({ message: 'Usuário não associado a uma franquia.' });
        return;
      }
    }

    const checkResult = await db.query(checkQuery, checkParams);
    if (checkResult.rows.length === 0) {
      res.status(404).json({ message: 'Funcionário não encontrado.' });
      return;
    }

    // Excluir funcionário
    await db.query('DELETE FROM employees WHERE id = $1', [employeeId]);

    res.status(200).json({ message: 'Funcionário excluído com sucesso.' });
    return;
  } catch (error) {
    console.error('Erro ao excluir funcionário:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao excluir funcionário.' });
    return;
  }
};

// Listar cargos
export const getRoles = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const result = await db.query('SELECT * FROM roles WHERE is_active = true ORDER BY name');
    res.status(200).json(result.rows);
    return;
  } catch (error) {
    console.error('Erro ao buscar cargos:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar cargos.' });
    return;
  }
}; 