import { Request, Response } from 'express';
import db from '../config/db';

const pool = db;

const mapRow = (row: any) => ({
  id: row.id,
  franchise_id: row.franchise_id,
  client_id: row.client_id,
  user_id: row.user_id,
  title: row.title,
  description: row.description,
  start_at: row.start_at,
  end_at: row.end_at,
  status: row.status,
  created_at: row.created_at,
  updated_at: row.updated_at,
  client_name: row.client_name,
  client_phone: row.client_phone,
  user_name: row.user_name,
});

const baseSelect = `
  SELECT
    a.*,
    c.name as client_name,
    c.phone as client_phone,
    u.name as user_name
  FROM appointments a
  LEFT JOIN clients c ON a.client_id = c.id
  LEFT JOIN users u ON a.user_id = u.id
`;

export const getAppointments = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const franchiseId = user.role === 'SUPER_ADMIN' ? null : user.franchise_id;

    let query = baseSelect;
    const params: any[] = [];

    if (franchiseId) {
      query += ` WHERE a.franchise_id = $1`;
      params.push(franchiseId);
    }

    query += ` ORDER BY a.start_at DESC`;

    const result = await pool.query(query, params);
    return res.json(result.rows.map(mapRow));
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const getAppointmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user as any;
    const franchiseId = user.role === 'SUPER_ADMIN' ? null : user.franchise_id;

    let query = baseSelect + ` WHERE a.id = $1`;
    const params: any[] = [id];

    if (franchiseId) {
      query += ` AND a.franchise_id = $2`;
      params.push(franchiseId);
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Agendamento não encontrado' });
    }

    return res.json(mapRow(result.rows[0]));
  } catch (error) {
    console.error('Erro ao buscar agendamento:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const createAppointment = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const franchiseId = user.franchise_id ?? null;

    const { client_id, user_id, title, description, start_at, end_at, status } = req.body;

    if (!title || !start_at) {
      return res.status(400).json({ message: 'Título e data de início são obrigatórios' });
    }

    const result = await pool.query(
      `INSERT INTO appointments (franchise_id, client_id, user_id, title, description, start_at, end_at, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, 'scheduled'))
       RETURNING *`,
      [franchiseId, client_id || null, user_id || null, title, description || null, start_at, end_at || null, status || null]
    );

    const detailResult = await pool.query(
      baseSelect + ` WHERE a.id = $1`,
      [result.rows[0].id]
    );

    return res.status(201).json(mapRow(detailResult.rows[0]));
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const updateAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user as any;
    const franchiseId = user.role === 'SUPER_ADMIN' ? null : user.franchise_id;

    let checkQuery = 'SELECT id FROM appointments WHERE id = $1';
    const checkParams: any[] = [id];
    if (franchiseId) {
      checkQuery += ' AND franchise_id = $2';
      checkParams.push(franchiseId);
    }
    const check = await pool.query(checkQuery, checkParams);
    if (check.rows.length === 0) {
      return res.status(404).json({ message: 'Agendamento não encontrado' });
    }

    const { client_id, user_id, title, description, start_at, end_at, status } = req.body;

    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (client_id !== undefined) { fields.push(`client_id = $${idx++}`); values.push(client_id); }
    if (user_id !== undefined) { fields.push(`user_id = $${idx++}`); values.push(user_id); }
    if (title !== undefined) { fields.push(`title = $${idx++}`); values.push(title); }
    if (description !== undefined) { fields.push(`description = $${idx++}`); values.push(description); }
    if (start_at !== undefined) { fields.push(`start_at = $${idx++}`); values.push(start_at); }
    if (end_at !== undefined) { fields.push(`end_at = $${idx++}`); values.push(end_at); }
    if (status !== undefined) { fields.push(`status = $${idx++}`); values.push(status); }

    if (fields.length === 0) {
      return res.status(400).json({ message: 'Nenhum campo fornecido para atualização' });
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    await pool.query(
      `UPDATE appointments SET ${fields.join(', ')} WHERE id = $${idx}`,
      values
    );

    const detailResult = await pool.query(baseSelect + ` WHERE a.id = $1`, [id]);
    return res.json(mapRow(detailResult.rows[0]));
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const deleteAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user as any;
    const franchiseId = user.role === 'SUPER_ADMIN' ? null : user.franchise_id;

    let query = 'DELETE FROM appointments WHERE id = $1';
    const params: any[] = [id];

    if (franchiseId) {
      query += ' AND franchise_id = $2';
      params.push(franchiseId);
    }

    const result = await pool.query(query, params);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Agendamento não encontrado' });
    }

    return res.json({ message: 'Agendamento deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar agendamento:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const getAppointmentsByDate = async (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    const user = req.user as any;
    const franchiseId = user.role === 'SUPER_ADMIN' ? null : user.franchise_id;

    let query = baseSelect + ` WHERE a.start_at::date = $1`;
    const params: any[] = [date];

    if (franchiseId) {
      query += ' AND a.franchise_id = $2';
      params.push(franchiseId);
    }

    query += ' ORDER BY a.start_at ASC';

    const result = await pool.query(query, params);
    return res.json(result.rows.map(mapRow));
  } catch (error) {
    console.error('Erro ao buscar agendamentos por data:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const getAppointmentsByEmployee = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const user = req.user as any;
    const franchiseId = user.role === 'SUPER_ADMIN' ? null : user.franchise_id;

    let query = baseSelect + ` WHERE a.user_id = $1`;
    const params: any[] = [employeeId];

    if (franchiseId) {
      query += ' AND a.franchise_id = $2';
      params.push(franchiseId);
    }

    query += ' ORDER BY a.start_at DESC';

    const result = await pool.query(query, params);
    return res.json(result.rows.map(mapRow));
  } catch (error) {
    console.error('Erro ao buscar agendamentos por funcionário:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};
