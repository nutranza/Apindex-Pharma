import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function CtaSection() {
  return (
    <section className="bg-white py-14 lg:py-16">
      <div className="content-container">
        <div className="mx-auto max-w-5xl rounded-2xl bg-surface-low px-4 py-14 text-center text-on-surface">
          <div className="mx-auto max-w-3xl">
            <p className="mb-4 text-sm font-extrabold text-primary">
              Partner with Apindex
            </p>
            <h2 className="apx-font-headline flex flex-col capitalize items-center gap-2 text-3xl font-extrabold leading-none text-on-surface sm:gap-3 sm:text-4xl lg:text-5xl">
              <span>Scale with</span>
              <span className="text-primary">trusted pharma support</span>
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-base font-medium leading-8 text-on-surface-variant sm:text-lg">
              Partner with Apindex for WHO-GMP aligned manufacturing,
              third-party production, and export-ready supply support.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-extrabold text-white transition-colors hover:bg-primary-container"
              >
                Start an Inquiry
                <ArrowRight aria-hidden="true" className="h-5 w-5" />
              </Link>
              <Link
                href="/products"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-[#ded4c4] bg-white px-6 py-3 text-sm font-extrabold text-on-surface transition-colors hover:border-primary"
              >
                Explore Products
                <ArrowRight aria-hidden="true" className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
