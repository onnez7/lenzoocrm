import { Router } from 'express';
import payableController from '../controllers/payableController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// GET /api/payables - Listar todas as contas a pagar
router.get('/', payableController.getPayables);

// GET /api/payables/stats - Buscar estatísticas
router.get('/stats', payableController.getPayableStats);

// GET /api/payables/:id - Buscar conta a pagar por ID
router.get('/:id', payableController.getPayableById);

// POST /api/payables - Criar nova conta a pagar
router.post('/', payableController.createPayable);

// PUT /api/payables/:id - Atualizar conta a pagar
router.put('/:id', payableController.updatePayable);

// DELETE /api/payables/:id - Deletar conta a pagar
router.delete('/:id', payableController.deletePayable);

// PUT /api/payables/:id/paid - Marcar como paga
router.put('/:id/paid', payableController.markAsPaid);

export default router; 