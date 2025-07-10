-- Tabela de pagamentos de clientes (CRM)
CREATE TABLE IF NOT EXISTS client_payments (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    order_id INTEGER REFERENCES service_orders(id) ON DELETE SET NULL,
    amount NUMERIC(12,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, paid, canceled, failed
    method VARCHAR(30) NOT NULL, -- boleto, cartao, pix, dinheiro, etc
    gateway VARCHAR(30), -- mercadopago, asaas, pagseguro, stripe, etc
    external_id VARCHAR(100), -- id do pagamento no gateway
    due_date DATE,
    paid_at TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
); 