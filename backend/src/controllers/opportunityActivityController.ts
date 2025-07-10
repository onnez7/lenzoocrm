import { Request, Response } from 'express';
import db from '../config/db';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: 'SUPER_ADMIN' | 'FRANCHISE_ADMIN' | 'EMPLOYEE';
    franchiseId: number | null;
  };
}

// Listar atividades de uma oportunidade
export const getOpportunityActivities = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const opportunityId = parseInt(req.params.opportunityId);
    const { status, priority, activityType } = req.query;
    
    let query = `
      SELECT oa.*, u.name as assigned_to_name, c.name as created_by_name 
      FROM opportunity_activities oa 
      LEFT JOIN users u ON oa.assigned_to = u.id 
      LEFT JOIN users c ON oa.created_by = c.id 
      WHERE oa.opportunity_id = $1
    `;
    const params: any[] = [opportunityId];
    let idx = 2;

    if (status) {
      query += ` AND oa.status = $${idx++}`;
      params.push(status);
    }
    if (priority) {
      query += ` AND oa.priority = $${idx++}`;
      params.push(priority);
    }
    if (activityType) {
      query += ` AND oa.activity_type = $${idx++}`;
      params.push(activityType);
    }

    query += ` ORDER BY oa.due_date ASC, oa.due_time ASC, oa.created_at DESC`;

    const result = await db.query(query, params);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar atividades da oportunidade:', error);
    res.status(500).json({ message: 'Erro ao buscar atividades da oportunidade.' });
  }
};

// Buscar atividade por ID
export const getActivityById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = await db.query(`
      SELECT oa.*, u.name as assigned_to_name, c.name as created_by_name 
      FROM opportunity_activities oa 
      LEFT JOIN users u ON oa.assigned_to = u.id 
      LEFT JOIN users c ON oa.created_by = c.id 
      WHERE oa.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Atividade não encontrada.' });
      return;
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar atividade:', error);
    res.status(500).json({ message: 'Erro ao buscar atividade.' });
  }
};

// Criar nova atividade
export const createActivity = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const opportunityId = parseInt(req.params.opportunityId);
    const { 
      title, 
      description, 
      activity_type, 
      status, 
      priority, 
      due_date, 
      due_time, 
      assigned_to, 
      notes 
    } = req.body;

    if (!title || !opportunityId) {
      res.status(400).json({ message: 'Título e ID da oportunidade são obrigatórios.' });
      return;
    }

    const result = await db.query(
      `INSERT INTO opportunity_activities (
        opportunity_id, title, description, activity_type, status, priority, 
        due_date, due_time, assigned_to, created_by, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        opportunityId, title, description || null, activity_type || 'task', 
        status || 'pending', priority || 'medium', due_date || null, due_time || null,
        assigned_to || null, req.user!.id, notes || null
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar atividade:', error);
    res.status(500).json({ message: 'Erro ao criar atividade.' });
  }
};

// Atualizar atividade
export const updateActivity = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { 
      title, 
      description, 
      activity_type, 
      status, 
      priority, 
      due_date, 
      due_time, 
      assigned_to, 
      notes 
    } = req.body;

    const result = await db.query(
      `UPDATE opportunity_activities SET 
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        activity_type = COALESCE($3, activity_type),
        status = COALESCE($4, status),
        priority = COALESCE($5, priority),
        due_date = COALESCE($6, due_date),
        due_time = COALESCE($7, due_time),
        assigned_to = COALESCE($8, assigned_to),
        notes = COALESCE($9, notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $10 RETURNING *`,
      [title, description, activity_type, status, priority, due_date, due_time, assigned_to, notes, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Atividade não encontrada.' });
      return;
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar atividade:', error);
    res.status(500).json({ message: 'Erro ao atualizar atividade.' });
  }
};

// Atualizar status da atividade
export const updateActivityStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;

    if (!status) {
      res.status(400).json({ message: 'Status é obrigatório.' });
      return;
    }

    const completedAt = status === 'completed' ? 'CURRENT_TIMESTAMP' : 'NULL';
    
    const result = await db.query(
      `UPDATE opportunity_activities SET 
        status = $1, 
        completed_at = ${completedAt},
        updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Atividade não encontrada.' });
      return;
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar status da atividade:', error);
    res.status(500).json({ message: 'Erro ao atualizar status da atividade.' });
  }
};

// Deletar atividade
export const deleteActivity = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = await db.query('DELETE FROM opportunity_activities WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Atividade não encontrada.' });
      return;
    }

    res.status(200).json({ message: 'Atividade deletada com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar atividade:', error);
    res.status(500).json({ message: 'Erro ao deletar atividade.' });
  }
}; 