"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { GiMedicines } from "react-icons/gi"
import { LuDroplets, LuPill, LuSyringe } from "react-icons/lu"
import { MdOutlineScience } from "react-icons/md"
import { TbBottleFilled, TbTopologyStar3 } from "react-icons/tb"

import { CATALOG_DOSAGE_OPTIONS } from "@/lib/constants/product-dosage"
import type { PublicCatalogResult } from "@/lib/data/public-catalog"
import { buildProductDetailHref } from "@/modules/products/lib/product-detail-ui"

type ProductsCatalogSectionProps = {
  catalog: PublicCatalogResult
  initialCategoryHandle?: string | null
}

const DOSAGE_TILES = [
  {
    label: "Tablet",
    icon: LuPill,
    className: "bg-[#f39a09]",
  },
  {
    label: "Capsule",
    icon: GiMedicines,
    className: "bg-[#2c86bd]",
  },
  {
    label: "Eye / Ear Drops",
    icon: LuDroplets,
    className: "bg-[#20aa59]",
  },
  {
    label: "Injection",
    icon: LuSyringe,
    className: "bg-[#c43b2d]",
  },
  {
    label: "Creams",
    icon: TbBottleFilled,
    className: "bg-[#8e44ad]",
  },
  {
    label: "Suspension / Syrup",
    icon: MdOutlineScience,
    className: "bg-[#2d3e50]",
  },
  {
    label: "Other",
    icon: TbTopologyStar3,
    className: "bg-[#f2c500]",
  },
] as const

const DOSAGE_LABELS = CATALOG_DOSAGE_OPTIONS.filter(
  (option) => option !== "All Dosage Forms"
)

type CatalogProduct = PublicCatalogResult["products"][number]
type ProductGroup = {
  label: string
  products: CatalogProduct[]
}

function chunkProducts<T>(items: T[], size: number): T[][] {
  const rows: T[][] = []

  for (let index = 0; index < items.length; index += size) {
    rows.push(items.slice(index, index + size))
  }

  return rows
}

function normalizeSubcategory(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? ""
}

function buildSubcategorySectionId(label: string) {
  return `product-subcategory-${normalizeSubcategory(label)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}`
}

const DOSAGE_ORDER = DOSAGE_LABELS.map((label) => normalizeSubcategory(label))

function getProductSubcategory(product: CatalogProduct) {
  return product.subcategory?.trim() || "Other"
}

function buildProductGroups(products: CatalogProduct[]): ProductGroup[] {
  const groups = new Map<string, ProductGroup>()

  products.forEach((product) => {
    const label = getProductSubcategory(product)
    const key = normalizeSubcategory(label)
    const group = groups.get(key)

    if (group) {
      group.products.push(product)
      return
    }

    groups.set(key, {
      label,
      products: [product],
    })
  })

  return Array.from(groups.values()).sort((firstGroup, secondGroup) => {
    const firstIndex = DOSAGE_ORDER.indexOf(
      normalizeSubcategory(firstGroup.label)
    )
    const secondIndex = DOSAGE_ORDER.indexOf(
      normalizeSubcategory(secondGroup.label)
    )

    if (firstIndex !== -1 || secondIndex !== -1) {
      return (
        (firstIndex === -1 ? Number.MAX_SAFE_INTEGER : firstIndex) -
        (secondIndex === -1 ? Number.MAX_SAFE_INTEGER : secondIndex)
      )
    }

    return firstGroup.label.localeCompare(secondGroup.label)
  })
}

export default function ProductsCatalogSection({
  catalog,
  initialCategoryHandle = null,
}: ProductsCatalogSectionProps) {
  const initialCategoryExists = catalog.categories.some(
    (category) => category.handle === initialCategoryHandle
  )
  const [selectedCategoryHandle, setSelectedCategoryHandle] = useState<
    string | null
  >(initialCategoryExists ? initialCategoryHandle : null)

  const selectedCategory =
    catalog.categories.find(
      (category) => category.handle === selectedCategoryHandle
    ) ?? null

  const visibleProducts = useMemo(() => {
    let products = selectedCategoryHandle
      ? catalog.products.filter((product) =>
          product.categories.some(
            (category) => category.handle === selectedCategoryHandle
          )
        )
      : catalog.products

    return products
  }, [catalog.products, selectedCategoryHandle])

  const productGroups = useMemo(
    () => buildProductGroups(visibleProducts),
    [visibleProducts]
  )
  const selectedLabel =
    selectedCategory?.name ?? "All therapeutic categories"

  function scrollToSubcategory(label: string) {
    const target = document.getElementById(buildSubcategorySectionId(label))
    target?.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest",
    })
  }

  return (
    <section className="bg-white py-14 lg:py-20">
      <div className="content-container">
        <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="overflow-hidden border border-gray-200 bg-white">
            <h2 className="bg-gray-50 px-5 py-6 text-center text-2xl font-semibold text-primary">
              Category
            </h2>
            <nav aria-label="Therapeutic categories">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategoryHandle(null)
                }}
                className={`block w-full border-t border-gray-200 px-5 py-3 text-left text-sm transition-colors ${
                  !selectedCategoryHandle
                    ? "bg-secondary text-white"
                    : "bg-white text-on-surface hover:bg-gray-50"
                }`}
              >
                All
              </button>

              {catalog.categories.map((category) => {
                const isSelected = category.handle === selectedCategoryHandle

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategoryHandle(category.handle)
                    }}
                    className={`block w-full border-t border-gray-200 px-5 py-3 text-left text-sm transition-colors ${
                      isSelected
                        ? "bg-secondary text-white"
                        : "bg-white text-on-surface hover:bg-gray-50"
                    }`}
                  >
                    {category.name}
                  </button>
                )
              })}
            </nav>
          </aside>

          <div className="min-w-0">
            <div className="mb-12 grid grid-cols-2 gap-5 sm:grid-cols-3 xl:grid-cols-7">
              {DOSAGE_TILES.filter((tile) =>
                DOSAGE_LABELS.includes(
                  tile.label as (typeof DOSAGE_LABELS)[number]
                )
              ).map((tile) => {
                const Icon = tile.icon

                return (
                  <button
                    key={tile.label}
                    type="button"
                    onClick={() => scrollToSubcategory(tile.label)}
                    className={`flex min-h-[100px] flex-col items-center justify-center gap-2 px-3 py-4 text-center text-white transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-secondary-container ${tile.className}`}
                  >
                    <Icon className="text-3xl" />
                    <span className="text-sm font-semibold leading-tight">
                      {tile.label}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <h3 className="text-2xl font-semibold text-secondary">
                {selectedCategory?.name ?? "All Products"}
              </h3>
              <p className="text-sm text-on-surface-variant">
                Showing {visibleProducts.length} result
                {visibleProducts.length === 1 ? "" : "s"} in {selectedLabel}
              </p>
            </div>

            {productGroups.length > 0 ? (
              <div className="space-y-8">
                {productGroups.map((group) => {
                  const productRows = chunkProducts(group.products, 4)

                  return (
                    <div
                      key={normalizeSubcategory(group.label)}
                      id={buildSubcategorySectionId(group.label)}
                      className="scroll-mt-28"
                    >
                      <h4 className="mb-3 text-xl font-semibold text-primary">
                        {group.label}
                      </h4>

                      <div className="overflow-hidden border border-gray-200">
                        {productRows.map((row, rowIndex) => (
                          <div
                            key={row.map((product) => product.id).join("-")}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
                          >
                            {row.map((product) => (
                              <Link
                                key={product.id}
                                href={buildProductDetailHref(product.handle)}
                                className="flex min-h-[56px] items-center justify-center border-b border-r border-gray-200 px-4 py-3 text-center text-sm leading-6 text-on-surface transition-colors hover:bg-gray-50"
                              >
                                {product.name}
                              </Link>
                            ))}
                            {rowIndex === productRows.length - 1
                              ? Array.from({ length: 4 - row.length }).map(
                                  (_, index) => (
                                    <div
                                      key={`empty-${index}`}
                                      className="hidden min-h-[56px] border-b border-r border-gray-200 lg:block"
                                    />
                                  )
                                )
                              : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="border border-gray-200 px-4 py-14 text-center">
                <h3 className="apx-font-headline text-xl font-semibold text-on-surface">
                  No products found
                </h3>
                <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-on-surface-variant">
                  Select another category to review the available
                  pharmaceutical catalogue entries.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
