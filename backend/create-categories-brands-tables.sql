-- Criar tabela de categorias
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    franchise_id INTEGER REFERENCES franchises(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de marcas
CREATE TABLE IF NOT EXISTS brands (
    id SERIAL PRIMARY KEY,
    franchise_id INTEGER REFERENCES franchises(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Adicionar campos à tabela products
ALTER TABLE products ADD COLUMN IF NOT EXISTS model VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode VARCHAR(50);
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES categories(id);
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand_id INTEGER REFERENCES brands(id);

-- Inserir categorias padrão
INSERT INTO categories (franchise_id, name, description) VALUES
(1, 'Óculos de Sol', 'Óculos para proteção solar e estilo'),
(1, 'Armações', 'Armações para lentes de grau'),
(1, 'Lentes de Contato', 'Lentes de contato diversos tipos'),
(1, 'Acessórios', 'Cordões, estojos e acessórios diversos'),
(1, 'Óculos Infantil', 'Óculos especiais para crianças'),
(1, 'Lentes', 'Lentes de grau e tratamentos'),
(1, 'Óculos Esportivos', 'Óculos para prática esportiva')
ON CONFLICT DO NOTHING;

-- Inserir marcas padrão
INSERT INTO brands (franchise_id, name, description) VALUES
(1, 'Ray-Ban', 'Marca premium de óculos de sol'),
(1, 'Oakley', 'Óculos esportivos e de alto desempenho'),
(1, 'Prada', 'Óculos de luxo e design exclusivo'),
(1, 'Gucci', 'Óculos de alta moda'),
(1, 'Chilli Beans', 'Óculos coloridos e jovens'),
(1, 'Essilor', 'Lentes de alta tecnologia'),
(1, 'Johnson & Johnson', 'Lentes de contato'),
(1, 'Alcon', 'Lentes de contato e produtos oftálmicos'),
(1, 'Transitions', 'Lentes fotocromáticas'),
(1, 'Tom Ford', 'Óculos elegantes e sofisticados'),
(1, 'Versace', 'Óculos de luxo italianos'),
(1, 'Dolce & Gabbana', 'Óculos de design italiano'),
(1, 'Persol', 'Óculos vintage italianos'),
(1, 'Bvlgari', 'Óculos de luxo com detalhes'),
(1, 'Oliver Peoples', 'Óculos artesanais'),
(1, 'Carrera', 'Óculos esportivos'),
(1, 'Disney', 'Óculos infantis'),
(1, 'Nike', 'Óculos esportivos'),
(1, 'Adidas', 'Óculos esportivos'),
(1, 'Vans', 'Óculos casuais')
ON CONFLICT DO NOTHING;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_categories_franchise_id ON categories(franchise_id);
CREATE INDEX IF NOT EXISTS idx_brands_franchise_id ON brands(franchise_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id);

-- Triggers para atualizar updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 