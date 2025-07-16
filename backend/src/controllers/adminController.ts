import { Request, Response } from 'express';
import db from '../config/db';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: 'SUPER_ADMIN' | 'FRANCHISE_ADMIN' | 'EMPLOYEE';
    franchiseId: number | null;
  };
}

// Estatísticas gerais do sistema (apenas SUPER_ADMIN)
export const getAdminStats = async (req: AuthenticatedRequest, res: Response) => {
  const { role } = req.user!;

  if (role !== 'SUPER_ADMIN') {
    return res.status(403).json({ message: 'Acesso negado. Apenas SUPER_ADMIN pode acessar estas estatísticas.' });
  }

  try {
    // Total de franquias
    const franchisesResult = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active
      FROM franchises
    `);

    // Total de usuários
    const usersResult = await db.query(`
      SELECT COUNT(*) as total FROM users
    `);

    // Total de produtos
    const productsResult = await db.query(`
      SELECT COUNT(*) as total FROM products
    `);

    // Total de vendas e receita
    const salesResult = await db.query(`
      SELECT 
        COUNT(*) as total_sales,
        COALESCE(SUM(total_amount), 0) as total_revenue
      FROM sales
    `);

    // Receita do mês atual
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const monthlyRevenueResult = await db.query(`
      SELECT COALESCE(SUM(total_amount), 0) as monthly_revenue
      FROM sales
      WHERE EXTRACT(MONTH FROM created_at) = $1 
      AND EXTRACT(YEAR FROM created_at) = $2
    `, [currentMonth, currentYear]);

    // Contas a receber pendentes
    const receivablesResult = await db.query(`
      SELECT 
        COUNT(*) as pending_count,
        COALESCE(SUM(amount), 0) as pending_amount
      FROM receivables
      WHERE status = 'pending'
    `);

    // Contas a pagar pendentes
    const payablesResult = await db.query(`
      SELECT 
        COUNT(*) as pending_count,
        COALESCE(SUM(amount), 0) as pending_amount
      FROM payables
      WHERE status = 'pending'
    `);

    const stats = {
      totalFranchises: parseInt(franchisesResult.rows[0].total),
      activeFranchises: parseInt(franchisesResult.rows[0].active),
      totalUsers: parseInt(usersResult.rows[0].total),
      totalProducts: parseInt(productsResult.rows[0].total),
      totalSales: parseInt(salesResult.rows[0].total_sales),
      totalRevenue: parseFloat(salesResult.rows[0].total_revenue || 0),
      monthlyRevenue: parseFloat(monthlyRevenueResult.rows[0].monthly_revenue || 0),
      pendingReceivables: parseFloat(receivablesResult.rows[0].pending_amount || 0),
      pendingPayables: parseFloat(payablesResult.rows[0].pending_amount || 0)
    };

    return res.status(200).json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas admin:', error);
    return res.status(500).json({ message: 'Erro interno do servidor ao buscar estatísticas.' });
  }
};

// Dados de receita mensal (últimos 6 meses)
export const getRevenueData = async (req: AuthenticatedRequest, res: Response) => {
  const { role } = req.user!;

  if (role !== 'SUPER_ADMIN') {
    return res.status(403).json({ message: 'Acesso negado. Apenas SUPER_ADMIN pode acessar estes dados.' });
  }

  try {
    const result = await db.query(`
      SELECT 
        TO_CHAR(DATE_TRUNC('month', created_at), 'Mon') as month,
        COALESCE(SUM(total_amount), 0) as revenue,
        COUNT(DISTINCT franchise_id) as franchises
      FROM sales
      WHERE created_at >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at) ASC
    `);

    const revenueData = result.rows.map(row => ({
      month: row.month,
      revenue: parseFloat(row.revenue || 0),
      franchises: parseInt(row.franchises || 0)
    }));

    return res.status(200).json(revenueData);
  } catch (error) {
    console.error('Erro ao buscar dados de receita:', error);
    return res.status(500).json({ message: 'Erro interno do servidor ao buscar dados de receita.' });
  }
};

// Atividade recente
export const getRecentActivity = async (req: AuthenticatedRequest, res: Response) => {
  const { role } = req.user!;

  if (role !== 'SUPER_ADMIN') {
    return res.status(403).json({ message: 'Acesso negado. Apenas SUPER_ADMIN pode acessar estes dados.' });
  }

  try {
    // Últimas vendas
    const salesResult = await db.query(`
      SELECT 
        s.id,
        s.total_amount,
        s.created_at,
        c.name as client_name,
        f.name as franchise_name,
        u.name as user_name
      FROM sales s
      LEFT JOIN clients c ON s.client_id = c.id
      LEFT JOIN franchises f ON s.franchise_id = f.id
      LEFT JOIN users u ON s.user_id = u.id
      ORDER BY s.created_at DESC
      LIMIT 10
    `);

    // Últimos usuários criados
    const usersResult = await db.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        u.created_at,
        f.name as franchise_name
      FROM users u
      LEFT JOIN franchises f ON u.franchise_id = f.id
      ORDER BY u.created_at DESC
      LIMIT 5
    `);

    // Últimos produtos criados
    const productsResult = await db.query(`
      SELECT 
        p.id,
        p.name,
        p.price,
        p.created_at,
        f.name as franchise_name
      FROM products p
      LEFT JOIN franchises f ON p.franchise_id = f.id
      ORDER BY p.created_at DESC
      LIMIT 5
    `);

    const activity = [
      ...salesResult.rows.map(sale => ({
        type: 'sale',
        id: sale.id,
        title: `Venda de R$ ${parseFloat(sale.total_amount).toFixed(2)}`,
        description: `Cliente: ${sale.client_name || 'N/A'} | Franquia: ${sale.franchise_name || 'N/A'}`,
        user: sale.user_name,
        date: sale.created_at,
        amount: parseFloat(sale.total_amount)
      })),
      ...usersResult.rows.map(user => ({
        type: 'user',
        id: user.id,
        title: `Novo usuário: ${user.name}`,
        description: `${user.role} | ${user.franchise_name || 'Matriz'}`,
        user: user.email,
        date: user.created_at
      })),
      ...productsResult.rows.map(product => ({
        type: 'product',
        id: product.id,
        title: `Novo produto: ${product.name}`,
        description: `R$ ${parseFloat(product.price).toFixed(2)} | ${product.franchise_name || 'N/A'}`,
        user: 'Sistema',
        date: product.created_at,
        amount: parseFloat(product.price)
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
     .slice(0, 15);

    return res.status(200).json(activity);
  } catch (error) {
    console.error('Erro ao buscar atividade recente:', error);
    return res.status(500).json({ message: 'Erro interno do servidor ao buscar atividade recente.' });
  }
};

// Top performers (franquias com mais vendas)
export const getTopPerformers = async (req: AuthenticatedRequest, res: Response) => {
  const { role } = req.user!;

  if (role !== 'SUPER_ADMIN') {
    return res.status(403).json({ message: 'Acesso negado. Apenas SUPER_ADMIN pode acessar estes dados.' });
  }

  try {
    const result = await db.query(`
      SELECT 
        f.id,
        f.name as franchise_name,
        COUNT(s.id) as total_sales,
        COALESCE(SUM(s.total_amount), 0) as total_revenue,
        COUNT(DISTINCT u.id) as total_users,
        COUNT(DISTINCT p.id) as total_products
      FROM franchises f
      LEFT JOIN sales s ON f.id = s.franchise_id
      LEFT JOIN users u ON f.id = u.franchise_id
      LEFT JOIN products p ON f.id = p.franchise_id
      WHERE f.status = 'active'
      GROUP BY f.id, f.name
      ORDER BY total_revenue DESC
      LIMIT 5
    `);

    const performers = result.rows.map(row => ({
      id: row.id,
      name: row.franchise_name,
      sales: parseInt(row.total_sales || 0),
      revenue: parseFloat(row.total_revenue || 0),
      users: parseInt(row.total_users || 0),
      products: parseInt(row.total_products || 0)
    }));

    return res.status(200).json(performers);
  } catch (error) {
    console.error('Erro ao buscar top performers:', error);
    return res.status(500).json({ message: 'Erro interno do servidor ao buscar top performers.' });
  }
};

// Alertas críticos
export const getCriticalAlerts = async (req: AuthenticatedRequest, res: Response) => {
  const { role } = req.user!;

  if (role !== 'SUPER_ADMIN') {
    return res.status(403).json({ message: 'Acesso negado. Apenas SUPER_ADMIN pode acessar estes dados.' });
  }

  try {
    const alerts = [];

    // Franquias inativas
    const inactiveFranchises = await db.query(`
      SELECT id, name FROM franchises WHERE status = 'inactive'
    `);
    if (inactiveFranchises.rows.length > 0) {
      alerts.push({
        type: 'warning',
        title: 'Franquias Inativas',
        description: `${inactiveFranchises.rows.length} franquia(s) inativa(s)`,
        count: inactiveFranchises.rows.length,
        data: inactiveFranchises.rows
      });
    }

    // Contas a receber vencidas
    const overdueReceivables = await db.query(`
      SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total
      FROM receivables 
      WHERE status = 'overdue'
    `);
    if (parseInt(overdueReceivables.rows[0].count) > 0) {
      alerts.push({
        type: 'danger',
        title: 'Contas a Receber Vencidas',
        description: `${overdueReceivables.rows[0].count} conta(s) vencida(s)`,
        count: parseInt(overdueReceivables.rows[0].count),
        amount: parseFloat(overdueReceivables.rows[0].total)
      });
    }

    // Contas a pagar vencidas
    const overduePayables = await db.query(`
      SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total
      FROM payables 
      WHERE status = 'overdue'
    `);
    if (parseInt(overduePayables.rows[0].count) > 0) {
      alerts.push({
        type: 'danger',
        title: 'Contas a Pagar Vencidas',
        description: `${overduePayables.rows[0].count} conta(s) vencida(s)`,
        count: parseInt(overduePayables.rows[0].count),
        amount: parseFloat(overduePayables.rows[0].total)
      });
    }

    // Produtos com estoque baixo
    const lowStock = await db.query(`
      SELECT COUNT(*) as count
      FROM products 
      WHERE stock_quantity <= 5 AND status = 'active'
    `);
    if (parseInt(lowStock.rows[0].count) > 0) {
      alerts.push({
        type: 'warning',
        title: 'Produtos com Estoque Baixo',
        description: `${lowStock.rows[0].count} produto(s) com estoque ≤ 5`,
        count: parseInt(lowStock.rows[0].count)
      });
    }

    return res.status(200).json(alerts);
  } catch (error) {
    console.error('Erro ao buscar alertas:', error);
    return res.status(500).json({ message: 'Erro interno do servidor ao buscar alertas.' });
  }
};

// Buscar métricas detalhadas de uma franquia específica
export const getFranchiseMetrics = async (req: AuthenticatedRequest, res: Response) => {
  const { role } = req.user!;
  const franchiseId = parseInt(req.params.id);

  if (role !== 'SUPER_ADMIN') {
    return res.status(403).json({ message: 'Acesso negado. Apenas SUPER_ADMIN pode acessar métricas de franquias.' });
  }

  try {
    // Buscar estatísticas da franquia
    const userCountResult = await db.query(
      'SELECT COUNT(*) as count FROM users WHERE franchise_id = $1',
      [franchiseId]
    );

    const salesCountResult = await db.query(
      'SELECT COUNT(*) as count FROM sales WHERE franchise_id = $1',
      [franchiseId]
    );

    const revenueResult = await db.query(
      'SELECT COALESCE(SUM(total_amount), 0) as total FROM sales WHERE franchise_id = $1',
      [franchiseId]
    );

    const productsCountResult = await db.query(
      'SELECT COUNT(*) as count FROM products WHERE franchise_id = $1',
      [franchiseId]
    );

    // Buscar crescimento mensal (comparação com mês anterior)
    const currentMonthSales = await db.query(
      'SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as revenue FROM sales WHERE franchise_id = $1 AND created_at >= date_trunc(\'month\', CURRENT_DATE)',
      [franchiseId]
    );

    const lastMonthSales = await db.query(
      'SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as revenue FROM sales WHERE franchise_id = $1 AND created_at >= date_trunc(\'month\', CURRENT_DATE - INTERVAL \'1 month\') AND created_at < date_trunc(\'month\', CURRENT_DATE)',
      [franchiseId]
    );

    // Calcular crescimento
    const currentCount = currentMonthSales.rows[0].count;
    const lastCount = lastMonthSales.rows[0].count;
    const monthlyGrowth = lastCount > 0 ? Math.round(((currentCount - lastCount) / lastCount) * 100) : 0;

    // Buscar usuários ativos (que fizeram login nos últimos 30 dias)
    const activeUsersResult = await db.query(
      'SELECT COUNT(DISTINCT u.id) as count FROM users u WHERE u.franchise_id = $1',
      [franchiseId]
    );

    // Buscar atividade recente
    const recentActivityResult = await db.query(`
      SELECT 
        'sale' as type,
        'Venda realizada - R$ ' || s.total_amount as description,
        s.created_at as date,
        s.total_amount as amount
      FROM sales s 
      WHERE s.franchise_id = $1 
      ORDER BY s.created_at DESC 
      LIMIT 5
    `, [franchiseId]);

    const metrics = {
      totalUsers: parseInt(userCountResult.rows[0].count),
      totalSales: parseInt(salesCountResult.rows[0].count),
      totalRevenue: parseFloat(revenueResult.rows[0].total),
      totalProducts: parseInt(productsCountResult.rows[0].count),
      monthlyGrowth: monthlyGrowth,
      activeUsers: parseInt(activeUsersResult.rows[0].count),
      recentActivity: recentActivityResult.rows.map((row, index) => ({
        id: index + 1,
        type: row.type,
        description: row.description,
        date: row.date,
        amount: row.amount
      }))
    };

    return res.status(200).json(metrics);
  } catch (error) {
    console.error('Erro ao buscar métricas da franquia:', error);
    return res.status(500).json({ message: 'Erro interno do servidor ao buscar métricas da franquia.' });
  }
}; 