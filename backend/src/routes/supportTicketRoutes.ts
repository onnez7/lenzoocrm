import { Router } from 'express';
import { authenticateToken, authorize } from '../middleware/authMiddleware';
import {
  createTicket,
  getMyTickets,
  getAllTickets,
  getTicketById,
  addTicketMessage,
  getTicketMessages
} from '../controllers/supportTicketController';

const router = Router();

// Todas as rotas exigem autenticação
router.use(authenticateToken);

// Franqueado abre ticket
router.post('/tickets', authorize('FRANCHISE_ADMIN'), createTicket);

// Franqueado vê seus tickets
router.get('/tickets', authorize('FRANCHISE_ADMIN'), getMyTickets);

// Suporte vê todos os tickets
router.get('/tickets/all', authorize('SUPER_ADMIN'), getAllTickets);

// Detalhe de um ticket (acesso para ambos)
router.get('/tickets/:id', authorize('SUPER_ADMIN', 'FRANCHISE_ADMIN'), getTicketById);

// Mensagens do ticket
router.get('/tickets/:id/messages', authorize('SUPER_ADMIN', 'FRANCHISE_ADMIN'), getTicketMessages);
router.post('/tickets/:id/messages', authorize('SUPER_ADMIN', 'FRANCHISE_ADMIN'), addTicketMessage);

export default router; 