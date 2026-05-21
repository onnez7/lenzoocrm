-- Tabela de cargos/funções
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de funcionários
CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    franchise_id INTEGER REFERENCES franchises(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES roles(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    position VARCHAR(100),
    salary DECIMAL(10,2),
    hire_date DATE NOT NULL,
    termination_date DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
    address TEXT,
    cpf VARCHAR(14) UNIQUE,
    rg VARCHAR(20),
    emergency_contact VARCHAR(255),
    emergency_phone VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir cargos padrão
INSERT INTO roles (name, description) VALUES
('Administrador', 'Acesso total ao sistema'),
('Gerente', 'Acesso à gestão e relatórios'),
('Vendedor', 'Acesso básico para vendas'),
('Técnico', 'Acesso técnico especializado'),
('Caixa', 'Acesso ao caixa e vendas'),
('Estoquista', 'Acesso ao controle de estoque')
ON CONFLICT DO NOTHING; 