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
    <div role="group" aria-labelledby="purpose-heading">
      <h2 id="purpose-heading" className="section-heading">
        Guided by <span className="text-secondary">purpose</span>
      </h2>
      <p className="mt-4 max-w-3xl section-description">
        Our mission and vision guide how we deliver quality pharmaceutical
        products, support healthcare partners, and grow responsibly.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:mt-10">
        {PURPOSE_CARDS.map((card) => {
          const Icon = card.icon

          return (
            <article
              key={card.title}
              className="min-w-0 rounded-3xl border border-secondary/20 bg-white p-6 sm:p-8 lg:p-10"
            >
              <div className="flex items-center gap-4">
                <span
                  className="inline-flex size-14 shrink-0 items-center justify-center rounded-2xl
                    bg-secondary/20 text-secondary"
                >
                  <Icon
                    aria-hidden="true"
                    className="size-7"
                    strokeWidth={1.7}
                  />
                </span>
                <h3 className="apx-font-headline text-2xl font-semibold text-on-surface">
                  Our {card.title}
                </h3>
              </div>
              <div className="mt-6 space-y-4 text-base leading-7 text-on-surface-variant">
                {card.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
