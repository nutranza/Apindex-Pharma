import type { IconType } from "react-icons"
import {
  LuClipboardCheck,
  LuFactory,
  LuMicroscope,
  LuPillBottle,
} from "react-icons/lu"

type ServiceCard = {
  icon: IconType
  title: string
  description: string
}

const SERVICE_CARDS: ServiceCard[] = [
  {
    icon: LuFactory,
    title: "Contract Manufacturing",
    description:
      "Dedicated facilities for high-volume pharmaceutical production with consistent process control.",
  },
  {
    icon: LuMicroscope,
    title: "3rd Party Manufacturing",
    description:
      "Private-label and partner manufacturing support backed by WHO-GMP aligned execution.",
  },
  {
    icon: LuPillBottle,
    title: "Generic Products",
    description:
      "Accessible generic formulations developed for dependable supply and broad healthcare reach.",
  },
  {
    icon: LuClipboardCheck,
    title: "Institutional Tenders",
    description:
      "Reliable procurement support for government, hospital, and healthcare organization demand.",
  },
]

export default function ServicesSection() {
  return (
    <section id="infrastructure" className="bg-surface py-14 lg:py-20">
      <div className="content-container">
        <div className="mb-10 lg:mb-12">
          <h2 className="section-heading max-w-3xl">
            Manufacturing{" "}
            <span className="text-primary">Capabilities</span>
          </h2>
          <p className="section-description mt-4 max-w-2xl">
            Flexible manufacturing support for pharmaceutical brands,
            institutions, and global healthcare partners with a focus on
            quality, scale, and reliable supply.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {SERVICE_CARDS.map((card, index) => {
            const Icon = card.icon
            return (
              <div
                key={card.title}
                className="flex min-h-[250px] flex-col rounded-xl bg-white p-6"
              >
                <div className="mb-7 flex items-start justify-between gap-4">
                  <Icon aria-hidden="true" className="text-4xl text-primary" strokeWidth={1.8} />
                  <span className="text-sm font-bold text-on-surface-variant/50">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="apx-font-headline text-xl font-semibold leading-tight text-on-surface">
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
