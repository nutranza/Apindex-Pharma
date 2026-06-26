import Image from "next/image"
import SectionBadge from "@modules/common/components/section-badge"

type StoryCard = {
  title: string
  description: string
  imageUrl: string
  imageAlt: string
  borderTone: "primary" | "secondary"
}

const STORY_CARDS: StoryCard[] = [
  {
    title: "Our Mission",
    description:
      "To deliver affordable, innovative, and high-quality pharmaceutical products that improve the lives of patients worldwide through continuous research and rigorous standards.",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD2wBwbxNQrbVjfUwAbA4_lX2b5eNFLpfHpbcLTPbHXBzizt8YKT7uUMWR7_Dh1YXHm6NsVgJIv5hAPNRp77WwbBdn6ENp0h9n10xkdJF_bLkNv1X3Nbz3CMpkoA5YLGBGjjvVk0sQadHx7r-QUWm7wJrEGHzsnwl4tl5IZqdgzu453uEZJfHHA0p4UGsFF_mSxHq8S_HRTX5F8ujTCY9p_zTemplbcz32kh1-1n7K4T-KSLrFJvjqLpFvIMoF3LWrDEGHr-n0OxRw",
    imageAlt:
      "Scientific researcher looking into a microscope in a clean, brightly lit laboratory setting",
    borderTone: "primary",
  },
  {
    title: "Our Vision",
    description:
      "To become a global leader in the pharmaceutical industry, recognized for our commitment to precision, ethics, and the sustainable evolution of healthcare.",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCAToZADVB4xM043eYneGVipKDmGjt3ph4cimJUXczxXks53ENiKA298Jr7Q3IsHTX8QPiBebYPsAjW-2R4e1lT1XBaFsKdQSYG9Dh5VKyHWZilO-h-r2fwsxA2ISz24B6DASZ-uA-GDG3nq5fs3_6RNht9AInM30W52QgIxlkFsKGLsmiBu5RdULYLhL8JfJ0Q33ayp_tgiAAA2hHYi-B9QUnozF0TUQrGnne4DzE5GdT5D71uKueghBgYsaNMVU7NaNDszMJTL-o",
    imageAlt:
      "Modern pharmaceutical production line with automated machinery processing capsules in a sterile environment",
    borderTone: "secondary",
  },
  {
    title: "Leadership Voice",
    description:
      '"Quality is not just a standard for us; it\'s a promise to the patients who rely on our products every single day." - MD Message.',
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAmz7qGu1kSrO-j3LIFD3Oa_y98cJvLNgoaHSAkIg8ZR3tV6tTNlRJ4a20-nGSdkftbgdVnE63J0IzvHQSJ8UhUMtLDQu6ARjwMd5A3IhnMR4VIionc2I_47BNCiJK94YICDLLwOP1ux1rGpKCzg2cLC6BuPYdiPYIUtGuPWAa_tz58efwHzyQQYOeUk2YJLdZT3N7Y-HA4rvnPRJmZWfrdjEpot1fIYB5cy4wQXl9nLBCuHUGvLWqaKE7p6fAaQj1x3qYWmgxM5-4",
    imageAlt:
      "Professional portrait of a mature male executive in a corporate setting, representing leadership and trust",
    borderTone: "primary",
  },
]

const BORDER_TONE_CLASS: Record<StoryCard["borderTone"], string> = {
  primary: "border-primary",
  secondary: "border-secondary",
}

export default function AboutQualityCommitmentSection() {
  return (
    <section className="bg-surface py-16 lg:py-24">
      <div className="content-container">
        <div className="mb-12 space-y-4">
          <SectionBadge tone="secondary">Our Story</SectionBadge>
          <h2 className="section-heading">
            Commitment to <span className="text-secondary">Excellence</span>
          </h2>
          <p className="section-description max-w-2xl">
            Driven by purpose, guided by science - our mission, vision, and leadership define who we are.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {STORY_CARDS.map((card) => (
            <div key={card.title} className="group">
              <div className="relative mb-8 h-[400px] overflow-hidden rounded-xl bg-surface-low">
                <Image
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  src={card.imageUrl}
                  alt={card.imageAlt}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <h3
                className={`apx-font-headline mb-4 border-l-4 pl-4 text-2xl font-bold ${BORDER_TONE_CLASS[card.borderTone]}`}
              >
                {card.title}
              </h3>
              <p className="section-description">{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
