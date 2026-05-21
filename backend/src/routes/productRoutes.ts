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
router.get('/', authorize('SUPER_ADMIN'), getAllProducts);
router.post('/', authorize('SUPER_ADMIN'), createProduct);
router.get('/:id', authorize('SUPER_ADMIN'), getProductById);
router.put('/:id', authorize('SUPER_ADMIN'), updateProduct);
router.delete('/:id', authorize('SUPER_ADMIN'), deleteProduct);

// Rotas para FRANCHISE_ADMIN - gerenciar apenas produtos da sua franquia
router.get('/franchise/products', authorize('FRANCHISE_ADMIN'), getAllProducts);
router.post('/franchise/products', authorize('FRANCHISE_ADMIN'), createProduct);
router.get('/franchise/products/:id', authorize('FRANCHISE_ADMIN'), getProductById);
router.put('/franchise/products/:id', authorize('FRANCHISE_ADMIN'), updateProduct);
router.delete('/franchise/products/:id', authorize('FRANCHISE_ADMIN'), deleteProduct);

export default router; 