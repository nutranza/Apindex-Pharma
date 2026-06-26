import type { Metadata } from "next"

import { listPublicCatalogProducts } from "@/lib/data/public-catalog"
import ProductsPageTemplate from "@/modules/products/templates/products-page"

export const metadata: Metadata = {
  title: "Products",
  description:
    "Browse Apindex pharmaceutical products for institutional and export enquiries.",
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>
}) {
  const resolvedSearchParams = await searchParams

  const catalog = await listPublicCatalogProducts({
    page: 1,
    pageSize: 1000,
    query: resolvedSearchParams.q,
  })

  return (
    <ProductsPageTemplate
      catalog={catalog}
      initialCategoryHandle={resolvedSearchParams.category ?? null}
    />
  )
}
