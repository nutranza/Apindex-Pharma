import AboutCompanyDocumentsSection from "@modules/about/sections/about-company-documents-section"
import AboutGlobalFootprintSection from "@modules/about/sections/about-global-footprint-section"
import AboutHeroSection from "@modules/about/sections/about-hero-section"
import AboutFounderSection from "@modules/about/sections/about-founder-section"
import AboutPurposeSection from "@modules/about/sections/about-purpose-section"
import AboutStatsSection from "@modules/about/sections/about-stats-section"
export default function AboutPageTemplate() {
  return (
    <div className="apx-landing apx-font-body bg-surface text-on-surface">
      <main className="!pb-0">
        <AboutHeroSection />
        <AboutFounderSection />
        <AboutStatsSection />
        <AboutPurposeSection />
        <AboutCompanyDocumentsSection />
        <AboutGlobalFootprintSection />
      </main>
    </div>
  )
}

