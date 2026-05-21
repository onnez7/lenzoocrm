import nodemailer from 'nodemailer';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Configurar transporter do nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface NotificationData {
  subscriptionId: number;
  type: 'payment_due' | 'payment_failed' | 'trial_ending' | 'subscription_canceled' | 'payment_succeeded';
  title: string;
  message: string;
  email: string;
}

export class NotificationService {
  // Enviar notificação por email
  static async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@lenzoocrm.com',
        to,
        subject,
        html,
      };

      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      return false;
    }
  }

  // Criar e enviar notificação
  static async createNotification(data: NotificationData): Promise<void> {
    const client = await pool.connect();
    try {
      // Salvar notificação no banco
      await client.query(
        'INSERT INTO subscription_notifications (subscription_id, type, title, message, sent_to) VALUES ($1, $2, $3, $4, $5)',
        [data.subscriptionId, data.type, data.title, data.message, data.email]
      );

      // Enviar email
      const success = await this.sendEmail(data.email, data.title, data.message);
      
      if (!success) {
        await client.query(
          'UPDATE subscription_notifications SET status = $1 WHERE subscription_id = $2 AND type = $3 AND sent_to = $4',
          ['failed', data.subscriptionId, data.type, data.email]
        );
      }
    } finally {
      client.release();
    }
  }

  // Notificação de pagamento vencendo
  static async sendPaymentDueNotification(subscriptionId: number, email: string, daysUntilDue: number): Promise<void> {
    const data: NotificationData = {
      subscriptionId,
      type: 'payment_due',
      title: 'Pagamento da Assinatura Vencendo',
      message: `
        <h2>Olá!</h2>
        <p>Sua assinatura do LenZoo CRM vence em ${daysUntilDue} dias.</p>
        <p>Para evitar a interrupção do serviço, acesse sua conta e atualize suas informações de pagamento.</p>
        <p>Atenciosamente,<br>Equipe LenZoo CRM</p>
      `,
      email,
    };

    await this.createNotification(data);
  }

  // Notificação de pagamento falhado
  static async sendPaymentFailedNotification(subscriptionId: number, email: string): Promise<void> {
    const data: NotificationData = {
      subscriptionId,
      type: 'payment_failed',
      title: 'Pagamento da Assinatura Falhou',
      message: `
        <h2>Pagamento Não Processado</h2>
        <p>O pagamento da sua assinatura do LenZoo CRM não foi processado com sucesso.</p>
        <p>Por favor, acesse sua conta e atualize suas informações de pagamento para continuar usando o serviço.</p>
        <p>Atenciosamente,<br>Equipe LenZoo CRM</p>
      `,
      email,
    };

    await this.createNotification(data);
  }

  // Notificação de trial terminando
  static async sendTrialEndingNotification(subscriptionId: number, email: string, daysRemaining: number): Promise<void> {
    const data: NotificationData = {
      subscriptionId,
      type: 'trial_ending',
      title: 'Seu Período Trial Está Terminando',
      message: `
        <h2>Período Trial Terminando</h2>
        <p>Seu período trial do LenZoo CRM termina em ${daysRemaining} dias.</p>
        <p>Para continuar usando o serviço, escolha um plano e configure seu método de pagamento.</p>
        <p>Atenciosamente,<br>Equipe LenZoo CRM</p>
      `,
      email,
    };

    await this.createNotification(data);
  }

  // Notificação de assinatura cancelada
  static async sendSubscriptionCanceledNotification(subscriptionId: number, email: string): Promise<void> {
    const data: NotificationData = {
      subscriptionId,
      type: 'subscription_canceled',
      title: 'Assinatura Cancelada',
      message: `
        <h2>Assinatura Cancelada</h2>
        <p>Sua assinatura do LenZoo CRM foi cancelada conforme solicitado.</p>
        <p>Você ainda pode acessar o sistema até o final do período atual.</p>
        <p>Para reativar sua assinatura, entre em contato conosco.</p>
        <p>Atenciosamente,<br>Equipe LenZoo CRM</p>
      `,
      email,
    };

    await this.createNotification(data);
  }

  // Notificação de pagamento bem-sucedido
  static async sendPaymentSucceededNotification(subscriptionId: number, email: string, amount: number): Promise<void> {
    const data: NotificationData = {
      subscriptionId,
      type: 'payment_succeeded',
      title: 'Pagamento Confirmado',
      message: `
        <h2>Pagamento Confirmado</h2>
        <p>O pagamento de R$ ${amount.toFixed(2)} da sua assinatura foi processado com sucesso.</p>
        <p>Obrigado por escolher o LenZoo CRM!</p>
        <p>Atenciosamente,<br>Equipe LenZoo CRM</p>
      `,
      email,
    };

    await this.createNotification(data);
  }

  // Buscar notificações não lidas
  static async getUnreadNotifications(subscriptionId: number): Promise<any[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM subscription_notifications WHERE subscription_id = $1 AND read_at IS NULL ORDER BY sent_at DESC',
        [subscriptionId]
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  // Marcar notificação como lida
  static async markAsRead(notificationId: number): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query(
        'UPDATE subscription_notifications SET read_at = CURRENT_TIMESTAMP WHERE id = $1',
        [notificationId]
      );
    } finally {
      client.release();
    }
  }

  // Verificar assinaturas que precisam de notificação
  static async checkSubscriptionsForNotifications(): Promise<void> {
    const client = await pool.connect();
    try {
      // Buscar assinaturas com pagamento vencendo em 3 dias
      const dueSubscriptions = await client.query(`
        SELECT s.id, s.franchise_id, f.name as franchise_name, u.email, s.current_period_end
        FROM subscriptions s
        JOIN franchises f ON s.franchise_id = f.id
        JOIN users u ON f.id = u.franchise_id AND u.role = 'FRANCHISE_ADMIN'
        WHERE s.status = 'active' 
        AND s.current_period_end::date = (CURRENT_DATE + INTERVAL '3 days')::date
      `);

      for (const subscription of dueSubscriptions.rows) {
        await this.sendPaymentDueNotification(
          subscription.id,
          subscription.email,
          3
        );
      }

      // Buscar assinaturas em trial que terminam em 2 dias
      const trialSubscriptions = await client.query(`
        SELECT s.id, s.franchise_id, f.name as franchise_name, u.email, s.trial_end_date
        FROM subscriptions s
        JOIN franchises f ON s.franchise_id = f.id
        JOIN users u ON f.id = u.franchise_id AND u.role = 'FRANCHISE_ADMIN'
        WHERE s.status = 'trialing' 
        AND s.trial_end_date::date = (CURRENT_DATE + INTERVAL '2 days')::date
      `);

      for (const subscription of trialSubscriptions.rows) {
        await this.sendTrialEndingNotification(
          subscription.id,
          subscription.email,
          2
        );
      }
    } finally {
      client.release();
    }
  }
} 