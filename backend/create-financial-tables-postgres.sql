-- Script para criar tabelas financeiras no PostgreSQL
-- Execute este script no seu banco PostgreSQL

-- Tabela de contas bancárias
CREATE TABLE IF NOT EXISTS bank_accounts (
    id SERIAL PRIMARY KEY,
    franchise_id INTEGER REFERENCES franchises(id),
    bank_name VARCHAR(100) NOT NULL,
    account_type VARCHAR(20) NOT NULL CHECK (account_type IN ('checking', 'savings', 'business')),
    account_number VARCHAR(50) NOT NULL,
    agency VARCHAR(20) NOT NULL,
    balance DECIMAL(15,2) DEFAULT 0.00,
    pix_key VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de cartões de crédito
CREATE TABLE IF NOT EXISTS credit_cards (
    id SERIAL PRIMARY KEY,
    franchise_id INTEGER REFERENCES franchises(id),
    card_name VARCHAR(100) NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    last_four_digits VARCHAR(4) NOT NULL,
    brand VARCHAR(20) NOT NULL CHECK (brand IN ('visa', 'mastercard', 'elo', 'amex', 'hipercard')),
    limit_amount DECIMAL(15,2) NOT NULL,
    available_limit DECIMAL(15,2) NOT NULL,
    due_date INTEGER NOT NULL CHECK (due_date >= 1 AND due_date <= 31),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de contas a pagar
CREATE TABLE IF NOT EXISTS payables (
    id SERIAL PRIMARY KEY,
    franchise_id INTEGER REFERENCES franchises(id),
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    due_date DATE NOT NULL,
    payment_date DATE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
    category VARCHAR(50),
    supplier VARCHAR(100),
    invoice_number VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de contas a receber
CREATE TABLE IF NOT EXISTS receivables (
    id SERIAL PRIMARY KEY,
    franchise_id INTEGER REFERENCES franchises(id),
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    due_date DATE NOT NULL,
    payment_date DATE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
    category VARCHAR(50),
    client_name VARCHAR(100),
    invoice_number VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de notas fiscais
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    franchise_id INTEGER REFERENCES franchises(id),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    client_name VARCHAR(100) NOT NULL,
    client_document VARCHAR(20),
    amount DECIMAL(15,2) NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
    payment_method VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_bank_accounts_franchise ON bank_accounts(franchise_id);
CREATE INDEX IF NOT EXISTS idx_credit_cards_franchise ON credit_cards(franchise_id);
CREATE INDEX IF NOT EXISTS idx_payables_franchise ON payables(franchise_id);
CREATE INDEX IF NOT EXISTS idx_payables_status ON payables(status);
CREATE INDEX IF NOT EXISTS idx_payables_due_date ON payables(due_date);
CREATE INDEX IF NOT EXISTS idx_receivables_franchise ON receivables(franchise_id);
CREATE INDEX IF NOT EXISTS idx_receivables_status ON receivables(status);
CREATE INDEX IF NOT EXISTS idx_receivables_due_date ON receivables(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_franchise ON invoices(franchise_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_bank_accounts_updated_at BEFORE UPDATE ON bank_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_credit_cards_updated_at BEFORE UPDATE ON credit_cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payables_updated_at BEFORE UPDATE ON payables FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_receivables_updated_at BEFORE UPDATE ON receivables FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 