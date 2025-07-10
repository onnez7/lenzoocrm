import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import {
  getAllClientPayments,
  getClientPaymentById,
  createClientPayment,
  updateClientPaymentStatus
} from '../controllers/clientPaymentController';

const router = Router();

router.use(authenticateToken);

router.get('/', getAllClientPayments);
router.get('/:id', getClientPaymentById);
router.post('/', createClientPayment);
router.patch('/:id/status', updateClientPaymentStatus);

export default router; 