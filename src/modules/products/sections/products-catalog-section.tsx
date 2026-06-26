"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { HiArrowUpRight } from "react-icons/hi2"

import type { PublicCatalogResult } from "@/lib/data/public-catalog"
import {
  buildCatalogRequestHref,
  getAllCategoriesIcon,
  getCategoryIcon,
  getProductBadge,
  getProductIcon,
} from "@/modules/products/lib/catalog-ui"
import { buildProductDetailHref } from "@/modules/products/lib/product-detail-ui"

type ProductsCatalogSectionProps = {
  catalog: PublicCatalogResult
  initialCategoryHandle?: string | null
}

export default function ProductsCatalogSection({
  catalog,
  initialCategoryHandle = null,
}: ProductsCatalogSectionProps) {
  const catalogRequestHref = buildCatalogRequestHref()
  const initialCategoryExists = catalog.categories.some(
    (category) => category.handle === initialCategoryHandle
  )
  const [selectedCategoryHandle, setSelectedCategoryHandle] = useState<
    string | null
  >(initialCategoryExists ? initialCategoryHandle : null)
  const selectedCategory =
    catalog.categories.find((category) => category.handle === selectedCategoryHandle) ??
    null
  const visibleProducts = useMemo(() => {
    if (!selectedCategoryHandle) {
      return catalog.products
    }

    return catalog.products.filter((product) =>
      product.categories.some((category) => category.handle === selectedCategoryHandle)
    )
  }, [catalog.products, selectedCategoryHandle])
  const selectedCategoryName =
    selectedCategory?.name ?? "All therapeutic categories"
  const AllCategoriesIcon = getAllCategoriesIcon()

  return (
    <section className="bg-surface py-14 lg:py-20">
      <div className="content-container">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="apx-font-headline text-3xl font-semibold text-on-surface md:text-4xl">
              Product Registry
            </h2>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant md:text-base">
              Showing {visibleProducts.length} result
              {visibleProducts.length === 1 ? "" : "s"} in{" "}
              {selectedCategoryName}
            </p>
          </div>

          {/* <a
            href={catalogRequestHref}
            className="inline-flex w-fit items-center justify-center rounded-xl border border-outline-variant/25 bg-white px-5 py-3 text-sm font-semibold text-on-surface"
          >
            Request Catalog
          </a> */}
        </div>

        <nav
          aria-label="Therapeutic categories"
          className="mb-10 flex flex-wrap gap-3"
        >
          <button
            type="button"
            onClick={() => setSelectedCategoryHandle(null)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
              !selectedCategoryHandle
                ? "bg-secondary-container text-on-secondary-container"
                : "bg-white text-on-surface-variant"
            }`}
          >
            <AllCategoriesIcon className="text-base" />
            <span>All Categories</span>
          </button>

          {catalog.categories.map((category) => {
            const isSelected = category.handle === selectedCategoryHandle
            const CategoryIcon = getCategoryIcon(category)

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategoryHandle(category.handle)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
                  isSelected
                    ? "bg-secondary-container text-on-secondary-container"
                    : "bg-white text-on-surface-variant"
                }`}
              >
                <CategoryIcon className="text-base" />
                <span>{category.name}</span>
              </button>
            )
          })}
        </nav>

        <div className="min-w-0">
          <div className="mb-2 hidden border-b border-outline-variant/20 pb-3 text-xs font-semibold uppercase text-on-surface-variant md:grid md:grid-cols-[minmax(0,1fr)_160px_140px] md:items-center md:gap-8">
            <span>Product</span>
            <span>Category</span>
            <span className="text-right">Action</span>
          </div>
        </div>

        {visibleProducts.length > 0 ? (
          <div className="divide-y divide-outline-variant/20">
            {visibleProducts.map((product) => {
              const ProductIcon = getProductIcon(product)
              const productBadge = getProductBadge(product)

              return (
                <article
                  key={product.id}
                  className="group grid gap-4 py-6 md:grid-cols-[minmax(0,1fr)_160px_140px] md:items-center md:gap-8"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-primary">
                      <ProductIcon className="text-xl" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="apx-font-headline text-xl font-semibold text-on-surface md:text-xl">
                        <Link
                          href={buildProductDetailHref(product.handle)}
                          className="text-on-surface"
                        >
                          {product.name}
                        </Link>
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center md:justify-start">
                    <span className="inline-flex rounded-full bg-surface-low px-4 py-2 text-xs font-semibold text-on-surface-variant">
                      {productBadge}
                    </span>
                  </div>

                  <div className="flex items-center md:justify-end">
                    <Link
                      href={buildProductDetailHref(product.handle)}
                      className="inline-flex items-center group gap-2 text-sm font-semibold text-on-surface"
                    >
                      <span>View Product</span>
                      <HiArrowUpRight className="text-lg transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1.5" />
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="px-4 py-20 text-center">
            <h3 className="apx-font-headline text-2xl font-semibold text-on-surface">
              No products found
            </h3>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-6 text-on-surface-variant">
              Adjust your search or therapeutic category filter to review the available
              pharmaceutical catalogue entries.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                href="/products"
                className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-container"
                onClick={() => setSelectedCategoryHandle(null)}
              >
                Clear filters
              </Link>
              <a
                href={catalogRequestHref}
                className="rounded-xl border border-primary/20 bg-surface-lowest px-5 py-3 text-sm font-semibold text-primary transition-colors hover:border-primary"
              >
                Request catalog
              </a>
            </div>
          </div>
        )}

      </div>
    </section>
  )
}
