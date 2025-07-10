import { Router } from 'express';
import { authenticateToken, authorize } from '../middleware/authMiddleware';
import { 
  getAllEmployees, 
  createEmployee, 
  updateEmployee, 
  deleteEmployee, 
  getEmployeeById,
  getRoles
} from '../controllers/employeeController';

const router = Router();

// Rotas protegidas - apenas usuários autenticados
router.use(authenticateToken);

// Rotas para cargos (acessível por ambos) - DEVE VIR ANTES das rotas com parâmetros
router.get('/roles', getRoles);

// Rotas para FRANCHISE_ADMIN - gerenciar apenas funcionários da sua franquia
router.get('/franchise', authorize('FRANCHISE_ADMIN'), getAllEmployees);
router.post('/franchise', authorize('FRANCHISE_ADMIN'), createEmployee);
router.get('/franchise/:id', authorize('FRANCHISE_ADMIN'), getEmployeeById);
router.put('/franchise/:id', authorize('FRANCHISE_ADMIN'), updateEmployee);
router.delete('/franchise/:id', authorize('FRANCHISE_ADMIN'), deleteEmployee);

// Rotas para SUPER_ADMIN - acesso total
router.get('/', authorize('SUPER_ADMIN'), getAllEmployees);
router.post('/', authorize('SUPER_ADMIN'), createEmployee);
router.get('/:id', authorize('SUPER_ADMIN'), getEmployeeById);
router.put('/:id', authorize('SUPER_ADMIN'), updateEmployee);
router.delete('/:id', authorize('SUPER_ADMIN'), deleteEmployee);

export default router; 