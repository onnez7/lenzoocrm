import { Router } from 'express';
import { authenticateToken, authorize } from '../middleware/authMiddleware';
import { 
  getAllCategories, 
  getCategoryById, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '../controllers/categoryController';

const router = Router();

// Rotas protegidas - apenas usuários autenticados
router.use(authenticateToken);

// Rotas para SUPER_ADMIN - acesso total
router.get('/', authorize('SUPER_ADMIN'), getAllCategories);
router.post('/', authorize('SUPER_ADMIN'), createCategory);
router.get('/:id', authorize('SUPER_ADMIN'), getCategoryById);
router.put('/:id', authorize('SUPER_ADMIN'), updateCategory);
router.delete('/:id', authorize('SUPER_ADMIN'), deleteCategory);

// Rotas para FRANCHISE_ADMIN - gerenciar apenas categorias da sua franquia
router.get('/franchise/categories', authorize('FRANCHISE_ADMIN'), getAllCategories);
router.post('/franchise/categories', authorize('FRANCHISE_ADMIN'), createCategory);
router.get('/franchise/categories/:id', authorize('FRANCHISE_ADMIN'), getCategoryById);
router.put('/franchise/categories/:id', authorize('FRANCHISE_ADMIN'), updateCategory);
router.delete('/franchise/categories/:id', authorize('FRANCHISE_ADMIN'), deleteCategory);

export default router; 