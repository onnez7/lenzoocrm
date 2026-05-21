import { Router } from 'express';
import receivableController from '../controllers/receivableController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// GET /api/receivables - Listar todas as contas a receber
router.get('/', receivableController.getReceivables);

// GET /api/receivables/stats - Buscar estatísticas
router.get('/stats', receivableController.getReceivableStats);

// GET /api/receivables/clients - Buscar clientes para formulário
router.get('/clients', receivableController.getClients);

// GET /api/receivables/client/:clientId/installments - Buscar parcelas pendentes do cliente
router.get('/client/:clientId/installments', receivableController.getClientInstallments);

// GET /api/receivables/:id - Buscar conta a receber por ID
router.get('/:id', receivableController.getReceivableById);

// POST /api/receivables - Criar nova conta a receber
router.post('/', receivableController.createReceivable);

// PUT /api/receivables/:id - Atualizar conta a receber
router.put('/:id', receivableController.updateReceivable);

// DELETE /api/receivables/:id - Deletar conta a receber
router.delete('/:id', receivableController.deleteReceivable);

// PUT /api/receivables/:id/paid - Marcar como paga
router.put('/:id/paid', receivableController.markAsPaid);

export default router; 