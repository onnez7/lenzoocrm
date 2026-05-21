-- Adicionar coluna billing_cycle na tabela subscriptions
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS billing_cycle VARCHAR(10) DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly'));

-- Atualizar registros existentes para ter billing_cycle
UPDATE subscriptions 
SET billing_cycle = 'monthly' 
WHERE billing_cycle IS NULL; 