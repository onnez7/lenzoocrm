-- Inserir produtos de exemplo para a franquia matriz
INSERT INTO products (franchise_id, name, description, price, cost, stock_quantity, min_stock, category, brand, sku, status) VALUES
(1, 'Óculos Ray-Ban Aviador', 'Óculos de sol clássico com lentes polarizadas', 450.00, 200.00, 15, 5, 'Óculos de Sol', 'Ray-Ban', 'RB3025-001', 'active'),
(1, 'Armação Oakley OX8156', 'Armação esportiva para lentes de grau', 380.00, 180.00, 8, 10, 'Armações', 'Oakley', 'OAK-8156-02', 'active'),
(1, 'Lente de Contato Acuvue', 'Lentes de contato descartáveis mensais', 85.00, 45.00, 25, 15, 'Lentes de Contato', 'Johnson & Johnson', 'JJ-OASYS-30', 'active'),
(1, 'Óculos Prada PR 17WS', 'Óculos de sol de luxo com design exclusivo', 850.00, 400.00, 3, 5, 'Óculos de Sol', 'Prada', 'PR-17WS-1AB', 'active'),
(1, 'Armação Chilli Beans', 'Armação colorida para jovens', 150.00, 75.00, 0, 8, 'Armações', 'Chilli Beans', 'CB-2024-BK', 'inactive'),
(1, 'Lente Progressiva Essilor', 'Lente progressiva de alta tecnologia', 1200.00, 600.00, 12, 8, 'Lentes', 'Essilor', 'ESS-PROG-1.74', 'active'),
(1, 'Óculos Gucci GG0060S', 'Óculos de sol com logo Gucci', 1200.00, 500.00, 6, 3, 'Óculos de Sol', 'Gucci', 'GUCCI-GG0060S', 'active'),
(1, 'Armação Tom Ford FT0010', 'Armação elegante para executivos', 650.00, 300.00, 10, 5, 'Armações', 'Tom Ford', 'TF-FT0010-01', 'active'),
(1, 'Lente Transitions', 'Lente fotocromática que escurece no sol', 450.00, 225.00, 18, 10, 'Lentes', 'Transitions', 'TRANS-1.67', 'active'),
(1, 'Óculos Infantil Disney', 'Óculos resistentes para crianças', 120.00, 60.00, 22, 15, 'Óculos Infantil', 'Disney', 'DISNEY-KIDS-01', 'active'),
(1, 'Armação Carrera 6001', 'Armação esportiva de alta performance', 280.00, 140.00, 7, 5, 'Armações', 'Carrera', 'CAR-6001-SP', 'active'),
(1, 'Lente Anti-reflexo', 'Lente com tratamento anti-reflexo premium', 180.00, 90.00, 30, 20, 'Lentes', 'Essilor', 'ESS-AR-PREMIUM', 'active'),
(1, 'Óculos Versace VE2190', 'Óculos de sol com detalhes dourados', 750.00, 350.00, 4, 3, 'Óculos de Sol', 'Versace', 'VER-VE2190-GD', 'active'),
(1, 'Armação Ray-Ban RB3447V', 'Armação clássica Wayfarer', 320.00, 160.00, 14, 8, 'Armações', 'Ray-Ban', 'RB-3447V-001', 'active'),
(1, 'Lente de Contato Air Optix', 'Lentes de contato de uso prolongado', 95.00, 50.00, 20, 12, 'Lentes de Contato', 'Alcon', 'ALC-AIR-OPTIX', 'active'),
(1, 'Óculos Dolce & Gabbana DG4001', 'Óculos de sol com design italiano', 680.00, 320.00, 5, 3, 'Óculos de Sol', 'Dolce & Gabbana', 'DG-DG4001-IT', 'active'),
(1, 'Armação Persol PO3015', 'Armação vintage com charme italiano', 420.00, 210.00, 9, 6, 'Armações', 'Persol', 'PER-PO3015-VT', 'active'),
(1, 'Lente Blue Control', 'Lente com proteção contra luz azul', 220.00, 110.00, 16, 10, 'Lentes', 'Essilor', 'ESS-BLUE-CTRL', 'active'),
(1, 'Óculos Bvlgari BV3026', 'Óculos de sol de luxo com detalhes', 920.00, 460.00, 2, 2, 'Óculos de Sol', 'Bvlgari', 'BV-BV3026-LX', 'active'),
(1, 'Armação Oliver Peoples OP-505', 'Armação artesanal de alta qualidade', 580.00, 290.00, 11, 7, 'Armações', 'Oliver Peoples', 'OP-505-ART', 'active');

-- Inserir produtos para uma segunda franquia (se existir)
-- INSERT INTO products (franchise_id, name, description, price, cost, stock_quantity, min_stock, category, brand, sku, status) VALUES
-- (2, 'Óculos Local Franquia 2', 'Produto específico da franquia 2', 300.00, 150.00, 10, 5, 'Óculos de Sol', 'Marca Local', 'LOCAL-F2-001', 'active'); 