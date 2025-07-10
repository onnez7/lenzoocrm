import { Router } from 'express';
import { authenticateToken, authorize } from '../middleware/authMiddleware';
import { 
  getAllSales, 
  createSale, 
  updateSale, 
  deleteSale, 
  getSaleById 
} from '../controllers/saleController';

const router = Router();

// Rotas protegidas - apenas usuários autenticados
router.use(authenticateToken);

// Rotas para SUPER_ADMIN - acesso total
router.get('/sales', authorize('SUPER_ADMIN'), getAllSales);
router.post('/sales', authorize('SUPER_ADMIN'), createSale);
router.get('/sales/:id', authorize('SUPER_ADMIN'), getSaleById);
router.put('/sales/:id', authorize('SUPER_ADMIN'), updateSale);
router.delete('/sales/:id', authorize('SUPER_ADMIN'), deleteSale);

// Rotas para FRANCHISE_ADMIN - gerenciar apenas vendas da sua franquia
router.get('/franchise/sales', authorize('FRANCHISE_ADMIN'), getAllSales);
router.post('/franchise/sales', authorize('FRANCHISE_ADMIN'), createSale);
router.get('/franchise/sales/:id', authorize('FRANCHISE_ADMIN'), getSaleById);
router.put('/franchise/sales/:id', authorize('FRANCHISE_ADMIN'), updateSale);
router.delete('/franchise/sales/:id', authorize('FRANCHISE_ADMIN'), deleteSale);

export default router; 