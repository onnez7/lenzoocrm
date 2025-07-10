import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getAppointmentsByDate,
  getAppointmentsByEmployee
} from '../controllers/appointmentController';

const router = Router();

// Todas as rotas são protegidas
router.use(authenticateToken);

// Rotas específicas primeiro!
router.get('/date/:date', getAppointmentsByDate);
router.get('/employee/:employeeId', getAppointmentsByEmployee);

// Rotas principais
router.get('/', getAppointments);
router.get('/:id', getAppointmentById);
router.post('/', createAppointment);
router.put('/:id', updateAppointment);
router.delete('/:id', deleteAppointment);

export default router; 