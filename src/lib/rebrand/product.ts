import { z } from "zod"
import { resolveProductImageUrl } from "@/lib/util/images"
import { productSchema, type RebrandProduct } from "./contracts"

export const PRODUCT_COLUMNS = "id,handle,name,description,short_description,metadata,image_url,thumbnail,images,updated_at"
const rowSchema = z.object({
  id: z.string(), handle: z.string(), name: z.string(),
  description: z.string().nullable(), short_description: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  image_url: z.string().nullable(), thumbnail: z.string().nullable(),
  images: z.array(z.union([z.string(), z.object({ url: z.string() })])).nullable(),
  updated_at: z.string(),
})

export function toRebrandProduct(value: unknown): RebrandProduct {
  const row = rowSchema.parse(value)
  const rawImages = [row.image_url, ...(row.images ?? []).map(image => typeof image === "string" ? image : image.url)]
  const imageUrls = Array.from(new Set(rawImages.map(resolveProductImageUrl).filter((url): url is string => Boolean(url))))
  const details = row.metadata?.pharma_details
  const tradeName = details && typeof details === "object" && "trade_name" in details && typeof details.trade_name === "string" ? details.trade_name : null
  return productSchema.parse({ id: row.id, handle: row.handle, name: row.name, description: row.description,
    shortDescription: row.short_description, tradeName, imageUrl: imageUrls[0] ?? null, imageUrls, version: row.updated_at })
}

export function etag(version: string): string { return `"${version}"` }
