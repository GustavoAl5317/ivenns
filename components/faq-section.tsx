import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "Como funciona o processo de contratação?",
    answer:
      "Após o primeiro contato, agendamos uma reunião para entender suas necessidades. Em seguida, elaboramos uma proposta personalizada e, após aprovação, iniciamos o projeto com prazos bem definidos.",
  },
  {
    question: "Qual é o prazo médio de entrega?",
    answer:
      "O prazo varia conforme a complexidade do projeto. Serviços de consultoria podem levar de 1-2 semanas, enquanto desenvolvimentos mais complexos podem levar de 4-8 semanas. Sempre definimos prazos claros na proposta.",
  },
  {
    question: "Vocês oferecem suporte pós-entrega?",
    answer:
      "Sim! Oferecemos suporte completo pós-entrega. Todos os projetos incluem um período de garantia e suporte técnico. Também oferecemos planos de manutenção contínua.",
  },
  {
    question: "Como são definidos os preços?",
    answer:
      "Os preços são definidos com base no escopo do projeto, complexidade e prazo de entrega. Oferecemos orçamentos transparentes sem custos ocultos. Entre em contato para receber uma proposta personalizada.",
  },
  {
    question: "Posso fazer alterações durante o projeto?",
    answer:
      "Sim, entendemos que mudanças podem ser necessárias. Trabalhamos de forma flexível e comunicativa. Alterações significativas podem impactar prazo e custo, mas sempre discutimos isso previamente.",
  },
  {
    question: "Vocês trabalham com empresas de todos os tamanhos?",
    answer:
      "Absolutamente! Atendemos desde pequenos empreendedores até grandes corporações. Nossas soluções são escaláveis e adaptadas ao porte e necessidades específicas de cada cliente.",
  },
]

export function FAQSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
            Perguntas <span className="gradient-text">Frequentes</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Tire suas dúvidas sobre nossos produtos e serviços.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-balance">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-pretty">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
