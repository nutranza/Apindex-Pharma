import { unstable_cache } from "next/cache"
import { cache } from "react"

import { CATALOG_DOSAGE_OPTIONS } from "@/lib/constants/product-dosage"
import type { Category, Collection } from "@/lib/supabase/types"
import { createPublicServerClient } from "@/lib/supabase/public-server"
import { fixUrl } from "@/lib/util/images"
import { ACTIVE_PRODUCT_STATUS } from "@/lib/util/product-visibility"

export const PRODUCT_CATALOG_PAGE_SIZE = 6
const PRODUCT_CATALOG_QUERY_CHUNK_SIZE = 1000
export { CATALOG_DOSAGE_OPTIONS }

export type CatalogCategory = Pick<Category, "id" | "name" | "handle" | "image_url">
export type CatalogCollection = Pick<Collection, "id" | "title" | "handle" | "image_url">

type CatalogImage = string | { url?: string | null }

type PublicCatalogProductRow = {
  id: string
  handle: string
  name: string
  description?: string | null
  short_description?: string | null
  image_url?: string | null
  images?: CatalogImage[] | null
  metadata: Record<string, unknown> | null
  created_at: string
  product_categories?: Array<{
    category: CatalogCategory | CatalogCategory[] | null
  }> | null
}

export type PublicCatalogProduct = PublicCatalogProductRow & {
  categories: CatalogCategory[]
  collections: CatalogCollection[]
  images: string[]
  image_url: string | null
  subcategory: string | null
}

export type PublicCatalogResult = {
  categories: CatalogCategory[]
  products: PublicCatalogProduct[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  selectedCategory: CatalogCategory | null
  query: string
}

type ListPublicCatalogProductsOptions = {
  page?: number
  pageSize?: number
  query?: string
  categoryHandle?: string
  mode?: "listing" | "media"
  includeCount?: boolean
}

function normalizePage(page: number | undefined): number {
  if (!page || Number.isNaN(page) || page < 1) {
    return 1
  }

  return Math.floor(page)
}

function buildNormalizedImages(
  imageUrl: string | null | undefined,
  images: CatalogImage[] | null | undefined
): string[] {
  const rawImages: string[] = []

  if (Array.isArray(images)) {
    images.forEach((image) => {
      if (typeof image === "string") {
        rawImages.push(image)
        return
      }

      const normalizedUrl = image.url?.trim()
      if (normalizedUrl) {
        rawImages.push(normalizedUrl)
      }
    })
  }

  if (imageUrl && !rawImages.includes(imageUrl)) {
    rawImages.unshift(imageUrl)
  }

  return Array.from(
    new Set(
      rawImages
        .map((value) => fixUrl(value))
        .filter((value): value is string => Boolean(value))
    )
  )
}

function normalizeSearchQuery(query: string | undefined): string {
  return query?.trim().replace(/\s+/g, " ") ?? ""
}

function buildSearchPattern(query: string): string {
  return `%${query.replace(/,/g, " ")}%`
}

function normalizeRelatedRows<T>(value: T | T[] | null): T[] {
  if (Array.isArray(value)) {
    return value
  }

  return value ? [value] : []
}

function createEmptyCatalogResult(
  categories: CatalogCategory[],
  selectedCategory: CatalogCategory | null,
  query: string,
  pageSize: number
): PublicCatalogResult {
  return {
    categories,
    products: [],
    total: 0,
    page: 1,
    pageSize,
    totalPages: 1,
    selectedCategory,
    query,
  }
}

const listPublicCatalogCategoriesCached = unstable_cache(
  async function listPublicCatalogCategoriesCached(): Promise<CatalogCategory[]> {
    const supabase = createPublicServerClient()
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, handle, image_url")
      .order("name", { ascending: true })

    if (error) {
      console.error("Error fetching public catalog categories:", error.message)
      return []
    }

    return (data ?? []) as CatalogCategory[]
  },
  ["public-catalog-categories"],
  { revalidate: 300 }
)

export const listPublicCatalogCategories = cache(
  async function listPublicCatalogCategories(): Promise<CatalogCategory[]> {
    return listPublicCatalogCategoriesCached()
  }
)

const listPublicCatalogProductsCached = unstable_cache(
  async function listPublicCatalogProductsCached(
    page: number,
    pageSize: number,
    query: string,
    categoryHandle: string,
    mode: "listing" | "media",
    includeCount: boolean
  ): Promise<PublicCatalogResult> {
    const supabase = createPublicServerClient()
    const categories = await listPublicCatalogCategoriesCached()

    const selectedCategory = categoryHandle
      ? categories.find((category) => category.handle === categoryHandle) ?? null
      : null

    if (categoryHandle && !selectedCategory) {
      return createEmptyCatalogResult(categories, null, query, pageSize)
    }

    const baseSelect =
      mode === "media"
        ? "id, handle, name, image_url, images, metadata, created_at, product_categories(category:categories(id, name, handle, image_url))"
        : "id, handle, name, metadata, created_at, product_categories(category:categories(id, name, handle, image_url))"
    const selectWithCategory =
      mode === "media"
        ? "id, handle, name, image_url, images, metadata, created_at, product_categories!inner(category_id, category:categories(id, name, handle, image_url))"
        : "id, handle, name, metadata, created_at, product_categories!inner(category_id, category:categories(id, name, handle, image_url))"

    const createProductsQuery = (shouldIncludeCount: boolean) => {
      const selectOptions = shouldIncludeCount
        ? { count: "exact" as const }
        : undefined
      let productsQuery = selectedCategory
        ? supabase
            .from("products")
            .select(selectWithCategory, selectOptions)
        : supabase.from("products").select(baseSelect, selectOptions)

      productsQuery = productsQuery.eq("status", ACTIVE_PRODUCT_STATUS)

      if (selectedCategory) {
        productsQuery = productsQuery.eq(
          "product_categories.category_id",
          selectedCategory.id
        )
      }

      if (query) {
        const pattern = buildSearchPattern(query)
        productsQuery = productsQuery.or(
          [`name.ilike.${pattern}`, `handle.ilike.${pattern}`].join(",")
        )
      }

      return productsQuery.order("created_at", { ascending: false })
    }

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    const productRows: PublicCatalogProductRow[] = []
    let total = 0

    for (
      let rangeStart = from;
      rangeStart <= to;
      rangeStart += PRODUCT_CATALOG_QUERY_CHUNK_SIZE
    ) {
      const rangeEnd = Math.min(
        rangeStart + PRODUCT_CATALOG_QUERY_CHUNK_SIZE - 1,
        to
      )
      const { data, count, error } = await createProductsQuery(
        includeCount && productRows.length === 0
      ).range(rangeStart, rangeEnd)

      if (error) {
        console.error("Error fetching public catalog products:", error.message)
        return createEmptyCatalogResult(
          categories,
          selectedCategory,
          query,
          pageSize
        )
      }

      if (typeof count === "number") {
        total = count
      }

      const currentRows = (data ?? []) as unknown as PublicCatalogProductRow[]
      productRows.push(...currentRows)

      if (currentRows.length < rangeEnd - rangeStart + 1) {
        break
      }
    }

    const products = productRows.map((product) => {
      const { product_categories: productCategories, ...catalogProduct } =
        product
      const images = buildNormalizedImages(product.image_url, product.images)
      const categories = (productCategories ?? [])
        .flatMap((link) => normalizeRelatedRows(link.category))
        .filter((category, index, collection) => {
          return collection.findIndex((item) => item.id === category.id) === index
        })

      return {
        ...catalogProduct,
        image_url: images[0] ?? fixUrl(product.image_url),
        images,
        subcategory:
          typeof product.metadata?.product_subcategory === "string"
            ? product.metadata.product_subcategory
            : null,
        categories,
        collections: [],
      }
    })

    if (!includeCount) {
      total = productRows.length
    }

    const totalPages = Math.max(1, Math.ceil(total / pageSize))

    return {
      categories,
      products,
      total,
      page: Math.min(page, totalPages),
      pageSize,
      totalPages,
      selectedCategory,
      query,
    }
  },
  ["public-catalog-products"],
  { revalidate: 300 }
)

export const listPublicCatalogProducts = cache(
  async function listPublicCatalogProducts(
    options: ListPublicCatalogProductsOptions = {}
  ): Promise<PublicCatalogResult> {
    const pageSize = options.pageSize ?? PRODUCT_CATALOG_PAGE_SIZE
    const page = normalizePage(options.page)
    const query = normalizeSearchQuery(options.query)
    const categoryHandle = options.categoryHandle ?? ""
    const mode = options.mode ?? "listing"
    const includeCount = options.includeCount ?? true

    return listPublicCatalogProductsCached(
      page,
      pageSize,
      query,
      categoryHandle,
      mode,
      includeCount
    )
  }
)

export const listPublicCatalogListing = cache(
  async function listPublicCatalogListing(
    options: Omit<ListPublicCatalogProductsOptions, "mode" | "includeCount"> = {}
  ): Promise<PublicCatalogResult> {
    return listPublicCatalogProducts({
      ...options,
      mode: "listing",
      includeCount: false,
    })
  }
)
