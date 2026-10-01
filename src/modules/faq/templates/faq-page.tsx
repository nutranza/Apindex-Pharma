import FaqList from "@modules/faq/components/faq-list"
import PageHeroSection from "@modules/common/components/page-hero-section"

export default function FaqPageTemplate() {
  return (
    <div className="apx-landing apx-font-body bg-surface text-on-surface">
      <main className="!pb-0">
        <PageHeroSection
          title="Answers for"
          accent="Pharma"
          suffix="Partnerships"
          description="Find clear answers about products, dosage forms, sourcing, documentation, manufacturing coordination, and global supply."
          imageSrc="/faq-hero-pharmaceutical-support.png"
          imageAlt="Pharmaceutical partnership specialists reviewing product documentation"
          imageClassName="object-[66%_center] sm:object-center lg:object-[50%_top]"
        />

        <section className="bg-surface apx-section">
          <div className="content-container">
            <div>
              <p className="apx-body-muted mb-8 max-w-4xl">
                Common questions about our product range, supply coordination,
                and manufacturing support. If your question is not answered
                here, send us an inquiry and our team will respond directly.
              </p>
              <FaqList />
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
