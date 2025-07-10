import { Router } from 'express';
import { authenticateToken, authorize } from '../middleware/authMiddleware';
import { 
  getAllUsers, 
  createUser, 
  updateUser, 
  deleteUser, 
  getUserById,
  getUserProfile,
  updateUserProfile,
  getUserSettings,
  updateUserSettings,
  changePassword,
  uploadAvatar,
  uploadAvatarMiddleware
} from '../controllers/userController';

const router = Router();

// Rotas protegidas - apenas usuários autenticados
router.use(authenticateToken);

// Rotas de perfil e configurações (acessível por todos os usuários autenticados)
router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.get('/settings', getUserSettings);
router.put('/settings', updateUserSettings);
router.post('/change-password', changePassword);
router.post('/avatar', uploadAvatarMiddleware, uploadAvatar);

// Rotas para SUPER_ADMIN - acesso total
router.get('/', authorize('SUPER_ADMIN'), getAllUsers);
router.post('/', authorize('SUPER_ADMIN'), createUser);
router.get('/:id', authorize('SUPER_ADMIN'), getUserById);
router.put('/:id', authorize('SUPER_ADMIN'), updateUser);
router.delete('/:id', authorize('SUPER_ADMIN'), deleteUser);

// Rotas para FRANCHISE_ADMIN - gerenciar apenas usuários da sua franquia
router.get('/franchise', authorize('FRANCHISE_ADMIN'), getAllUsers);
router.post('/franchise', authorize('FRANCHISE_ADMIN'), createUser);
router.get('/franchise/:id', authorize('FRANCHISE_ADMIN'), getUserById);
router.put('/franchise/:id', authorize('FRANCHISE_ADMIN'), updateUser);
router.delete('/franchise/:id', authorize('FRANCHISE_ADMIN'), deleteUser);

export default router; 