-- SQL ALTERNATIVO - Versão mais simples para corrigir recursão
-- Use este se o sql-fix-policies.sql não funcionar

-- 1. DESABILITAR RLS em todas as tabelas
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE partners DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings DISABLE ROW LEVEL SECURITY;

-- 2. REMOVER todas as políticas
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE tablename IN ('products', 'partners', 'profiles', 'site_settings')) LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- 3. CRIAR políticas MUITO simples (sem verificação de admin por enquanto)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_allow_all" ON products FOR ALL USING (true);

ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "partners_allow_all" ON partners FOR ALL USING (true);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "site_settings_allow_all" ON site_settings FOR ALL USING (true);

-- Para profiles, política mais restritiva
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_own_only" ON profiles FOR ALL USING (auth.uid() = id);

-- 4. Verificar
SELECT 'Políticas criadas com sucesso!' as status;
SELECT tablename, policyname FROM pg_policies WHERE tablename IN ('products', 'partners', 'profiles', 'site_settings');