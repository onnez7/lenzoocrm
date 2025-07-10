-- Adicionar campos de parcelamento na tabela service_orders
ALTER TABLE service_orders 
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20) DEFAULT 'cash' CHECK (payment_method IN ('cash', 'credit_card', 'debit_card', 'pix', 'bank_transfer', 'installments')),
ADD COLUMN IF NOT EXISTS installments INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS installment_amount DECIMAL(10,2) DEFAULT 0;

-- Comentários sobre os novos campos
COMMENT ON COLUMN service_orders.payment_method IS 'Método de pagamento da ordem';
COMMENT ON COLUMN service_orders.installments IS 'Número de parcelas (1 = à vista)';
COMMENT ON COLUMN service_orders.installment_amount IS 'Valor de cada parcela';

-- Atualizar valores padrão para ordens existentes
UPDATE service_orders 
SET installment_amount = total_amount 
WHERE installment_amount = 0 OR installment_amount IS NULL; 