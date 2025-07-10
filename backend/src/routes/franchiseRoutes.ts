import { Router } from 'express';
import { authenticateToken, authorize } from '../middleware/authMiddleware';
import * as franchiseController from '../controllers/franchiseController';

const router = Router();

// Rotas protegidas - apenas usuários autenticados
router.use(authenticateToken);

// Rotas para SUPER_ADMIN - acesso total às franquias
router.get('/', authorize('SUPER_ADMIN'), franchiseController.getAllFranchises);
router.post('/', authorize('SUPER_ADMIN'), franchiseController.createFranchise);
router.get('/:id', authorize('SUPER_ADMIN'), franchiseController.getFranchiseById);
router.put('/:id', authorize('SUPER_ADMIN'), franchiseController.updateFranchise);
router.delete('/:id', authorize('SUPER_ADMIN'), franchiseController.deleteFranchise);
router.get('/:id/members', franchiseController.getFranchiseMembers);

export default router; 