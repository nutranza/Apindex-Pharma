import Image from "next/image"

export default function AboutFounderSection() {
  return (
    <section className="bg-white apx-section-compact">
      <div className="content-container">
        <div className="grid items-center gap-8 rounded-3xl bg-surface-low p-6 sm:p-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-12 lg:p-10">
          <div className="relative h-[280px] overflow-hidden rounded-2xl sm:h-[340px] lg:h-[360px]">
            <Image
              fill
              sizes="(min-width: 1024px) 280px, 100vw"
              src="/founder-of-apindex.jpeg"
              alt="Ashish Chovatiya, Director of Apindex Pharmaceuticals"
              className="object-cover object-[center_28%]"
            />
          </div>

          <div className="max-w-3xl">
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
