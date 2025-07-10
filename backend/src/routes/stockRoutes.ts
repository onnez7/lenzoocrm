import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import {
  registerStockMovement,
  listStockMovements,
  getStockMovementById
} from '../controllers/stockController';

const router = Router();

router.use(authenticateToken);

// Registrar movimentação
router.post('/stock/movements', registerStockMovement);
// Listar histórico
router.get('/stock/movements', listStockMovements);
// Detalhe de movimentação
router.get('/stock/movements/:id', getStockMovementById);

export default router; 