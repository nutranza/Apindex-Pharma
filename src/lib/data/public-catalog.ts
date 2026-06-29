import { cache } from "react"

import { CATALOG_DOSAGE_OPTIONS } from "@/lib/constants/product-dosage"
import type { Category, Collection } from "@/lib/supabase/types"
import { createClient } from "@/lib/supabase/server"
import { fixUrl } from "@/lib/util/images"
import { ACTIVE_PRODUCT_STATUS } from "@/lib/util/product-visibility"

export const PRODUCT_CATALOG_PAGE_SIZE = 6
export { CATALOG_DOSAGE_OPTIONS }

export type CatalogCategory = Pick<Category, "id" | "name" | "handle" | "image_url">
export type CatalogCollection = Pick<Collection, "id" | "title" | "handle" | "image_url">

type CatalogImage = string | { url?: string | null }

type PublicCatalogProductRow = {
  id: string
  handle: string
  name: string
  description: string | null
  short_description: string | null
  image_url: string | null
  images: CatalogImage[] | null
  metadata: Record<string, unknown> | null
  created_at: string
}

type ProductCategoryLinkRow = {
  product_id: string
  category: CatalogCategory | CatalogCategory[] | null
}

type ProductCollectionLinkRow = {
  product_id: string
  collection: CatalogCollection | CatalogCollection[] | null
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
}

function normalizePage(page: number | undefined): number {
  if (!page || Number.isNaN(page) || page < 1) {
    return 1
  }

  return Math.floor(page)
}

function buildNormalizedImages(
  imageUrl: string | null,
  images: CatalogImage[] | null
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

export const listPublicCatalogCategories = cache(
  async function listPublicCatalogCategories(): Promise<CatalogCategory[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, handle, image_url")
      .order("name", { ascending: true })

    if (error) {
      console.error("Error fetching public catalog categories:", error.message)
      return []
    }

    return (data ?? []) as CatalogCategory[]
  }
)

export const listPublicCatalogProducts = cache(
  async function listPublicCatalogProducts(
    options: ListPublicCatalogProductsOptions = {}
  ): Promise<PublicCatalogResult> {
    const supabase = await createClient()
    const categories = await listPublicCatalogCategories()

    const pageSize = options.pageSize ?? PRODUCT_CATALOG_PAGE_SIZE
    const page = normalizePage(options.page)
    const query = normalizeSearchQuery(options.query)
    const selectedCategory = options.categoryHandle
      ? categories.find((category) => category.handle === options.categoryHandle) ??
        null
      : null

    if (options.categoryHandle && !selectedCategory) {
      return createEmptyCatalogResult(categories, null, query, pageSize)
    }

    const baseSelect =
      "id, handle, name, description, short_description, image_url, images, metadata, created_at"
    const selectWithCategory = `${baseSelect}, product_categories!inner(category_id)`

    let productsQuery = selectedCategory
      ? supabase
          .from("products")
          .select(selectWithCategory, { count: "exact" })
      : supabase.from("products").select(baseSelect, { count: "exact" })

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
        [
          `name.ilike.${pattern}`,
          `handle.ilike.${pattern}`,
          `short_description.ilike.${pattern}`,
          `description.ilike.${pattern}`,
        ].join(",")
      )
    }

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data, count, error } = await productsQuery
      .order("created_at", { ascending: false })
      .range(from, to)

    if (error) {
      console.error("Error fetching public catalog products:", error.message)
      return createEmptyCatalogResult(categories, selectedCategory, query, pageSize)
    }

    const productRows = (data ?? []) as PublicCatalogProductRow[]
    const productIds = productRows.map((product) => product.id)

    const categoryLinksPromise = productIds.length
      ? supabase
          .from("product_categories")
          .select(
            "product_id, category:categories(id, name, handle, image_url)"
          )
          .in("product_id", productIds)
      : Promise.resolve({ data: [], error: null })

    const collectionLinksPromise = productIds.length
      ? supabase
          .from("product_collections")
          .select(
            "product_id, collection:collections(id, title, handle, image_url)"
          )
          .in("product_id", productIds)
      : Promise.resolve({ data: [], error: null })

    const [categoryLinksResult, collectionLinksResult] = await Promise.all([
      categoryLinksPromise,
      collectionLinksPromise,
    ])

    if (categoryLinksResult.error) {
      console.error(
        "Error fetching public catalog product categories:",
        categoryLinksResult.error.message
      )
    }

    if (collectionLinksResult.error) {
      console.error(
        "Error fetching public catalog product collections:",
        collectionLinksResult.error.message
      )
    }

    const categoryMap = new Map<string, CatalogCategory[]>()
    ;((categoryLinksResult.data ?? []) as ProductCategoryLinkRow[]).forEach(
      (link) => {
        const normalizedCategories = normalizeRelatedRows(link.category)
        if (normalizedCategories.length === 0) {
          return
        }

        const currentCategories = categoryMap.get(link.product_id) ?? []
        currentCategories.push(...normalizedCategories)
        categoryMap.set(link.product_id, currentCategories)
      }
    )

    const collectionMap = new Map<string, CatalogCollection[]>()
    ;((collectionLinksResult.data ?? []) as ProductCollectionLinkRow[]).forEach(
      (link) => {
        const normalizedCollections = normalizeRelatedRows(link.collection)
        if (normalizedCollections.length === 0) {
          return
        }

        const currentCollections = collectionMap.get(link.product_id) ?? []
        currentCollections.push(...normalizedCollections)
        collectionMap.set(link.product_id, currentCollections)
      }
    )

    const products = productRows.map((product) => {
      const images = buildNormalizedImages(product.image_url, product.images)

      return {
        ...product,
        image_url: images[0] ?? fixUrl(product.image_url),
        images,
        subcategory:
          typeof product.metadata?.product_subcategory === "string"
            ? product.metadata.product_subcategory
            : null,
        categories: categoryMap.get(product.id) ?? [],
        collections: collectionMap.get(product.id) ?? [],
      }
    })

    const total = count ?? 0
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
  }
)
