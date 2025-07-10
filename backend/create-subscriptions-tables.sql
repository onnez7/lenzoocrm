-- Tabelas para gestão de assinaturas e planos

-- 1. Tabela de planos
CREATE TABLE IF NOT EXISTS subscription_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BRL',
    interval VARCHAR(10) DEFAULT 'month' CHECK (interval IN ('month', 'year')),
    max_users INTEGER NOT NULL,
    max_stores INTEGER NOT NULL,
    features TEXT[], -- Array de recursos
    stripe_price_id VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela de assinaturas
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    franchise_id INTEGER REFERENCES franchises(id) ON DELETE CASCADE,
    plan_id INTEGER REFERENCES subscription_plans(id),
    stripe_subscription_id VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'unpaid')),
    current_period_start DATE NOT NULL,
    current_period_end DATE NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT false,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BRL',
    trial_start DATE,
    trial_end DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabela de pagamentos
CREATE TABLE IF NOT EXISTS subscription_payments (
    id SERIAL PRIMARY KEY,
    subscription_id INTEGER REFERENCES subscriptions(id) ON DELETE CASCADE,
    stripe_payment_id VARCHAR(100),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BRL',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('succeeded', 'pending', 'failed', 'canceled')),
    method VARCHAR(50),
    paid_at TIMESTAMP,
    failure_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir planos padrão
INSERT INTO subscription_plans (name, description, price, max_users, max_stores, features) VALUES
('Básico', 'Ideal para óticas pequenas', 99.90, 3, 1, ARRAY['Gestão de clientes', 'Controle de estoque', 'Vendas básicas']),
('Premium', 'Para óticas em crescimento', 199.90, 10, 3, ARRAY['Todos os recursos básicos', 'CRM avançado', 'Relatórios detalhados', 'API']),
('Enterprise', 'Para redes de óticas', 399.90, -1, -1, ARRAY['Todos os recursos', 'Usuários ilimitados', 'Lojas ilimitadas', 'Suporte prioritário'])
ON CONFLICT DO NOTHING;

-- Inserir assinaturas de exemplo para as franquias existentes
INSERT INTO subscriptions (franchise_id, plan_id, status, current_period_start, current_period_end, amount) 
SELECT 
    f.id,
    sp.id,
    'active',
    CURRENT_DATE - INTERVAL '15 days',
    CURRENT_DATE + INTERVAL '15 days',
    sp.price
FROM franchises f
CROSS JOIN subscription_plans sp
WHERE sp.name = 'Premium'
ON CONFLICT DO NOTHING;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_franchise_id ON subscriptions(franchise_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_subscription_id ON subscription_payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(is_active);

-- Triggers para atualizar updated_at
CREATE TRIGGER update_subscription_plans_updated_at 
    BEFORE UPDATE ON subscription_plans 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at 
    BEFORE UPDATE ON subscriptions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 