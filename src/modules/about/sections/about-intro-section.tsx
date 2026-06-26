import Image from "next/image"
import Link from "next/link"

const INTRO_IMAGE_URL =
  "https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=900&q=80"

export default function AboutIntroSection() {
  return (
    <section className="bg-surface py-16 lg:py-24">
      <div className="content-container">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="relative h-[420px] overflow-hidden rounded-2xl lg:h-[500px]">
            <Image
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              src={INTRO_IMAGE_URL}
              alt="Apindex team member working in a pharmaceutical laboratory"
              className="object-cover object-center"
            />
          </div>

          <div className="space-y-6">
            <h2 className="section-heading">
              Precision in Chemistry,
              <span className="block text-primary">
                Built for Global Care
              </span>
            </h2>
            <p className="section-description">
              Apindex Pharmaceuticals brings together scientific discipline,
              regulatory focus, and dependable manufacturing systems to support
              partners across regulated healthcare markets.
            </p>
            <p className="section-description">
              From formulation planning and quality documentation to export-ready
              production, we help pharmaceutical brands, distributors, and
              institutions build supply programs with consistency and confidence.
            </p>
            <div className="pt-2">
              <Link
                href="/#infrastructure"
                className="inline-flex min-h-12 items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-extrabold text-white transition-colors hover:bg-primary-container"
              >
                Explore Capabilities
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
