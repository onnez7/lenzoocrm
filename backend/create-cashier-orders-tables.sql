-- Tabela para sessões de caixa
CREATE TABLE IF NOT EXISTS cashier_sessions (
    id SERIAL PRIMARY KEY,
    session_code VARCHAR(20) UNIQUE NOT NULL,
    employee_id INTEGER REFERENCES employees(id),
    franchise_id INTEGER REFERENCES franchises(id),
    open_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    close_time TIMESTAMP NULL,
    initial_amount DECIMAL(10,2) NOT NULL,
    final_amount DECIMAL(10,2) NULL,
    cash_sales DECIMAL(10,2) DEFAULT 0,
    card_sales DECIMAL(10,2) DEFAULT 0,
    pix_sales DECIMAL(10,2) DEFAULT 0,
    total_sales DECIMAL(10,2) DEFAULT 0,
    difference DECIMAL(10,2) NULL,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para sangrias do caixa
CREATE TABLE IF NOT EXISTS cashier_sangrias (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES cashier_sessions(id),
    amount DECIMAL(10,2) NOT NULL,
    description TEXT NOT NULL,
    employee_id INTEGER REFERENCES employees(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para ordens de serviço
CREATE TABLE IF NOT EXISTS service_orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(20) UNIQUE NOT NULL,
    client_id INTEGER REFERENCES clients(id),
    employee_id INTEGER REFERENCES employees(id),
    session_id INTEGER REFERENCES cashier_sessions(id),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    total_amount DECIMAL(10,2) DEFAULT 0,
    description TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para itens das ordens de serviço
CREATE TABLE IF NOT EXISTS service_order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES service_orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_cashier_sessions_franchise_id ON cashier_sessions(franchise_id);
CREATE INDEX IF NOT EXISTS idx_cashier_sessions_status ON cashier_sessions(status);
CREATE INDEX IF NOT EXISTS idx_cashier_sessions_employee_id ON cashier_sessions(employee_id);
CREATE INDEX IF NOT EXISTS idx_service_orders_client_id ON service_orders(client_id);
CREATE INDEX IF NOT EXISTS idx_service_orders_employee_id ON service_orders(employee_id);
CREATE INDEX IF NOT EXISTS idx_service_orders_session_id ON service_orders(session_id);
CREATE INDEX IF NOT EXISTS idx_service_orders_status ON service_orders(status);
CREATE INDEX IF NOT EXISTS idx_service_order_items_order_id ON service_order_items(order_id);

-- Função para gerar número da sessão
CREATE OR REPLACE FUNCTION generate_session_code()
RETURNS VARCHAR(20) AS $$
DECLARE
    next_id INTEGER;
    session_code VARCHAR(20);
BEGIN
    SELECT COALESCE(MAX(id), 0) + 1 INTO next_id FROM cashier_sessions;
    session_code := 'CS-' || LPAD(next_id::TEXT, 3, '0');
    RETURN session_code;
END;
$$ LANGUAGE plpgsql;

-- Função para gerar número da ordem de serviço
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS VARCHAR(20) AS $$
DECLARE
    next_id INTEGER;
    order_number VARCHAR(20);
BEGIN
    SELECT COALESCE(MAX(id), 0) + 1 INTO next_id FROM service_orders;
    order_number := 'OS-' || LPAD(next_id::TEXT, 3, '0');
    RETURN order_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cashier_sessions_updated_at 
    BEFORE UPDATE ON cashier_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_orders_updated_at 
    BEFORE UPDATE ON service_orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 