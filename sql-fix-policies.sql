-- SQL para corrigir políticas RLS e evitar recursão infinita
-- Execute este SQL no Supabase para corrigir os erros

-- 1. DESABILITAR RLS temporariamente para fazer as correções
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE partners DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings DISABLE ROW LEVEL SECURITY;

-- 2. REMOVER TODAS as políticas problemáticas
DROP POLICY IF EXISTS "Admin pode gerenciar produtos" ON products;
DROP POLICY IF EXISTS "Admin pode gerenciar parceiros" ON partners;
DROP POLICY IF EXISTS "Admin pode ver todos os perfis" ON profiles;
DROP POLICY IF EXISTS "Admin pode gerenciar configurações" ON site_settings;
DROP POLICY IF EXISTS "Produtos são públicos" ON products;
DROP POLICY IF EXISTS "Parceiros são públicos" ON partners;
DROP POLICY IF EXISTS "Configurações são públicas" ON site_settings;

-- 3. REABILITAR RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- 4. CRIAR políticas simples e seguras SEM recursão

-- Políticas para PRODUCTS
CREATE POLICY "products_public_read" ON products FOR SELECT USING (true);
CREATE POLICY "products_admin_all" ON products FOR ALL USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.id IN (
      SELECT p.id FROM profiles p WHERE p.role = 'admin'
    )
  )
);

-- Políticas para PARTNERS
CREATE POLICY "partners_public_read" ON partners FOR SELECT USING (true);
CREATE POLICY "partners_admin_all" ON partners FOR ALL USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.id IN (
      SELECT p.id FROM profiles p WHERE p.role = 'admin'
    )
  )
);

-- Políticas para PROFILES (mais cuidadosa)
CREATE POLICY "profiles_own_read" ON profiles FOR SELECT USING (
  auth.uid() = id
);
CREATE POLICY "profiles_admin_read" ON profiles FOR SELECT USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin' AND id = auth.uid()
  )
);

-- Políticas para SITE_SETTINGS
CREATE POLICY "site_settings_public_read" ON site_settings FOR SELECT USING (true);
CREATE POLICY "site_settings_admin_all" ON site_settings FOR ALL USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.id IN (
      SELECT p.id FROM profiles p WHERE p.role = 'admin'
    )
  )
);

-- 5. Verificar se as políticas foram criadas corretamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename IN ('products', 'partners', 'profiles', 'site_settings')
ORDER BY tablename, policyname;
ORDER BY tablename, policyname;