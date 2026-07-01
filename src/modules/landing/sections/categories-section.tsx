import Link from "next/link"
import type { IconType } from "react-icons"
import {
  FaCapsules,
  FaEyeDropper,
  FaSyringe,
  FaTablets,
} from "react-icons/fa"
import { MdApps, MdSanitizer } from "react-icons/md"
import { TbMedicineSyrup } from "react-icons/tb"

type CategoryCard = {
  icon: IconType
  title: string
  description: string
  filterLabel: string
}

const CATEGORY_CARDS: CategoryCard[] = [
  {
    icon: FaTablets,
    title: "Tablet",
    description: "Solid oral dosage forms for precise daily therapy.",
    filterLabel: "Tablet",
  },
  {
    icon: FaCapsules,
    title: "Capsule",
    description: "Encapsulated formulations for controlled delivery.",
    filterLabel: "Capsule",
  },
  {
    icon: FaSyringe,
    title: "Injection",
    description: "Sterile injectable products for clinical requirements.",
    filterLabel: "Injection",
  },
  {
    icon: FaEyeDropper,
    title: "Eye / Ear Drops",
    description: "Focused liquid care for ophthalmic and otic use.",
    filterLabel: "Eye / Ear Drops",
  },
  {
    icon: MdSanitizer,
    title: "Creams",
    description: "Topical preparations built for smooth application.",
    filterLabel: "Creams",
  },
  {
    icon: TbMedicineSyrup,
    title: "Suspension / Syrup",
    description: "Palatable liquid medicines for flexible dosing.",
    filterLabel: "Suspension / Syrup",
  },
  {
    icon: MdApps,
    title: "Other Dosage Forms",
    description: "Additional formulations for specialized needs.",
    filterLabel: "Other",
  },
]

const ICON_CLASS = "bg-primary-fixed text-primary ring-primary/10"

function getCategoryBorderClass(index: number) {
  const lastMobileRowStart = CATEGORY_CARDS.length - 1
  const lastTabletRowStart = Math.floor((CATEGORY_CARDS.length - 1) / 2) * 2
  const lastDesktopRowStart = Math.floor((CATEGORY_CARDS.length - 1) / 4) * 4
  const isSecondColumn = index % 2 === 1
  const isDesktopLastColumn = index % 4 === 3
  const isMobileLastRow = index >= lastMobileRowStart
  const isTabletLastRow = index >= lastTabletRowStart
  const isDesktopLastRow = index >= lastDesktopRowStart

  return [
    !isMobileLastRow ? "border-b" : "",
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
          <p className="section-description capitalize max-w-md md:justify-self-end md:text-right">
            Explore dosage formats designed for institutional, export, and clinical supply needs.
          </p>
        </div>

        <div className="grid overflow-hidden border-y border-outline-variant/60 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORY_CARDS.map((card, index) => {
            const Icon = card.icon
            return (
              <Link
                key={card.title}
                href={`/products?subcategory=${encodeURIComponent(
                  card.filterLabel
                )}`}
                className={`group flex min-h-[140px] gap-5 border-outline-variant/60 px-2 py-5 transition-colors hover:bg-primary-fixed/35 focus:outline-none sm:min-h-[195px] sm:p-6 ${getCategoryBorderClass(index)}`}
              >
                <div
                  className={`flex lg:size-12 size-8 shrink-0 items-center justify-center rounded-full ${ICON_CLASS}`}
                >
                  <Icon
                    aria-hidden="true"
                    className="lg:text-xl text-lg"
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
              </Link>
            )
          })}
          <div
            aria-hidden="true"
            className="hidden min-h-[195px] border-outline-variant/60 lg:block"
          />
        </div>
      </div>
    </section>
  )
}
