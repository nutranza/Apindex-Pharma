import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { listPublicCatalogProducts } from "@/lib/data/public-catalog"
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
  searchParams: Promise<{ q?: string; category?: string; page?: string }>
}) {
  const resolvedSearchParams = await searchParams
  const categoryHandle = resolvedSearchParams.category?.trim()

  if (categoryHandle) {
    const query = resolvedSearchParams.q?.trim()
    const queryString = query ? `?q=${encodeURIComponent(query)}` : ""

    redirect(
      `/categories/${encodeURIComponent(
        categoryHandle
      )}${queryString}`
    )
  }

  const catalog = await listPublicCatalogProducts({
    page: 1,
    pageSize: 2000,
    query: resolvedSearchParams.q,
  })

  return <ProductsPageTemplate catalog={catalog} />
}
