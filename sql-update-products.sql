-- SQL para adicionar campos extras aos produtos (para funcionalidade e-commerce)
-- Execute este SQL no Supabase

-- Adicionar colunas extras para produtos
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS additional_images TEXT[], -- Array de URLs de imagens extras
ADD COLUMN IF NOT EXISTS specifications TEXT, -- Especificações técnicas
ADD COLUMN IF NOT EXISTS features TEXT[], -- Array de características
ADD COLUMN IF NOT EXISTS warranty TEXT, -- Informações de garantia
ADD COLUMN IF NOT EXISTS weight DECIMAL(10,2), -- Peso do produto
ADD COLUMN IF NOT EXISTS dimensions TEXT, -- Dimensões (ex: "10x20x30 cm")
ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0, -- Quantidade em estoque
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false; -- Produto em destaque

-- Atualizar alguns produtos existentes com dados de exemplo (opcional)
UPDATE products 
SET 
  additional_images = ARRAY[image_url, 'https://via.placeholder.com/600x400/4F46E5/FFFFFF?text=Imagem+2', 'https://via.placeholder.com/600x400/059669/FFFFFF?text=Imagem+3'],
  specifications = 'Especificações técnicas detalhadas do produto. Inclui informações sobre materiais, dimensões, capacidade e outras características importantes.',
  features = ARRAY['Alta qualidade', 'Durabilidade garantida', 'Design moderno', 'Fácil instalação'],
  warranty = '12 meses de garantia',
  weight = 2.5,
  dimensions = '25x15x10 cm',
  stock_quantity = 50,
  is_featured = true
WHERE category = 'product' AND id IN (
  SELECT id FROM products WHERE category = 'product' LIMIT 3
);

-- Verificar as alterações
SELECT id, title, category, additional_images, specifications, features, warranty 
FROM products 
WHERE category = 'product' 
LIMIT 5;