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

router.get('/', authorize('SUPER_ADMIN', 'FRANCHISE_ADMIN', 'EMPLOYEE'), getAllCategories);
router.post('/', authorize('SUPER_ADMIN', 'FRANCHISE_ADMIN'), createCategory);
router.get('/:id', authorize('SUPER_ADMIN', 'FRANCHISE_ADMIN', 'EMPLOYEE'), getCategoryById);
router.put('/:id', authorize('SUPER_ADMIN', 'FRANCHISE_ADMIN'), updateCategory);
router.delete('/:id', authorize('SUPER_ADMIN', 'FRANCHISE_ADMIN'), deleteCategory);

export default router; 