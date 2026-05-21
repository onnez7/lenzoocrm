-- Criar tabela de clientes
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    franchise_id INTEGER REFERENCES franchises(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    cpf VARCHAR(14),
    birth_date DATE,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(2),
    zip_code VARCHAR(10),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_clients_franchise_id ON clients(franchise_id);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_cpf ON clients(cpf);

-- Inserir alguns clientes de exemplo
INSERT INTO clients (franchise_id, name, email, phone, cpf, birth_date, address, city, state, zip_code, notes) VALUES
(1, 'João Silva', 'joao@email.com', '(11) 99999-9999', '123.456.789-00', '1985-05-15', 'Rua das Flores, 123', 'São Paulo', 'SP', '01234-567', 'Cliente VIP. Prefere lentes de contato mensais.'),
(1, 'Maria Santos', 'maria@email.com', '(11) 88888-8888', '987.654.321-00', '1990-08-22', 'Av. Paulista, 1000', 'São Paulo', 'SP', '01310-100', 'Cliente frequente. Gosta de óculos de sol.'),
(2, 'Pedro Costa', 'pedro@email.com', '(11) 77777-7777', '456.789.123-00', '1978-12-10', 'Rua Augusta, 500', 'São Paulo', 'SP', '01205-000', 'Cliente novo. Primeira consulta.'),
(2, 'Ana Oliveira', 'ana@email.com', '(11) 66666-6666', '789.123.456-00', '1995-03-25', 'Rua Oscar Freire, 200', 'São Paulo', 'SP', '01426-000', 'Cliente ativo. Faz exames anuais.');

-- Comentários sobre a estrutura
COMMENT ON TABLE clients IS 'Tabela de clientes das franquias';
COMMENT ON COLUMN clients.franchise_id IS 'ID da franquia (NULL se não associado)';
COMMENT ON COLUMN clients.name IS 'Nome completo do cliente';
COMMENT ON COLUMN clients.email IS 'Email do cliente';
COMMENT ON COLUMN clients.phone IS 'Telefone do cliente';
COMMENT ON COLUMN clients.cpf IS 'CPF do cliente (formato: 123.456.789-00)';
COMMENT ON COLUMN clients.birth_date IS 'Data de nascimento';
COMMENT ON COLUMN clients.address IS 'Endereço completo';
COMMENT ON COLUMN clients.city IS 'Cidade';
COMMENT ON COLUMN clients.state IS 'Estado (sigla de 2 letras)';
COMMENT ON COLUMN clients.zip_code IS 'CEP';
COMMENT ON COLUMN clients.notes IS 'Observações sobre o cliente'; 