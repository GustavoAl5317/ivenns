-- SQL para configurar o usuário admin da ivenns
-- Execute este comando APÓS criar o usuário no Supabase Auth

-- 1. Primeiro, crie o usuário no painel do Supabase:
--    - Vá em Authentication > Users
--    - Clique em "Add user"
--    - Email: vendas@ivenns.com.br
--    - Password: 1VennS@25
--    - Copie o User ID gerado

-- 2. Substitua 'USER_ID_AQUI' pelo ID real do usuário e execute:
INSERT INTO profiles (id, full_name, role) 
VALUES ('USER_ID_AQUI', 'Administrador ivenns', 'admin');

-- Exemplo:
-- INSERT INTO profiles (id, full_name, role) 
-- VALUES ('12345678-1234-1234-1234-123456789012', 'Administrador ivenns', 'admin');

-- Verificar se o usuário foi criado corretamente:
SELECT * FROM profiles WHERE role = 'admin';