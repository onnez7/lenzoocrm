import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import './config/db'; // Importa para inicializar a conexão com o DB
import apiRoutes from './routes'; // Importa o roteador principal

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';
app.use(cors({
  origin: allowedOrigin === '*' ? true : allowedOrigin,
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

// Servir arquivos estáticos (para avatars)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rota de healthcheck
app.get('/api/healthcheck', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    message: 'Servidor do LenzooCRM está funcionando!',
  });
});

// Usa as rotas da API sob o prefixo /api
app.use('/api', apiRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});