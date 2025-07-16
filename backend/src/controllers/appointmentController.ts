import { Request, Response } from 'express';
import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: 'postgres',
  database: 'lenzoocrm',
  port: 5432,
});

// Interface para Appointment
interface Appointment {
  id: number;
  client_id: number;
  employee_id: number;
  service: string;
  appointment_date: string;
  appointment_time: string;
  status: 'agendado' | 'confirmado' | 'em_andamento' | 'concluido' | 'cancelado';
  observations?: string;
  franchise_id: number;
  created_at: string;
  updated_at: string;
  // Campos relacionados
  client_name?: string;
  client_phone?: string;
  employee_name?: string;
}

// Buscar todos os agendamentos da franquia
export const getAppointments = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const franchiseId = user.role === 'SUPER_ADMIN' ? null : user.franchise_id;

    let query = `
      SELECT 
        a.*,
        c.name as client_name,
        c.phone as client_phone,
        e.name as employee_name
      FROM appointments a
      JOIN clients c ON a.client_id = c.id
      LEFT JOIN employees e ON a.employee_id = e.id
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (franchiseId) {
      query += ` WHERE a.franchise_id = $${paramIndex}`;
      params.push(franchiseId);
      paramIndex++;
    }

    query += ` ORDER BY a.date DESC, a.time ASC`;

    const result = await pool.query(query, params);
    
    // Mapear os dados para o formato esperado pelo frontend
    const mappedAppointments = result.rows.map(row => ({
      id: row.id,
      client_id: row.client_id,
      employee_id: row.employee_id,
      service: row.type, // mapear type para service
      appointment_date: row.date, // mapear date para appointment_date
      appointment_time: row.time, // mapear time para appointment_time
      status: row.status,
      observations: row.notes, // mapear notes para observations
      franchise_id: row.franchise_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
      client_name: row.client_name,
      client_phone: row.client_phone,
      employee_name: row.employee_name
    }));
    
    return res.json(mappedAppointments);
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Buscar agendamento por ID
export const getAppointmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user as any;
    const franchiseId = user.role === 'SUPER_ADMIN' ? null : user.franchise_id;

    let query = `
      SELECT 
        a.*,
        c.name as client_name,
        c.phone as client_phone,
        e.name as employee_name
      FROM appointments a
      JOIN clients c ON a.client_id = c.id
      LEFT JOIN employees e ON a.employee_id = e.id
      WHERE a.id = $1
    `;

    const params: any[] = [id];
    let paramIndex = 2;

    if (franchiseId) {
      query += ` AND a.franchise_id = $${paramIndex}`;
      params.push(franchiseId);
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Agendamento não encontrado' });
    }

    const row = result.rows[0];
    const mappedAppointment = {
      id: row.id,
      client_id: row.client_id,
      employee_id: row.employee_id,
      service: row.type,
      appointment_date: row.date,
      appointment_time: row.time,
      status: row.status,
      observations: row.notes,
      franchise_id: row.franchise_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
      client_name: row.client_name,
      client_phone: row.client_phone,
      employee_name: row.employee_name
    };

    return res.json(mappedAppointment);
  } catch (error) {
    console.error('Erro ao buscar agendamento:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Criar novo agendamento
export const createAppointment = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const franchiseId = user.role === 'SUPER_ADMIN' ? null : user.franchise_id;

    const {
      client_id,
      employee_id,
      service,
      appointment_date,
      appointment_time,
      observations
    } = req.body;

    // Validações
    if (!client_id || !service || !appointment_date || !appointment_time) {
      return res.status(400).json({ message: 'Todos os campos obrigatórios devem ser preenchidos' });
    }

    // Verificar se o cliente existe (SUPER_ADMIN pode acessar qualquer cliente)
    let clientCheckQuery = 'SELECT id, franchise_id FROM clients WHERE id = $1';
    let clientCheckParams = [client_id];
    
    if (franchiseId) {
      clientCheckQuery += ' AND franchise_id = $2';
      clientCheckParams.push(franchiseId);
    }

    const clientCheck = await pool.query(clientCheckQuery, clientCheckParams);

    if (clientCheck.rows.length === 0) {
      return res.status(400).json({ message: 'Cliente não encontrado' });
    }

    // Usar a franquia do cliente para criar o agendamento
    const clientFranchiseId = clientCheck.rows[0].franchise_id;

    // Verificar se o funcionário existe na franquia do cliente (se fornecido)
    if (employee_id) {
      const employeeCheck = await pool.query(
        'SELECT id FROM employees WHERE id = $1 AND franchise_id = $2',
        [employee_id, clientFranchiseId]
      );

      if (employeeCheck.rows.length === 0) {
        return res.status(400).json({ message: 'Funcionário não encontrado' });
      }
    }

    // Verificar se não há conflito de horário (se funcionário fornecido)
    if (employee_id) {
      const conflictCheck = await pool.query(
        `SELECT id FROM appointments 
         WHERE employee_id = $1 
         AND date = $2 
         AND time = $3 
         AND status NOT IN ('cancelado')
         AND franchise_id = $4`,
        [employee_id, appointment_date, appointment_time, clientFranchiseId]
      );

      if (conflictCheck.rows.length > 0) {
        return res.status(400).json({ message: 'Já existe um agendamento neste horário para este profissional' });
      }
    }

    // Criar agendamento
    const result = await pool.query(
      `INSERT INTO appointments 
       (client_id, employee_id, type, date, time, notes, franchise_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [client_id, employee_id || null, service, appointment_date, appointment_time, observations, clientFranchiseId]
    );

    // Buscar dados completos do agendamento criado
    const appointmentWithDetails = await pool.query(
      `SELECT 
        a.*,
        c.name as client_name,
        c.phone as client_phone,
        e.name as employee_name
       FROM appointments a
       JOIN clients c ON a.client_id = c.id
       LEFT JOIN employees e ON a.employee_id = e.id
       WHERE a.id = $1`,
      [result.rows[0].id]
    );

    const row = appointmentWithDetails.rows[0];
    const mappedAppointment = {
      id: row.id,
      client_id: row.client_id,
      employee_id: row.employee_id,
      service: row.type,
      appointment_date: row.date,
      appointment_time: row.time,
      status: row.status,
      observations: row.notes,
      franchise_id: row.franchise_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
      client_name: row.client_name,
      client_phone: row.client_phone,
      employee_name: row.employee_name
    };

    return res.status(201).json(mappedAppointment);
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Atualizar agendamento
export const updateAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user as any;
    const franchiseId = user.role === 'SUPER_ADMIN' ? null : user.franchise_id;

    const {
      client_id,
      employee_id,
      service,
      appointment_date,
      appointment_time,
      status,
      observations
    } = req.body;

    // Verificar se o agendamento existe e pertence à franquia
    let checkQuery = 'SELECT * FROM appointments WHERE id = $1';
    const checkParams: any[] = [id];
    let paramIndex = 2;

    if (franchiseId) {
      checkQuery += ` AND franchise_id = $${paramIndex}`;
      checkParams.push(franchiseId);
      paramIndex++;
    }

    const checkResult = await pool.query(checkQuery, checkParams);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Agendamento não encontrado' });
    }

    const currentAppointment = checkResult.rows[0];

    // Se está mudando data/hora/funcionário, verificar conflitos
    if (appointment_date !== currentAppointment.date || 
        appointment_time !== currentAppointment.time || 
        employee_id !== currentAppointment.employee_id) {
      
      const conflictCheck = await pool.query(
        `SELECT id FROM appointments 
         WHERE employee_id = $1 
         AND date = $2 
         AND time = $3 
         AND status NOT IN ('cancelado')
         AND id != $4
         AND franchise_id = $5`,
        [employee_id, appointment_date, appointment_time, id, franchiseId || currentAppointment.franchise_id]
      );

      if (conflictCheck.rows.length > 0) {
        return res.status(400).json({ message: 'Já existe um agendamento neste horário para este profissional' });
      }
    }

    // Atualizar agendamento
    const updateQuery = `
      UPDATE appointments 
      SET 
        client_id = COALESCE($1, client_id),
        employee_id = COALESCE($2, employee_id),
        type = COALESCE($3, type),
        date = COALESCE($4, date),
        time = COALESCE($5, time),
        status = COALESCE($6, status),
        notes = COALESCE($7, notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `;

    const result = await pool.query(updateQuery, [
      client_id || null,
      employee_id || null,
      service || null,
      appointment_date || null,
      appointment_time || null,
      status || null,
      observations || null,
      id
    ]);

    // Buscar dados completos do agendamento atualizado
    const appointmentWithDetails = await pool.query(
      `SELECT 
        a.*,
        c.name as client_name,
        c.phone as client_phone,
        e.name as employee_name
       FROM appointments a
       JOIN clients c ON a.client_id = c.id
       JOIN employees e ON a.employee_id = e.id
       WHERE a.id = $1`,
      [id]
    );

    return res.json(appointmentWithDetails.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Deletar agendamento
export const deleteAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user as any;
    const franchiseId = user.role === 'SUPER_ADMIN' ? null : user.franchise_id;
    

    let query = 'DELETE FROM appointments WHERE id = $1';
    const params: any[] = [id];
    let paramIndex = 2;

    if (franchiseId) {
      query += ` AND franchise_id = $${paramIndex}`;
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

// Buscar agendamentos por data
export const getAppointmentsByDate = async (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    const user = req.user as any;
    const franchiseId = user.role === 'SUPER_ADMIN' ? null : user.franchise_id;

    let query = `
      SELECT 
        a.*,
        c.name as client_name,
        c.phone as client_phone,
        e.name as employee_name
      FROM appointments a
      JOIN clients c ON a.client_id = c.id
      LEFT JOIN employees e ON a.employee_id = e.id
      WHERE a.date = $1
    `;

    const params: any[] = [date];
    let paramIndex = 2;

    if (franchiseId) {
      query += ` AND a.franchise_id = $${paramIndex}`;
      params.push(franchiseId);
    }

    query += ` ORDER BY a.time ASC`;

    const result = await pool.query(query, params);
    
    // Mapear os dados para o formato esperado pelo frontend
    const mappedAppointments = result.rows.map(row => ({
      id: row.id,
      client_id: row.client_id,
      employee_id: row.employee_id,
      service: row.type,
      appointment_date: row.date,
      appointment_time: row.time,
      status: row.status,
      observations: row.notes,
      franchise_id: row.franchise_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
      client_name: row.client_name,
      client_phone: row.client_phone,
      employee_name: row.employee_name
    }));
    
    return res.json(mappedAppointments);
  } catch (error) {
    console.error('Erro ao buscar agendamentos por data:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Buscar agendamentos por funcionário
export const getAppointmentsByEmployee = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const user = req.user as any;
    const franchiseId = user.role === 'SUPER_ADMIN' ? null : user.franchise_id;

    let query = `
      SELECT 
        a.*,
        c.name as client_name,
        c.phone as client_phone,
        e.name as employee_name
      FROM appointments a
      JOIN clients c ON a.client_id = c.id
      LEFT JOIN employees e ON a.employee_id = e.id
      WHERE a.employee_id = $1
    `;

    const params: any[] = [employeeId];
    let paramIndex = 2;

    if (franchiseId) {
      query += ` AND a.franchise_id = $${paramIndex}`;
      params.push(franchiseId);
    }

    query += ` ORDER BY a.date DESC, a.time ASC`;

    const result = await pool.query(query, params);
    
    // Mapear os dados para o formato esperado pelo frontend
    const mappedAppointments = result.rows.map(row => ({
      id: row.id,
      client_id: row.client_id,
      employee_id: row.employee_id,
      service: row.type,
      appointment_date: row.date,
      appointment_time: row.time,
      status: row.status,
      observations: row.notes,
      franchise_id: row.franchise_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
      client_name: row.client_name,
      client_phone: row.client_phone,
      employee_name: row.employee_name
    }));
    
    return res.json(mappedAppointments);
  } catch (error) {
    console.error('Erro ao buscar agendamentos por funcionário:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
}; 