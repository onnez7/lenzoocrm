-- Tabela de receitas ópticas
CREATE TABLE IF NOT EXISTS prescriptions (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    doctor VARCHAR(255) NOT NULL,
    -- Olho direito
    right_eye_spherical DECIMAL(4,2),
    right_eye_cylindrical DECIMAL(4,2),
    right_eye_axis INTEGER,
    right_eye_addition DECIMAL(4,2),
    -- Olho esquerdo
    left_eye_spherical DECIMAL(4,2),
    left_eye_cylindrical DECIMAL(4,2),
    left_eye_axis INTEGER,
    left_eye_addition DECIMAL(4,2),
    -- Medidas adicionais
    pd VARCHAR(10), -- Distância pupilar
    height VARCHAR(10), -- Altura
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de compras/vendas
CREATE TABLE IF NOT EXISTS sales (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    franchise_id INTEGER REFERENCES franchises(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'completed', -- completed, pending, cancelled
    payment_method VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de itens da venda
CREATE TABLE IF NOT EXISTS sale_items (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    notes TEXT
);

-- Tabela de agendamentos
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    franchise_id INTEGER REFERENCES franchises(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    type VARCHAR(50) NOT NULL, -- consulta, entrega, retorno
    status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, completed, cancelled, no_show
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_prescriptions_client_id ON prescriptions(client_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_date ON prescriptions(date);
CREATE INDEX IF NOT EXISTS idx_sales_client_id ON sales(client_id);
CREATE INDEX IF NOT EXISTS idx_sales_franchise_id ON sales(franchise_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_franchise_id ON appointments(franchise_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);

-- Inserir dados de exemplo
-- Receitas ópticas
INSERT INTO prescriptions (client_id, date, doctor, right_eye_spherical, right_eye_cylindrical, right_eye_axis, right_eye_addition, left_eye_spherical, left_eye_cylindrical, left_eye_axis, left_eye_addition, pd, height, notes) VALUES
(1, '2024-01-15', 'Dr. Maria Oliveira', -2.00, -0.50, 90, 1.25, -1.75, -0.25, 85, 1.25, '62mm', '18mm', 'Receita para óculos progressivos'),
(1, '2023-06-20', 'Dr. Carlos Santos', -1.75, -0.25, 90, 1.00, -1.50, -0.25, 85, 1.00, '62mm', '18mm', 'Receita anterior'),
(2, '2024-01-10', 'Dr. Ana Silva', -1.50, -0.75, 88, 1.50, -1.25, -0.50, 92, 1.50, '64mm', '20mm', 'Primeira receita');

-- Compras
INSERT INTO sales (client_id, franchise_id, date, total_amount, status, payment_method, notes) VALUES
(1, 1, '2024-01-15', 650.00, 'completed', 'cartão', 'Óculos Ray-Ban + Lentes Crizal'),
(1, 1, '2023-12-10', 380.00, 'completed', 'dinheiro', 'Lentes de contato 6 meses'),
(1, 1, '2023-08-22', 220.00, 'completed', 'pix', 'Óculos de sol Oakley'),
(2, 1, '2024-01-12', 450.00, 'completed', 'cartão', 'Óculos básico');

-- Itens das vendas
INSERT INTO sale_items (sale_id, product_name, quantity, unit_price, total_price) VALUES
(1, 'Óculos Ray-Ban RB3025', 1, 350.00, 350.00),
(1, 'Lentes Crizal', 1, 300.00, 300.00),
(2, 'Lentes de Contato Acuvue Oasys (6 meses)', 1, 380.00, 380.00),
(3, 'Óculos de Sol Oakley', 1, 220.00, 220.00),
(4, 'Óculos Básico', 1, 450.00, 450.00);

-- Agendamentos
INSERT INTO appointments (client_id, franchise_id, date, time, type, status, notes) VALUES
(1, 1, '2024-01-15', '14:30:00', 'consulta', 'completed', 'Renovação de receita'),
(1, 1, '2024-02-20', '10:00:00', 'entrega', 'scheduled', 'Entrega de óculos novos'),
(2, 1, '2024-01-12', '15:00:00', 'consulta', 'completed', 'Primeira consulta'),
(2, 1, '2024-02-15', '16:00:00', 'retorno', 'scheduled', 'Retorno para ajustes');

-- Comentários
COMMENT ON TABLE prescriptions IS 'Receitas ópticas dos clientes';
COMMENT ON TABLE sales IS 'Vendas/compras dos clientes';
COMMENT ON TABLE sale_items IS 'Itens individuais de cada venda';
COMMENT ON TABLE appointments IS 'Agendamentos dos clientes'; 