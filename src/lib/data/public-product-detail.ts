import { cache } from "react"

import { listPublicCatalogCategories } from "@/lib/data/public-catalog"
import { getProductByHandle } from "@/lib/data/products"
import { createClient } from "@/lib/supabase/server"
import type { Category, Collection, Product } from "@/lib/supabase/types"
import { getProductPharmaDetails, type ProductPharmaDetails } from "@/lib/util/product-pharma"

type ProductDetailCategory = Pick<Category, "id" | "name" | "handle" | "image_url">
type ProductDetailCollection = Pick<Collection, "id" | "title" | "handle" | "image_url">

type ProductCategoryLinkRow = {
  category: ProductDetailCategory | ProductDetailCategory[] | null
}

type ProductCollectionLinkRow = {
  collection: ProductDetailCollection | ProductDetailCollection[] | null
}

type ProductSeoMetadata = Record<string, unknown>

export type PublicProductDetail = Pick<
  Product,
  | "id"
  | "handle"
  | "name"
  | "description"
  | "short_description"
  | "image_url"
  | "seo_title"
  | "seo_description"
  | "video_url"
  | "created_at"
  | "updated_at"
> & {
  images: string[]
  categories: ProductDetailCategory[]
  catalogCategories: ProductDetailCategory[]
  collections: ProductDetailCollection[]
  pharmaDetails: ProductPharmaDetails | null
  noIndex: boolean
  ogTitle: string | null
  ogDescription: string | null
}

function normalizeRelatedRows<T>(value: T | T[] | null): T[] {
  if (Array.isArray(value)) {
    return value
  }

  return value ? [value] : []
}

function getSeoMetadataValue(
  metadata: ProductSeoMetadata | null | undefined,
  key: string
): string | null {
  const value = metadata?.[key]

  if (typeof value !== "string") {
    return null
  }

  const trimmedValue = value.trim()
  return trimmedValue ? trimmedValue : null
}

function resolveNoIndex(metadata: ProductSeoMetadata | null | undefined): boolean {
  return metadata?.no_index === true
}

export const getPublicProductDetailByHandle = cache(
  async function getPublicProductDetailByHandle(
    handle: string
  ): Promise<PublicProductDetail | null> {
    const normalizedHandle = handle.trim()
    if (!normalizedHandle) {
      return null
    }

    const product = await getProductByHandle(normalizedHandle)
    if (!product) {
      return null
    }

    const supabase = await createClient()
    const [
      categoryLinksResult,
      collectionLinksResult,
      catalogCategories,
    ] = await Promise.all([
      supabase
        .from("product_categories")
        .select("category:categories(id, name, handle, image_url)")
        .eq("product_id", product.id),
      supabase
        .from("product_collections")
        .select("collection:collections(id, title, handle, image_url)")
        .eq("product_id", product.id),
      listPublicCatalogCategories(),
    ])

    if (categoryLinksResult.error) {
      console.error(
        "Error fetching public product categories:",
        categoryLinksResult.error.message
      )
    }

    if (collectionLinksResult.error) {
      console.error(
        "Error fetching public product collections:",
        collectionLinksResult.error.message
      )
    }

    const categories = ((categoryLinksResult.data ?? []) as ProductCategoryLinkRow[])
      .flatMap((link) => normalizeRelatedRows(link.category))
      .filter((category, index, collection) => {
        return collection.findIndex((item) => item.id === category.id) === index
      })

    const collections = ((collectionLinksResult.data ?? []) as ProductCollectionLinkRow[])
      .flatMap((link) => normalizeRelatedRows(link.collection))
      .filter((collection, index, items) => {
        return items.findIndex((item) => item.id === collection.id) === index
      })

    const images = Array.isArray(product.images)
      ? product.images.filter((image): image is string => typeof image === "string")
      : []

    const seoMetadata =
      product.seo_metadata && typeof product.seo_metadata === "object" && !Array.isArray(product.seo_metadata)
        ? (product.seo_metadata as ProductSeoMetadata)
        : null

    return {
      id: product.id,
      handle: product.handle,
      name: product.name,
      description: product.description,
      short_description: product.short_description,
      image_url: product.image_url,
      images,
      seo_title: product.seo_title,
      seo_description: product.seo_description,
      video_url: product.video_url ?? null,
      created_at: product.created_at,
      updated_at: product.updated_at,
      categories,
      catalogCategories,
      collections,
      pharmaDetails: getProductPharmaDetails(product.metadata),
      noIndex: resolveNoIndex(seoMetadata),
      ogTitle: getSeoMetadataValue(seoMetadata, "og_title"),
      ogDescription: getSeoMetadataValue(seoMetadata, "og_description"),
    }
  }
)
