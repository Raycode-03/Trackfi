import Navbar from "./navbar";
import { HeroSection } from "@/components/base/heroSection";
import { FeaturesSection } from "@/components/base/featuresSection";
import { MarketCoverageSection } from "@/components/base/marketCoverageSection";
import { AlertsSection } from "@/components/base/alertsSection";
import { PortfolioSection } from "@/components/base/portfolioSection";
import { StepsSection } from "@/components/base/stepsSection";
import { StatsSection } from "@/components/base/statsSection";
import { TestimonialsSection } from "@/components/base/testimonialsSection";
import { PricingSection } from "@/components/base/pricingSection";
import { FAQSection } from "@/components/base/faqSection";
import { CTASection } from "@/components/base/ctaSection";
import { FooterSection } from "@/components/base/footerSection";

export default function LandingPage() {
  return (
    <>
      <Navbar isLanding={true} />
      <main className="bg-[#0a0a0a]">
        <HeroSection />
        <section id="features">
          <FeaturesSection />
        </section>
        {/* <MarketCoverageSection />
        <AlertsSection />
        <PortfolioSection /> */}
        <StepsSection />
        <StatsSection />
        <TestimonialsSection />
        <section id="pricing">
          <PricingSection />
        </section>
        <section id="faq">
          <FAQSection />
        </section>
        <CTASection />
        <FooterSection />
      </main>
    </>
  );
}
