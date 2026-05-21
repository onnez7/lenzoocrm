import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { 
  getAllOrders, 
  getOrderById, 
  createOrder, 
  updateOrder, 
  updateOrderStatus, 
  deleteOrder,
  finalizeOrder,
  getOrderStats
} from '../controllers/orderController';

const router = Router();

router.use(authenticateToken);

// Estatísticas de vendas
router.get('/stats', getOrderStats);

// Listar todas as ordens de serviço
router.get('/', getAllOrders);

// Buscar ordem por ID
router.get('/:id', getOrderById);

// Criar nova ordem de serviço
router.post('/', createOrder);

// Atualizar ordem de serviço
router.put('/:id', updateOrder);

// Atualizar status da ordem
router.patch('/:id/status', updateOrderStatus);

// Finalizar ordem (apenas no caixa)
router.post('/:id/finalize', finalizeOrder);

// Deletar ordem de serviço
router.delete('/:id', deleteOrder);

export default router; 