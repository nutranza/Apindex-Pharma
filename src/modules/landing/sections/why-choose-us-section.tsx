import type { LucideIcon } from "lucide-react"
import { Globe, Settings2, ShieldCheck } from "lucide-react"

type FeatureItem = {
  icon: LucideIcon
  title: string
  description: string
}

const FEATURES: FeatureItem[] = [
  {
    icon: Settings2,
    title: "Advanced R&D",
    description: "Innovative formulations developed by our in-house R&D team using evidence-based research and advanced testing.",
  },
  {
    icon: ShieldCheck,
    title: "WHO-GMP Quality",
    description: "All facilities are WHO-GMP certified with rigorous multi-stage quality control at every production step for consistent product safety.",
  },
  {
    icon: Globe,
    title: "End-to-End Logistics",
    description: "Reliable delivery across 86+ countries via air, sea, and land with precise tracking, export documentation, and coordinated support.",
  },
]

export default function WhyChooseUsSection() {
  return (
    <section
      id="why-choose-us"
      className="bg-white py-16 lg:py-24"
    >
      <div className="content-container">
        <div className="mb-12 max-w-3xl lg:mb-14">
          <h2 className="section-heading">
            Why Choose{" "}
            <span className="text-primary">Apindex?</span>
          </h2>
          <p className="mt-5 section-description max-w-2xl">
            Precision is the hallmark of pharmaceutical leadership. A company
            matured to deliver global solutions with modern manufacturing and
            uncompromising quality standards.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 lg:gap-14">
          {FEATURES.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.title} className="text-center space-y-4">
                <Icon
                  aria-hidden="true"
                  className="mx-auto size-10 text-on-surface"
                  strokeWidth={1.5}
                />
                <h3 className="text-lg font-extrabold leading-tight text-on-surface">
                  {item.title}
                </h3>
                <p className="text-sm text-on-surface-variant sm:text-base">
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
