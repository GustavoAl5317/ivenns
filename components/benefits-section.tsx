import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Users, Zap, Shield, Clock, Award } from "lucide-react"

const benefits = [
  {
    icon: CheckCircle,
    title: "Qualidade Garantida",
    description: "Todos os nossos produtos e serviços passam por rigoroso controle de qualidade.",
  },
  {
    icon: Users,
    title: "Atendimento Personalizado",
    description: "Cada cliente recebe atenção individual e soluções customizadas para suas necessidades.",
  },
  {
    icon: Zap,
    title: "Resultados Rápidos",
    description: "Implementação ágil e resultados visíveis em pouco tempo de parceria.",
  },
  {
    icon: Shield,
    title: "Segurança Total",
    description: "Seus dados e informações estão protegidos com os mais altos padrões de segurança.",
  },
  {
    icon: Clock,
    title: "Suporte 24/7",
    description: "Nossa equipe está sempre disponível para ajudar quando você precisar.",
  },
  {
    icon: Award,
    title: "Experiência Comprovada",
    description: "Anos de experiência no mercado com centenas de projetos bem-sucedidos.",
  },
]

export function BenefitsSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
            Por Que Escolher <span className="gradient-text">Nossa Empresa</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Oferecemos muito mais que produtos e serviços. Oferecemos uma parceria para o seu sucesso.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <Card
                key={index}
                className="group hover:shadow-lg transition-all duration-300 hover:scale-105 bg-card border-border/50"
              >
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl text-balance">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-muted-foreground text-pretty">{benefit.description}</CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
