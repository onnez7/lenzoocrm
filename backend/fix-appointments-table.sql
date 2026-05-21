-- Verificar se a coluna employee_id existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'appointments' 
        AND column_name = 'employee_id'
    ) THEN
        -- Adicionar a coluna employee_id
        ALTER TABLE appointments ADD COLUMN employee_id INTEGER;
        
        -- Adicionar a foreign key
        ALTER TABLE appointments 
        ADD CONSTRAINT fk_appointments_employee 
        FOREIGN KEY (employee_id) REFERENCES employees(id);
        
        RAISE NOTICE 'Coluna employee_id adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna employee_id já existe!';
    END IF;
END $$;

-- Verificar a estrutura atual da tabela
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'appointments' 
ORDER BY ordinal_position;

-- Mostrar os dados atuais (se houver)
SELECT COUNT(*) as total_appointments FROM appointments; 