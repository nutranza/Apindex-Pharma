import type { Metadata } from "next"
import { notFound } from "next/navigation"

import {
  listPublicCatalogCategories,
  listPublicCatalogProducts,
} from "@/lib/data/public-catalog"
import ProductsPageTemplate from "@/modules/products/templates/products-page"

export const revalidate = 300

type CategoryPageProps = {
  params: Promise<{ handle: string }>
  searchParams: Promise<{ q?: string; subcategory?: string }>
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

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const [{ handle }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ])

  const catalog = await listPublicCatalogProducts({
    page: 1,
    pageSize: 2000,
    query: resolvedSearchParams.q,
    categoryHandle: handle,
  })

  if (!catalog.selectedCategory) {
    notFound()
  }

  return (
    <ProductsPageTemplate
      catalog={catalog}
      initialCategoryHandle={catalog.selectedCategory.handle}
      initialSubcategoryLabel={resolvedSearchParams.subcategory?.trim() || null}
    />
  )
}
