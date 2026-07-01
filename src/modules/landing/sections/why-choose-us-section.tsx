import type { LucideIcon } from "lucide-react"
import {
  FlaskConical,
  Globe2,
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
      "Research-led formulation development supported by testing discipline, practical manufacturing insight, and dependable scale-up planning.",
  },
  {
    icon: ShieldCheck,
    title: "Quality-Led Production",
    description:
      "WHO-GMP aligned processes and documented checks designed to maintain consistent product safety across every production stage.",
  },
  {
    icon: Globe2,
    title: "Export-Ready Support",
    description:
      "Coordinated documentation, regulatory support, and supply planning to help partners serve regulated and emerging healthcare markets.",
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
            A dependable pharmaceutical manufacturing partner for quality-led
            production, export readiness, and long-term supply confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 lg:gap-14">
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
