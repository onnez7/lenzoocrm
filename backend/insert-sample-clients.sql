-- Inserir clientes de exemplo
INSERT INTO clients (franchise_id, name, email, phone, cpf, birth_date, address, city, state, zip_code, notes) VALUES
(1, 'João Silva', 'joao@email.com', '(11) 99999-9999', '123.456.789-00', '1985-05-15', 'Rua das Flores, 123', 'São Paulo', 'SP', '01234-567', 'Cliente VIP. Prefere lentes de contato mensais.'),
(1, 'Maria Santos', 'maria@email.com', '(11) 88888-8888', '987.654.321-00', '1990-08-22', 'Av. Paulista, 1000', 'São Paulo', 'SP', '01310-100', 'Cliente frequente. Gosta de óculos de sol.'),
(2, 'Pedro Costa', 'pedro@email.com', '(11) 77777-7777', '456.789.123-00', '1978-12-10', 'Rua Augusta, 500', 'São Paulo', 'SP', '01205-000', 'Cliente novo. Primeira consulta.'),
(2, 'Ana Oliveira', 'ana@email.com', '(11) 66666-6666', '789.123.456-00', '1995-03-25', 'Rua Oscar Freire, 200', 'São Paulo', 'SP', '01426-000', 'Cliente ativo. Faz exames anuais.')
ON CONFLICT (id) DO NOTHING; 