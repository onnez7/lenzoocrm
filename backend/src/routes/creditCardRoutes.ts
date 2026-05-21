import { Router } from 'express';
import creditCardController from '../controllers/creditCardController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// GET /api/credit-cards - Listar todos os cartões
router.get('/', creditCardController.getCreditCards);

// GET /api/credit-cards/:id - Buscar cartão por ID
router.get('/:id', creditCardController.getCreditCardById);

// POST /api/credit-cards - Criar novo cartão
router.post('/', creditCardController.createCreditCard);

// PUT /api/credit-cards/:id - Atualizar cartão
router.put('/:id', creditCardController.updateCreditCard);

// DELETE /api/credit-cards/:id - Deletar cartão
router.delete('/:id', creditCardController.deleteCreditCard);

// PUT /api/credit-cards/:id/limit - Atualizar limite disponível
router.put('/:id/limit', creditCardController.updateAvailableLimit);

export default router; 