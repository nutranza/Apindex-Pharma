import Image from "next/image"

import type { PublicCatalogResult } from "@/lib/data/public-catalog"
import { HiOutlineMagnifyingGlass } from "react-icons/hi2"

type ProductsHeroSectionProps = {
  catalog: PublicCatalogResult
}

export default function ProductsHeroSection({
  catalog,
}: ProductsHeroSectionProps) {
  return (
    <section className="relative overflow-hidden border-b border-outline-variant/20 bg-surface py-10">
      <div className="relative content-container grid gap-10 lg:grid-cols-[minmax(0,1fr)_550px] lg:items-center xl:grid-cols-[minmax(0,1fr)_650px]">
        <div className="max-w-3xl">
          <h1 className="apx-font-headline max-w-3xl text-4xl font-semibold leading-tight text-on-surface sm:text-5xl lg:text-6xl">
            Explore Our{" "}
            <span className="text-primary">Product Portfolio</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-on-surface-variant md:text-lg">
            Browse quality-focused formulations across therapeutic categories,
            dosage forms, and export-ready pharmaceutical supply solutions.
          </p>

          <form action="/products" method="get" className="mt-8 max-w-xl">
            {catalog.selectedCategory ? (
              <input type="hidden" name="category" value={catalog.selectedCategory.handle} />
            ) : null}
            <div className="flex flex-col gap-3 rounded-2xl border border-outline-variant/25 bg-white p-2 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3 px-3 sm:px-4">
                <HiOutlineMagnifyingGlass className="shrink-0 text-xl text-on-surface-variant" />
                <input
                  type="search"
                  name="q"
                  defaultValue={catalog.query}
                  placeholder="Search by product name, molecule, or therapeutic category..."
                  className="h-12 min-w-0 w-full border-none bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-variant/60"
                />
              </div>
              <button
                type="submit"
                className="rounded-xl bg-secondary px-10 py-3.5 text-sm font-bold text-white transition-colors hover:bg-on-secondary-container"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        <div className="mx-auto w-full max-w-[420px] lg:max-w-none">
          <div className="relative h-[320px] overflow-hidden rounded-2xl bg-surface-lowest sm:h-[380px] lg:h-[430px]">
            <Image
              src="/products-hero-image.png"
              alt="Pharmaceutical product portfolio with clean medicine packaging and laboratory equipment"
              fill
              sizes="(min-width: 1280px) 460px, (min-width: 1024px) 420px, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
