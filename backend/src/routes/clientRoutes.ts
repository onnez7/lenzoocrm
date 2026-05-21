import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient
} from '../controllers/clientController';

const router = Router();

// Todas as rotas de clientes requerem autenticação
router.use(authenticateToken);

// Rotas
router.get('/', getAllClients);
router.post('/', createClient);
router.get('/:id', getClientById);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);

export default router;