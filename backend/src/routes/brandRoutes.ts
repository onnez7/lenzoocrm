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

// Rotas para SUPER_ADMIN - acesso total
router.get('/', authorize('SUPER_ADMIN'), getAllBrands);
router.post('/', authorize('SUPER_ADMIN'), createBrand);
router.get('/:id', authorize('SUPER_ADMIN'), getBrandById);
router.put('/:id', authorize('SUPER_ADMIN'), updateBrand);
router.delete('/:id', authorize('SUPER_ADMIN'), deleteBrand);

// Rotas para FRANCHISE_ADMIN - gerenciar apenas marcas da sua franquia
router.get('/franchise/brands', authorize('FRANCHISE_ADMIN'), getAllBrands);
router.post('/franchise/brands', authorize('FRANCHISE_ADMIN'), createBrand);
router.get('/franchise/brands/:id', authorize('FRANCHISE_ADMIN'), getBrandById);
router.put('/franchise/brands/:id', authorize('FRANCHISE_ADMIN'), updateBrand);
router.delete('/franchise/brands/:id', authorize('FRANCHISE_ADMIN'), deleteBrand);

export default router; 