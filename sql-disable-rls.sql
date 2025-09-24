-- SQL EMERGENCIAL - Desabilitar RLS completamente para desenvolvimento
-- Use este se estiver com muitos problemas de políticas

-- DESABILITAR RLS em todas as tabelas principais
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE partners DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings DISABLE ROW LEVEL SECURITY;

-- REMOVER todas as políticas problemáticas
DROP POLICY IF EXISTS "Admin pode gerenciar produtos" ON products;
DROP POLICY IF EXISTS "Admin pode gerenciar parceiros" ON partners;
DROP POLICY IF EXISTS "Admin pode ver todos os perfis" ON profiles;
DROP POLICY IF EXISTS "Admin pode gerenciar configurações" ON site_settings;
DROP POLICY IF EXISTS "Produtos são públicos" ON products;
DROP POLICY IF EXISTS "Parceiros são públicos" ON partners;
DROP POLICY IF EXISTS "Configurações são públicas" ON site_settings;
DROP POLICY IF EXISTS "products_public_read" ON products;
DROP POLICY IF EXISTS "products_admin_all" ON products;
DROP POLICY IF EXISTS "partners_public_read" ON partners;
DROP POLICY IF EXISTS "partners_admin_all" ON partners;
DROP POLICY IF EXISTS "profiles_own_read" ON profiles;
DROP POLICY IF EXISTS "profiles_admin_read" ON profiles;
DROP POLICY IF EXISTS "site_settings_public_read" ON site_settings;
DROP POLICY IF EXISTS "site_settings_admin_all" ON site_settings;
DROP POLICY IF EXISTS "products_allow_all" ON products;
DROP POLICY IF EXISTS "partners_allow_all" ON partners;
DROP POLICY IF EXISTS "site_settings_allow_all" ON site_settings;
DROP POLICY IF EXISTS "profiles_own_only" ON profiles;

-- Verificar que RLS está desabilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('products', 'partners', 'profiles', 'site_settings')
ORDER BY tablename;

-- Verificar que não há políticas
SELECT 
    tablename,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename IN ('products', 'partners', 'profiles', 'site_settings')
GROUP BY tablename
ORDER BY tablename;