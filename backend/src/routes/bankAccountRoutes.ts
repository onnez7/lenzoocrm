import { Router } from 'express';
import bankAccountController from '../controllers/bankAccountController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// GET /api/bank-accounts - Listar todas as contas bancárias
router.get('/', bankAccountController.getBankAccounts);

// GET /api/bank-accounts/:id - Buscar conta bancária por ID
router.get('/:id', bankAccountController.getBankAccountById);

// POST /api/bank-accounts - Criar nova conta bancária
router.post('/', bankAccountController.createBankAccount);

// PUT /api/bank-accounts/:id - Atualizar conta bancária
router.put('/:id', bankAccountController.updateBankAccount);

// DELETE /api/bank-accounts/:id - Deletar conta bancária
router.delete('/:id', bankAccountController.deleteBankAccount);

// PUT /api/bank-accounts/:id/balance - Atualizar saldo da conta
router.put('/:id/balance', bankAccountController.updateBalance);

export default router; 