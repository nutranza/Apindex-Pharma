import Image from "next/image"

export default function AboutFounderSection() {
  return (
    <section className="bg-white apx-section-compact">
      <div className="content-container">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16">
          <div className="relative h-[380px] overflow-hidden rounded-2xl sm:h-[480px] lg:h-[520px]">
            <Image
              fill
              sizes="(min-width: 1280px) 592px, (min-width: 1024px) calc((100vw - 96px) / 2), calc(100vw - 32px)"
              src="/founder-of-apindex.jpeg"
              alt="Ashish Chovatiya, Director of Apindex Pharmaceuticals"
              className="object-cover object-[center_28%]"
            />
          </div>

          <div className="min-w-0">
            <p className="apx-eyebrow">
              Founder&apos;s Message
            </p>
            <h2 className="mt-3 section-heading">
              Building trust through dependable healthcare supply
            </h2>
            <p className="mt-5 section-description">
              Apindex Pharmaceuticals was started with a simple goal: make it
              easier for healthcare partners to source quality products with
              clear communication, responsible documentation, and reliable
              follow-through.
            </p>
            <p className="mt-4 section-description">
              We continue to grow by listening to distributors, institutions,
              and healthcare businesses and by building long-term partnerships
              across domestic and global markets.
            </p>
            <div className="mt-6">
              <p className="font-extrabold text-on-surface">Ashish Chovatiya</p>
              <p className="mt-1 text-sm font-medium text-on-surface-variant">
                Director, Apindex Pharmaceuticals Pvt. Ltd.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
