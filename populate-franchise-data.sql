-- Script para popular dados de teste para a franquia do João Silva
-- Execute este script no banco de dados PostgreSQL

-- Primeiro, vamos verificar se existe a franquia "Matriz"
DO $$
DECLARE
    matriz_franchise_id INTEGER;
BEGIN
    -- Buscar ou criar a franquia Matriz
    SELECT id INTO matriz_franchise_id FROM franchises WHERE name = 'Matriz';
    
    IF matriz_franchise_id IS NULL THEN
        INSERT INTO franchises (name, address, phone, email, created_at, updated_at)
        VALUES ('Matriz', 'Rua Principal, 123', '(11) 99999-9999', 'matriz@lenzoo.com', NOW(), NOW())
        RETURNING id INTO matriz_franchise_id;
    END IF;

    -- Inserir contas a receber de teste
    INSERT INTO receivables (franchise_id, description, amount, due_date, status, category, payment_method, created_at)
    VALUES 
        (matriz_franchise_id, 'Venda de óculos', 1500.00, '2024-01-15', 'paid', 'Vendas', 'credit_card', '2024-01-10'),
        (matriz_franchise_id, 'Serviço de lentes', 800.00, '2024-01-20', 'paid', 'Serviços', 'pix', '2024-01-12'),
        (matriz_franchise_id, 'Venda de armação', 1200.00, '2024-02-01', 'pending', 'Vendas', 'cash', '2024-01-15'),
        (matriz_franchise_id, 'Consulta oftalmológica', 200.00, '2024-01-25', 'overdue', 'Serviços', 'bank_transfer', '2024-01-08');

    -- Inserir contas a pagar de teste
    INSERT INTO payables (franchise_id, description, amount, due_date, status, category, payment_method, created_at)
    VALUES 
        (matriz_franchise_id, 'Fornecedor de lentes', 2500.00, '2024-01-30', 'paid', 'Fornecedores', 'bank_transfer', '2024-01-05'),
        (matriz_franchise_id, 'Aluguel da loja', 3000.00, '2024-02-05', 'pending', 'Aluguel', 'bank_transfer', '2024-01-10'),
        (matriz_franchise_id, 'Conta de luz', 450.00, '2024-01-20', 'paid', 'Serviços Públicos', 'pix', '2024-01-15'),
        (matriz_franchise_id, 'Internet e telefone', 200.00, '2024-02-10', 'pending', 'Serviços Públicos', 'credit_card', '2024-01-12');

    -- Inserir funcionários de teste (com hire_date obrigatório)
    INSERT INTO employees (franchise_id, name, email, phone, position, salary, hire_date, created_at)
    VALUES 
        (matriz_franchise_id, 'Maria Santos', 'maria@lenzoo.com', '(11) 88888-8888', 'Vendedora', 2500.00, '2024-01-01', '2024-01-01'),
        (matriz_franchise_id, 'Pedro Oliveira', 'pedro@lenzoo.com', '(11) 77777-7777', 'Optometrista', 3500.00, '2024-01-01', '2024-01-01'),
        (matriz_franchise_id, 'Ana Costa', 'ana@lenzoo.com', '(11) 66666-6666', 'Atendente', 2000.00, '2024-01-01', '2024-01-01');

    -- Inserir sangrias de teste
    INSERT INTO cashier_sangrias (franchise_id, amount, reason, created_at)
    VALUES 
        (matriz_franchise_id, 500.00, 'Compra de material de limpeza', '2024-01-15 10:00:00'),
        (matriz_franchise_id, 300.00, 'Pagamento de frete', '2024-01-16 14:30:00'),
        (matriz_franchise_id, 200.00, 'Compra de café e lanches', '2024-01-17 09:15:00');

    -- Inserir ordens de serviço de teste (sem client_id para evitar erro)
    INSERT INTO service_orders (franchise_id, order_number, total_amount, status, payment_method, created_at)
    VALUES 
        (matriz_franchise_id, 'ORD001', 1500.00, 'completed', 'credit_card', '2024-01-10 10:00:00'),
        (matriz_franchise_id, 'ORD002', 800.00, 'completed', 'pix', '2024-01-12 14:30:00'),
        (matriz_franchise_id, 'ORD003', 1200.00, 'completed', 'cash', '2024-01-15 16:45:00'),
        (matriz_franchise_id, 'ORD004', 200.00, 'pending', 'bank_transfer', '2024-01-18 11:20:00');

    RAISE NOTICE 'Dados de teste inseridos para a franquia Matriz (ID: %)', matriz_franchise_id;
END $$;

-- Verificar os dados inseridos
SELECT 'Receivables' as tabela, COUNT(*) as total FROM receivables WHERE franchise_id = (SELECT id FROM franchises WHERE name = 'Matriz' LIMIT 1)
UNION ALL
SELECT 'Payables' as tabela, COUNT(*) as total FROM payables WHERE franchise_id = (SELECT id FROM franchises WHERE name = 'Matriz' LIMIT 1)
UNION ALL
SELECT 'Employees' as tabela, COUNT(*) as total FROM employees WHERE franchise_id = (SELECT id FROM franchises WHERE name = 'Matriz' LIMIT 1)
UNION ALL
SELECT 'Sangrias' as tabela, COUNT(*) as total FROM cashier_sangrias WHERE franchise_id = (SELECT id FROM franchises WHERE name = 'Matriz' LIMIT 1)
UNION ALL
SELECT 'Service Orders' as tabela, COUNT(*) as total FROM service_orders WHERE franchise_id = (SELECT id FROM franchises WHERE name = 'Matriz' LIMIT 1); 