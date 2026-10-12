import { Suspense } from "react"
import ProductCatalogLoading from "@/modules/products/components/product-catalog-loading"
import ProductsCatalogSection from "@/modules/products/sections/products-catalog-section"
import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"

import {
  listPublicCatalogCategories,
  listPublicCatalogListing,
  normalizeCatalogDosageForm,
} from "@/lib/data/public-catalog"
import ProductsPageTemplate from "@/modules/products/templates/products-page"

export const revalidate = 300

type CategoryPageProps = {
  params: Promise<{ handle: string }>
  searchParams: Promise<{
    q?: string
    dosageForm?: string
    subcategory?: string
    page?: string
  }>
}

export async function generateStaticParams() {
  const categories = await listPublicCatalogCategories()

  return categories.map((category) => ({
    handle: category.handle,
  }))
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { handle } = await params
  const categories = await listPublicCatalogCategories()
  const category = categories.find((item) => item.handle === handle)

  if (!category) {
    return {
      title: "Category Not Found",
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  return {
    title: `${category.name} Products | Apindex`,
    description: `Browse ${category.name} pharmaceutical products from Apindex for institutional and export enquiries.`,
  }
}

async function CategoryCatalogContent({
  params,
  searchParams,
}: CategoryPageProps) {
  const [{ handle }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ])

  const dosageForm =
    resolvedSearchParams.dosageForm?.trim() ||
    resolvedSearchParams.subcategory?.trim()
  const catalog = await listPublicCatalogListing({
    page: Number(resolvedSearchParams.page),
    dosageForm,
    query: resolvedSearchParams.q,
    categoryHandle: handle,
  })

  if (!catalog.selectedCategory) {
    notFound()
  }

  if (catalog.page > catalog.totalPages) {
    const query = new URLSearchParams()
    if (catalog.query) query.set("q", catalog.query)
    const normalizedDosage = normalizeCatalogDosageForm(dosageForm)
    if (normalizedDosage) query.set("dosageForm", normalizedDosage)
    if (catalog.totalPages > 1) query.set("page", String(catalog.totalPages))
    redirect(
      `/categories/${encodeURIComponent(handle)}${
        query.size ? `?${query}` : ""
      }`
    )
  }

  return (
    <ProductsCatalogSection
      catalog={catalog}
      initialCategoryHandle={catalog.selectedCategory.handle}
      initialDosageForm={
        resolvedSearchParams.dosageForm?.trim() ||
        resolvedSearchParams.subcategory?.trim() ||
        null
      }
    />
  )
}

export default function CategoryPage(props: CategoryPageProps) {
  return (
    <ProductsPageTemplate>
      <Suspense fallback={<ProductCatalogLoading />}>
        <CategoryCatalogContent {...props} />
      </Suspense>
    </ProductsPageTemplate>
  )
}
