import { Router } from 'express';
import { authenticateToken, authorize } from '../middleware/authMiddleware';
import { 
  getAllProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '../controllers/productController';

const router = Router();

// Rotas protegidas - apenas usuários autenticados
router.use(authenticateToken);

// Rotas para SUPER_ADMIN - acesso total
router.get('/', authorize('SUPER_ADMIN', 'FRANCHISE_ADMIN', 'EMPLOYEE'), getAllProducts);
router.post('/', authorize('SUPER_ADMIN', 'FRANCHISE_ADMIN'), createProduct);
router.get('/:id', authorize('SUPER_ADMIN', 'FRANCHISE_ADMIN', 'EMPLOYEE'), getProductById);
router.put('/:id', authorize('SUPER_ADMIN', 'FRANCHISE_ADMIN'), updateProduct);
router.delete('/:id', authorize('SUPER_ADMIN', 'FRANCHISE_ADMIN'), deleteProduct);

export default router; 