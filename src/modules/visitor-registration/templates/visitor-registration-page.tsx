import VisitorRegistrationForm from "@modules/visitor-registration/components/visitor-registration-form"

export default function VisitorRegistrationPageTemplate() {
  return (
    <main className="apx-landing apx-font-body bg-surface px-4 pb-16 pt-32 text-on-surface sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center sm:mb-10">
          <p className="apx-font-headline text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Expo Nairobi Visitor Registration
          </p>
          <h1 className="section-heading mx-auto mt-3 max-w-4xl text-on-surface">
            7th International Indo-Africa B2B Trade Expo &amp; Investment Summit
            (IIATE) 2026 Visitor Registration Form
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-on-surface-variant sm:text-base">
            Register to visit the IIATE 2026 event at KICC, Nairobi, Kenya.
          </p>
        </div>

        <div className="rounded-2xl border border-outline-variant/20 bg-white p-5 shadow-sm sm:p-8 lg:p-10">
          <VisitorRegistrationForm />
        </div>
      </div>
    </main>
  )
}
