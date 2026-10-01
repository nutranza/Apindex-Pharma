import Link from "next/link"

export default function CtaSection() {
  return (
    <section className="bg-white apx-section">
      <div className="content-container">
        <div className="mx-auto overflow-hidden rounded-2xl bg-primary-container/80 px-6 py-10 text-on-surface shadow-[0_28px_80px_rgba(107,173,35,0.14)] sm:px-10 lg:px-14 lg:py-12">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 font-semibold capitalize text-on-surface">
              Partner with Apindex
            </p>
            <h2 className="apx-font-headline flex flex-col items-center gap-2 text-3xl font-bold leading-tight sm:text-4xl lg:text-[44px]">
              <span>Scale with Trusted</span>
              <span className="text-secondary">Pharma Supply Support</span>
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-base font-medium leading-7 text-on-surface-variant sm:text-lg">
              Partner with Apindex for finished formulations, contract
              manufacturing coordination, documentation support, and
              export-ready pharmaceutical supply.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="apx-button-secondary min-h-12"
              >
                Start an Inquiry
              </Link>
              <Link
                href="/products"
                className="apx-button-outline min-h-12"
              >
                Explore Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
