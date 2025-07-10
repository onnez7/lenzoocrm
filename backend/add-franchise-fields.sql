-- Script para adicionar campos city e state à tabela franchises
-- Execute este script no banco de dados PostgreSQL

-- 1. Adicionar colunas city e state à tabela franchises
DO $$ 
BEGIN
    -- Adicionar coluna city se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'franchises' AND column_name = 'city') THEN
        ALTER TABLE franchises ADD COLUMN city VARCHAR(100);
        RAISE NOTICE 'Coluna city adicionada à tabela franchises';
    ELSE
        RAISE NOTICE 'Coluna city já existe na tabela franchises';
    END IF;

    -- Adicionar coluna state se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'franchises' AND column_name = 'state') THEN
        ALTER TABLE franchises ADD COLUMN state VARCHAR(2);
        RAISE NOTICE 'Coluna state adicionada à tabela franchises';
    ELSE
        RAISE NOTICE 'Coluna state já existe na tabela franchises';
    END IF;
END $$;

-- 2. Verificar se a coluna updated_at existe na tabela franchises
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'franchises' AND column_name = 'updated_at') THEN
        ALTER TABLE franchises ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        RAISE NOTICE 'Coluna updated_at adicionada à tabela franchises';
    ELSE
        RAISE NOTICE 'Coluna updated_at já existe na tabela franchises';
    END IF;
END $$;

-- 3. Recriar o trigger para updated_at (remover e recriar para garantir que funcione)
DROP TRIGGER IF EXISTS update_franchises_updated_at ON franchises;

-- Recriar a função update_updated_at_column se não existir
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Recriar o trigger
CREATE TRIGGER update_franchises_updated_at 
    BEFORE UPDATE ON franchises 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 4. Atualizar dados existentes com valores padrão para city e state
UPDATE franchises 
SET city = 'São Paulo', state = 'SP' 
WHERE city IS NULL OR state IS NULL;

-- 5. Verificar a estrutura final da tabela
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'franchises' 
ORDER BY ordinal_position;

-- 6. Verificar se o trigger foi criado corretamente
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'franchises'; 