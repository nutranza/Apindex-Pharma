import Image from "next/image"

type StorySection = {
  eyebrow: string
  title: string
  descriptions: string[]
  imageUrl: string
  imageAlt: string
  reverse?: boolean
  surface?: "white" | "muted"
  attributionName?: string
  attributionTitle?: string
}

const STORY_SECTIONS: StorySection[] = [
  {
    eyebrow: "Our Story",
    title: "Commitment to Excellence",
    descriptions: [
      "Driven by science and disciplined execution, Apindex Pharmaceuticals builds dependable manufacturing systems for healthcare partners, institutions, and regulated supply chains across global markets.",
      "Our focus on clear documentation, controlled processes, and consistent quality practices helps every production stage remain transparent, reliable, and export-ready.",
    ],
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD2wBwbxNQrbVjfUwAbA4_lX2b5eNFLpfHpbcLTPbHXBzizt8YKT7uUMWR7_Dh1YXHm6NsVgJIv5hAPNRp77WwbBdn6ENp0h9n10xkdJF_bLkNv1X3Nbz3CMpkoA5YLGBGjjvVk0sQadHx7r-QUWm7wJrEGHzsnwl4tl5IZqdgzu453uEZJfHHA0p4UGsFF_mSxHq8S_HRTX5F8ujTCY9p_zTemplbcz32kh1-1n7K4T-KSLrFJvjqLpFvIMoF3LWrDEGHr-n0OxRw",
    imageAlt:
      "Scientific researcher looking into a microscope in a clean pharmaceutical laboratory",
  },
  {
    eyebrow: "Our Vision",
    title: "Built for Reliable Global Supply",
    descriptions: [
      "We aim to be recognized for precision manufacturing, ethical execution, and reliable export readiness, helping pharmaceutical brands expand confidently across domestic and international markets.",
      "Our long-term vision is to strengthen trust through efficient, compliant, and dependable systems that support consistent healthcare supply at scale.",
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
    title: "Quality Is a Promise",
    descriptions: [
      "Quality is not a standard we apply once; it is a promise we keep every day for the healthcare partners and patients who rely on our products and process discipline.",
      "That promise guides how we design processes, review batches, document quality, and protect reliability from planning through final dispatch.",
    ],
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAmz7qGu1kSrO-j3LIFD3Oa_y98cJvLNgoaHSAkIg8ZR3tV6tTNlRJ4a20-nGSdkftbgdVnE63J0IzvHQSJ8UhUMtLDQu6ARjwMd5A3IhnMR4VIionc2I_47BNCiJK94YICDLLwOP1ux1rGpKCzg2cLC6BuPYdiPYIUtGuPWAa_tz58efwHzyQQYOeUk2YJLdZT3N7Y-HA4rvnPRJmZWfrdjEpot1fIYB5cy4wQXl9nLBCuHUGvLWqaKE7p6fAaQj1x3qYWmgxM5-4",
    imageAlt:
      "Professional portrait representing Apindex pharmaceutical leadership and trust",
    attributionName: "Jayesh Dhameliya",
    attributionTitle: "Founder, Apindex Pharmaceuticals Pvt. Ltd.",
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
              className="object-cover object-center"
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
