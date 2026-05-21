import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import {
  getOpportunityActivities,
  getActivityById,
  createActivity,
  updateActivity,
  updateActivityStatus,
  deleteActivity
} from '../controllers/opportunityActivityController';

const router = Router();

router.use(authenticateToken);

// Rotas para atividades de uma oportunidade específica
router.get('/opportunities/:opportunityId/activities', getOpportunityActivities);
router.post('/opportunities/:opportunityId/activities', createActivity);

// Rotas para uma atividade específica
router.get('/activities/:id', getActivityById);
router.put('/activities/:id', updateActivity);
router.patch('/activities/:id/status', updateActivityStatus);
router.delete('/activities/:id', deleteActivity);

export default router; 