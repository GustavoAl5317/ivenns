-- SQL para criar a tabela de parceiros/fornecedores
-- Execute este comando no SQL Editor do Supabase

CREATE TABLE partners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  website_url TEXT,
  whatsapp TEXT,
  category TEXT CHECK (category IN ('partner', 'supplier')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública
CREATE POLICY "Parceiros são públicos" ON partners FOR SELECT USING (true);

-- Política para permitir que admin gerencie parceiros
CREATE POLICY "Admin pode gerenciar parceiros" ON partners FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Inserir alguns parceiros de exemplo (opcional)
INSERT INTO partners (name, description, logo_url, category, website_url, whatsapp) VALUES
('Fornecedor Tech', 'Especialista em soluções tecnológicas avançadas', 'https://via.placeholder.com/200x100', 'supplier', 'https://fornecedortech.com', '11991321-1958'),
('Parceiro Logística', 'Soluções completas em logística e distribuição', 'https://via.placeholder.com/200x100', 'partner', 'https://parcerologistica.com', '11888888888'),
('Supplier Global', 'Fornecedor internacional de componentes', 'https://via.placeholder.com/200x100', 'supplier', 'https://supplierglobal.com', '11777777777');