import type { IconType } from "react-icons"
import {
  MdBiotech,
  MdFactory,
  MdGavel,
  MdInventory2,
} from "react-icons/md"

type ServiceCard = {
  icon: IconType
  title: string
  description: string
  tone: "primary" | "secondary"
}

const SERVICE_CARDS: ServiceCard[] = [
  {
    icon: MdFactory,
    title: "Contract Manufacturing",
    description:
      "State-of-the-art facilities dedicated to high-volume production for global partners.",
    tone: "primary",
  },
  {
    icon: MdBiotech,
    title: "3rd Party Manufacturing",
    description:
      "Scalable solutions for private label brands with strict adherence to WHO-GMP.",
    tone: "secondary",
  },
  {
    icon: MdInventory2,
    title: "Generic Products",
    description:
      "High-efficacy generic formulations providing accessible healthcare to millions.",
    tone: "secondary",
  },
  {
    icon: MdGavel,
    title: "Institutional Tenders",
    description:
      "Reliable supply chain for governmental and health organization procurement.",
    tone: "primary",
  },
]

const ICON_TONE_CLASS: Record<ServiceCard["tone"], string> = {
  primary: "bg-primary-fixed text-primary",
  secondary: "bg-secondary-fixed text-on-secondary-container",
}

export default function ServicesSection() {
  return (
    <section id="infrastructure" className="bg-surface py-16 lg:py-24">
      <div className="content-container">
        <div className="mb-12 max-w-3xl lg:mb-14">
          <div>
            <h2 className="section-heading max-w-3xl">
              Molecular <span className="text-primary">Precision.</span>
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {SERVICE_CARDS.map((card) => {
            const Icon = card.icon
            return (
              <div
                key={card.title}
                className="flex min-h-[230px] flex-col rounded-xl bg-white p-6 lg:p-7"
              >
                <div
                  className={`mb-6 flex h-12 w-12 items-center justify-center rounded-lg ${ICON_TONE_CLASS[card.tone]}`}
                >
                  <Icon aria-hidden="true" className="text-2xl" />
                </div>
                <h3 className="apx-font-headline text-lg font-extrabold leading-tight text-on-surface">
                  {card.title}
                </h3>
                <p className="mt-4 text-sm leading-6 text-on-surface-variant">
                  {card.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
