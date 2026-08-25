import { randomUUID } from "node:crypto"

import { NextResponse } from "next/server"
import sharp from "sharp"

import {
  ArtistlyApiError,
  readImageMode,
  requireArtistlyToken,
  type ArtistlyImageMode,
} from "@/lib/artistly-store-api"
import { createAdminClient } from "@/lib/supabase/admin"
import { uploadFileBytes } from "@/lib/r2"
import { revalidateStorefrontProductPaths } from "@/lib/data/product-revalidation"
import { resolveProductImageUrl } from "@/lib/util/images"

type RouteContext = {
  params: Promise<{ productId: string }>
}

type CurrentProduct = {
  id: string
  handle: string
  image_url: string | null
  thumbnail: string | null
  images: string[] | null
  updated_at: string
}

const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])

export async function PUT(request: Request, context: RouteContext) {
  try {
    requireArtistlyToken(request)

    const { productId } = await context.params
    if (!productId.trim()) {
      throw new ArtistlyApiError("Product ID is required.", 400)
    }

    const expectedVersion = request.headers.get("if-match")?.trim()
    if (!expectedVersion) {
      throw new ArtistlyApiError("If-Match is required when publishing an image.", 428)
    }

    const idempotencyKey = request.headers.get("x-idempotency-key")?.trim()
    if (!idempotencyKey || idempotencyKey.length < 8 || idempotencyKey.length > 160) {
      throw new ArtistlyApiError("A valid idempotency key is required.", 400)
    }

    const adminClient = await createAdminClient()
    const existingPublication = await adminClient
      .from("artistly_image_publications")
      .select("product_id,image_url,image_version")
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle()

    if (existingPublication.error) {
      throw new ArtistlyApiError("Image publication storage is not ready.", 500)
    }

    if (existingPublication.data) {
      if (existingPublication.data.product_id !== productId) {
        throw new ArtistlyApiError("This idempotency key belongs to another product.", 409)
      }

      return NextResponse.json({
        productId,
        imageUrl: existingPublication.data.image_url,
        imageVersion: existingPublication.data.image_version,
        replayed: true,
      })
    }

    const { data: product, error: productError } = await adminClient
      .from("products")
      .select("id,handle,image_url,thumbnail,images,updated_at")
      .eq("id", productId)
      .maybeSingle()

    if (productError || !product) {
      throw new ArtistlyApiError("Product not found.", 404)
    }

    const currentProduct = product as CurrentProduct
    if (currentProduct.updated_at !== expectedVersion) {
      throw new ArtistlyApiError("The product changed. Refresh it before publishing.", 409)
    }

    const formData = await request.formData()
    const image = formData.get("image")
    if (!(image instanceof File)) {
      throw new ArtistlyApiError("An image file is required.", 400)
    }

    if (image.size <= 0 || image.size > MAX_IMAGE_BYTES) {
      throw new ArtistlyApiError("Images must be between 1 byte and 10 MB.", 400)
    }

    if (!ALLOWED_IMAGE_TYPES.has(image.type)) {
      throw new ArtistlyApiError("Only JPEG, PNG, and WebP images are supported.", 400)
    }

    const imageBytes = new Uint8Array(await image.arrayBuffer())
    try {
      const metadata = await sharp(Buffer.from(imageBytes)).metadata()
      if (metadata.format !== "jpeg" && metadata.format !== "png" && metadata.format !== "webp") {
        throw new Error("unsupported")
      }
    } catch {
      throw new ArtistlyApiError("The uploaded file is not a valid image.", 400)
    }
    const mode = readImageMode(formData.get("mode"))
    const imageUrl = await uploadProductImage(productId, imageBytes, image.type)
    const imageUrls = buildImageUrls(currentProduct)
    const nextImages = mergeImageUrls(imageUrl, imageUrls, mode)

    const { data: updatedProduct, error: updateError } = await adminClient
      .from("products")
      .update({
        image_url: imageUrl,
        thumbnail: imageUrl,
        images: nextImages,
        image_embedding: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId)
      .eq("updated_at", expectedVersion)
      .select("id,handle,image_url,updated_at")
      .single()

    if (updateError || !updatedProduct) {
      throw new ArtistlyApiError("The product changed. Refresh it before publishing.", 409)
    }

    const { error: publicationError } = await adminClient
      .from("artistly_image_publications")
      .insert({
        idempotency_key: idempotencyKey,
        product_id: productId,
        image_url: imageUrl,
        image_version: updatedProduct.updated_at,
      })

    if (publicationError && !publicationError.message.toLowerCase().includes("duplicate")) {
      console.error("Artistly publication record failed:", publicationError)
    }

    revalidateStorefrontProductPaths([updatedProduct.handle])

    return NextResponse.json({
      productId,
      imageUrl,
      imageVersion: updatedProduct.updated_at,
      mode,
      replayed: false,
    })
  } catch (error) {
    if (error instanceof ArtistlyApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error("Artistly image publish failed:", error)
    return NextResponse.json({ error: "The product image could not be published." }, { status: 500 })
  }
}

function buildImageUrls(product: CurrentProduct): string[] {
  return Array.from(
    new Set(
      [product.image_url, product.thumbnail, ...(product.images ?? [])]
        .map((value) => resolveProductImageUrl(value))
        .filter((value): value is string => Boolean(value))
    )
  )
}

function mergeImageUrls(
  imageUrl: string,
  currentImages: string[],
  mode: ArtistlyImageMode
): string[] {
  if (mode === "replace-all") return [imageUrl]
  if (mode === "keep-both") return [imageUrl, ...currentImages.filter((url) => url !== imageUrl)]

  const oldPrimary = currentImages[0]
  return [imageUrl, ...currentImages.filter((url) => url !== oldPrimary && url !== imageUrl)]
}

async function uploadProductImage(
  productId: string,
  bytes: Uint8Array,
  contentType: string
): Promise<string> {
  const extension = contentType === "image/jpeg" ? "jpg" : contentType.split("/")[1]
  return uploadFileBytes({
    key: `products/artistly/${productId}/${randomUUID()}.${extension}`,
    bytes,
    contentType,
  })
}
