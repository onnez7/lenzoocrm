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

-- Tabela de permissões por módulo
CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    module VARCHAR(50) NOT NULL,
    action VARCHAR(20) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(module, action)
);

-- Tabela de permissões por cargo
CREATE TABLE IF NOT EXISTS role_permissions (
    id SERIAL PRIMARY KEY,
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
    granted BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role_id, permission_id)
);

-- Tabela de permissões específicas por funcionário (sobrescreve permissões do cargo)
CREATE TABLE IF NOT EXISTS employee_permissions (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
    permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
    granted BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, permission_id)
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

-- Inserir permissões padrão
INSERT INTO permissions (module, action, description) VALUES
-- Dashboard
('dashboard', 'view', 'Visualizar dashboard'),
-- Clientes
('clients', 'view', 'Visualizar clientes'),
('clients', 'create', 'Criar clientes'),
('clients', 'edit', 'Editar clientes'),
('clients', 'delete', 'Excluir clientes'),
-- Produtos
('products', 'view', 'Visualizar produtos'),
('products', 'create', 'Criar produtos'),
('products', 'edit', 'Editar produtos'),
('products', 'delete', 'Excluir produtos'),
-- Estoque
('stock', 'view', 'Visualizar estoque'),
('stock', 'create', 'Criar movimentações'),
('stock', 'edit', 'Editar movimentações'),
('stock', 'delete', 'Excluir movimentações'),
-- Ordens de Serviço
('orders', 'view', 'Visualizar ordens'),
('orders', 'create', 'Criar ordens'),
('orders', 'edit', 'Editar ordens'),
('orders', 'delete', 'Excluir ordens'),
-- Agendamentos
('appointments', 'view', 'Visualizar agendamentos'),
('appointments', 'create', 'Criar agendamentos'),
('appointments', 'edit', 'Editar agendamentos'),
('appointments', 'delete', 'Excluir agendamentos'),
-- Automação
('automation', 'view', 'Visualizar automações'),
('automation', 'create', 'Criar automações'),
('automation', 'edit', 'Editar automações'),
('automation', 'delete', 'Excluir automações'),
-- Caixa
('cashier', 'view', 'Visualizar caixa'),
('cashier', 'create', 'Criar vendas'),
('cashier', 'edit', 'Editar vendas'),
('cashier', 'delete', 'Excluir vendas'),
-- CRM
('crm', 'view', 'Visualizar CRM'),
('crm', 'create', 'Criar leads'),
('crm', 'edit', 'Editar leads'),
('crm', 'delete', 'Excluir leads'),
-- Financeiro
('finance', 'view', 'Visualizar financeiro'),
('finance', 'create', 'Criar transações'),
('finance', 'edit', 'Editar transações'),
('finance', 'delete', 'Excluir transações'),
-- Funcionários
('employees', 'view', 'Visualizar funcionários'),
('employees', 'create', 'Criar funcionários'),
('employees', 'edit', 'Editar funcionários'),
('employees', 'delete', 'Excluir funcionários'),
-- Perfil de Usuário
('user_profile', 'view', 'Visualizar perfil'),
('user_profile', 'edit', 'Editar perfil'),
-- Configurações de Usuário
('user_settings', 'view', 'Visualizar configurações'),
('user_settings', 'edit', 'Editar configurações'),
-- Configurações do Sistema
('settings', 'view', 'Visualizar configurações'),
('settings', 'edit', 'Editar configurações')
ON CONFLICT DO NOTHING;

-- Inserir permissões padrão para cada cargo
-- Administrador (todas as permissões)
INSERT INTO role_permissions (role_id, permission_id, granted)
SELECT 1, id, true FROM permissions
ON CONFLICT DO NOTHING;

-- Gerente (todas exceto configurações do sistema)
INSERT INTO role_permissions (role_id, permission_id, granted)
SELECT 2, id, true FROM permissions WHERE module != 'settings'
ON CONFLICT DO NOTHING;

-- Vendedor (acesso básico)
INSERT INTO role_permissions (role_id, permission_id, granted)
SELECT 3, id, 
  CASE 
    WHEN module IN ('dashboard', 'clients', 'products', 'appointments', 'crm', 'user_profile', 'user_settings') AND action = 'view' THEN true
    WHEN module IN ('clients', 'appointments') AND action IN ('create', 'edit') THEN true
    WHEN module IN ('user_profile', 'user_settings') AND action = 'edit' THEN true
    ELSE false
  END
FROM permissions
ON CONFLICT DO NOTHING;

-- Técnico (acesso técnico)
INSERT INTO role_permissions (role_id, permission_id, granted)
SELECT 4, id, 
  CASE 
    WHEN module IN ('dashboard', 'clients', 'products', 'stock', 'orders', 'appointments', 'user_profile', 'user_settings') AND action = 'view' THEN true
    WHEN module IN ('orders', 'stock') AND action IN ('create', 'edit') THEN true
    WHEN module IN ('user_profile', 'user_settings') AND action = 'edit' THEN true
    ELSE false
  END
FROM permissions
ON CONFLICT DO NOTHING;

-- Caixa (acesso ao caixa)
INSERT INTO role_permissions (role_id, permission_id, granted)
SELECT 5, id, 
  CASE 
    WHEN module IN ('dashboard', 'clients', 'products', 'cashier', 'user_profile', 'user_settings') AND action = 'view' THEN true
    WHEN module IN ('cashier') AND action IN ('create', 'edit') THEN true
    WHEN module IN ('user_profile', 'user_settings') AND action = 'edit' THEN true
    ELSE false
  END
FROM permissions
ON CONFLICT DO NOTHING;

-- Estoquista (acesso ao estoque)
INSERT INTO role_permissions (role_id, permission_id, granted)
SELECT 6, id, 
  CASE 
    WHEN module IN ('dashboard', 'products', 'stock', 'user_profile', 'user_settings') AND action = 'view' THEN true
    WHEN module IN ('stock') AND action IN ('create', 'edit') THEN true
    WHEN module IN ('user_profile', 'user_settings') AND action = 'edit' THEN true
    ELSE false
  END
FROM permissions
ON CONFLICT DO NOTHING;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_role_permissions_updated_at BEFORE UPDATE ON role_permissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employee_permissions_updated_at BEFORE UPDATE ON employee_permissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 