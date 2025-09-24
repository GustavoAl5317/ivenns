-- SQL para resolver o problema do user_id obrigatório
-- Execute este SQL no Supabase

-- OPÇÃO 1: Tornar user_id opcional (mais simples)
ALTER TABLE products ALTER COLUMN user_id DROP NOT NULL;

-- OPÇÃO 2: OU manter obrigatório mas definir um padrão
-- Primeiro, pegue o ID do seu usuário admin:
-- SELECT id FROM profiles WHERE role = 'admin' LIMIT 1;

-- Depois substitua 'SEU_USER_ID_AQUI' pelo ID real e execute:
-- ALTER TABLE products ALTER COLUMN user_id SET DEFAULT 'SEU_USER_ID_AQUI';

-- Verificar se funcionou
SELECT column_name, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'products' AND column_name = 'user_id';