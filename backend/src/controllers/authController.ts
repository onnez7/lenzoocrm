import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db';

const generateToken = (id: number, role: string, franchiseId: number | null) => {
  return jwt.sign({ id, role, franchiseId }, process.env.JWT_SECRET!, {
    expiresIn: '1d', // Token expira em 1 dia
  });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: 'Por favor, forneça email e senha.' });
    return;
  }

  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (user && (await bcrypt.compare(password, user.password_hash))) {
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        franchiseId: user.franchise_id,
        token: generateToken(user.id, user.role, user.franchise_id),
      });
      return;
    } else {
      res.status(401).json({ message: 'Email ou senha inválidos.' });
      return;
    }
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
    return;
  }
};

// Função para registrar um SUPER_ADMIN (apenas para setup inicial)
export const registerAdmin = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    return;
  }

  try {
    // Verificar se o email já existe
    const userExists = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      res.status(409).json({ message: 'Este email já está em uso.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newUserResult = await db.query(
      'INSERT INTO users (name, email, password_hash, role, franchise_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, franchise_id',
      [name, email, password_hash, 'SUPER_ADMIN', null]
    );

    res.status(201).json(newUserResult.rows[0]);
    return;
  } catch (error) {
    console.error('Erro ao registrar admin:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
    return;
  }
};

// Exemplo de rota protegida: SUPER_ADMIN cria um FRANCHISE_ADMIN
export const registerFranchiseAdmin = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, franchiseId } = req.body;

  if (!name || !email || !password || !franchiseId) {
    res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    return;
  }

  try {
    // Verificar se o email já existe
    const userExists = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      res.status(409).json({ message: 'Este email já está em uso.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newUserResult = await db.query(
      'INSERT INTO users (name, email, password_hash, role, franchise_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, franchise_id',
      [name, email, password_hash, 'FRANCHISE_ADMIN', franchiseId]
    );

    res.status(201).json(newUserResult.rows[0]);
    return;
  } catch (error) {
    console.error('Erro ao registrar admin de franquia:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
    return;
  }
};

// Rota para FRANCHISE_ADMIN criar um EMPLOYEE para sua própria franquia
export const registerEmployee = async (req: Request, res: Response): Promise<void> => {
  // O req.user é injetado pelo middleware 'protect' e contém os dados do admin logado
  const franchiseAdmin = req.user;

  // Verificação de segurança: o admin DEVE estar associado a uma franquia
  if (!franchiseAdmin || !franchiseAdmin.franchiseId) {
    res.status(403).json({ message: 'Ação não permitida. Administrador não associado a uma franquia.' });
    return;
  }

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ message: 'Nome, email e senha são obrigatórios.' });
    return;
  }

  try {
    const userExists = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      res.status(409).json({ message: 'Este email já está em uso.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newUserResult = await db.query(
      'INSERT INTO users (name, email, password_hash, role, franchise_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, franchise_id',
      [name, email, password_hash, 'EMPLOYEE', franchiseAdmin.franchiseId] // Usa o franchiseId do admin logado
    );

    res.status(201).json(newUserResult.rows[0]);
    return;
  } catch (error) {
    console.error('Erro ao registrar colaborador:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
    return;
  }
};