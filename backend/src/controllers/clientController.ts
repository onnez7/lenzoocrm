import { Request, Response } from 'express';
import db from '../config/db';

export const getAllClients = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const pageNumber = parseInt(page as string) || 1;
    const limitNumber = parseInt(limit as string) || 20;
    const offset = (pageNumber - 1) * limitNumber;

    const whereConditions: string[] = [];
    const queryParams: unknown[] = [];
    let paramIndex = 1;

    if (search && typeof search === 'string') {
      whereConditions.push(`(c.name ILIKE $${paramIndex} OR c.email ILIKE $${paramIndex} OR c.phone ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (req.user?.role === 'FRANCHISE_ADMIN' && req.user?.franchiseId) {
      whereConditions.push(`c.franchise_id = $${paramIndex}`);
      queryParams.push(req.user.franchiseId);
      paramIndex++;
    }

    const baseFrom = `FROM clients c LEFT JOIN franchises f ON c.franchise_id = f.id${whereConditions.length ? ' WHERE ' + whereConditions.join(' AND ') : ''}`;

    const countResult = await db.query(`SELECT COUNT(*) as total ${baseFrom}`, queryParams);
    const totalClients = parseInt(countResult.rows[0].total);

    const activeConnector = whereConditions.length ? ' AND ' : ' WHERE ';
    const activeResult = await db.query(
      `SELECT COUNT(*) as total ${baseFrom}${activeConnector}(c.email IS NOT NULL OR c.phone IS NOT NULL)`,
      queryParams
    );
    const activeClients = parseInt(activeResult.rows[0].total);

    const mainResult = await db.query(
      `SELECT c.*, f.name as franchise_name ${baseFrom} ORDER BY c.name ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...queryParams, limitNumber, offset]
    );

    const totalPages = Math.ceil(totalClients / limitNumber);

    res.status(200).json({
      clients: mainResult.rows,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total: totalClients,
        totalPages,
        hasNext: pageNumber < totalPages,
        hasPrev: pageNumber > 1
      },
      stats: {
        total: totalClients,
        active: activeClients,
        inactive: totalClients - activeClients
      }
    });
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar clientes.' });
  }
};

// Buscar cliente por ID com dados relacionados
export const getClientById = async (req: Request, res: Response): Promise<void> => {
  const { role, franchiseId } = req.user!;
  const clientId = parseInt(req.params.id);

  if (isNaN(clientId)) {
    res.status(400).json({ message: 'ID de cliente inválido.' });
    return;
  }

  try {
    let query = `
      SELECT c.*, f.name as franchise_name
      FROM clients c
      LEFT JOIN franchises f ON c.franchise_id = f.id
      WHERE c.id = $1
    `;
    const queryParams = [clientId];

    // FRANCHISE_ADMIN só pode ver clientes da sua franquia
    if (role === 'FRANCHISE_ADMIN') {
      if (franchiseId !== null && franchiseId !== undefined) {
        query += ' AND c.franchise_id = $2';
        queryParams.push(franchiseId);
      } else {
        res.status(403).json({ message: 'Usuário não associado a uma franquia.' });
        return;
      }
    }

    const clientResult = await db.query(query, queryParams);

    if (clientResult.rows.length === 0) {
      res.status(404).json({ message: 'Cliente não encontrado.' });
      return;
    }

    const client = clientResult.rows[0];

    // Buscar receitas ópticas
    const prescriptionsResult = await db.query(
      'SELECT * FROM prescriptions WHERE client_id = $1 ORDER BY date DESC',
      [clientId]
    );

    // Buscar agendamentos
    const appointmentsResult = await db.query(
      'SELECT * FROM appointments WHERE client_id = $1 ORDER BY date DESC, time DESC',
      [clientId]
    );

    // Buscar total de compras
    const totalPurchasesResult = await db.query(
      'SELECT COALESCE(SUM(total_amount), 0) as total FROM sales WHERE client_id = $1 AND status = $2',
      [clientId, 'completed']
    );

    // Buscar última visita (último agendamento)
    const lastVisitResult = await db.query(
      'SELECT date FROM appointments WHERE client_id = $1 AND status = $2 ORDER BY date DESC, time DESC LIMIT 1',
      [clientId, 'completed']
    );

    const response = {
      ...client,
      prescriptions: prescriptionsResult.rows,
      appointments: appointmentsResult.rows,
      totalPurchases: Number(totalPurchasesResult.rows[0].total),
      lastVisit: lastVisitResult.rows[0]?.date || null
    };

    res.status(200).json(response);
    return;
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar cliente.' });
    return;
  }
};

// Criar novo cliente
export const createClient = async (req: Request, res: Response): Promise<void> => {
  const { role, franchiseId } = req.user!;
  const { name, email, phone, cpf, birthDate, address, city, state, zipCode, notes, targetFranchiseId } = req.body;

  // Validações
  if (!name) {
    res.status(400).json({ message: 'Nome é obrigatório.' });
    return;
  }

  try {
    // Determinar a franquia do cliente
    let finalFranchiseId = targetFranchiseId;
    
    if (role === 'FRANCHISE_ADMIN') {
      // FRANCHISE_ADMIN só pode criar clientes para sua própria franquia
      if (targetFranchiseId && targetFranchiseId !== franchiseId) {
        res.status(403).json({ message: 'Você só pode criar clientes para sua própria franquia.' });
        return;
      }
      finalFranchiseId = franchiseId || null;
    } else if (role === 'SUPER_ADMIN') {
      // SUPER_ADMIN pode criar clientes para qualquer franquia
      if (!targetFranchiseId) {
        res.status(400).json({ message: 'Franquia deve ser especificada.' });
        return;
      }
    }

    // Inserir cliente
    const newClientResult = await db.query(
      `INSERT INTO clients (franchise_id, name, email, phone, cpf, birth_date, address, city, state, zip_code, notes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
       RETURNING id, name, email, phone, cpf, birth_date, address, city, state, zip_code, notes, franchise_id, created_at`,
      [finalFranchiseId, name, email, phone, cpf, birthDate, address, city, state, zipCode, notes]
    );

    res.status(201).json(newClientResult.rows[0]);
    return;
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao criar cliente.' });
    return;
  }
};

// Atualizar cliente
export const updateClient = async (req: Request, res: Response): Promise<void> => {
  const { role, franchiseId } = req.user!;
  const clientId = parseInt(req.params.id);
  const { name, email, phone, cpf, birthDate, address, city, state, zipCode, notes, targetFranchiseId } = req.body;

  if (isNaN(clientId)) {
    res.status(400).json({ message: 'ID de cliente inválido.' });
    return;
  }

  try {
    // Verificar se o cliente existe e tem permissão para editá-lo
    let checkQuery = 'SELECT id, franchise_id FROM clients WHERE id = $1';
    const checkParams = [clientId];

    if (role === 'FRANCHISE_ADMIN') {
      if (franchiseId !== null && franchiseId !== undefined) {
        checkQuery += ' AND franchise_id = $2';
        checkParams.push(franchiseId);
      } else {
        res.status(403).json({ message: 'Usuário não associado a uma franquia.' });
        return;
      }
    }

    const existingClient = await db.query(checkQuery, checkParams);
    if (existingClient.rows.length === 0) {
      res.status(404).json({ message: 'Cliente não encontrado ou sem permissão.' });
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

    if (email !== undefined) {
      updateFields.push(`email = $${paramIndex++}`);
      updateParams.push(email);
    }

    if (phone !== undefined) {
      updateFields.push(`phone = $${paramIndex++}`);
      updateParams.push(phone);
    }

    if (cpf !== undefined) {
      updateFields.push(`cpf = $${paramIndex++}`);
      updateParams.push(cpf);
    }

    if (birthDate !== undefined) {
      updateFields.push(`birth_date = $${paramIndex++}`);
      updateParams.push(birthDate);
    }

    if (address !== undefined) {
      updateFields.push(`address = $${paramIndex++}`);
      updateParams.push(address);
    }

    if (city !== undefined) {
      updateFields.push(`city = $${paramIndex++}`);
      updateParams.push(city);
    }

    if (state !== undefined) {
      updateFields.push(`state = $${paramIndex++}`);
      updateParams.push(state);
    }

    if (zipCode !== undefined) {
      updateFields.push(`zip_code = $${paramIndex++}`);
      updateParams.push(zipCode);
    }

    if (notes !== undefined) {
      updateFields.push(`notes = $${paramIndex++}`);
      updateParams.push(notes);
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
    updateParams.push(clientId);
    const updateQuery = `UPDATE clients SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`;

    await db.query(updateQuery, updateParams);

    // Buscar cliente atualizado
    const updatedClient = await db.query(
      'SELECT * FROM clients WHERE id = $1',
      [clientId]
    );

    res.status(200).json(updatedClient.rows[0]);
    return;
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao atualizar cliente.' });
    return;
  }
};

// Deletar cliente
export const deleteClient = async (req: Request, res: Response): Promise<void> => {
  const { role, franchiseId } = req.user!;
  const clientId = parseInt(req.params.id);

  if (isNaN(clientId)) {
    res.status(400).json({ message: 'ID de cliente inválido.' });
    return;
  }

  try {
    // Verificar se o cliente existe e tem permissão para deletá-lo
    let checkQuery = 'SELECT id, franchise_id FROM clients WHERE id = $1';
    const checkParams = [clientId];

    if (role === 'FRANCHISE_ADMIN') {
      if (franchiseId !== null && franchiseId !== undefined) {
        checkQuery += ' AND franchise_id = $2';
        checkParams.push(franchiseId);
      } else {
        res.status(403).json({ message: 'Usuário não associado a uma franquia.' });
        return;
      }
    }

    const existingClient = await db.query(checkQuery, checkParams);
    if (existingClient.rows.length === 0) {
      res.status(404).json({ message: 'Cliente não encontrado ou sem permissão.' });
      return;
    }

    // Deletar cliente
    await db.query('DELETE FROM clients WHERE id = $1', [clientId]);

    res.status(200).json({ message: 'Cliente deletado com sucesso.' });
    return;
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao deletar cliente.' });
    return;
  }
};