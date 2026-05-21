-- Adicionar colunas faltantes na tabela clients
ALTER TABLE clients ADD COLUMN IF NOT EXISTS cpf VARCHAR(14);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS state VARCHAR(2);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS zip_code VARCHAR(10);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS notes TEXT;

-- Comentários para documentação
COMMENT ON COLUMN clients.cpf IS 'CPF do cliente (formato: 123.456.789-00)';
COMMENT ON COLUMN clients.birth_date IS 'Data de nascimento';
COMMENT ON COLUMN clients.city IS 'Cidade';
COMMENT ON COLUMN clients.state IS 'Estado (sigla de 2 letras)';
COMMENT ON COLUMN clients.zip_code IS 'CEP';
COMMENT ON COLUMN clients.notes IS 'Observações sobre o cliente'; 