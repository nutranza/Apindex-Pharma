import Image from "next/image"

type StorySection = {
  eyebrow: string
  title: string
  descriptions: string[]
  imageUrl: string
  imageAlt: string
  imageClassName?: string
  reverse?: boolean
  surface?: "white" | "muted"
  attributionName?: string
  attributionTitle?: string
}

const STORY_SECTIONS: StorySection[] = [
  {
    eyebrow: "Our Story",
    title: "From Domestic Supply to Global Pharma Trade",
    descriptions: [
      "Apindex Pharmaceuticals Pvt. Ltd. began in November 2021 with a focus on dependable pharmaceutical supply in the domestic market.",
      "Step by step, we expanded from domestic supply into export-focused sourcing of finished formulations, surgicals, and disposable healthcare products.",
    ],
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD2wBwbxNQrbVjfUwAbA4_lX2b5eNFLpfHpbcLTPbHXBzizt8YKT7uUMWR7_Dh1YXHm6NsVgJIv5hAPNRp77WwbBdn6ENp0h9n10xkdJF_bLkNv1X3Nbz3CMpkoA5YLGBGjjvVk0sQadHx7r-QUWm7wJrEGHzsnwl4tl5IZqdgzu453uEZJfHHA0p4UGsFF_mSxHq8S_HRTX5F8ujTCY9p_zTemplbcz32kh1-1n7K4T-KSLrFJvjqLpFvIMoF3LWrDEGHr-n0OxRw",
    imageAlt:
      "Scientific researcher looking into a microscope in a clean pharmaceutical laboratory",
  },
  {
    eyebrow: "Our Vision",
    title: "Affordable Healthcare Products for Global Markets",
    descriptions: [
      "Our vision is to make quality-assured finished formulations, surgicals, and disposable healthcare products accessible to global buyers at affordable, competitive prices.",
      "We focus on reliable sourcing, clear documentation, and long-term partnerships across global healthcare markets.",
    ],
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCAToZADVB4xM043eYneGVipKDmGjt3ph4cimJUXczxXks53ENiKA298Jr7Q3IsHTX8QPiBebYPsAjW-2R4e1lT1XBaFsKdQSYG9Dh5VKyHWZilO-h-r2fwsxA2ISz24B6DASZ-uA-GDG3nq5fs3_6RNht9AInM30W52QgIxlkFsKGLsmiBu5RdULYLhL8JfJ0Q33ayp_tgiAAA2hHYi-B9QUnozF0TUQrGnne4DzE5GdT5D71uKueghBgYsaNMVU7NaNDszMJTL-o",
    imageAlt:
      "Modern pharmaceutical production line with automated machinery processing capsules",
    reverse: true,
    surface: "muted",
  },
  {
    eyebrow: "Leadership Voice",
    title: "Building Apindex as a Global Export Partner",
    descriptions: [
      "I started Apindex to build trust-led Indian pharmaceutical supply for global healthcare markets.",
      "Our mission is to grow as an export-driven partner and contribute to India's pharmaceutical export progress through dependable products and disciplined execution.",
    ],
    imageUrl: "/founder-of-apindex.jpeg",
    imageAlt: "Ashish Chovatiya at the Apindex Pharma exhibition booth",
    imageClassName: "object-cover object-[center_28%]",
    attributionName: "Ashish Chovatiya",
    attributionTitle: "Director, Apindex Pharmaceuticals Pvt. Ltd.",
  },
]

export default function AboutQualityCommitmentSection() {
  return (
    <>
      {STORY_SECTIONS.map((section) => (
        <SplitStorySection
          key={section.title}
          eyebrow={section.eyebrow}
          title={section.title}
          descriptions={section.descriptions}
          imageUrl={section.imageUrl}
          imageAlt={section.imageAlt}
          imageClassName={section.imageClassName}
          reverse={section.reverse}
          surface={section.surface}
          attributionName={section.attributionName}
          attributionTitle={section.attributionTitle}
        />
      ))}
    </>
  )
}

function SplitStorySection({
  eyebrow,
  title,
  descriptions,
  imageUrl,
  imageAlt,
  imageClassName = "object-cover object-center",
  reverse = false,
  surface = "white",
  attributionName,
  attributionTitle,
}: StorySection) {
  return (
    <section
      className={`py-12 lg:py-16 ${
        surface === "muted" ? "bg-surface" : "bg-white"
      }`}
    >
      <div className="content-container">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div
            className={`relative h-[320px] overflow-hidden rounded-2xl sm:h-[400px] lg:h-[500px] ${
              reverse ? "lg:order-2" : "lg:order-1"
            }`}
          >
            <Image
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              src={imageUrl}
              alt={imageAlt}
              className={imageClassName}
            />
          </div>

          <div
            className={`max-w-2xl space-y-4 ${
              reverse ? "lg:order-1" : "lg:order-2"
            }`}
          >
            <p className="text-sm font-extrabold uppercase tracking-[0.12em] text-primary">
              {eyebrow}
            </p>
            <h2 className="section-heading">{title}</h2>
            <div className="space-y-3">
              {descriptions.map((paragraph) => (
                <p key={paragraph} className="section-description">
                  {paragraph}
                </p>
              ))}
            </div>
            {attributionName ? (
              <div className="pt-2">
                <p className="text-base font-extrabold text-on-surface">
                  {attributionName}
                </p>
                {attributionTitle ? (
                  <p className="mt-1 text-sm font-medium text-on-surface-variant">
                    {attributionTitle}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
