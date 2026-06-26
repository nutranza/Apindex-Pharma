import Image from "next/image"

const WELCOME_IMAGE_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAqn5mGy4tBW7R-mFwByWYGx2rc1xuPI8beh1p8OKwZb1nhKY9ANVEOWgYA97BhbNqskkNwVBPGjRk5paTpQSFnonLojpwaXbtJAmUl8Ui4zynW85S7UMzIUAdOVgYRU9ALRRaYWKL4v7PQkgjxKH5GfoDjEWGFQWYJ0_MP8ZVVo2u0pIVOBf5c5Oty3TXeJG3YDF7eO21qn2JTMnRRM1N-Dc9FvSF3zNQhKIoOWJatBRZDKZU8TnTqRrr4QyBdgxhfqyRbYSYbgZI"

const TRUST_POINTS = [
  { value: "WHO-GMP", label: "Certified" },
  { value: "1500+", label: "Products" },
  { value: "86+", label: "Countries" },
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
                delivering high-quality, affordable medicines across the globe.
                With over two decades of experience, we are trusted for
                reliability, innovation, and uncompromising quality.
              </p>
              <p>
                Our portfolio of 1500+ products spans diverse therapeutic
                categories and reaches 86+ countries through modern
                manufacturing and research-driven formulations.
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
              src={WELCOME_IMAGE_URL}
              alt="Apindex Pharmaceutical modern manufacturing facility production line"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
