import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticateToken, authorize } from '../middleware/authMiddleware';
import { login, registerFranchiseAdmin, registerEmployee } from '../controllers/authController';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', loginLimiter, login);
router.post('/users/franchise-admin', authenticateToken, authorize('SUPER_ADMIN'), registerFranchiseAdmin);
router.post('/users/employee', authenticateToken, authorize('FRANCHISE_ADMIN'), registerEmployee);

export default router;