-- LenzooCRM Database Schema
-- Inicialização básica do banco de dados

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'EMPLOYEE',
    franchise_id INTEGER,
    avatar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de franquias
CREATE TABLE IF NOT EXISTS franchises (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cnpj VARCHAR(20) UNIQUE,
    address VARCHAR(500),
    phone VARCHAR(20),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    franchise_id INTEGER NOT NULL REFERENCES franchises(id),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    cpf VARCHAR(20) UNIQUE,
    address VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de marcas de produtos
CREATE TABLE IF NOT EXISTS brands (
    id SERIAL PRIMARY KEY,
    franchise_id INTEGER NOT NULL REFERENCES franchises(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de categorias de produtos
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    franchise_id INTEGER NOT NULL REFERENCES franchises(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    franchise_id INTEGER NOT NULL REFERENCES franchises(id),
    brand_id INTEGER REFERENCES brands(id),
    category_id INTEGER REFERENCES categories(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(100) UNIQUE,
    price DECIMAL(10, 2),
    cost DECIMAL(10, 2),
    stock_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_franchise_id ON users(franchise_id);
CREATE INDEX IF NOT EXISTS idx_clients_franchise_id ON clients(franchise_id);
CREATE INDEX IF NOT EXISTS idx_products_franchise_id ON products(franchise_id);
CREATE INDEX IF NOT EXISTS idx_brands_franchise_id ON brands(franchise_id);
CREATE INDEX IF NOT EXISTS idx_categories_franchise_id ON categories(franchise_id);

-- Tabela de planos de assinatura
CREATE TABLE IF NOT EXISTS subscription_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    billing_cycle VARCHAR(20) DEFAULT 'monthly',
    max_users INTEGER DEFAULT 5,
    max_stores INTEGER DEFAULT 1,
    features JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de assinaturas
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    franchise_id INTEGER NOT NULL REFERENCES franchises(id),
    plan_id INTEGER NOT NULL REFERENCES subscription_plans(id),
    status VARCHAR(50) DEFAULT 'active',
    current_period_start DATE,
    current_period_end DATE,
    trial_end DATE,
    amount DECIMAL(10, 2),
    billing_cycle VARCHAR(20) DEFAULT 'monthly',
    stripe_subscription_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de tickets de suporte
CREATE TABLE IF NOT EXISTS support_tickets (
    id SERIAL PRIMARY KEY,
    franchise_id INTEGER NOT NULL REFERENCES franchises(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de mensagens de ticket
CREATE TABLE IF NOT EXISTS support_ticket_messages (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de vendas
CREATE TABLE IF NOT EXISTS sales (
    id SERIAL PRIMARY KEY,
    franchise_id INTEGER NOT NULL REFERENCES franchises(id),
    client_id INTEGER REFERENCES clients(id),
    user_id INTEGER REFERENCES users(id),
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de contas a receber
CREATE TABLE IF NOT EXISTS receivables (
    id SERIAL PRIMARY KEY,
    franchise_id INTEGER NOT NULL REFERENCES franchises(id),
    client_id INTEGER REFERENCES clients(id),
    description VARCHAR(500),
    amount DECIMAL(10, 2) NOT NULL,
    due_date DATE,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de contas a pagar
CREATE TABLE IF NOT EXISTS payables (
    id SERIAL PRIMARY KEY,
    franchise_id INTEGER NOT NULL REFERENCES franchises(id),
    description VARCHAR(500),
    amount DECIMAL(10, 2) NOT NULL,
    due_date DATE,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de oportunidades de venda (CRM)
CREATE TABLE IF NOT EXISTS opportunities (
    id SERIAL PRIMARY KEY,
    franchise_id INTEGER NOT NULL REFERENCES franchises(id),
    client_id INTEGER NOT NULL REFERENCES clients(id),
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    value DECIMAL(10, 2),
    stage VARCHAR(50) DEFAULT 'prospecting',
    probability INTEGER DEFAULT 0,
    expected_close_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de atividades de oportunidade
CREATE TABLE IF NOT EXISTS opportunity_activities (
    id SERIAL PRIMARY KEY,
    opportunity_id INTEGER NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) DEFAULT 'note',
    scheduled_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de pagamentos de clientes
CREATE TABLE IF NOT EXISTS client_payments (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id),
    amount DECIMAL(10, 2) NOT NULL,
    method VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending',
    description VARCHAR(500),
    due_date DATE,
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de agendamentos
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    franchise_id INTEGER NOT NULL REFERENCES franchises(id),
    client_id INTEGER REFERENCES clients(id),
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_at TIMESTAMP NOT NULL,
    end_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir um SUPER_ADMIN de teste (senha: 123456)
-- O hash foi gerado com bcrypt(10)
INSERT INTO users (name, email, password_hash, role, franchise_id)
VALUES ('Admin', 'admin@lenzoo.com.br', '$2b$10$X0mKNUYsCOxRNzFsRtDnIOwqxJYGxs8CqTpLLI8q8YXW7K9J7Zpuu', 'SUPER_ADMIN', NULL)
ON CONFLICT (email) DO NOTHING;
