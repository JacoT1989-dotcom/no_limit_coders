import { ContactSection } from "./_components/(section-1)/contact-section";
import { HeroSection } from "./_components/(section-2)/hero-section";
import { PricingSection } from "./_components/(section-3)/pricing-section";
import { ProjectsSection } from "./_components/(section-4)/projects-section";
import { ServicesSection } from "./_components/(section-5)/services-section";
import { TechStackSection } from "./_components/(section-6)/tech-stack-section";
import { TechStackSlider } from "./_components/(section-7)/tech-stack-slider";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <ServicesSection />
      <TechStackSection />
      <ProjectsSection />
      <PricingSection />
      <ContactSection />
      <TechStackSlider />
    </main>
  );
}
