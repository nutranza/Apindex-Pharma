import Image from "next/image"
import Link from "next/link"

const INTRO_IMAGE_URL = "/about-company.jpg"

export default function AboutIntroSection() {
  return (
    <section className="bg-surface py-16 lg:py-24">
      <div className="content-container">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="relative h-[320px] overflow-hidden rounded-2xl sm:h-[420px] lg:h-[500px]">
            <Image
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              src={INTRO_IMAGE_URL}
              alt="Pharmaceutical quality team reviewing formulation support in a laboratory"
              className="object-cover object-center"
            />
          </div>

          <div className="space-y-6">
            <h2 className="section-heading">
              Trusted Pharma Supply,
              <span className="block text-primary">
                Built for Global Healthcare
              </span>
            </h2>
            <p className="section-description">
              Apindex Pharmaceuticals Pvt. Ltd. supplies and exports finished
              formulation products, surgicals, and disposable healthcare
              products for domestic and international buyers.
            </p>
            <p className="section-description">
              With reliable sourcing, clear documentation, and export-ready
              support, we help distributors, institutions, and healthcare
              partners source pharmaceutical products with confidence.
            </p>
            <div className="pt-2">
              <Link
                href="/#infrastructure"
                className="inline-flex min-h-12 items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-extrabold text-white transition-colors hover:bg-primary-container"
              >
                Explore Supply Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
