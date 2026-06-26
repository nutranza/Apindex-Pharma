import Image from "next/image"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export default function CtaSection() {
  return (
    <section className="border-t border-gray-200/70 bg-white py-14 lg:py-20">
      <div className="content-container">
        <div className="overflow-hidden rounded-2xl bg-surface-low text-on-surface ring-1 ring-gray-200/80">
          <div className="grid lg:grid-cols-[0.55fr_1fr]">
            <div className="relative min-h-[350px] lg:min-h-[450px]">
              <Image
                fill
                src="/cta-image.jpg"
                alt="Apindex partnership discussion"
                sizes="(min-width: 1024px) 42vw, 100vw"
                className="object-cover grayscale"
              />
            </div>

            <div className="flex min-h-[300px] flex-col justify-center px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
              <h2 className="apx-font-headline max-w-2xl text-3xl font-extrabold leading-tight text-on-surface sm:text-4xl lg:text-5xl">
                Ready to scale your{" "}
                <span className="text-primary-container">
                  pharmaceutical supply?
                </span>
              </h2>

              <p className="mt-6 max-w-2xl text-base font-medium leading-8 text-on-surface-variant sm:text-lg">
                Connect with our team for WHO-GMP manufacturing, third-party
                production, and export-ready pharmaceutical solutions.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/contact"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-extrabold text-white transition-colors hover:bg-primary-container"
                >
                  <ChevronRight aria-hidden="true" className="h-5 w-5" />
                  Start a Partnership
                </Link>
                <Link
                  href="/products"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-extrabold text-on-surface transition-colors hover:border-primary-container hover:text-primary"
                >
                  <ChevronRight aria-hidden="true" className="h-5 w-5" />
                  View Products
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
