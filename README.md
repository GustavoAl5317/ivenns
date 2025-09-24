# ivenns - Landing Page Moderna

Uma landing page moderna para a empresa ivenns, com funcionalidades de produtos, serviços, parceiros e painel administrativo.

## 🚀 Funcionalidades

- **Site Público:**
  - Exibição de produtos
  - Exibição de serviços
  - Seção de parceiros e fornecedores
  - Seção de avaliações
  - Formulário de contato
  - Integração com WhatsApp

- **Painel Administrativo:**
  - Gerenciamento de produtos e serviços
  - Gerenciamento de parceiros e fornecedores
  - Configurações do site (WhatsApp, informações da empresa)
  - Moderação de avaliações
  - Informações do administrador
  - **Acesso restrito ao usuário admin da empresa**

## 🛠️ Tecnologias

- **Frontend:** Next.js 14, React, TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Backend:** Supabase (Database, Auth, Storage)
- **Icons:** Lucide React

## 📋 Pré-requisitos

- Node.js 18+
- npm ou pnpm
- Conta no Supabase

## ⚙️ Configuração

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd modern-landing-page
```

### 2. Instale as dependências
```bash
npm install
# ou
pnpm install
```

### 3. Configure o Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Copie o arquivo `.env.local.example` para `.env.local`
3. Substitua as variáveis pelos valores do seu projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
```

### 4. Configure o banco de dados

Como as tabelas principais já existem, você precisa apenas:

#### A) Criar a tabela de parceiros (nova funcionalidade):
Execute o arquivo `sql-partners-table.sql` no SQL Editor do Supabase.

#### B) Configurar o usuário admin:
1. No painel do Supabase, vá em Authentication > Users
2. Clique em "Add user" e crie com:
   - Email: `vendas@ivenns.com.br`
   - Password: `1VennS@25`
3. Copie o User ID gerado
4. Execute o arquivo `sql-admin-user.sql` substituindo o USER_ID

#### C) Verificar tabelas existentes:
As seguintes tabelas já devem existir no seu banco:
- `products` (produtos e serviços)
- `profiles` (perfis de usuário)
- `site_settings` (configurações do site)

Se alguma tabela estiver faltando, execute o SQL completo abaixo:
);

-- Tabela de perfis de usuário
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  role TEXT CHECK (role IN ('user', 'admin')) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de configurações do site
CREATE TABLE site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  whatsapp_number TEXT,
  contact_email TEXT,
  site_title TEXT DEFAULT 'ivenns',
  site_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir configurações padrão
INSERT INTO site_settings (site_title, site_description)
VALUES ('ivenns', 'Apresentamos os melhores produtos e serviços para você');

-- Políticas RLS (Row Level Security)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para produtos (público pode ler, admin pode tudo)
CREATE POLICY "Produtos são públicos" ON products FOR SELECT USING (true);
CREATE POLICY "Admin pode gerenciar produtos" ON products FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Políticas para parceiros (público pode ler, admin pode tudo)
CREATE POLICY "Parceiros são públicos" ON partners FOR SELECT USING (true);
CREATE POLICY "Admin pode gerenciar parceiros" ON partners FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Políticas para perfis
CREATE POLICY "Usuários podem ver próprio perfil" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admin pode ver todos os perfis" ON profiles FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Políticas para configurações do site
CREATE POLICY "Configurações são públicas" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Admin pode gerenciar configurações" ON site_settings FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);
```

### 5. Execute o projeto

```bash
npm run dev
# ou
pnpm dev
```

O projeto estará disponível em `http://localhost:3000`

## 👤 Criando um usuário admin

1. Registre-se no site (ou crie via Supabase Auth)
2. No painel do Supabase, vá em Authentication > Users
3. Encontre seu usuário e copie o ID
4. Execute no SQL Editor:

```sql
INSERT INTO profiles (id, full_name, role) 
VALUES ('seu-user-id-aqui', 'Seu Nome', 'admin');
```

## 📁 Estrutura do Projeto

```
├── app/                    # App Router do Next.js
│   ├── admin/             # Páginas do painel admin
│   ├── api/               # API Routes
│   └── page.tsx           # Página principal
├── components/            # Componentes React
│   ├── admin/            # Componentes do admin
│   ├── ui/               # Componentes UI (shadcn)
│   └── ...               # Outros componentes
├── lib/                  # Utilitários e configurações
│   └── supabase/         # Cliente Supabase
└── hooks/                # Custom hooks
```

## 🎨 Personalização

### Cores e Tema
As cores podem ser personalizadas no arquivo `app/globals.css` nas variáveis CSS.

### Logo
Substitua o placeholder do logo nos arquivos:
- `components/header.tsx`
- `components/admin/admin-header.tsx`

### WhatsApp
Configure o número do WhatsApp no painel admin em "Configurações".

## 📝 Licença

Este projeto está sob a licença MIT.