import Image from "next/image"
import { FaCircleCheck } from "react-icons/fa6"
import { GiMedicines } from "react-icons/gi"
import { HiOutlineArrowRight } from "react-icons/hi2"

import type { PublicProductDetail } from "@/lib/data/public-product-detail"
import { buildProductHeadline } from "@/modules/products/lib/product-detail-ui"

type ProductHeroSectionProps = {
  product: PublicProductDetail
}

type SpecItem = {
  label: string
  value: string
  highlighted?: boolean
}

function buildSpecItems(product: PublicProductDetail): SpecItem[] {
  const details = product.pharmaDetails
  const items: SpecItem[] = []

  if (details?.tradeName) {
    items.push({ label: "Trade Name", value: details.tradeName })
  }

  if (details?.availableStrength) {
    items.push({ label: "Available Strength", value: details.availableStrength })
  }

  if (details?.packing) {
    items.push({ label: "Packing", value: details.packing })
  }

  if (details?.packInsertLeaflet !== null && details?.packInsertLeaflet !== undefined) {
    items.push({
      label: "Pack Insert / Leaflet",
      value: details.packInsertLeaflet ? "Yes" : "No",
      highlighted: details.packInsertLeaflet === true,
    })
  }

  const therapeuticUse =
    details?.therapeuticUse ||
    (product.categories.length > 0
      ? product.categories.map((c) => c.name).join(", ")
      : null)

  if (therapeuticUse) {
    items.push({ label: "Therapeutic Use", value: therapeuticUse })
  }

  if (details?.productionCapacity) {
    items.push({ label: "Production Capacity", value: details.productionCapacity })
  }

  return items
}

export default function ProductHeroSection({ product }: ProductHeroSectionProps) {
  const headline = buildProductHeadline(product.name)
  const specItems = buildSpecItems(product)

  return (
    <section className="content-container grid grid-cols-1 gap-8 bg-white pb-10 pt-6 lg:grid-cols-12 lg:items-center lg:gap-12 lg:pb-16 lg:pt-8">
      <div className="max-w-[460px] lg:col-span-5 xl:max-w-[500px]">
        <div className="relative overflow-hidden rounded-2xl bg-white">
          <div className="relative aspect-[1.05/1] overflow-hidden rounded-2xl bg-white">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={`${product.name} packaging`}
                fill
                unoptimized
                sizes="(min-width: 1024px) 38vw, 100vw"
                className="scale-[1.05] object-contain mix-blend-multiply"
              />
            ) : (
              <div className="flex h-full items-center justify-center rounded-lg bg-white text-primary">
                <GiMedicines className="text-7xl" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="lg:col-span-7 xl:col-span-7">
        <h1 className="apx-font-headline max-w-2xl text-4xl font-extrabold leading-[1.02] text-on-surface md:text-[2.75rem] lg:text-[3rem]">
          {headline.primary}
          {headline.accent ? (
            <>
              <br />
              <span className="text-primary-container">{headline.accent}</span>
            </>
          ) : null}
        </h1>

        {specItems.length > 0 && (
          <div className="mt-6 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
            {specItems.map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-outline-variant/25 bg-white px-4 py-3"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                  {item.label}
                </p>
                {item.highlighted ? (
                  <div className="mt-1 flex items-center gap-2 text-sm font-bold text-secondary">
                    <FaCircleCheck className="text-base" />
                    <span>{item.value}</span>
                  </div>
                ) : (
                  <p className="mt-1 text-sm font-semibold text-on-surface">
                    {item.value}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-7 flex flex-wrap gap-4">
          <a
            href="/contact"
            className="inline-flex items-center gap-3 rounded-xl bg-primary px-6 py-3.5 text-xs font-bold uppercase tracking-[0.04em] text-white transition-colors hover:bg-primary-container"
          >
            <span>Inquire About This Product</span>
            <HiOutlineArrowRight className="text-lg" />
          </a>
        </div>
      </div>
    </section>
  )
}
