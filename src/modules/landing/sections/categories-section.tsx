import Link from "next/link"
import Image from "next/image"
import { HiOutlineArrowRight } from "react-icons/hi2"

import { buildProductsPageHref } from "@/modules/products/lib/catalog-ui"

type CategoryCard = {
  title: string
  description: string
  filterLabel: string
  imageUrl: string
  imageAlt: string
}

const CATEGORY_CARDS: CategoryCard[] = [
  {
    title: "Tablet",
    description: "Solid oral dosage forms for precise daily therapy.",
    filterLabel: "Tablet",
    imageUrl: "/category-tablets-v3.png",
    imageAlt: "Tablet pharmaceutical products and packaging",
  },
  {
    title: "Capsule",
    description: "Encapsulated formulations for controlled delivery.",
    filterLabel: "Capsule",
    imageUrl: "/category-capsules-v3.png",
    imageAlt: "Blue and white capsules in a pharmaceutical production environment",
  },
  {
    title: "Injection",
    description: "Sterile injectable products for clinical requirements.",
    filterLabel: "Injection",
    imageUrl: "/category-injections-v3.png",
    imageAlt: "Unbranded injectable vials and ampoules on a sterile filling line",
  },
  {
    title: "Eye / Ear Drops",
    description: "Focused liquid care for ophthalmic and otic use.",
    filterLabel: "Eye / Ear Drops",
    imageUrl: "/category-eye-ear-drops-v3.png",
    imageAlt: "Unbranded eye and ear dropper bottles in a sterile filling area",
  },
  {
    title: "Creams",
    description: "Topical preparations built for smooth application.",
    filterLabel: "Creams",
    imageUrl: "/category-creams-v3.png",
    imageAlt: "Unbranded pharmaceutical cream jars and topical tubes",
  },
  {
    title: "Suspension / Syrup",
    description: "Palatable liquid medicines for flexible dosing.",
    filterLabel: "Suspension / Syrup",
    imageUrl: "/category-suspensions-syrups-v3.png",
    imageAlt: "Unbranded liquid medicine bottles on a pharmaceutical filling line",
  },
  {
    title: "Other Dosage Forms",
    description: "Additional formulations for specialized needs.",
    filterLabel: "Other",
    imageUrl: "/category-other-dosage-forms-v3.png",
    imageAlt: "Assorted unbranded pharmaceutical dosage forms in a clean production area",
  },
]

export default function CategoriesSection() {
  return (
    <section id="categories" className="bg-white apx-section">
      <div className="content-container">
        <div className="mb-10 max-w-3xl lg:mb-12">
          <h2 className="section-heading text-on-surface">
            Product{" "}
            <span className="text-primary">Categories</span>
          </h2>
          <p className="mt-4 section-description">
            Explore dosage formats designed for institutional, domestic, and
            international healthcare supply needs.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {CATEGORY_CARDS.map((card) => {
            return (
              <Link
                key={card.title}
                href={buildProductsPageHref({ dosageForm: card.filterLabel })}
                className="group relative h-[260px] overflow-hidden rounded-2xl shadow-none transition-[transform,box-shadow] duration-300 focus-visible:outline-none sm:h-[310px] xl:h-[360px]">
                <Image
                  fill
                  sizes="(min-width: 1280px) 18vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  src={card.imageUrl}
                  alt={card.imageAlt}
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent transition-[background] duration-[450ms] group-hover:from-secondary/90 group-hover:via-secondary/50" />

                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h3 className="text-base font-semibold text-white">
                    {card.title}
                  </h3>
                  <div className="card-accordion">
                    <div>
                      <p className="pt-2 text-xs leading-relaxed text-white/90">
                        {card.description}
                      </p>
                      <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-white">
                        Learn More
                        <HiOutlineArrowRight
                          aria-hidden="true"
                          className="size-3.5 transition-transform duration-300 group-hover:translate-x-1"
                        />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
