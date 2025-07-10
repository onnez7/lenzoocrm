import express from 'express';
import {
  getAllSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  cancelSubscription,
  reactivateSubscription,
  getAllPlans,
  createPlan,
  updatePlan,
  getSubscriptionMetrics,
  handleStripeWebhook,
  createCheckoutSession
} from '../controllers/subscriptionController';
import { authenticateToken, authorize } from '../middleware/authMiddleware';

const router = express.Router();

// Rotas protegidas por autenticação
router.use(authenticateToken);

// Rotas de assinaturas
router.get('/', authorize('SUPER_ADMIN', 'FRANCHISE_ADMIN'), getAllSubscriptions);
router.get('/metrics', authorize('SUPER_ADMIN', 'FRANCHISE_ADMIN'), getSubscriptionMetrics);
router.get('/:id', authorize('SUPER_ADMIN', 'FRANCHISE_ADMIN'), getSubscriptionById);
router.post('/', authorize('SUPER_ADMIN', 'FRANCHISE_ADMIN'), createSubscription);
router.put('/:id', authorize('SUPER_ADMIN', 'FRANCHISE_ADMIN'), updateSubscription);
router.post('/:id/cancel', authorize('SUPER_ADMIN', 'FRANCHISE_ADMIN'), cancelSubscription);
router.post('/:id/reactivate', authorize('SUPER_ADMIN', 'FRANCHISE_ADMIN'), reactivateSubscription);

// Rotas de planos
router.get('/plans/all', authorize('SUPER_ADMIN', 'FRANCHISE_ADMIN'), getAllPlans);
router.post('/plans', authorize('SUPER_ADMIN'), createPlan);
router.put('/plans/:id', authorize('SUPER_ADMIN'), updatePlan);

// Rota de checkout
router.post('/checkout', authorize('SUPER_ADMIN', 'FRANCHISE_ADMIN'), createCheckoutSession);


// Webhook do Stripe (não precisa de autenticação)
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

export default router; 