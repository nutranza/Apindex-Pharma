import type { IconType } from "react-icons"
import {
  FaCapsules,
  FaEyeDropper,
  FaSyringe,
  FaTablets,
} from "react-icons/fa"
import { MdApps, MdOutlineMedication, MdSanitizer } from "react-icons/md"
import { TbMedicineSyrup } from "react-icons/tb"

type CategoryCard = {
  icon: IconType
  title: string
  description: string
}

const CATEGORY_CARDS: CategoryCard[] = [
  {
    icon: FaTablets,
    title: "Tablet",
    description: "Solid oral dosage forms for precise daily therapy.",
  },
  {
    icon: FaCapsules,
    title: "Capsule",
    description: "Encapsulated formulations for controlled delivery.",
  },
  {
    icon: FaSyringe,
    title: "Injection",
    description: "Sterile injectable products for clinical requirements.",
  },
  {
    icon: FaEyeDropper,
    title: "Eye / Ear Drops",
    description: "Focused liquid care for ophthalmic and otic use.",
  },
  {
    icon: MdSanitizer,
    title: "Creams",
    description: "Topical preparations built for smooth application.",
  },
  {
    icon: MdOutlineMedication,
    title: "Ointments / Gels",
    description: "Semi-solid topical formats for targeted treatment.",
  },
  {
    icon: TbMedicineSyrup,
    title: "Suspension / Syrup",
    description: "Palatable liquid medicines for flexible dosing.",
  },
  {
    icon: MdApps,
    title: "Other Dosage Forms",
    description: "Additional formulations for specialized needs.",
  },
]

const ICON_CLASS = "bg-primary-fixed text-primary ring-primary/10"

function getCategoryBorderClass(index: number) {
  const isSecondColumn = index % 2 === 1
  const isDesktopLastColumn = index % 4 === 3
  const isMobileLast = index === CATEGORY_CARDS.length - 1
  const isTabletLastRow = index >= CATEGORY_CARDS.length - 2
  const isDesktopLastRow = index >= CATEGORY_CARDS.length - 4

  return [
    !isMobileLast ? "border-b" : "",
    !isSecondColumn ? "sm:border-r" : "",
    !isTabletLastRow ? "sm:border-b" : "sm:border-b-0",
    !isDesktopLastColumn ? "lg:border-r" : "lg:border-r-0",
    !isDesktopLastRow ? "lg:border-b" : "lg:border-b-0",
  ]
    .filter(Boolean)
    .join(" ")
}

export default function CategoriesSection() {
  return (
    <section id="categories" className="bg-white py-16 lg:py-24">
      <div className="content-container">
        <div className="mb-10 grid gap-4 md:grid-cols-[minmax(0,0.8fr)_minmax(280px,0.42fr)] md:items-end lg:mb-12">
          <h2 className="section-heading max-w-2xl">
            Product{" "}
            <span className="text-primary">Categories</span>
          </h2>
          <p className="section-description max-w-md md:justify-self-end md:text-right">
            Engineered for every therapeutic need and patient requirement.
          </p>
        </div>

        <div className="grid overflow-hidden border-y border-outline-variant/60 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORY_CARDS.map((card, index) => {
            const Icon = card.icon
            return (
              <div
                key={card.title}
                className={`flex min-h-[140px] gap-5 border-outline-variant/60 px-2 py-5 sm:min-h-[195px] sm:p-6 ${getCategoryBorderClass(index)}`}
              >
                <div
                  className={`flex lg:size-10 size-8 shrink-0 items-center justify-center rounded-full ring-8 ${ICON_CLASS}`}
                >
                  <Icon
                    aria-hidden="true"
                    className="lg:text-2xl text-xl"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="apx-font-headline text-base font-extrabold leading-tight text-on-surface lg:text-lg">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                    {card.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
