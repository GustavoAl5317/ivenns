-- Insert sample products (only if no products exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.products LIMIT 1) THEN
    -- Create a sample user first (this would normally be done through auth)
    -- Note: In production, this would be handled by the auth system
    
    INSERT INTO public.products (title, description, image_url, sku, category, price, user_id, is_active) VALUES
    ('Consultoria em Marketing Digital', 'Estratégias personalizadas para aumentar sua presença online e gerar mais leads qualificados.', '/placeholder.svg?height=300&width=400', 'SERV-001', 'service', 1500.00, '00000000-0000-0000-0000-000000000000', true),
    ('Desenvolvimento de Website', 'Criação de sites modernos, responsivos e otimizados para SEO.', '/placeholder.svg?height=300&width=400', 'SERV-002', 'service', 2500.00, '00000000-0000-0000-0000-000000000000', true),
    ('Gestão de Redes Sociais', 'Gerenciamento completo das suas redes sociais com conteúdo estratégico.', '/placeholder.svg?height=300&width=400', 'SERV-003', 'service', 800.00, '00000000-0000-0000-0000-000000000000', true),
    ('E-book: Guia Completo de SEO', 'Material completo com as melhores práticas de otimização para mecanismos de busca.', '/placeholder.svg?height=300&width=400', 'PROD-001', 'product', 97.00, '00000000-0000-0000-0000-000000000000', true),
    ('Curso Online: Marketing de Conteúdo', 'Aprenda a criar conteúdo que converte e engaja sua audiência.', '/placeholder.svg?height=300&width=400', 'PROD-002', 'product', 297.00, '00000000-0000-0000-0000-000000000000', true),
    ('Template de Landing Page', 'Templates profissionais para criar páginas de alta conversão.', '/placeholder.svg?height=300&width=400', 'PROD-003', 'product', 147.00, '00000000-0000-0000-0000-000000000000', true);
  END IF;
END $$;

-- Insert sample reviews
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.reviews LIMIT 1) THEN
    INSERT INTO public.reviews (product_id, reviewer_name, reviewer_email, rating, comment, is_approved, is_public) 
    SELECT 
      p.id,
      reviewer_data.name,
      reviewer_data.email,
      reviewer_data.rating,
      reviewer_data.comment,
      true,
      true
    FROM public.products p
    CROSS JOIN (
      VALUES 
        ('Maria Silva', 'maria@email.com', 5, 'Excelente serviço! Superou todas as minhas expectativas. Recomendo muito!'),
        ('João Santos', 'joao@email.com', 5, 'Profissionais muito competentes. Resultado incrível para minha empresa.'),
        ('Ana Costa', 'ana@email.com', 4, 'Muito bom! Entregaram tudo no prazo e com qualidade.'),
        ('Carlos Oliveira', 'carlos@email.com', 5, 'Investimento que valeu muito a pena. Já vejo os resultados.'),
        ('Fernanda Lima', 'fernanda@email.com', 4, 'Gostei muito do atendimento e do resultado final.'),
        ('Roberto Alves', 'roberto@email.com', 5, 'Superou minhas expectativas! Trabalho de alta qualidade.')
    ) AS reviewer_data(name, email, rating, comment)
    WHERE p.title IN ('Consultoria em Marketing Digital', 'Desenvolvimento de Website', 'Gestão de Redes Sociais')
    LIMIT 6;
  END IF;
END $$;
