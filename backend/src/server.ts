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
app.use(cors()); // Habilita o CORS para todas as origens
app.use(express.json()); // Habilita o parsing de JSON no corpo das requisições

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