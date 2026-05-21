import { Router } from 'express';
import { authenticateToken, authorize } from '../middleware/authMiddleware';
import * as adminController from '../controllers/adminController';

const router = Router();

// Todas as rotas requerem autenticação e autorização SUPER_ADMIN
router.use(authenticateToken);
router.use(authorize('SUPER_ADMIN'));

// Estatísticas gerais
router.get('/stats', adminController.getAdminStats);

// Dados de receita
router.get('/revenue', adminController.getRevenueData);

// Atividade recente
router.get('/activity', adminController.getRecentActivity);

// Top performers
router.get('/top-performers', adminController.getTopPerformers);

// Alertas críticos
router.get('/alerts', adminController.getCriticalAlerts);

// Métricas de franquia específica
router.get('/franchise/:id/metrics', adminController.getFranchiseMetrics);

export default router; 