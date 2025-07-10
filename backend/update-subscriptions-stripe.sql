-- Atualizar tabela subscription_plans para suportar Stripe
ALTER TABLE subscription_plans 
ADD COLUMN IF NOT EXISTS stripe_price_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_product_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS billing_cycle VARCHAR(20) DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
ADD COLUMN IF NOT EXISTS trial_days INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT false;

-- Atualizar tabela subscriptions para suportar Stripe
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_invoice_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS next_billing_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(100),
ADD COLUMN IF NOT EXISTS billing_cycle VARCHAR(20) DEFAULT 'monthly',
ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS cancel_reason TEXT;

-- Criar tabela para histórico de pagamentos
CREATE TABLE IF NOT EXISTS subscription_payments (
    id SERIAL PRIMARY KEY,
    subscription_id INTEGER REFERENCES subscriptions(id) ON DELETE CASCADE,
    stripe_payment_intent_id VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BRL',
    status VARCHAR(50) NOT NULL,
    payment_method VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela para notificações
CREATE TABLE IF NOT EXISTS subscription_notifications (
    id SERIAL PRIMARY KEY,
    subscription_id INTEGER REFERENCES subscriptions(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'payment_due', 'payment_failed', 'trial_ending', 'subscription_canceled'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    sent_to VARCHAR(255) NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'sent' -- 'sent', 'read', 'failed'
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_billing ON subscriptions(next_billing_date);
CREATE INDEX IF NOT EXISTS idx_payments_subscription_id ON subscription_payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_notifications_subscription_id ON subscription_notifications(subscription_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger nas novas tabelas
DROP TRIGGER IF EXISTS update_subscription_payments_updated_at ON subscription_payments;
CREATE TRIGGER update_subscription_payments_updated_at 
    BEFORE UPDATE ON subscription_payments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscription_notifications_updated_at ON subscription_notifications;
CREATE TRIGGER update_subscription_notifications_updated_at 
    BEFORE UPDATE ON subscription_notifications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir planos padrão
INSERT INTO subscription_plans (name, description, price, max_users, max_stores, features, is_active, billing_cycle, trial_days, is_free) 
VALUES 
    ('Básico', 'Plano gratuito para começar', 0.00, 2, 1, ARRAY['CRM básico', 'Gestão de clientes', 'Relatórios simples'], true, 'monthly', 0, true),
    ('Premium', 'Plano completo para crescimento', 99.90, 10, 3, ARRAY['CRM completo', 'Gestão avançada', 'Relatórios detalhados', 'Suporte prioritário'], true, 'monthly', 7, false),
    ('Enterprise', 'Solução empresarial', 299.90, -1, -1, ARRAY['CRM ilimitado', 'Gestão completa', 'Relatórios avançados', 'Suporte 24/7', 'API personalizada'], true, 'monthly', 14, false)
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    max_users = EXCLUDED.max_users,
    max_stores = EXCLUDED.max_stores,
    features = EXCLUDED.features,
    billing_cycle = EXCLUDED.billing_cycle,
    trial_days = EXCLUDED.trial_days,
    is_free = EXCLUDED.is_free; 