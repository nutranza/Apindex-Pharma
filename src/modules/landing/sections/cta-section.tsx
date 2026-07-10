import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function CtaSection() {
  return (
    <section className="bg-white py-16 lg:py-20">
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
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-secondary px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(232,150,29,0.22)] transition-colors  focus:outline-none"
              >
                Start an Inquiry
              </Link>
              <Link
                href="/products"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-outline-variant/50 bg-white px-6 py-3 text-sm font-semibold text-on-surface transition-colors focus:outline-none"
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
