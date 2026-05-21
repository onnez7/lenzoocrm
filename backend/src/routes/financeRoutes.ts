import { Router } from 'express';
import financeController from '../controllers/financeController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// GET /api/finance/stats - Estatísticas financeiras gerais
router.get('/stats', financeController.getFinancialStats);

// GET /api/finance/monthly - Dados mensais para gráficos
router.get('/monthly', financeController.getMonthlyData);

// GET /api/finance/categories - Dados por categoria
router.get('/categories', financeController.getCategoryData);

// GET /api/finance/payment-methods - Métodos de pagamento
router.get('/payment-methods', financeController.getPaymentMethodsData);

export default router; 