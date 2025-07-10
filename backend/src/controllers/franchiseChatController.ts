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

// Retorna o canal da franquia do usuário (cria se não existir)
export const getFranchiseChannel = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user.franchiseId) {
      return res.status(401).json({ message: 'Usuário não autenticado ou sem franquia.' });
    }
    // Verifica se já existe canal
    let result = await pool.query(
      'SELECT * FROM franchise_channels WHERE franchise_id = $1 LIMIT 1',
      [req.user.franchiseId]
    );
    let channel;
    if (result.rows.length === 0) {
      // Cria canal se não existir
      result = await pool.query(
        'INSERT INTO franchise_channels (franchise_id, name) VALUES ($1, $2) RETURNING *',
        [req.user.franchiseId, 'Geral']
      );
    }
    channel = result.rows[0];
    res.status(200).json(channel);
  } catch (error) {
    console.error('Erro ao buscar canal da franquia:', error);
    res.status(500).json({ message: 'Erro ao buscar canal.' });
  }
};

// Lista mensagens do canal
export const getChannelMessages = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const channelId = parseInt(req.params.id);
    const result = await pool.query(
      `SELECT m.*, u.name as author_name, u.role as author_role FROM franchise_channel_messages m JOIN users u ON m.user_id = u.id WHERE m.channel_id = $1 ORDER BY m.created_at ASC`,
      [channelId]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar mensagens do canal:', error);
    res.status(500).json({ message: 'Erro ao buscar mensagens.' });
  }
};

// Envia mensagem para o canal
export const sendChannelMessage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const channelId = parseInt(req.params.id);
    const { message } = req.body;
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }
    if (!message) {
      return res.status(400).json({ message: 'Mensagem obrigatória.' });
    }
    const result = await pool.query(
      'INSERT INTO franchise_channel_messages (channel_id, user_id, message) VALUES ($1, $2, $3) RETURNING *',
      [channelId, req.user.id, message]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({ message: 'Erro ao enviar mensagem.' });
  }
};

// Criar canal privado (com membros)
export const createFranchiseChannel = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user.franchiseId) {
      return res.status(401).json({ message: 'Usuário não autenticado ou sem franquia.' });
    }
    const { name, is_private, memberIds } = req.body;
    if (!name || !Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({ message: 'Nome e membros são obrigatórios.' });
    }
    // Cria canal
    const channelResult = await pool.query(
      'INSERT INTO franchise_channels (franchise_id, name, created_by, is_private) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.franchiseId, name, req.user.id, !!is_private]
    );
    const channel = channelResult.rows[0];
    // Adiciona membros
    const values = memberIds.map((uid: number) => `(${channel.id}, ${uid})`).join(',');
    await pool.query(`INSERT INTO franchise_channel_members (channel_id, user_id) VALUES ${values}`);
    res.status(201).json(channel);
  } catch (error) {
    console.error('Erro ao criar canal:', error);
    res.status(500).json({ message: 'Erro ao criar canal.' });
  }
};

// Listar canais do usuário
export const getMyFranchiseChannels = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user.franchiseId) {
      return res.status(401).json({ message: 'Usuário não autenticado ou sem franquia.' });
    }
    const result = await pool.query(
      `SELECT c.* FROM franchise_channels c
       JOIN franchise_channel_members m ON c.id = m.channel_id
       WHERE m.user_id = $1 AND c.franchise_id = $2
       ORDER BY c.created_at ASC`,
      [req.user.id, req.user.franchiseId]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao listar canais:', error);
    res.status(500).json({ message: 'Erro ao listar canais.' });
  }
};

// Adicionar membros ao canal
export const addChannelMembers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const channelId = parseInt(req.params.id);
    const { memberIds } = req.body;
    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({ message: 'Membros obrigatórios.' });
    }
    const values = memberIds.map((uid: number) => `(${channelId}, ${uid})`).join(',');
    await pool.query(`INSERT INTO franchise_channel_members (channel_id, user_id) VALUES ${values} ON CONFLICT DO NOTHING`);
    res.status(200).json({ message: 'Membros adicionados.' });
  } catch (error) {
    console.error('Erro ao adicionar membros:', error);
    res.status(500).json({ message: 'Erro ao adicionar membros.' });
  }
};

// Remover membro do canal
export const removeChannelMember = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const channelId = parseInt(req.params.id);
    const userId = parseInt(req.params.userId);
    await pool.query('DELETE FROM franchise_channel_members WHERE channel_id = $1 AND user_id = $2', [channelId, userId]);
    res.status(200).json({ message: 'Membro removido.' });
  } catch (error) {
    console.error('Erro ao remover membro:', error);
    res.status(500).json({ message: 'Erro ao remover membro.' });
  }
};

// Deletar canal (apenas criador)
export const deleteFranchiseChannel = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const channelId = parseInt(req.params.id);
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }
    // Verifica se é o criador
    const result = await pool.query('SELECT created_by FROM franchise_channels WHERE id = $1', [channelId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Canal não encontrado.' });
    }
    if (result.rows[0].created_by !== req.user.id) {
      return res.status(403).json({ message: 'Apenas o criador pode deletar o canal.' });
    }
    await pool.query('DELETE FROM franchise_channels WHERE id = $1', [channelId]);
    res.status(200).json({ message: 'Canal deletado.' });
  } catch (error) {
    console.error('Erro ao deletar canal:', error);
    res.status(500).json({ message: 'Erro ao deletar canal.' });
  }
}; 