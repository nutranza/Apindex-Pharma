import { unstable_cache } from "next/cache"
import { cache } from "react"

import { CATALOG_DOSAGE_OPTIONS } from "@/lib/constants/product-dosage"
import type { Category, Collection } from "@/lib/supabase/types"
import { createPublicServerClient } from "@/lib/supabase/public-server"
import { fixUrl } from "@/lib/util/images"
import { ACTIVE_PRODUCT_STATUS } from "@/lib/util/product-visibility"

export const PRODUCT_CATALOG_PAGE_SIZE = 24
const PRODUCT_CATALOG_QUERY_CHUNK_SIZE = 1000
export { CATALOG_DOSAGE_OPTIONS }

export type CatalogCategory = Pick<
  Category,
  "id" | "name" | "handle" | "image_url"
>
export type CatalogCollection = Pick<
  Collection,
  "id" | "title" | "handle" | "image_url"
>

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
  if (
    !page ||
    !Number.isSafeInteger(page) ||
    page < 1 ||
    page > Math.floor(2147483647 / PRODUCT_CATALOG_PAGE_SIZE)
  ) {
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
  async function listPublicCatalogCategoriesCached(): Promise<
    CatalogCategory[]
  > {
    const supabase = createPublicServerClient()
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, handle, image_url")
      .order("name", { ascending: true })

    if (error) {
      console.error("Error fetching public catalog categories:", error.message)
      throw new Error("Unable to load product categories", { cause: error })
    }

    return (data ?? []) as CatalogCategory[]
  },
  ["public-catalog-categories"],
  { revalidate: 300, tags: ["products"] }
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
      ? categories.find((category) => category.handle === categoryHandle) ??
        null
      : null

    if (categoryHandle && !selectedCategory) {
      return createEmptyCatalogResult(categories, null, query, pageSize)
    }

    const baseSelect =
      mode === "media"
        ? "id, handle, name, short_description, image_url, images, metadata, created_at, product_categories(category:categories(id, name, handle, image_url))"
        : "id, handle, name, metadata, created_at, product_categories(category:categories(id, name, handle, image_url))"
    const selectWithCategory =
      mode === "media"
        ? "id, handle, name, short_description, image_url, images, metadata, created_at, product_categories!inner(category_id, category:categories(id, name, handle, image_url))"
        : "id, handle, name, metadata, created_at, product_categories!inner(category_id, category:categories(id, name, handle, image_url))"

    const createProductsQuery = (shouldIncludeCount: boolean) => {
      const selectOptions = shouldIncludeCount
        ? { count: "exact" as const }
        : undefined
      let productsQuery = selectedCategory
        ? supabase.from("products").select(selectWithCategory, selectOptions)
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
        throw new Error("Unable to load products", { cause: error })
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
          return (
            collection.findIndex((item) => item.id === category.id) === index
          )
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
  { revalidate: 300, tags: ["products"] }
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

export type PublicCatalogListingProduct = {
  id: string
  handle: string
  name: string
  subcategory: string | null
}

export type PublicCatalogListingResult = Omit<
  PublicCatalogResult,
  "products"
> & {
  products: PublicCatalogListingProduct[]
}

type PublicCatalogListingOptions = {
  page?: number
  query?: string
  categoryHandle?: string
  dosageForm?: string
}

export function normalizeCatalogDosageForm(
  value: string | undefined
): string | null {
  return (
    CATALOG_DOSAGE_OPTIONS.find(
      (label) =>
        label !== "All Dosage Forms" &&
        label.toLowerCase() === value?.trim().toLowerCase()
    ) ?? null
  )
}

function createListingRequest(
  selectedCategory: CatalogCategory | null,
  query: string,
  dosageForm: string | null,
  head = false
) {
  const supabase = createPublicServerClient()
  let request = supabase
    .from("products")
    .select(
      selectedCategory
        ? "id, handle, name, subcategory:metadata->>product_subcategory, product_categories!inner(category_id)"
        : "id, handle, name, subcategory:metadata->>product_subcategory",
      { count: "exact", head }
    )
    .eq("status", ACTIVE_PRODUCT_STATUS)

  if (selectedCategory) {
    request = request.eq("product_categories.category_id", selectedCategory.id)
  }
  if (query) {
    const pattern = JSON.stringify(`%${query.replace(/[%_\\]/g, "\\$&")}%`)
    request = request.or(`name.ilike.${pattern},handle.ilike.${pattern}`)
  }
  if (dosageForm === "Other") {
    const recognized = CATALOG_DOSAGE_OPTIONS.filter(
      (label) => label !== "All Dosage Forms" && label !== "Other"
    )
    // Match the same trimmed, case-insensitive labels used by the UI.
    const unrecognized = recognized
      .map(
        (label) =>
          `metadata->>product_subcategory.not.imatch.${JSON.stringify(
            `^[[:space:]]*${label}[[:space:]]*$`
          )}`
      )
      .join(",")
    request = request.or(
      `metadata->>product_subcategory.is.null,and(${unrecognized})`
    )
  } else if (dosageForm) {
    request = request.filter(
      "metadata->>product_subcategory",
      "imatch",
      `^[[:space:]]*${dosageForm}[[:space:]]*$`
    )
  }

  return request
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
}

const listPublicCatalogDosageCountsCached = unstable_cache(
  async (query: string) =>
    Promise.all(
      CATALOG_DOSAGE_OPTIONS.filter(
        (label) => label !== "All Dosage Forms"
      ).map(async (dosageForm) => {
        const { count, error } = await createListingRequest(
          null,
          query,
          dosageForm,
          true
        )
        if (error)
          throw new Error("Unable to load product counts", { cause: error })
        return { dosageForm, count: count ?? 0 }
      })
    ),
  ["public-catalog-dosage-counts"],
  { revalidate: 300, tags: ["products"] }
)

type PublicCatalogListingRow = Omit<
  PublicCatalogListingProduct,
  "subcategory"
> & {
  subcategory: unknown
}

const listPublicCatalogListingCached = unstable_cache(
  async (
    page: number,
    query: string,
    categoryHandle: string,
    dosageForm: string | null
  ): Promise<PublicCatalogListingResult> => {
    const categories = await listPublicCatalogCategoriesCached()
    const selectedCategory =
      categories.find((category) => category.handle === categoryHandle) ?? null
    if (categoryHandle && !selectedCategory) {
      return createEmptyCatalogResult(
        categories,
        null,
        query,
        PRODUCT_CATALOG_PAGE_SIZE
      )
    }

    const createRequest = (head = false) =>
      createListingRequest(selectedCategory, query, dosageForm, head)

    const from = (page - 1) * PRODUCT_CATALOG_PAGE_SIZE
    let total = 0
    let rows: PublicCatalogListingRow[] = []
    if (!selectedCategory && !dosageForm) {
      // Count small dosage groups once per cache window, then fetch only the
      // portions of those groups that belong to this 24-product page.
      const counts = await listPublicCatalogDosageCountsCached(query)
      const to = from + PRODUCT_CATALOG_PAGE_SIZE - 1
      let groupStart = 0
      const requests = counts.flatMap(({ dosageForm: group, count }) => {
        const start = groupStart
        groupStart += count
        if (count === 0 || from >= groupStart || to < start) return []
        return [
          createListingRequest(null, query, group).range(
            Math.max(0, from - start),
            Math.min(count - 1, to - start)
          ),
        ]
      })
      total = groupStart
      const results = await Promise.all(requests)
      for (const result of results) {
        if (result.error)
          throw new Error("Unable to load products", { cause: result.error })
        rows.push(
          ...((result.data ?? []) as unknown as PublicCatalogListingRow[])
        )
      }
    } else {
      const { data, count, error } = await createRequest().range(
        from,
        from + PRODUCT_CATALOG_PAGE_SIZE - 1
      )
      total = count ?? 0
      if (error?.code === "PGRST103") {
        // Out-of-range requests return 416 without a count. Count the same filters
        // without an offset so the route can redirect to the last valid page.
        const countResult = await createRequest(true)
        if (countResult.error) {
          throw new Error("Unable to load products", {
            cause: countResult.error,
          })
        }
        total = countResult.count ?? 0
      } else if (error) {
        throw new Error("Unable to load products", { cause: error })
      }

      rows = (data ?? []) as unknown as PublicCatalogListingRow[]
    }
    return {
      categories,
      products: rows.map(({ id, handle, name, subcategory }) => ({
        id,
        handle,
        name,
        subcategory: typeof subcategory === "string" ? subcategory : null,
      })),
      total,
      page,
      pageSize: PRODUCT_CATALOG_PAGE_SIZE,
      totalPages: Math.max(1, Math.ceil(total / PRODUCT_CATALOG_PAGE_SIZE)),
      selectedCategory,
      query,
    }
  },
  ["public-catalog-listing"],
  { revalidate: 300, tags: ["products"] }
)

export const listPublicCatalogListing = cache(
  async (
    options: PublicCatalogListingOptions = {}
  ): Promise<PublicCatalogListingResult> => {
    return listPublicCatalogListingCached(
      normalizePage(options.page),
      normalizeSearchQuery(options.query),
      options.categoryHandle?.trim() ?? "",
      normalizeCatalogDosageForm(options.dosageForm)
    )
  }
)
