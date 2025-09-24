import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { ProductsSection } from "@/components/products-section"
import ServicesSection from "@/components/services-section"
import PartnersSection from "@/components/partners-section"

import { BenefitsSection } from "@/components/benefits-section"
import { ReviewsSection } from "@/components/reviews-section"
import { FAQSection } from "@/components/faq-section"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/footer"
import { WhatsAppFloat } from "@/components/whatsapp-float"
import AnimatedGlassCard from "@/components/animated-glass-card"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <ProductsSection />
      <ServicesSection />
      <PartnersSection />
      <BenefitsSection />
      <ReviewsSection />
      <FAQSection />
      <ContactSection />
      <Footer />
      <WhatsAppFloat />
    </main>
  )
}
