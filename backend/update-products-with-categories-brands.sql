-- Atualizar produtos existentes com categorias e marcas
UPDATE products 
SET category_id = (
  SELECT id FROM categories 
  WHERE name = 'Óculos de Sol' AND franchise_id = products.franchise_id 
  LIMIT 1
)
WHERE name ILIKE '%óculos%' AND name ILIKE '%sol%' AND category_id IS NULL;

UPDATE products 
SET category_id = (
  SELECT id FROM categories 
  WHERE name = 'Armações' AND franchise_id = products.franchise_id 
  LIMIT 1
)
WHERE name ILIKE '%armação%' AND category_id IS NULL;

UPDATE products 
SET category_id = (
  SELECT id FROM categories 
  WHERE name = 'Lentes de Contato' AND franchise_id = products.franchise_id 
  LIMIT 1
)
WHERE name ILIKE '%lente%' AND name ILIKE '%contato%' AND category_id IS NULL;

UPDATE products 
SET category_id = (
  SELECT id FROM categories 
  WHERE name = 'Acessórios' AND franchise_id = products.franchise_id 
  LIMIT 1
)
WHERE name ILIKE '%cordão%' OR name ILIKE '%estojo%' OR name ILIKE '%acessório%' AND category_id IS NULL;

-- Atualizar marcas
UPDATE products 
SET brand_id = (
  SELECT id FROM brands 
  WHERE name = 'Ray-Ban' AND franchise_id = products.franchise_id 
  LIMIT 1
)
WHERE name ILIKE '%ray-ban%' OR name ILIKE '%rayban%' AND brand_id IS NULL;

UPDATE products 
SET brand_id = (
  SELECT id FROM brands 
  WHERE name = 'Oakley' AND franchise_id = products.franchise_id 
  LIMIT 1
)
WHERE name ILIKE '%oakley%' AND brand_id IS NULL;

UPDATE products 
SET brand_id = (
  SELECT id FROM brands 
  WHERE name = 'Prada' AND franchise_id = products.franchise_id 
  LIMIT 1
)
WHERE name ILIKE '%prada%' AND brand_id IS NULL;

UPDATE products 
SET brand_id = (
  SELECT id FROM brands 
  WHERE name = 'Chilli Beans' AND franchise_id = products.franchise_id 
  LIMIT 1
)
WHERE name ILIKE '%chilli%' OR name ILIKE '%beans%' AND brand_id IS NULL;

UPDATE products 
SET brand_id = (
  SELECT id FROM brands 
  WHERE name = 'Johnson & Johnson' AND franchise_id = products.franchise_id 
  LIMIT 1
)
WHERE name ILIKE '%acuvue%' OR name ILIKE '%johnson%' AND brand_id IS NULL;

-- Adicionar modelos e códigos de barras para produtos existentes
UPDATE products 
SET model = 'RB3025' 
WHERE name ILIKE '%ray-ban%' AND name ILIKE '%aviador%' AND model IS NULL;

UPDATE products 
SET model = 'OX8156' 
WHERE name ILIKE '%oakley%' AND model IS NULL;

UPDATE products 
SET model = 'PR17WS' 
WHERE name ILIKE '%prada%' AND model IS NULL;

UPDATE products 
SET model = 'CB2024' 
WHERE name ILIKE '%chilli%' AND model IS NULL;

-- Gerar códigos de barras fictícios para produtos que não têm
UPDATE products 
SET barcode = CONCAT('789', LPAD(id::text, 10, '0'))
WHERE barcode IS NULL;

-- Verificar produtos atualizados
SELECT 
  p.name,
  c.name as category_name,
  b.name as brand_name,
  p.model,
  p.barcode
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN brands b ON p.brand_id = b.id
ORDER BY p.id; 