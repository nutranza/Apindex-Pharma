import BlogSection from "@modules/landing/sections/blog-section"
import CategoriesSection from "@modules/landing/sections/categories-section"
import CtaSection from "@modules/landing/sections/cta-section"
import GlobalPresenceSection from "@modules/landing/sections/global-presence-section"
import HeroSection from "@modules/landing/sections/hero-section"
import ServicesSection from "@modules/landing/sections/services-section"
import WelcomeSection from "@modules/landing/sections/welcome-section"
import WhyChooseUsSection from "@modules/landing/sections/why-choose-us-section"

export default function LandingPageTemplate() {
  return (
    <div className="apx-landing apx-font-body bg-surface text-on-surface">
      <main className="!pb-0">
        <HeroSection />
        <WelcomeSection />
        <CategoriesSection />
        <ServicesSection />
        <GlobalPresenceSection />
        <WhyChooseUsSection />
        <BlogSection />
        <CtaSection />
      </main>
    </div>
  )
}
