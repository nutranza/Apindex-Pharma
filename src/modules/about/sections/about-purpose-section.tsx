import { Eye, Target } from "lucide-react"
import type { LucideIcon } from "lucide-react"

type PurposeCard = {
  title: string
  paragraphs: string[]
  icon: LucideIcon
}

const PURPOSE_CARDS: PurposeCard[] = [
  {
    title: "Mission",
    paragraphs: [
      "To deliver reliable, accessible pharmaceutical solutions backed by disciplined process controls, responsive partnerships, and continuous quality improvement.",
      "We build long-term relationships by listening carefully, communicating clearly, and improving the way we support healthcare partners.",
    ],
    icon: Target,
  },
  {
    title: "Vision",
    paragraphs: [
      "To be recognized as a globally trusted pharmaceutical company where precision manufacturing, ethics, and better patient outcomes move together.",
      "We aim to grow as a dependable healthcare supply partner across domestic and international markets through quality, transparency, and responsible execution.",
    ],
    icon: Eye,
  },
]

export default function AboutPurposeSection() {
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="content-container">
        <h2 id="purpose-heading" className="sr-only">
          Mission &amp; Vision
        </h2>

        <div
          aria-labelledby="purpose-heading"
          className="grid grid-cols-1 gap-14 md:grid-cols-2 md:gap-16 lg:gap-24"
        >
          {PURPOSE_CARDS.map((card) => {
            const Icon = card.icon

            return (
              <article key={card.title} className="max-w-xl">
                <Icon
                  aria-hidden="true"
                  className="size-14 text-primary"
                  strokeWidth={1.7}
                />
                <h3 className="mt-7 text-2xl font-medium uppercase tracking-[0.01em] text-on-surface">
                  {card.title}
                </h3>
                <div className="mt-4 space-y-4 text-base leading-7 text-on-surface sm:text-lg sm:leading-8">
                  {card.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
