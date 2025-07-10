import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import {
  getFranchiseChannel,
  getChannelMessages,
  sendChannelMessage,
  createFranchiseChannel,
  getMyFranchiseChannels,
  addChannelMembers,
  removeChannelMember,
  deleteFranchiseChannel
} from '../controllers/franchiseChatController';

const router = Router();

router.use(authenticateToken);

// Obter canal da franquia do usuário (cria se não existir)
router.get('/franchise-channel', getFranchiseChannel);

// Listar mensagens do canal
router.get('/franchise-channels/:id/messages', getChannelMessages);

// Enviar mensagem para o canal
router.post('/franchise-channels/:id/messages', sendChannelMessage);

// Criar canal privado
router.post('/franchise-channels', createFranchiseChannel);

// Listar canais do usuário
router.get('/franchise-channels', getMyFranchiseChannels);

// Adicionar membros
router.post('/franchise-channels/:id/members', addChannelMembers);

// Remover membro
router.delete('/franchise-channels/:id/members/:userId', removeChannelMember);

// Deletar canal
router.delete('/franchise-channels/:id', deleteFranchiseChannel);

export default router; 