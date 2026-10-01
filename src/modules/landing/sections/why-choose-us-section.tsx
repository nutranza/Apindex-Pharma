import type { LucideIcon } from "lucide-react"
import {
  ClipboardCheck,
  FlaskConical,
  Globe2,
  Handshake,
  PackageCheck,
  UsersRound,
  ShieldCheck,
} from "lucide-react"

type FeatureItem = {
  icon: LucideIcon
  title: string
  description: string
}

const FEATURES: FeatureItem[] = [
  {
    icon: FlaskConical,
    title: "Advanced Formulation",
    description:
      "Research-led formulation support backed by product understanding, practical manufacturing insight, and dependable scale-up planning.",
  },
  {
    icon: ShieldCheck,
    title: "Quality-Focused Processes",
    description:
      "WHO-GMP aligned coordination, documentation, and quality checks designed to support consistent product safety.",
  },
  {
    icon: Globe2,
    title: "Global Supplies",
    description:
      "Flexible product and supply coordination for healthcare partners serving domestic and international markets.",
  },
  {
    icon: PackageCheck,
    title: "Reliable Sourcing",
    description:
      "Structured sourcing and product coordination designed to support dependable availability and clear communication.",
  },
  {
    icon: ClipboardCheck,
    title: "Documentation Readiness",
    description:
      "Organized product and company information to support procurement, partner review, and responsible supply discussions.",
  },
  {
    icon: Handshake,
    title: "Flexible Partnerships",
    description:
      "Responsive collaboration for distributors, institutions, brands, and healthcare businesses with different supply needs.",
  },
  {
    icon: UsersRound,
    title: "Partner-First Coordination",
    description:
      "A practical team approach focused on clear updates, realistic commitments, and long-term business relationships.",
  },
]

export default function WhyChooseUsSection() {
  return (
    <section
      id="why-choose-us"
      className="bg-white py-14 lg:py-20"
    >
      <div className="content-container">
        <div className="mb-12 max-w-3xl">
          <h2 className="section-heading">
            Why Choose{" "}
            <span className="text-primary">Apindex?</span>
          </h2>
          <p className="mt-5 max-w-2xl section-description">
            A dependable pharmaceutical partner for finished formulations,
            contract manufacturing coordination, domestic and global supply,
            and long-term partnership confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-14">
          {FEATURES.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.title}
                className="max-w-sm"
              >
                <Icon
                  aria-hidden="true"
                  className="size-12 text-on-surface-variant"
                  strokeWidth={1.5}
                />
                <h3 className="mt-5 text-lg font-extrabold leading-tight text-on-surface">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-on-surface-variant">
                  {item.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
