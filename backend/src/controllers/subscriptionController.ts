import { Request, Response } from 'express';
import { Pool } from 'pg';
import Stripe from 'stripe';
import { StripeService } from '../services/stripeService';
import { NotificationService } from '../services/notificationService';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: 'SUPER_ADMIN' | 'FRANCHISE_ADMIN' | 'EMPLOYEE';
    franchiseId: number | null;
  };
}

// Listar todas as assinaturas (apenas SUPER_ADMIN)
export const getAllSubscriptions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(`
      SELECT 
        s.*,
        f.name as franchise_name,
        f.email as franchise_email,
        sp.name as plan_name,
        sp.price as plan_price,
        sp.max_users,
        sp.max_stores,
        CASE 
          WHEN s.trial_end IS NOT NULL AND s.trial_end > CURRENT_DATE 
          THEN EXTRACT(DAY FROM (s.trial_end - CURRENT_DATE))
          ELSE 0
        END as days_trial_remaining
      FROM subscriptions s
      JOIN franchises f ON s.franchise_id = f.id
      JOIN subscription_plans sp ON s.plan_id = sp.id
      ORDER BY s.created_at DESC
    `);
    
    res.status(200).json(result.rows);
    return;
  } catch (error) {
    console.error('Erro ao buscar assinaturas:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar assinaturas.' });
    return;
  }
};

// Buscar assinatura por ID
export const getSubscriptionById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const subscriptionId = parseInt(req.params.id);

  try {
    const result = await pool.query(`
      SELECT 
        s.*,
        f.name as franchise_name,
        f.email as franchise_email,
        sp.name as plan_name,
        sp.price as plan_price,
        sp.max_users,
        sp.max_stores,
        sp.features
      FROM subscriptions s
      JOIN franchises f ON s.franchise_id = f.id
      JOIN subscription_plans sp ON s.plan_id = sp.id
      WHERE s.id = $1
    `, [subscriptionId]);

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Assinatura não encontrada.' });
      return;
    }

    res.status(200).json(result.rows[0]);
    return;
  } catch (error) {
    console.error('Erro ao buscar assinatura:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar assinatura.' });
    return;
  }
};

// Criar nova assinatura
export const createSubscription = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { franchise_id, plan_id, status, current_period_start, current_period_end, amount, billing_cycle } = req.body;

  if (!franchise_id || !plan_id) {
    res.status(400).json({ message: 'ID da franquia e ID do plano são obrigatórios.' });
    return;
  }

  try {
    // Verificar se franquia existe
    const franchiseCheck = await pool.query('SELECT id FROM franchises WHERE id = $1', [franchise_id]);
    if (franchiseCheck.rows.length === 0) {
      res.status(404).json({ message: 'Franquia não encontrada.' });
      return;
    }

    // Verificar se plano existe e buscar seu preço
    const planCheck = await pool.query('SELECT id, price, billing_cycle FROM subscription_plans WHERE id = $1', [plan_id]);
    if (planCheck.rows.length === 0) {
      res.status(404).json({ message: 'Plano não encontrado.' });
      return;
    }

    const plan = planCheck.rows[0];
    const planPrice = plan.price;
    const planBillingCycle = billing_cycle || plan.billing_cycle || 'monthly';

    // Calcular datas se não fornecidas
    const now = new Date();
    let periodStart = current_period_start ? new Date(current_period_start) : now;
    let periodEnd = current_period_end ? new Date(current_period_end) : new Date(now);
    
    if (!current_period_end) {
      if (planBillingCycle === 'yearly') {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      }
    }

    const result = await pool.query(
      `INSERT INTO subscriptions (franchise_id, plan_id, status, current_period_start, current_period_end, amount, billing_cycle) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [franchise_id, plan_id, status || 'active', periodStart, periodEnd, amount || planPrice, planBillingCycle]
    );

    res.status(201).json(result.rows[0]);
    return;
  } catch (error) {
    console.error('Erro ao criar assinatura:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao criar assinatura.' });
    return;
  }
};

// Atualizar assinatura
export const updateSubscription = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const subscriptionId = parseInt(req.params.id);
  const { status, current_period_end, cancel_at_period_end } = req.body;

  try {
    // Verificar se assinatura existe
    const existingSubscription = await pool.query('SELECT id FROM subscriptions WHERE id = $1', [subscriptionId]);
    if (existingSubscription.rows.length === 0) {
      res.status(404).json({ message: 'Assinatura não encontrada.' });
      return;
    }

    // Construir query dinamicamente
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    if (status !== undefined) {
      updateFields.push(`status = $${paramIndex++}`);
      updateValues.push(status);
    }

    if (current_period_end !== undefined) {
      updateFields.push(`current_period_end = $${paramIndex++}`);
      updateValues.push(current_period_end);
    }

    if (cancel_at_period_end !== undefined) {
      updateFields.push(`cancel_at_period_end = $${paramIndex++}`);
      updateValues.push(cancel_at_period_end);
    }

    if (updateFields.length === 0) {
      res.status(400).json({ message: 'Nenhum campo válido fornecido para atualização.' });
      return;
    }

    updateValues.push(subscriptionId);
    const query = `UPDATE subscriptions SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

    const result = await pool.query(query, updateValues);

    res.status(200).json(result.rows[0]);
    return;
  } catch (error) {
    console.error('Erro ao atualizar assinatura:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao atualizar assinatura.' });
    return;
  }
};

// Deletar assinatura
export const deleteSubscription = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const subscriptionId = parseInt(req.params.id);

  try {
    // Verificar se assinatura existe
    const existingSubscription = await pool.query('SELECT id FROM subscriptions WHERE id = $1', [subscriptionId]);
    if (existingSubscription.rows.length === 0) {
      res.status(404).json({ message: 'Assinatura não encontrada.' });
      return;
    }

    await pool.query('DELETE FROM subscriptions WHERE id = $1', [subscriptionId]);

    res.status(200).json({ message: 'Assinatura deletada com sucesso.' });
    return;
  } catch (error) {
    console.error('Erro ao deletar assinatura:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao deletar assinatura.' });
    return;
  }
};

// Listar todos os planos
export const getAllPlans = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(`
      SELECT * FROM subscription_plans 
      ORDER BY price ASC
    `);
    
    res.status(200).json(result.rows);
    return;
  } catch (error) {
    console.error('Erro ao buscar planos:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar planos.' });
    return;
  }
};

// Criar novo plano
export const createPlan = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { name, description, price, max_users, max_stores, features } = req.body;

  if (!name || !price) {
    res.status(400).json({ message: 'Nome e preço do plano são obrigatórios.' });
    return;
  }

  try {
    const result = await pool.query(
      `INSERT INTO subscription_plans (name, description, price, max_users, max_stores, features) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, description, price, max_users || 1, max_stores || 1, features || []]
    );

    res.status(201).json(result.rows[0]);
    return;
  } catch (error) {
    console.error('Erro ao criar plano:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao criar plano.' });
    return;
  }
};

// Atualizar plano
export const updatePlan = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const planId = parseInt(req.params.id);
  const { name, description, price, max_users, max_stores, features, is_active } = req.body;

  try {
    // Verificar se plano existe
    const existingPlan = await pool.query('SELECT id FROM subscription_plans WHERE id = $1', [planId]);
    if (existingPlan.rows.length === 0) {
      res.status(404).json({ message: 'Plano não encontrado.' });
      return;
    }

    // Construir query dinamicamente
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updateFields.push(`name = $${paramIndex++}`);
      updateValues.push(name);
    }

    if (description !== undefined) {
      updateFields.push(`description = $${paramIndex++}`);
      updateValues.push(description);
    }

    if (price !== undefined) {
      updateFields.push(`price = $${paramIndex++}`);
      updateValues.push(price);
    }

    if (max_users !== undefined) {
      updateFields.push(`max_users = $${paramIndex++}`);
      updateValues.push(max_users);
    }

    if (max_stores !== undefined) {
      updateFields.push(`max_stores = $${paramIndex++}`);
      updateValues.push(max_stores);
    }

    if (features !== undefined) {
      updateFields.push(`features = $${paramIndex++}`);
      updateValues.push(features);
    }

    if (is_active !== undefined) {
      updateFields.push(`is_active = $${paramIndex++}`);
      updateValues.push(is_active);
    }

    if (updateFields.length === 0) {
      res.status(400).json({ message: 'Nenhum campo válido fornecido para atualização.' });
      return;
    }

    updateValues.push(planId);
    const query = `UPDATE subscription_plans SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

    const result = await pool.query(query, updateValues);

    res.status(200).json(result.rows[0]);
    return;
  } catch (error) {
    console.error('Erro ao atualizar plano:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao atualizar plano.' });
    return;
  }
};

// Deletar plano
export const deletePlan = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const planId = parseInt(req.params.id);

  try {
    // Verificar se plano existe
    const existingPlan = await pool.query('SELECT id FROM subscription_plans WHERE id = $1', [planId]);
    if (existingPlan.rows.length === 0) {
      res.status(404).json({ message: 'Plano não encontrado.' });
      return;
    }

    // Verificar se há assinaturas usando este plano
    const subscriptionsCheck = await pool.query('SELECT id FROM subscriptions WHERE plan_id = $1', [planId]);
    if (subscriptionsCheck.rows.length > 0) {
      res.status(400).json({ message: 'Não é possível deletar um plano que possui assinaturas ativas.' });
      return;
    }

    await pool.query('DELETE FROM subscription_plans WHERE id = $1', [planId]);

    res.status(200).json({ message: 'Plano deletado com sucesso.' });
    return;
  } catch (error) {
    console.error('Erro ao deletar plano:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao deletar plano.' });
    return;
  }
};

// Obter métricas de assinaturas
export const getSubscriptionMetrics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_subscriptions,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_subscriptions,
        COUNT(CASE WHEN status = 'trialing' THEN 1 END) as trial_subscriptions,
        COUNT(CASE WHEN status = 'canceled' THEN 1 END) as canceled_subscriptions,
        COUNT(CASE WHEN status = 'past_due' THEN 1 END) as past_due_subscriptions,
        SUM(CASE WHEN status = 'active' THEN amount ELSE 0 END) as mrr
      FROM subscriptions
    `);

    res.status(200).json(result.rows[0]);
    return;
  } catch (error) {
    console.error('Erro ao buscar métricas:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar métricas.' });
    return;
  }
};

// Webhook do Stripe
export const handleStripeWebhook = async (req: Request, res: Response) => {
  try {
    const sig = req.headers['stripe-signature'] as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    let event: any;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err: any) {
      console.error('Erro na assinatura do webhook:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    await StripeService.handleWebhook(event);

    res.json({ received: true });
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Criar link de checkout
export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { subscription_id, success_url, cancel_url } = req.body;

    // Buscar assinatura
    const subscriptionResult = await pool.query(`
      SELECT s.*, sp.stripe_price_id, f.name as franchise_name
      FROM subscriptions s
      JOIN subscription_plans sp ON s.plan_id = sp.id
      JOIN franchises f ON s.franchise_id = f.id
      WHERE s.id = $1
    `, [subscription_id]);

    if (subscriptionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Assinatura não encontrada' });
    }

    const subscription = subscriptionResult.rows[0];

    if (!subscription.stripe_price_id) {
      return res.status(400).json({ error: 'Plano não configurado para pagamento' });
    }

    const checkoutUrl = await StripeService.createCheckoutSession(
      subscription.stripe_customer_id,
      subscription.stripe_price_id,
      success_url,
      cancel_url
    );

    res.json({ checkout_url: checkoutUrl });
  } catch (error) {
    console.error('Erro ao criar sessão de checkout:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Cancelar assinatura
export const cancelSubscription = async (req: AuthenticatedRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { cancel_at_period_end = true } = req.body;

    // Buscar assinatura
    const subscriptionResult = await client.query(`
      SELECT s.*, f.name as franchise_name, u.email
      FROM subscriptions s
      JOIN franchises f ON s.franchise_id = f.id
      JOIN users u ON f.id = u.franchise_id AND u.role = 'FRANCHISE_ADMIN'
      WHERE s.id = $1
    `, [id]);

    if (subscriptionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Assinatura não encontrada' });
    }

    const subscription = subscriptionResult.rows[0];

    // Cancelar no Stripe se existir
    if (subscription.stripe_subscription_id) {
      await StripeService.cancelSubscription(
        subscription.stripe_subscription_id,
        cancel_at_period_end
      );
    }

    // Atualizar no banco
    const status = cancel_at_period_end ? 'canceled' : 'canceled';
    const result = await client.query(`
      UPDATE subscriptions 
      SET status = $1, cancel_at_period_end = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3 RETURNING *
    `, [status, cancel_at_period_end, id]);

    // Enviar notificação
    if (subscription.email) {
      await NotificationService.sendSubscriptionCanceledNotification(
        parseInt(id),
        subscription.email
      );
    }

    await client.query('COMMIT');

    res.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao cancelar assinatura:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  } finally {
    client.release();
  }
};

// Reativar assinatura
export const reactivateSubscription = async (req: AuthenticatedRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    // Buscar assinatura
    const subscriptionResult = await client.query(
      'SELECT * FROM subscriptions WHERE id = $1',
      [id]
    );

    if (subscriptionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Assinatura não encontrada' });
    }

    const subscription = subscriptionResult.rows[0];

    // Reativar no Stripe se existir
    if (subscription.stripe_subscription_id) {
      await StripeService.reactivateSubscription(subscription.stripe_subscription_id);
    }

    // Atualizar no banco
    const result = await client.query(`
      UPDATE subscriptions 
      SET status = 'active', cancel_at_period_end = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 RETURNING *
    `, [id]);

    await client.query('COMMIT');

    res.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao reativar assinatura:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  } finally {
    client.release();
  }
}; 