import Image from "next/image"

import { HiOutlineClipboardDocumentCheck, HiOutlineShieldCheck } from "react-icons/hi2"
import { LuFlaskConical } from "react-icons/lu"
import { VALIDATED_EXCELLENCE_IMAGE_URL } from "@/modules/products/lib/catalog-ui"

const assuranceItems = [
  {
    title: "GMP Certified",
    description: "Documented manufacturing controls for consistent batch quality.",
    icon: HiOutlineShieldCheck,
  },
  {
    title: "Validated Process",
    description: "Defined checks across production, testing, and release stages.",
    icon: HiOutlineClipboardDocumentCheck,
  },
  {
    title: "Lab Discipline",
    description: "Analytical oversight that supports purity, stability, and confidence.",
    icon: LuFlaskConical,
  },
]

export default function ProductsValidationSection() {
  return (
    <section className="bg-white py-12 lg:py-16">
      <div className="content-container">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-14">
          <div className="relative min-h-[280px] overflow-hidden rounded-2xl bg-surface-lowest sm:min-h-[380px] lg:min-h-[500px]">
            <Image
              src={VALIDATED_EXCELLENCE_IMAGE_URL}
              alt="Modern pharmaceutical manufacturing facility with stainless steel equipment and bright clinical lighting"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          <div>
            <h2 className="apx-font-headline max-w-xl text-4xl font-semibold text-on-surface md:text-5xl">
              Built for reliable <span className="text-primary">product confidence.</span> 
            </h2>
            <p className="mt-5 max-w-2xl text-base text-on-surface-variant">
              From facility control to final documentation, Apindex follows a
              validation-led approach designed to support repeatable quality,
              regulatory readiness, and dependable pharmaceutical supply.
            </p>

            <div className="mt-7 grid gap-6 sm:grid-cols-3 lg:grid-cols-1">
              {assuranceItems.map((item) => {
                const Icon = item.icon

                return (
                  <div
                    key={item.title}
                    className="flex gap-3"
                  >
                    <div className="flex sm:size-12 size-10 shrink-0 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
                      <Icon className="sm:text-xl text-lg" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-on-surface">
                        {item.title}
                      </p>
                      <p className="text-sm leading-6 text-on-surface-variant">
                        {item.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
