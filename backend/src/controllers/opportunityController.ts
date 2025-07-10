import { Request, Response } from 'express';
import db from '../config/db';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: 'SUPER_ADMIN' | 'FRANCHISE_ADMIN' | 'EMPLOYEE';
    franchiseId: number | null;
  };
}

// Listar oportunidades (com filtros)
export const getAllOpportunities = async (req: AuthenticatedRequest, res: Response) => {
  console.log('=== INICIANDO getAllOpportunities ===');
  
  try {
    // Debug: Log do usuário autenticado
    console.log('=== DEBUG OPPORTUNITIES ===');
    console.log('User authenticated:', req.user);
    console.log('User ID:', req.user?.id);
    console.log('User Role:', req.user?.role);
    console.log('User Franchise ID:', req.user?.franchiseId);
    console.log('Headers:', req.headers);
    console.log('==========================');

    // Verificar se a tabela existe
    try {
      console.log('Verificando se tabela existe...');
      const tableCheck = await db.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'opportunities')");
      console.log('Tabela opportunities existe:', tableCheck.rows[0].exists);
      
      if (tableCheck.rows[0].exists) {
        const countCheck = await db.query("SELECT COUNT(*) as total FROM opportunities");
        console.log('Total de oportunidades na tabela:', countCheck.rows[0].total);
      }
    } catch (tableError) {
      console.log('Erro ao verificar tabela:', tableError);
    }

    // Verificar se há restrições de franquia
    console.log('=== VERIFICANDO RESTRIÇÕES ===');
    console.log('User role:', req.user?.role);
    console.log('User franchiseId:', req.user?.franchiseId);
    
    // Se for FRANCHISE_ADMIN, adicionar filtro de franquia
    let query = `SELECT o.*, c.name as client_name FROM opportunities o LEFT JOIN clients c ON o.client_id = c.id WHERE 1=1`;
    const params: any[] = [];
    let idx = 1;
    
    // Adicionar filtro de franquia se necessário
    if (req.user?.role === 'FRANCHISE_ADMIN' && req.user?.franchiseId) {
      query += ` AND c.franchise_id = $${idx++}`;
      params.push(req.user.franchiseId);
      console.log('Adicionando filtro de franquia:', req.user.franchiseId);
    }
    
    const { clientId, stage, status, responsibleId } = req.query;
    if (clientId) { query += ` AND o.client_id = $${idx++}`; params.push(clientId); }
    if (stage) { query += ` AND o.stage = $${idx++}`; params.push(stage); }
    if (status) { query += ` AND o.status = $${idx++}`; params.push(status); }
    if (responsibleId) { query += ` AND o.responsible_id = $${idx++}`; params.push(responsibleId); }
    query += ` ORDER BY o.created_at DESC`;
    
    console.log('Executing query:', query);
    console.log('Query params:', params);
    
    console.log('Executando consulta no banco...');
    const result = await db.query(query, params);
    console.log('Query result rows:', result.rows.length);
    console.log('Query result:', result.rows);
    
    console.log('Enviando resposta 200...');
    res.status(200).json(result.rows);
    console.log('Resposta enviada com sucesso!');
  } catch (error) {
    console.error('Erro ao buscar oportunidades:', error);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
    res.status(500).json({ message: 'Erro ao buscar oportunidades.' });
  }
};

// Buscar oportunidade por ID
export const getOpportunityById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = await db.query('SELECT * FROM opportunities WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Oportunidade não encontrada.' });
      return;
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar oportunidade:', error);
    res.status(500).json({ message: 'Erro ao buscar oportunidade.' });
  }
};

// Criar nova oportunidade
export const createOpportunity = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { client_id, title, value, stage, probability, responsible_id, status, expected_close, origin, notes } = req.body;
    if (!client_id || !title || !value || !stage) {
      res.status(400).json({ message: 'Campos obrigatórios ausentes.' });
      return;
    }
    const result = await db.query(
      `INSERT INTO opportunities (client_id, title, value, stage, probability, responsible_id, status, expected_close, origin, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [client_id, title, value, stage, probability || 0, responsible_id || null, status || 'open', expected_close || null, origin || null, notes || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar oportunidade:', error);
    res.status(500).json({ message: 'Erro ao criar oportunidade.' });
  }
};

// Atualizar oportunidade
export const updateOpportunity = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { title, value, stage, probability, responsible_id, status, expected_close, origin, notes } = req.body;
    const result = await db.query(
      `UPDATE opportunities SET title=$1, value=$2, stage=$3, probability=$4, responsible_id=$5, status=$6, expected_close=$7, origin=$8, notes=$9, updated_at=NOW() WHERE id=$10 RETURNING *`,
      [title, value, stage, probability, responsible_id, status, expected_close, origin, notes, id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Oportunidade não encontrada.' });
      return;
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar oportunidade:', error);
    res.status(500).json({ message: 'Erro ao atualizar oportunidade.' });
  }
};

// Mover estágio da oportunidade
export const moveOpportunityStage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { stage } = req.body;
    if (!stage) {
      res.status(400).json({ message: 'Novo estágio é obrigatório.' });
      return;
    }
    const result = await db.query(
      `UPDATE opportunities SET stage = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [stage, id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Oportunidade não encontrada.' });
      return;
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao mover estágio:', error);
    res.status(500).json({ message: 'Erro ao mover estágio.' });
  }
};

// Deletar oportunidade
export const deleteOpportunity = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await db.query('DELETE FROM opportunities WHERE id = $1', [id]);
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar oportunidade:', error);
    res.status(500).json({ message: 'Erro ao deletar oportunidade.' });
  }
}; 