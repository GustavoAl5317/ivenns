# 🛍️ Sistema de Produtos vs Serviços - ivenns

## ✅ Implementações Realizadas

### 🎯 **SERVIÇOS** (Apresentação Simples)
- **Localização:** `/components/services-section.tsx`
- **Funcionalidade:** Apenas apresentação com botões de consulta
- **Botões:**
  - 🟢 **"Consultar via WhatsApp"** - Abre WhatsApp com mensagem personalizada
  - 📞 **"Entrar em Contato"** - Scroll para seção de contato
- **Visual:** Cards simples com imagem, título, descrição e preço (opcional)

### 🛒 **PRODUTOS** (Estilo E-commerce)
- **Localização:** `/components/products-section.tsx`
- **Funcionalidade:** Cards com link para página individual
- **Botões:**
  - 👁️ **"Ver Detalhes"** - Vai para página individual do produto
  - 💬 **Consulta Rápida** - WhatsApp direto (botão pequeno)
- **Página Individual:** `/app/produto/[id]/page.tsx`
  - Galeria de imagens
  - Especificações detalhadas
  - Informações completas
  - Botões de consulta

### 🔧 **Páginas Criadas:**
1. **`/app/produto/[id]/page.tsx`** - Página individual do produto
2. **`/components/product-details.tsx`** - Componente detalhado do produto
3. **`/app/admin/services/page.tsx`** - Gerenciamento de serviços no admin
4. **`/components/admin/services-management.tsx`** - CRUD de serviços

### 📊 **Banco de Dados:**
- **Tabela `products`** serve tanto para produtos quanto serviços
- **Campo `category`:** `'product'` ou `'service'`
- **Campos extras para produtos:** `additional_images`, `specifications`, `features`, `warranty`, etc.

## 🚀 **Como Usar:**

### **Para Serviços:**
1. Acesse `/admin/services`
2. Adicione serviços com `category = 'service'`
3. Aparecerão na seção "Serviços" do site com botões de consulta

### **Para Produtos:**
1. Acesse `/admin` (dashboard)
2. Adicione produtos com `category = 'product'`
3. Aparecerão na seção "Produtos" com link para página individual
4. Clique em "Ver Detalhes" para ver a página completa

## 📋 **SQLs para Executar:**

### 1. **Campos extras para produtos (opcional):**
```sql
-- Execute sql-update-products.sql no Supabase
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS additional_images TEXT[],
ADD COLUMN IF NOT EXISTS specifications TEXT,
ADD COLUMN IF NOT EXISTS features TEXT[],
ADD COLUMN IF NOT EXISTS warranty TEXT,
ADD COLUMN IF NOT EXISTS weight DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS dimensions TEXT,
ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
```

### 2. **Corrigir políticas RLS (obrigatório):**
```sql
-- Execute sql-fix-policies.sql no Supabase
DROP POLICY IF EXISTS "Admin pode gerenciar produtos" ON products;
CREATE POLICY "Admin pode gerenciar produtos" ON products FOR ALL USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
);
```

## 🎨 **Fluxo do Usuário:**

### **Serviços:**
1. Usuário vê card do serviço
2. Clica em "Consultar via WhatsApp" → Abre WhatsApp
3. OU clica em "Entrar em Contato" → Vai para seção contato

### **Produtos:**
1. Usuário vê card do produto
2. Clica em "Ver Detalhes" → Vai para `/produto/[id]`
3. Na página individual:
   - Vê galeria de imagens
   - Lê especificações completas
   - Clica em "Consultar via WhatsApp" ou "Entrar em Contato"

## 🔗 **URLs Importantes:**
- **Site:** http://localhost:3001
- **Admin Geral:** http://localhost:3001/admin
- **Admin Serviços:** http://localhost:3001/admin/services
- **Produto Individual:** http://localhost:3001/produto/[id]

## ✨ **Diferenças Principais:**

| Aspecto | Serviços | Produtos |
|---------|----------|----------|
| **Apresentação** | Card simples | Card + página individual |
| **Botões** | Consulta direta | Ver detalhes + consulta |
| **Informações** | Básicas | Completas com galeria |
| **Objetivo** | Consulta rápida | Experiência e-commerce |
| **Navegação** | Direto para contato | Página própria → contato |

Sistema pronto para uso! 🎉