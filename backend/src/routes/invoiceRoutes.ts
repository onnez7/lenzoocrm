import { Router } from 'express';
import invoiceController from '../controllers/invoiceController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// GET /api/invoices - Listar todas as notas fiscais
router.get('/', invoiceController.getInvoices);

// GET /api/invoices/stats - Buscar estatísticas
router.get('/stats', invoiceController.getInvoiceStats);

// GET /api/invoices/:id - Buscar nota fiscal por ID
router.get('/:id', invoiceController.getInvoiceById);

// POST /api/invoices - Criar nova nota fiscal
router.post('/', invoiceController.createInvoice);

// PUT /api/invoices/:id - Atualizar nota fiscal
router.put('/:id', invoiceController.updateInvoice);

// DELETE /api/invoices/:id - Deletar nota fiscal
router.delete('/:id', invoiceController.deleteInvoice);

// PUT /api/invoices/:id/paid - Marcar como paga
router.put('/:id/paid', invoiceController.markAsPaid);

export default router; 