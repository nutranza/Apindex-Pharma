"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { type FormEvent, useEffect, useMemo, useRef, useState } from "react"
import { ArrowUpRight, Search, X } from "lucide-react"

import { CATALOG_DOSAGE_OPTIONS } from "@/lib/constants/product-dosage"
import type { PublicCatalogResult } from "@/lib/data/public-catalog"
import CatalogFilterSelect, {
  type CatalogFilterOption,
} from "@/modules/products/components/catalog-filter-select"
import { buildProductDetailHref } from "@/modules/products/lib/product-detail-ui"
import { buildProductsPageHref } from "@/modules/products/lib/catalog-ui"

type ProductsCatalogSectionProps = {
  catalog: PublicCatalogResult
  initialCategoryHandle?: string | null
  initialDosageForm?: string | null
  initialSubcategoryLabel?: string | null
}

type ProductGroup = {
  label: string
  products: CatalogProduct[]
}

const ALL_DOSAGE_FORMS = CATALOG_DOSAGE_OPTIONS[0]
const DOSAGE_FORM_LABELS = CATALOG_DOSAGE_OPTIONS.filter(
  (option) => option !== ALL_DOSAGE_FORMS
)

type CatalogProduct = PublicCatalogResult["products"][number]

function normalizeValue(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? ""
}

function normalizeDosageForm(value: string | null | undefined): string | null {
  const normalizedValue = normalizeValue(value)

  if (!normalizedValue || normalizedValue === normalizeValue(ALL_DOSAGE_FORMS)) {
    return null
  }

  return (
    DOSAGE_FORM_LABELS.find(
      (label) => normalizeValue(label) === normalizedValue
    ) ?? null
  )
}

function getProductDosageForm(product: CatalogProduct) {
  const normalizedProductValue = normalizeValue(product.subcategory)

  return (
    DOSAGE_FORM_LABELS.find(
      (label) => normalizeValue(label) === normalizedProductValue
    ) ?? "Other"
  )
}

function buildProductGroups(
  products: CatalogProduct[],
  selectedDosageForm: string | null
): ProductGroup[] {
  const groupedProducts = new Map<string, CatalogProduct[]>()

  products.forEach((product) => {
    const dosageForm = getProductDosageForm(product)

    if (selectedDosageForm && dosageForm !== selectedDosageForm) {
      return
    }

    const groupProducts = groupedProducts.get(dosageForm) ?? []
    groupProducts.push(product)
    groupedProducts.set(dosageForm, groupProducts)
  })

  return DOSAGE_FORM_LABELS.map((label) => ({
    label,
    products: groupedProducts.get(label) ?? [],
  })).filter((group) => group.products.length > 0)
}

function scrollToProductResults() {
  window.requestAnimationFrame(() => {
    document.getElementById("product-catalog-results")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest",
    })
  })
}

export default function ProductsCatalogSection({
  catalog,
  initialCategoryHandle = null,
  initialDosageForm = null,
  initialSubcategoryLabel = null,
}: ProductsCatalogSectionProps) {
  const router = useRouter()
  const resolvedInitialDosageForm = normalizeDosageForm(
    initialDosageForm ?? initialSubcategoryLabel
  )
  const routeCategoryHandle =
    catalog.selectedCategory?.handle ?? initialCategoryHandle?.trim() ?? ""
  const routeDosageForm = normalizeDosageForm(
    initialDosageForm ?? initialSubcategoryLabel
  )
  const routeFilterKey = [
    catalog.query.trim(),
    routeCategoryHandle,
    routeDosageForm ?? "",
  ].join("|")
  const previousRouteFilterKey = useRef<string | null>(null)
  const [selectedCategoryHandle, setSelectedCategoryHandle] = useState(
    routeCategoryHandle
  )
  const [selectedDosageForm, setSelectedDosageForm] = useState<string | null>(
    resolvedInitialDosageForm
  )
  const [searchInput, setSearchInput] = useState(catalog.query)
  const [searchQuery, setSearchQuery] = useState(catalog.query)

  const categoryOptions = useMemo<readonly CatalogFilterOption[]>(
    () => [
      { label: "All categories", value: "" },
      ...catalog.categories.map((category) => ({
        label: category.name,
        value: category.handle,
      })),
    ],
    [catalog.categories]
  )

  const dosageFormOptions = useMemo<readonly CatalogFilterOption[]>(
    () => [
      { label: ALL_DOSAGE_FORMS, value: "" },
      ...DOSAGE_FORM_LABELS.map((label) => ({ label, value: label })),
    ],
    []
  )

  useEffect(() => {
    setSelectedCategoryHandle(routeCategoryHandle)
  }, [routeCategoryHandle])

  useEffect(() => {
    setSelectedDosageForm(routeDosageForm)
  }, [routeDosageForm])

  useEffect(() => {
    setSearchInput(catalog.query)
    setSearchQuery(catalog.query)
  }, [catalog.query])

  useEffect(() => {
    if (previousRouteFilterKey.current === null) {
      previousRouteFilterKey.current = routeFilterKey

      if (routeFilterKey !== "||") {
        scrollToProductResults()
      }

      return
    }

    if (previousRouteFilterKey.current !== routeFilterKey) {
      previousRouteFilterKey.current = routeFilterKey
      scrollToProductResults()
    }
  }, [routeFilterKey])

  useEffect(() => {
    const nextQuery = searchInput.trim()

    if (nextQuery === catalog.query.trim()) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setSearchQuery(nextQuery)
      router.replace(
        buildProductsPageHref({
          query: nextQuery,
          categoryHandle: selectedCategoryHandle || null,
          dosageForm: selectedDosageForm,
        }),
        { scroll: false }
      )
    }, 350)

    return () => window.clearTimeout(timeoutId)
  }, [
    catalog.query,
    router,
    searchInput,
    selectedCategoryHandle,
    selectedDosageForm,
  ])

  const selectedCategory =
    catalog.categories.find(
      (category) => category.handle === selectedCategoryHandle
    ) ?? null

  const visibleProducts = useMemo(() => {
    const normalizedQuery = normalizeValue(searchQuery)

    return catalog.products.filter((product) => {
      if (!normalizedQuery) {
        return true
      }

      return (
        normalizeValue(product.name).includes(normalizedQuery) ||
        normalizeValue(product.handle).includes(normalizedQuery)
      )
    })
  }, [catalog.products, searchQuery])

  const productGroups = useMemo(
    () => buildProductGroups(visibleProducts, selectedDosageForm),
    [selectedDosageForm, visibleProducts]
  )
  const visibleProductCount = productGroups.reduce(
    (productCount, group) => productCount + group.products.length,
    0
  )

  function navigateWithFilters(
    query: string,
    categoryHandle: string | null,
    dosageForm: string | null
  ) {
    const nextQuery = query.trim()
    setSearchQuery(nextQuery)
    router.replace(
      buildProductsPageHref({
        query: nextQuery,
        categoryHandle,
        dosageForm,
      }),
      { scroll: false }
    )
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    navigateWithFilters(
      searchInput,
      selectedCategoryHandle || null,
      selectedDosageForm
    )
  }

  function handleCategoryChange(categoryHandle: string) {
    const nextCategoryHandle = categoryHandle || null
    setSelectedCategoryHandle(categoryHandle)
    navigateWithFilters(searchInput, nextCategoryHandle, selectedDosageForm)
  }

  function handleDosageFormChange(dosageForm: string) {
    const nextDosageForm = dosageForm || null
    setSelectedDosageForm(nextDosageForm)
    navigateWithFilters(searchInput, selectedCategoryHandle || null, nextDosageForm)
  }

  function clearSearch() {
    setSearchInput("")
    navigateWithFilters("", selectedCategoryHandle || null, selectedDosageForm)
  }

  function clearFilters() {
    setSearchInput("")
    setSearchQuery("")
    setSelectedCategoryHandle("")
    setSelectedDosageForm(null)
    router.replace("/products", { scroll: false })
  }

  const hasActiveFilters = Boolean(
    searchInput.trim() || selectedCategoryHandle || selectedDosageForm
  )

  return (
    <section
      id="product-catalog"
      className="scroll-mt-24 bg-surface py-14 sm:py-16 lg:py-24"
    >
      <div className="content-container">
        <div className="mb-10 rounded-3xl border border-outline-variant/25 bg-white p-4 shadow-[0_14px_38px_rgba(86,67,54,0.06)] sm:p-7">
          <form
            role="search"
            onSubmit={handleSearchSubmit}
            className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]"
          >
            <label htmlFor="product-catalog-search" className="sr-only">
              Search by product name
            </label>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-on-surface-variant"
              />
              <input
                id="product-catalog-search"
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search by product name"
                className="apx-field h-14 pl-12 pr-12 font-medium placeholder:text-on-surface-variant/65"
              />
              {searchInput ? (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Clear product search"
                  className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-xl text-on-surface-variant transition-colors hover:bg-primary-fixed hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <X aria-hidden="true" className="size-4" />
                </button>
              ) : null}
            </div>
            <button
              type="submit"
              className="apx-button-primary w-full px-8 py-4 md:w-auto"
            >
              Search
            </button>
          </form>

          <div className="mt-6 grid gap-5 border-t border-outline-variant/20 pt-6 md:grid-cols-2">
            <CatalogFilterSelect
              id="product-catalog-category"
              label="Category"
              value={selectedCategoryHandle}
              options={categoryOptions}
              searchable
              searchPlaceholder="Search categories"
              onChange={handleCategoryChange}
            />
            <CatalogFilterSelect
              id="product-catalog-dosage-form"
              label="Dosage Form"
              value={selectedDosageForm ?? ""}
              options={dosageFormOptions}
              onChange={handleDosageFormChange}
            />
          </div>

          <div className="mt-6 flex flex-col gap-4 border-t border-outline-variant/20 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p
              aria-live="polite"
              className="text-sm font-medium leading-6 text-on-surface-variant"
            >
              Showing{" "}
              <span className="font-bold text-on-surface">{visibleProductCount}</span>{" "}
              product
              {visibleProductCount === 1 ? "" : "s"}
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className={
                hasActiveFilters
                  ? "apx-button-primary shrink-0"
                  : "apx-button-outline shrink-0 text-on-surface-variant"
              }
            >
              Clear Filters
            </button>
          </div>
        </div>

        <div id="product-catalog-results" className="scroll-mt-28">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <h3 className="apx-card-title text-2xl sm:text-3xl">
              {selectedCategory?.name ?? "All Products"}
            </h3>
            {searchQuery.trim() ? (
              <p className="text-sm text-on-surface-variant sm:text-right">
                Search results for “{searchQuery.trim()}”
              </p>
            ) : null}
          </div>

          {productGroups.length > 0 ? (
            <div className="space-y-10">
              {productGroups.map((group) => (
                <section
                  key={group.label}
                  data-product-dosage-group={group.label}
                  className="scroll-mt-28"
                >
                  <div className="mb-4 flex items-center gap-4">
                    <h4 className="text-lg font-bold text-primary sm:text-xl">
                      {group.label}
                    </h4>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {group.products.map((product) => (
                      <article
                        key={product.id}
                        className="apx-card apx-card-interactive group flex min-h-[142px] flex-col p-5"
                      >
                        <h5 className="line-clamp-3 text-base font-medium text-on-surface transition-colors">
                          {product.name}
                        </h5>
                        <div className="mt-auto flex items-center justify-end border-t border-outline-variant/25 pt-4">
                          <Link
                            href={buildProductDetailHref(product.handle)}
                            aria-label={`View ${product.name} details`}
                            className="inline-flex items-center gap-1 text-sm text-secondary transition-colors focus-visible:outline-none"
                          >
                            Details
                            <ArrowUpRight
                              aria-hidden="true"
                              className="size-4"
                            />
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ))}

            </div>
          ) : (
            <div className="apx-card px-4 py-16 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary-fixed text-primary">
                <Search aria-hidden="true" className="size-6" />
              </div>
              <h3 className="apx-card-title mt-5">
                No products found
              </h3>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-on-surface-variant">
                Try a different product name or clear the filters to review the
                full pharmaceutical catalogue.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="apx-button-primary mt-6"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
