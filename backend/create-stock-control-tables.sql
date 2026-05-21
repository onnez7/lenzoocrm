-- Criar tabela de movimentações de estoque
CREATE TABLE IF NOT EXISTS stock_movements (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    franchise_id INTEGER REFERENCES franchises(id),
    user_id INTEGER REFERENCES users(id),
    movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('entry', 'exit', 'adjustment', 'transfer')),
    quantity INTEGER NOT NULL,
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    reason TEXT,
    reference_number VARCHAR(50), -- Número da nota fiscal, pedido, etc.
    supplier VARCHAR(100), -- Para entradas
    customer VARCHAR(100), -- Para saídas
    notes TEXT,
    movement_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de fornecedores
CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    franchise_id INTEGER REFERENCES franchises(id),
    name VARCHAR(100) NOT NULL,
    cnpj VARCHAR(18),
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    contact_person VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de estoque por localização (opcional para futuras expansões)
CREATE TABLE IF NOT EXISTS stock_locations (
    id SERIAL PRIMARY KEY,
    franchise_id INTEGER REFERENCES franchises(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Adicionar coluna de localização à tabela de produtos (opcional)
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_location_id INTEGER REFERENCES stock_locations(id);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_franchise_id ON stock_movements(franchise_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_user_id ON stock_movements(user_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_movement_date ON stock_movements(movement_date);
CREATE INDEX IF NOT EXISTS idx_stock_movements_movement_type ON stock_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_suppliers_franchise_id ON suppliers(franchise_id);
CREATE INDEX IF NOT EXISTS idx_stock_locations_franchise_id ON stock_locations(franchise_id);

-- Triggers para atualizar updated_at
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir localização padrão
INSERT INTO stock_locations (franchise_id, name, description) VALUES
(1, 'Estoque Principal', 'Localização principal do estoque')
ON CONFLICT DO NOTHING;

-- Inserir fornecedores de exemplo
INSERT INTO suppliers (franchise_id, name, cnpj, email, phone, contact_person) VALUES
(1, 'Distribuidora Óptica Ltda', '12.345.678/0001-90', 'contato@distribuidoraoptica.com', '(11) 99999-9999', 'João Silva'),
(1, 'Importadora de Óculos S.A.', '98.765.432/0001-10', 'vendas@importadora.com', '(11) 88888-8888', 'Maria Santos'),
(1, 'Fornecedor Nacional', '55.444.333/0001-22', 'pedidos@fornecedor.com', '(11) 77777-7777', 'Carlos Oliveira')
ON CONFLICT DO NOTHING;

-- Função para registrar movimentação de estoque
CREATE OR REPLACE FUNCTION register_stock_movement(
    p_product_id INTEGER,
    p_franchise_id INTEGER,
    p_user_id INTEGER,
    p_movement_type VARCHAR(20),
    p_quantity INTEGER,
    p_unit_cost DECIMAL(10,2) DEFAULT NULL,
    p_reason TEXT DEFAULT NULL,
    p_reference_number VARCHAR(50) DEFAULT NULL,
    p_supplier VARCHAR(100) DEFAULT NULL,
    p_customer VARCHAR(100) DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
    v_previous_stock INTEGER;
    v_new_stock INTEGER;
    v_total_cost DECIMAL(10,2);
    v_movement_id INTEGER;
BEGIN
    -- Obter estoque atual do produto
    SELECT stock_quantity INTO v_previous_stock 
    FROM products 
    WHERE id = p_product_id AND franchise_id = p_franchise_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Produto não encontrado';
    END IF;
    
    -- Calcular novo estoque baseado no tipo de movimentação
    CASE p_movement_type
        WHEN 'entry' THEN
            v_new_stock := v_previous_stock + p_quantity;
        WHEN 'exit' THEN
            IF v_previous_stock < p_quantity THEN
                RAISE EXCEPTION 'Estoque insuficiente. Disponível: %, Solicitado: %', v_previous_stock, p_quantity;
            END IF;
            v_new_stock := v_previous_stock - p_quantity;
        WHEN 'adjustment' THEN
            v_new_stock := p_quantity; -- Ajuste define o estoque diretamente
        ELSE
            RAISE EXCEPTION 'Tipo de movimentação inválido: %', p_movement_type;
    END CASE;
    
    -- Calcular custo total se fornecido
    v_total_cost := CASE 
        WHEN p_unit_cost IS NOT NULL THEN p_unit_cost * ABS(p_quantity)
        ELSE NULL 
    END;
    
    -- Inserir movimentação
    INSERT INTO stock_movements (
        product_id, franchise_id, user_id, movement_type, quantity,
        previous_stock, new_stock, unit_cost, total_cost, reason,
        reference_number, supplier, customer, notes
    ) VALUES (
        p_product_id, p_franchise_id, p_user_id, p_movement_type, p_quantity,
        v_previous_stock, v_new_stock, p_unit_cost, v_total_cost, p_reason,
        p_reference_number, p_supplier, p_customer, p_notes
    ) RETURNING id INTO v_movement_id;
    
    -- Atualizar estoque do produto
    UPDATE products 
    SET stock_quantity = v_new_stock, updated_at = CURRENT_TIMESTAMP
    WHERE id = p_product_id;
    
    RETURN v_movement_id;
END;
$$ LANGUAGE plpgsql; 