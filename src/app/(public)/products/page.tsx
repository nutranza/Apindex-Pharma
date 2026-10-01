import type { Metadata } from "next"

import { listPublicCatalogListing } from "@/lib/data/public-catalog"
import ProductsPageTemplate from "@/modules/products/templates/products-page"

export const revalidate = 300

export const metadata: Metadata = {
  title: "Products",
  description:
    "Browse Apindex pharmaceutical products for institutional and export enquiries.",
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string
    category?: string
    dosageForm?: string
    subcategory?: string
    page?: string
  }>
}) {
  const resolvedSearchParams = await searchParams
  const categoryHandle = resolvedSearchParams.category?.trim()
  const dosageForm =
    resolvedSearchParams.dosageForm?.trim() ||
    resolvedSearchParams.subcategory?.trim()

  const catalog = await listPublicCatalogListing({
    page: 1,
    pageSize: 2000,
    query: resolvedSearchParams.q,
    categoryHandle,
  })

  return (
    <ProductsPageTemplate
      catalog={catalog}
      initialCategoryHandle={catalog.selectedCategory?.handle ?? categoryHandle ?? null}
      initialDosageForm={dosageForm || null}
    />
  )
}
