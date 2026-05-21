-- Script para adicionar franchise_id em todas as tabelas necessárias
-- Execute este script no banco de dados PostgreSQL

-- 1. Adicionar franchise_id na tabela receivables (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'receivables' AND column_name = 'franchise_id') THEN
        ALTER TABLE receivables ADD COLUMN franchise_id INTEGER;
        ALTER TABLE receivables ADD CONSTRAINT fk_receivables_franchise 
            FOREIGN KEY (franchise_id) REFERENCES franchises(id);
    END IF;
END $$;

-- 2. Adicionar franchise_id na tabela payables (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'payables' AND column_name = 'franchise_id') THEN
        ALTER TABLE payables ADD COLUMN franchise_id INTEGER;
        ALTER TABLE payables ADD CONSTRAINT fk_payables_franchise 
            FOREIGN KEY (franchise_id) REFERENCES franchises(id);
    END IF;
END $$;

-- 3. Adicionar franchise_id na tabela employees (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'employees' AND column_name = 'franchise_id') THEN
        ALTER TABLE employees ADD COLUMN franchise_id INTEGER;
        ALTER TABLE employees ADD CONSTRAINT fk_employees_franchise 
            FOREIGN KEY (franchise_id) REFERENCES franchises(id);
    END IF;
END $$;

-- 4. Adicionar franchise_id na tabela cashier_sangrias (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'cashier_sangrias' AND column_name = 'franchise_id') THEN
        ALTER TABLE cashier_sangrias ADD COLUMN franchise_id INTEGER;
        ALTER TABLE cashier_sangrias ADD CONSTRAINT fk_cashier_sangrias_franchise 
            FOREIGN KEY (franchise_id) REFERENCES franchises(id);
    END IF;
END $$;

-- 5. Adicionar franchise_id na tabela service_orders (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'service_orders' AND column_name = 'franchise_id') THEN
        ALTER TABLE service_orders ADD COLUMN franchise_id INTEGER;
        ALTER TABLE service_orders ADD CONSTRAINT fk_service_orders_franchise 
            FOREIGN KEY (franchise_id) REFERENCES franchises(id);
    END IF;
END $$;

-- 6. Adicionar franchise_id na tabela products (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'franchise_id') THEN
        ALTER TABLE products ADD COLUMN franchise_id INTEGER;
        ALTER TABLE products ADD CONSTRAINT fk_products_franchise 
            FOREIGN KEY (franchise_id) REFERENCES franchises(id);
    END IF;
END $$;

-- 7. Adicionar franchise_id na tabela categories (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'categories' AND column_name = 'franchise_id') THEN
        ALTER TABLE categories ADD COLUMN franchise_id INTEGER;
        ALTER TABLE categories ADD CONSTRAINT fk_categories_franchise 
            FOREIGN KEY (franchise_id) REFERENCES franchises(id);
    END IF;
END $$;

-- 8. Adicionar franchise_id na tabela brands (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'brands' AND column_name = 'franchise_id') THEN
        ALTER TABLE brands ADD COLUMN franchise_id INTEGER;
        ALTER TABLE brands ADD CONSTRAINT fk_brands_franchise 
            FOREIGN KEY (franchise_id) REFERENCES franchises(id);
    END IF;
END $$;

-- 9. Adicionar franchise_id na tabela stock_movements (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'stock_movements' AND column_name = 'franchise_id') THEN
        ALTER TABLE stock_movements ADD COLUMN franchise_id INTEGER;
        ALTER TABLE stock_movements ADD CONSTRAINT fk_stock_movements_franchise 
            FOREIGN KEY (franchise_id) REFERENCES franchises(id);
    END IF;
END $$;

-- 10. Adicionar franchise_id na tabela appointments (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'appointments' AND column_name = 'franchise_id') THEN
        ALTER TABLE appointments ADD COLUMN franchise_id INTEGER;
        ALTER TABLE appointments ADD CONSTRAINT fk_appointments_franchise 
            FOREIGN KEY (franchise_id) REFERENCES franchises(id);
    END IF;
END $$;

-- Verificar se as colunas foram adicionadas
SELECT 
    table_name, 
    column_name 
FROM information_schema.columns 
WHERE column_name = 'franchise_id' 
ORDER BY table_name; 