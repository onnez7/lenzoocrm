import { Request, Response } from 'express';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: 'SUPER_ADMIN' | 'FRANCHISE_ADMIN' | 'EMPLOYEE';
    franchiseId: number | null;
  };
}

// Configuração do multer para upload de avatar
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/avatars';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas'));
    }
  }
});

// Buscar perfil do usuário
export const getUserProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    const result = await pool.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.phone,
        u.role,
        u.franchise_id,
        u.avatar,
        u.bio,
        u.address,
        u.last_login,
        u.is_active,
        f.name as franchise_name
      FROM users u
      LEFT JOIN franchises f ON u.franchise_id = f.id
      WHERE u.id = $1
    `, [req.user.id]);

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Usuário não encontrado' });
      return;
    }

    const user = result.rows[0];
    
    // Parse do endereço se existir
    if (user.address && typeof user.address === 'string') {
      try {
        user.address = JSON.parse(user.address);
      } catch (e) {
        user.address = null;
      }
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Erro ao buscar perfil do usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Atualizar perfil do usuário
export const updateUserProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    const { name, email, phone, bio, address } = req.body;

    // Verificar se o email já existe (exceto para o usuário atual)
    if (email) {
      const emailCheck = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, req.user.id]
      );
      
      if (emailCheck.rows.length > 0) {
        res.status(400).json({ message: 'Este email já está em uso' });
        return;
      }
    }

    // Preparar dados para atualização
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updateFields.push(`name = $${paramIndex++}`);
      updateValues.push(name);
    }

    if (email !== undefined) {
      updateFields.push(`email = $${paramIndex++}`);
      updateValues.push(email);
    }

    if (phone !== undefined) {
      updateFields.push(`phone = $${paramIndex++}`);
      updateValues.push(phone);
    }

    if (bio !== undefined) {
      updateFields.push(`bio = $${paramIndex++}`);
      updateValues.push(bio);
    }

    if (address !== undefined) {
      updateFields.push(`address = $${paramIndex++}`);
      updateValues.push(JSON.stringify(address));
    }

    if (updateFields.length === 0) {
      res.status(400).json({ message: 'Nenhum campo válido fornecido para atualização' });
      return;
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(req.user.id);

    const query = `
      UPDATE users 
      SET ${updateFields.join(', ')} 
      WHERE id = $${paramIndex} 
      RETURNING *
    `;

    const result = await pool.query(query, updateValues);

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar perfil do usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Buscar configurações do usuário
export const getUserSettings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    const result = await pool.query(`
      SELECT settings FROM user_settings WHERE user_id = $1
    `, [req.user.id]);

    if (result.rows.length === 0) {
      // Retornar configurações padrão se não existirem
      const defaultSettings = {
        theme: "system",
        language: "pt-BR",
        notifications: {
          email: true,
          push: true,
          sms: false,
          appointments: true,
          sales: true,
          stock: true,
          system: false
        },
        privacy: {
          profileVisible: true,
          activityVisible: false,
          onlineStatus: true
        },
        security: {
          twoFactorEnabled: false,
          sessionTimeout: 30,
          loginNotifications: true
        }
      };

      res.status(200).json(defaultSettings);
      return;
    }

    const settings = result.rows[0].settings;
    res.status(200).json(settings);
  } catch (error) {
    console.error('Erro ao buscar configurações do usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Atualizar configurações do usuário
export const updateUserSettings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    const settings = req.body;

    // Verificar se já existem configurações
    const existingSettings = await pool.query(
      'SELECT id FROM user_settings WHERE user_id = $1',
      [req.user.id]
    );

    if (existingSettings.rows.length > 0) {
      // Atualizar configurações existentes
      await pool.query(
        'UPDATE user_settings SET settings = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2',
        [JSON.stringify(settings), req.user.id]
      );
    } else {
      // Criar novas configurações
      await pool.query(
        'INSERT INTO user_settings (user_id, settings) VALUES ($1, $2)',
        [req.user.id, JSON.stringify(settings)]
      );
    }

    res.status(200).json(settings);
  } catch (error) {
    console.error('Erro ao atualizar configurações do usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Alterar senha
export const changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: 'Senha atual e nova senha são obrigatórias' });
      return;
    }

    // Buscar senha atual do usuário
    const userResult = await pool.query(
      'SELECT password FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      res.status(404).json({ message: 'Usuário não encontrado' });
      return;
    }

    // Verificar senha atual
    const isValidPassword = await bcrypt.compare(currentPassword, userResult.rows[0].password);
    
    if (!isValidPassword) {
      res.status(400).json({ message: 'Senha atual incorreta' });
      return;
    }

    // Criptografar nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualizar senha
    await pool.query(
      'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedPassword, req.user.id]
    );

    res.status(200).json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Upload de avatar
export const uploadAvatar = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: 'Nenhum arquivo enviado' });
      return;
    }

    // Gerar URL do avatar
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // Atualizar avatar no banco
    await pool.query(
      'UPDATE users SET avatar = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [avatarUrl, req.user.id]
    );

    res.status(200).json({ avatarUrl });
  } catch (error) {
    console.error('Erro ao fazer upload do avatar:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Middleware para upload de avatar
export const uploadAvatarMiddleware = upload.single('avatar');

// Buscar todos os usuários (apenas para SUPER_ADMIN)
export const getAllUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        u.franchise_id,
        u.is_active,
        u.created_at,
        f.name as franchise_name
      FROM users u
      LEFT JOIN franchises f ON u.franchise_id = f.id
      ORDER BY u.created_at DESC
    `);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Buscar usuário por ID
export const getUserById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);

    const result = await pool.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        u.franchise_id,
        u.is_active,
        u.created_at,
        f.name as franchise_name
      FROM users u
      LEFT JOIN franchises f ON u.franchise_id = f.id
      WHERE u.id = $1
    `, [userId]);

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Usuário não encontrado' });
      return;
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Criar usuário
export const createUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, franchise_id } = req.body;

    if (!name || !email || !password || !role) {
      res.status(400).json({ message: 'Nome, email, senha e papel são obrigatórios' });
      return;
    }

    // Verificar se email já existe
    const emailCheck = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) {
      res.status(400).json({ message: 'Este email já está em uso' });
      return;
    }

    // Criptografar senha
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, franchise_id) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, franchise_id`,
      [name, email, hashedPassword, role, franchise_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Atualizar usuário
export const updateUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);
    const { name, email, role, franchise_id, is_active } = req.body;

    // Verificar se email já existe (exceto para o usuário atual)
    if (email) {
      const emailCheck = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, userId]
      );
      
      if (emailCheck.rows.length > 0) {
        res.status(400).json({ message: 'Este email já está em uso' });
        return;
      }
    }

    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updateFields.push(`name = $${paramIndex++}`);
      updateValues.push(name);
    }

    if (email !== undefined) {
      updateFields.push(`email = $${paramIndex++}`);
      updateValues.push(email);
    }

    if (role !== undefined) {
      updateFields.push(`role = $${paramIndex++}`);
      updateValues.push(role);
    }

    if (franchise_id !== undefined) {
      updateFields.push(`franchise_id = $${paramIndex++}`);
      updateValues.push(franchise_id);
    }

    if (is_active !== undefined) {
      updateFields.push(`is_active = $${paramIndex++}`);
      updateValues.push(is_active);
    }

    if (updateFields.length === 0) {
      res.status(400).json({ message: 'Nenhum campo válido fornecido para atualização' });
      return;
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(userId);

    const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await pool.query(query, updateValues);

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Usuário não encontrado' });
      return;
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Deletar usuário
export const deleteUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);

    // Verificar se usuário existe
    const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0) {
      res.status(404).json({ message: 'Usuário não encontrado' });
      return;
    }

    await pool.query('DELETE FROM users WHERE id = $1', [userId]);

    res.status(200).json({ message: 'Usuário deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
}; 