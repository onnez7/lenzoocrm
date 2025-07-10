-- Adiciona a coluna status nas tabelas principais do sistema multi-franquia LenzooCRM

-- 1. Franquias
ALTER TABLE franchises ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- 2. Produtos
ALTER TABLE products ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- 3. Funcionários
ALTER TABLE employees ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- 4. Contas a pagar
ALTER TABLE payables ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';

-- 5. Contas a receber
ALTER TABLE receivables ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';

-- 6. Categorias
ALTER TABLE categories ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- 7. Marcas
ALTER TABLE brands ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- 8. Movimentações de estoque
ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- 9. Vendas
ALTER TABLE sales ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'completed';

-- 10. Ordens de serviço
ALTER TABLE service_orders ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'open';

-- 11. Agendamentos
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'scheduled';

-- 12. Caixa (sangrias)
ALTER TABLE cashier_sangrias ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'open'; 