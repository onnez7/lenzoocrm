import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import {
  getAllOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  moveOpportunityStage,
  deleteOpportunity
} from '../controllers/opportunityController';

const router = Router();

router.use(authenticateToken);

// Rota de debug para verificar autenticação
router.get('/debug', (req: any, res) => {
  console.log('=== DEBUG ROUTE ===');
  console.log('User:', req.user);
  console.log('Headers:', req.headers);
  res.json({
    message: 'Debug route working',
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

// Rota de teste simples
router.get('/test', (req: any, res) => {
  console.log('=== TEST ROUTE ===');
  console.log('User:', req.user);
  res.json({
    message: 'Test route working',
    opportunities: [],
    user: req.user
  });
});

// Rota de teste que simula getAllOpportunities
router.get('/test-query', async (req: any, res) => {
  console.log('=== TEST QUERY ROUTE ===');
  console.log('User:', req.user);
  
  try {
    // Simular exatamente o que getAllOpportunities faz
    let query = `SELECT o.*, c.name as client_name FROM opportunities o LEFT JOIN clients c ON o.client_id = c.id WHERE 1=1`;
    const params: any[] = [];
    let idx = 1;
    
    // Adicionar filtro de franquia se necessário
    if (req.user?.role === 'FRANCHISE_ADMIN' && req.user?.franchiseId) {
      query += ` AND c.franchise_id = $${idx++}`;
      params.push(req.user.franchiseId);
      console.log('Adicionando filtro de franquia:', req.user.franchiseId);
    }
    
    query += ` ORDER BY o.created_at DESC`;
    
    console.log('Executing test query:', query);
    console.log('Query params:', params);
    
    const db = require('../config/db').default;
    const result = await db.query(query, params);
    console.log('Test query result rows:', result.rows.length);
    
    res.json({
      message: 'Test query working',
      opportunities: result.rows,
      user: req.user,
      query: query,
      params: params
    });
  } catch (error) {
    console.error('Erro no test query:', error);
    res.status(500).json({ message: 'Erro no test query', error: error.message });
  }
});

router.get('/', getAllOpportunities);
router.get('/:id', getOpportunityById);
router.post('/', createOpportunity);
router.put('/:id', updateOpportunity);
router.patch('/:id/stage', moveOpportunityStage);
router.delete('/:id', deleteOpportunity);

export default router; 