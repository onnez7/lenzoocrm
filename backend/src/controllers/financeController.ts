import { Request, Response } from 'express';
import db from '../config/db';

class FinanceController {
  // Buscar estatísticas financeiras gerais
  async getFinancialStats(req: Request, res: Response) {
    try {
      const user = (req.user as any);
      const franchiseId = user.franchiseId;
      const role = user.role;

      let franchiseFilter = '';
      let queryParams: any[] = [];
      
      if (role === 'SUPER_ADMIN') {
        // SUPER_ADMIN vê todos os dados
        franchiseFilter = '';
      } else if (franchiseId) {
        // FRANCHISE_ADMIN vê apenas dados da sua franquia
        franchiseFilter = 'AND franchise_id = $1';
        queryParams = [franchiseId];
      } else {
        res.status(400).json({ message: 'Usuário não está associado a uma franquia.' });
        return;
      }

      // Contas a receber
      const receivablesResult = await db.query(
        `SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
          COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid,
          COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue,
          SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_amount,
          SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as paid_amount,
          SUM(CASE WHEN status = 'overdue' THEN amount ELSE 0 END) as overdue_amount
        FROM receivables 
        WHERE status = 'paid' OR status = 'pending' OR status = 'overdue'
        ${franchiseFilter}`,
        queryParams
      );

      // Contas a pagar
      const payablesResult = await db.query(
        `SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
          COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid,
          COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue,
          SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_amount,
          SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as paid_amount,
          SUM(CASE WHEN status = 'overdue' THEN amount ELSE 0 END) as overdue_amount
        FROM payables 
        WHERE status = 'paid' OR status = 'pending' OR status = 'overdue'
        ${franchiseFilter}`,
        queryParams
      );

      // Vendas (service_orders)
      const salesResult = await db.query(
        `SELECT 
          COUNT(*) as total_orders,
          SUM(so.total_amount) as total_amount,
          AVG(so.total_amount) as average_amount,
          COUNT(CASE WHEN so.status = 'completed' THEN 1 END) as completed_orders,
          SUM(CASE WHEN so.status = 'completed' THEN so.total_amount ELSE 0 END) as completed_amount
        FROM service_orders so
        WHERE so.status = 'completed'
        ${franchiseFilter}`,
        queryParams
      );

      // Salários
      const salariesResult = await db.query(
        `SELECT 
          COUNT(*) as total_employees,
          SUM(salary) as total_salaries,
          AVG(salary) as average_salary
        FROM employees 
        WHERE salary IS NOT NULL
        ${franchiseFilter}`,
        queryParams
      );

      // Sangrias
      const sangriasResult = await db.query(
        `SELECT 
          COUNT(*) as total_sangrias,
          SUM(amount) as total_amount,
          AVG(amount) as average_amount
        FROM cashier_sangrias
        WHERE 1=1
        ${franchiseFilter}`,
        queryParams
      );

      // Calcular lucro líquido
      const receivables = receivablesResult.rows[0];
      const payables = payablesResult.rows[0];
      const sales = salesResult.rows[0];
      const salaries = salariesResult.rows[0];
      const sangrias = sangriasResult.rows[0];

      const totalReceitas = (receivables.paid_amount || 0) + (sales.completed_amount || 0);
      const totalDespesas = (payables.paid_amount || 0) + (salaries.total_salaries || 0) + (sangrias.total_amount || 0);
      const lucroLiquido = totalReceitas - totalDespesas;

      res.json({
        receivables: receivables,
        payables: payables,
        sales: sales,
        salaries: salaries,
        sangrias: sangrias,
        summary: {
          totalReceitas,
          totalDespesas,
          lucroLiquido,
          margemLucro: totalReceitas > 0 ? ((lucroLiquido / totalReceitas) * 100) : 0
        }
      });

    } catch (error) {
      console.error('Erro ao buscar estatísticas financeiras:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // Buscar dados mensais para gráficos
  async getMonthlyData(req: Request, res: Response) {
    try {
      const user = (req.user as any);
      const franchiseId = user.franchiseId;
      const role = user.role;
      const { months = 6 } = req.query;

      if (role !== 'SUPER_ADMIN' && !franchiseId) {
        res.status(400).json({ message: 'Usuário não está associado a uma franquia.' });
        return;
      }

      let franchiseFilter = '';
      let queryParams: any[] = [];
      
      if (role !== 'SUPER_ADMIN' && franchiseId) {
        franchiseFilter = 'AND franchise_id = $3';
      }

      const monthlyData = [];
      const today = new Date();

      for (let i = Number(months) - 1; i >= 0; i--) {
        const startDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const endDate = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);

        // Receitas do mês (contas a receber)
        let receivablesQuery = `SELECT SUM(amount) as total FROM receivables WHERE status = 'paid' AND payment_date >= $1 AND payment_date <= $2`;
        let receivablesParams = [startDate, endDate];
        if (role !== 'SUPER_ADMIN' && franchiseId) {
          receivablesQuery += franchiseFilter;
          receivablesParams.push(franchiseId);
        }
        const receivablesResult = await db.query(receivablesQuery, receivablesParams);

        // Vendas do mês (ordens de serviço)
        let salesQuery = `SELECT SUM(so.total_amount) as total FROM service_orders so WHERE so.status = 'completed' AND so.created_at >= $1 AND so.created_at <= $2`;
        let salesParams = [startDate, endDate];
        if (role !== 'SUPER_ADMIN' && franchiseId) {
          salesQuery += franchiseFilter;
          salesParams.push(franchiseId);
        }
        const salesResult = await db.query(salesQuery, salesParams);

        // Despesas do mês (contas a pagar)
        let payablesQuery = `SELECT SUM(amount) as total FROM payables WHERE status = 'paid' AND payment_date >= $1 AND payment_date <= $2`;
        let payablesParams = [startDate, endDate];
        if (role !== 'SUPER_ADMIN' && franchiseId) {
          payablesQuery += franchiseFilter;
          payablesParams.push(franchiseId);
        }
        const payablesResult = await db.query(payablesQuery, payablesParams);

        // Sangrias do mês
        let sangriasQuery = `SELECT SUM(amount) as total FROM cashier_sangrias WHERE created_at >= $1 AND created_at <= $2`;
        let sangriasParams = [startDate, endDate];
        if (role !== 'SUPER_ADMIN' && franchiseId) {
          sangriasQuery += franchiseFilter;
          sangriasParams.push(franchiseId);
        }
        const sangriasResult = await db.query(sangriasQuery, sangriasParams);

        const receitas = (receivablesResult.rows[0].total || 0) + (salesResult.rows[0].total || 0);
        const despesas = (payablesResult.rows[0].total || 0) + (sangriasResult.rows[0].total || 0);
        const lucro = receitas - despesas;

        monthlyData.push({
          month: startDate.toLocaleDateString('pt-BR', { month: 'short' }),
          receitas: Math.round(receitas),
          despesas: Math.round(despesas),
          lucro: Math.round(lucro)
        });
      }

      res.json(monthlyData);

    } catch (error) {
      console.error('Erro ao buscar dados mensais:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // Buscar dados por categoria
  async getCategoryData(req: Request, res: Response) {
    try {
      const user = (req.user as any);
      const franchiseId = user.franchiseId;
      const role = user.role;

      if (role !== 'SUPER_ADMIN' && !franchiseId) {
        res.status(400).json({ message: 'Usuário não está associado a uma franquia.' });
        return;
      }

      let franchiseFilter = '';
      let queryParams: any[] = [];
      
      if (role !== 'SUPER_ADMIN' && franchiseId) {
        franchiseFilter = 'AND franchise_id = $1';
        queryParams = [franchiseId];
      }

      // Categorias de receitas
      const receivablesCategories = await db.query(
        `SELECT 
          category,
          COUNT(*) as count,
          SUM(amount) as total_amount
        FROM receivables 
        WHERE status = 'paid'
        ${franchiseFilter}
        GROUP BY category
        ORDER BY total_amount DESC`,
        queryParams
      );

      // Categorias de despesas
      const payablesCategories = await db.query(
        `SELECT 
          category,
          COUNT(*) as count,
          SUM(amount) as total_amount
        FROM payables 
        WHERE status = 'paid'
        ${franchiseFilter}
        GROUP BY category
        ORDER BY total_amount DESC`,
        queryParams
      );

      res.json({
        receivables: receivablesCategories.rows,
        payables: payablesCategories.rows
      });

    } catch (error) {
      console.error('Erro ao buscar dados por categoria:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // Buscar métodos de pagamento
  async getPaymentMethodsData(req: Request, res: Response) {
    try {
      const user = (req.user as any);
      const franchiseId = user.franchiseId;
      const role = user.role;

      if (role !== 'SUPER_ADMIN' && !franchiseId) {
        res.status(400).json({ message: 'Usuário não está associado a uma franquia.' });
        return;
      }

      let franchiseFilter = '';
      let queryParams: any[] = [];
      
      if (role !== 'SUPER_ADMIN' && franchiseId) {
        franchiseFilter = 'AND franchise_id = $1';
        queryParams = [franchiseId];
      }

      // Métodos de pagamento das receitas
      const receivablesMethods = await db.query(
        `SELECT 
          payment_method,
          COUNT(*) as count,
          SUM(amount) as total_amount
        FROM receivables 
        WHERE status = 'paid'
        ${franchiseFilter}
        GROUP BY payment_method
        ORDER BY total_amount DESC`,
        queryParams
      );

      // Métodos de pagamento das despesas
      const payablesMethods = await db.query(
        `SELECT 
          payment_method,
          COUNT(*) as count,
          SUM(amount) as total_amount
        FROM payables 
        WHERE status = 'paid'
        ${franchiseFilter}
        GROUP BY payment_method
        ORDER BY total_amount DESC`,
        queryParams
      );

      res.json({
        receivables: receivablesMethods.rows,
        payables: payablesMethods.rows
      });

    } catch (error) {
      console.error('Erro ao buscar métodos de pagamento:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
}

export default new FinanceController(); 