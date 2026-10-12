import { Suspense } from "react"
import ProductCatalogLoading from "@/modules/products/components/product-catalog-loading"
import ProductsCatalogSection from "@/modules/products/sections/products-catalog-section"
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { buildProductsPageHref } from "@/modules/products/lib/catalog-ui"

import {
  listPublicCatalogListing,
  normalizeCatalogDosageForm,
} from "@/lib/data/public-catalog"
import ProductsPageTemplate from "@/modules/products/templates/products-page"

export const revalidate = 300

export const metadata: Metadata = {
  title: "Products",
  description:
    "Browse Apindex pharmaceutical products for institutional and export enquiries.",
}

async function ProductsCatalogContent({
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
    page: Number(resolvedSearchParams.page),
    dosageForm,
    query: resolvedSearchParams.q,
    categoryHandle,
  })

  if (catalog.page > catalog.totalPages) {
    redirect(
      buildProductsPageHref({
        query: catalog.query,
        categoryHandle,
        dosageForm: normalizeCatalogDosageForm(dosageForm),
        page: catalog.totalPages,
      })
    )
  }

  return (
    <ProductsCatalogSection
      catalog={catalog}
      initialCategoryHandle={
        catalog.selectedCategory?.handle ?? categoryHandle ?? null
      }
      initialDosageForm={dosageForm || null}
    />
  )
}

export default function ProductsPage(props: {
  searchParams: Promise<{
    q?: string
    category?: string
    dosageForm?: string
    subcategory?: string
    page?: string
  }>
}) {
  return (
    <ProductsPageTemplate>
      <Suspense fallback={<ProductCatalogLoading />}>
        <ProductsCatalogContent {...props} />
      </Suspense>
    </ProductsPageTemplate>
  )
}
