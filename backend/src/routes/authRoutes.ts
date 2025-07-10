import { Router } from 'express';
import { authenticateToken, authorize } from '../middleware/authMiddleware';
import { login, registerFranchiseAdmin, registerEmployee } from '../controllers/authController';

const router = Router();

router.post('/login', login);
router.post('/users/franchise-admin', authenticateToken, authorize('SUPER_ADMIN'), registerFranchiseAdmin);
router.post('/users/employee', authenticateToken, authorize('FRANCHISE_ADMIN'), registerEmployee);

export default router;