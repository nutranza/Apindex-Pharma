import FaqList from "@modules/faq/components/faq-list"

export default function FaqPageTemplate() {
  return (
    <div className="apx-landing apx-font-body bg-surface text-on-surface">
      <main className="!pb-0 pt-20">
        <section className="border-b border-outline-variant/15 bg-secondary-container py-14 lg:py-20">
          <div className="content-container">
            <div className="max-w-3xl">
              <h1 className="apx-font-headline text-4xl font-semibold leading-tight text-on-surface sm:text-5xl">
                Frequently Asked Questions
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-on-surface-variant sm:text-lg">
                Answers to common questions about Apindex Pharmaceuticals’
                product supply, manufacturing coordination, documentation, and
                healthcare partnerships.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-surface py-16 lg:py-24">
          <div className="content-container">
            <div>
              <p className="mb-8 max-w-4xl text-base leading-7 text-on-surface-variant">
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
