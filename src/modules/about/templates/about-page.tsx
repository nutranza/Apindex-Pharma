import AboutGlobalFootprintSection from "@modules/about/sections/about-global-footprint-section"
import AboutHeroSection from "@modules/about/sections/about-hero-section"
import AboutIntroSection from "@modules/about/sections/about-intro-section"
import AboutQualityCommitmentSection from "@modules/about/sections/about-quality-commitment-section"
import AboutStatsSection from "@modules/about/sections/about-stats-section"
export default function AboutPageTemplate() {
  return (
    <div className="apx-landing apx-font-body bg-surface text-on-surface">
      <main className="!pb-0">
        <AboutHeroSection />
        <AboutIntroSection />
        <AboutStatsSection />
        <AboutQualityCommitmentSection />
        <AboutGlobalFootprintSection />
      </main>
    </div>
  )
}

