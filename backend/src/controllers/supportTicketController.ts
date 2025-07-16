import { Request, Response } from 'express';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: "SUPER_ADMIN" | "FRANCHISE_ADMIN" | "EMPLOYEE";
    franchiseId: number | null;
  };
}

// Franqueado abre um ticket
export const createTicket = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, priority } = req.body;
    if (!req.user || !req.user.franchiseId) {
      return res.status(401).json({ message: 'Usuário não autenticado ou sem franquia.' });
    }
    if (!title || !description) {
      return res.status(400).json({ message: 'Título e descrição são obrigatórios.' });
    }
    const result = await pool.query(
      `INSERT INTO support_tickets (franchise_id, user_id, title, description, priority) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user.franchiseId, req.user.id, title, description, priority || 'medium']
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar ticket:', error);
    return res.status(500).json({ message: 'Erro ao criar ticket.' });
  }
};

// Franqueado vê seus próprios tickets
export const getMyTickets = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user.franchiseId) {
      return res.status(401).json({ message: 'Usuário não autenticado ou sem franquia.' });
    }
    const result = await pool.query(
      `SELECT t.*, u.name as opened_by FROM support_tickets t JOIN users u ON t.user_id = u.id WHERE t.franchise_id = $1 ORDER BY t.created_at DESC`,
      [req.user.franchiseId]
    );
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar tickets:', error);
    return res.status(500).json({ message: 'Erro ao buscar tickets.' });
  }
};

// Suporte vê todos os tickets
export const getAllTickets = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT t.*, u.name as opened_by, f.name as franchise_name FROM support_tickets t JOIN users u ON t.user_id = u.id JOIN franchises f ON t.franchise_id = f.id ORDER BY t.created_at DESC`
    );
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar todos os tickets:', error);
    return res.status(500).json({ message: 'Erro ao buscar tickets.' });
  }
};

// Detalhe de um ticket
export const getTicketById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ticketId = parseInt(req.params.id);
    const result = await pool.query(
      `SELECT t.*, u.name as opened_by, f.name as franchise_name FROM support_tickets t JOIN users u ON t.user_id = u.id JOIN franchises f ON t.franchise_id = f.id WHERE t.id = $1`,
      [ticketId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Ticket não encontrado.' });
    }
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar ticket:', error);
    return res.status(500).json({ message: 'Erro ao buscar ticket.' });
  }
};

// Adiciona mensagem ao ticket
export const addTicketMessage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ticketId = parseInt(req.params.id);
    const { message } = req.body;
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }
    if (!message) {
      return res.status(400).json({ message: 'Mensagem obrigatória.' });
    }
    const result = await pool.query(
      `INSERT INTO support_ticket_messages (ticket_id, user_id, message) VALUES ($1, $2, $3) RETURNING *`,
      [ticketId, req.user.id, message]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao adicionar mensagem ao ticket:', error);
    return res.status(500).json({ message: 'Erro ao adicionar mensagem.' });
  }
};

// Lista mensagens do ticket
export const getTicketMessages = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ticketId = parseInt(req.params.id);
    const result = await pool.query(
      `SELECT m.*, u.name as author_name, u.role as author_role FROM support_ticket_messages m JOIN users u ON m.user_id = u.id WHERE m.ticket_id = $1 ORDER BY m.created_at ASC`,
      [ticketId]
    );
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar mensagens do ticket:', error);
    return res.status(500).json({ message: 'Erro ao buscar mensagens.' });
  }
}; 