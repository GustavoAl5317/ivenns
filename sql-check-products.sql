-- SQL para verificar e ajustar a tabela products
-- Execute este SQL no Supabase

-- 1. Verificar a estrutura atual da tabela products
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- 2. Se a coluna user_id for obrigatória mas você quiser torná-la opcional:
-- ALTER TABLE products ALTER COLUMN user_id DROP NOT NULL;

-- 3. OU se quiser manter obrigatória, definir um valor padrão:
-- ALTER TABLE products ALTER COLUMN user_id SET DEFAULT 'default-user-id';

-- 4. Verificar se há produtos sem user_id
SELECT id, title, user_id 
FROM products 
WHERE user_id IS NULL 
LIMIT 10;

-- 5. Se houver produtos sem user_id, você pode atualizá-los:
-- UPDATE products 
-- SET user_id = 'SEU_USER_ID_ADMIN_AQUI' 
-- WHERE user_id IS NULL;

-- 6. Verificar dados atuais
SELECT 
    id, 
    title, 
    category, 
    user_id,
    created_at
FROM products 
ORDER BY created_at DESC 
LIMIT 10;