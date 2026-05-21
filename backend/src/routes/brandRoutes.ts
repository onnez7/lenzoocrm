import { Router } from 'express';
import { authenticateToken, authorize } from '../middleware/authMiddleware';
import { 
  getAllBrands, 
  getBrandById, 
  createBrand, 
  updateBrand, 
  deleteBrand 
} from '../controllers/brandController';

const router = Router();

// Rotas protegidas - apenas usuários autenticados
router.use(authenticateToken);

router.get('/', authorize('SUPER_ADMIN', 'FRANCHISE_ADMIN', 'EMPLOYEE'), getAllBrands);
router.post('/', authorize('SUPER_ADMIN', 'FRANCHISE_ADMIN'), createBrand);
router.get('/:id', authorize('SUPER_ADMIN', 'FRANCHISE_ADMIN', 'EMPLOYEE'), getBrandById);
router.put('/:id', authorize('SUPER_ADMIN', 'FRANCHISE_ADMIN'), updateBrand);
router.delete('/:id', authorize('SUPER_ADMIN', 'FRANCHISE_ADMIN'), deleteBrand);

export default router; 