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
  tone: "primary" | "secondary"
}

const CATEGORY_CARDS: CategoryCard[] = [
  {
    icon: FaTablets,
    title: "Tablet",
    description: "Solid oral dosage forms for precise daily therapy.",
    tone: "primary",
  },
  {
    icon: FaCapsules,
    title: "Capsule",
    description: "Encapsulated formulations for controlled delivery.",
    tone: "secondary",
  },
  {
    icon: FaSyringe,
    title: "Injection",
    description: "Sterile injectable products for clinical requirements.",
    tone: "primary",
  },
  {
    icon: FaEyeDropper,
    title: "Eye / Ear Drops",
    description: "Focused liquid care for ophthalmic and otic use.",
    tone: "secondary",
  },
  {
    icon: MdSanitizer,
    title: "Creams",
    description: "Topical preparations built for smooth application.",
    tone: "secondary",
  },
  {
    icon: MdOutlineMedication,
    title: "Ointments / Gels",
    description: "Semi-solid topical formats for targeted treatment.",
    tone: "primary",
  },
  {
    icon: TbMedicineSyrup,
    title: "Suspension / Syrup",
    description: "Palatable liquid medicines for flexible dosing.",
    tone: "secondary",
  },
  {
    icon: MdApps,
    title: "Other Dosage Forms",
    description: "Additional formulations for specialized needs.",
    tone: "primary",
  },
]

const TONE_CLASS: Record<CategoryCard["tone"], string> = {
  primary: "bg-primary-fixed text-primary",
  secondary: "bg-secondary-fixed text-on-secondary-container",
}

export default function CategoriesSection() {
  return (
    <section id="categories" className="bg-white py-16 lg:py-24">
      <div className="content-container">
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between lg:mb-14">
          <h2 className="section-heading max-w-2xl">
            Product{" "}
            <span className="rounded-lg bg-secondary-fixed px-2 text-on-secondary-container">
              Categories
            </span>
          </h2>
          <p className="section-description max-w-sm md:text-right">
            Engineered for every therapeutic need and patient requirement.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
          {CATEGORY_CARDS.map((card) => {
            const Icon = card.icon
            return (
              <div
                key={card.title}
                className="flex min-h-[190px] flex-col rounded-xl bg-surface-low p-5 lg:p-6"
              >
                <div
                  className={`mb-5 flex h-12 w-12 items-center justify-center rounded-lg ${TONE_CLASS[card.tone]}`}
                >
                  <Icon
                    aria-hidden="true"
                    className="text-2xl"
                  />
                </div>
                <h3 className="apx-font-headline text-base font-extrabold leading-tight text-on-surface lg:text-lg">
                  {card.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-on-surface-variant">
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
