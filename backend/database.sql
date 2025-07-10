-- Define um tipo ENUM para os papéis de usuário, garantindo consistência.
CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'FRANCHISE_ADMIN', 'EMPLOYEE');

-- Tabela de franquias
CREATE TABLE IF NOT EXISTS franchises (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18) UNIQUE,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir franquia matriz
INSERT INTO franchises (name, cnpj, address, phone, email) 
VALUES ('Matriz - Lenzoo', '00.000.000/0001-00', 'Endereço da Matriz', '(11) 9999-9999', 'matriz@lenzoo.com')
ON CONFLICT (cnpj) DO NOTHING;

-- Tabela de usuários, agora com papel e link para a franquia
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    franchise_id INTEGER REFERENCES franchises(id) ON DELETE SET NULL, -- ON DELETE SET NULL é útil se uma franquia for removida
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Atualizar tabela users para incluir franchise_id
ALTER TABLE users ADD COLUMN IF NOT EXISTS franchise_id INTEGER REFERENCES franchises(id);

-- Atualizar usuário admin matriz para ter franchise_id = 1
UPDATE users SET franchise_id = 1 WHERE email = 'admin@matriz.com';

-- Tabela de produtos (por franquia)
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    franchise_id INTEGER REFERENCES franchises(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    cost DECIMAL(10,2),
    stock_quantity INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 0,
    category VARCHAR(100),
    brand VARCHAR(100),
    sku VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de clientes (por franquia)
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    franchise_id INTEGER REFERENCES franchises(id),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    cpf VARCHAR(14),
    address TEXT,
    birth_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de vendas (por franquia)
CREATE TABLE IF NOT EXISTS sales (
    id SERIAL PRIMARY KEY,
    franchise_id INTEGER REFERENCES franchises(id),
    client_id INTEGER REFERENCES clients(id),
    user_id INTEGER REFERENCES users(id),
    total_amount DECIMAL(10,2),
    payment_method VARCHAR(50),
    status VARCHAR(20) DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de itens da venda
CREATE TABLE IF NOT EXISTS sale_items (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER REFERENCES sales(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar um índice para buscas rápidas por email e franchise_id
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_clients_franchise_id ON clients(franchise_id);
CREATE INDEX idx_products_franchise_id ON products(franchise_id);
CREATE INDEX idx_sales_franchise_id ON sales(franchise_id);
CREATE INDEX idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX idx_sale_items_product_id ON sale_items(product_id);

-- NOTA: O franchise_id para um SUPER_ADMIN será NULL.
-- Para FRANCHISE_ADMIN e EMPLOYEE, o franchise_id será obrigatório.

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_franchises_updated_at BEFORE UPDATE ON franchises FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();