-- Adicionar campos para finalização de ordens
ALTER TABLE service_orders 
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20),
ADD COLUMN IF NOT EXISTS total_paid DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS product_delivered BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS card_installments INTEGER,
ADD COLUMN IF NOT EXISTS card_interest DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS cancellation_reason VARCHAR(100);

-- Comentários para documentar os campos
COMMENT ON COLUMN service_orders.payment_method IS 'Método de pagamento: cash, card, pix';
COMMENT ON COLUMN service_orders.total_paid IS 'Valor total pago pelo cliente';
COMMENT ON COLUMN service_orders.product_delivered IS 'Se o produto foi entregue ao cliente';
COMMENT ON COLUMN service_orders.card_installments IS 'Número de parcelas do cartão';
COMMENT ON COLUMN service_orders.card_interest IS 'Juros aplicados no cartão (%)';
COMMENT ON COLUMN service_orders.cancellation_reason IS 'Motivo do cancelamento da ordem'; 