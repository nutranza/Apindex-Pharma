import Image from "next/image"

const TRUST_POINTS = [
  { value: "WHO-GMP", label: "Certified" },
  { value: "500+", label: "Products" },
  { value: "25+", label: "Countries" },
]

export default function WelcomeSection() {
  return (
    <section id="welcome" className="bg-white py-16 lg:py-24">
      <div className="content-container">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
          <div className="max-w-2xl">
            <h2 className="section-heading text-on-surface">
              <span className="block">A Legacy of Trust in</span>
              <span className="block">
                <span className="text-primary">Pharmaceutical</span> Excellence
              </span>
            </h2>

            <div className="mt-6 space-y-4 text-base leading-relaxed text-on-surface-variant sm:text-lg">
              <p>
                Apindex Pharmaceutical Pvt. Ltd. is a WHO-GMP certified company
                supporting pharmaceutical partners with finished formulations,
                contract manufacturing coordination, and export-ready product
                supply.
              </p>
              <p>
                Our portfolio of 500+ products spans diverse therapeutic
                categories and reaches 25+ countries through quality-focused
                processes, dependable sourcing, and partner-first execution.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-x-4 py-3">
              {TRUST_POINTS.map((point) => (
                <div key={point.label}>
                  <div className="apx-font-headline text-lg font-extrabold leading-none text-on-surface sm:text-2xl">
                    {point.value}
                  </div>
                  <div className="mt-2 text-xs font-semibold uppercase text-on-surface-variant sm:text-sm">
                    {point.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative h-[320px] overflow-hidden rounded-xl border border-outline-variant/50 bg-surface-low shadow-[0_24px_60px_rgba(86,67,54,0.10)] sm:h-[420px] lg:h-[500px]">
            <Image
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              src="about-company.jpg"
              alt="Apindex Pharmaceutical modern manufacturing facility production line"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
