import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { 
  getOpenCashierSession,
  openCashierSession,
  closeCashierSession,
  getCashierHistory,
  registerSangria,
  getSangrias,
  getAllSangrias
} from '../controllers/cashierController';

const router = Router();

router.use(authenticateToken);

// Buscar sessão de caixa aberta
router.get('/open-session', getOpenCashierSession);

// Abrir caixa
router.post('/open', openCashierSession);

// Fechar caixa
router.post('/close', closeCashierSession);

// Buscar histórico
router.get('/history', getCashierHistory);

// Registrar sangria
router.post('/sangria', registerSangria);

// Buscar sangrias de uma sessão
router.get('/sessions/:sessionId/sangrias', getSangrias);

// Buscar todas as sangrias da franquia
router.get('/sangrias', getAllSangrias);

export default router; 