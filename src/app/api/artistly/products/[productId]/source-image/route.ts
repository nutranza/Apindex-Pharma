import { lookup } from "node:dns/promises"
import { isIP } from "node:net"

import { NextResponse } from "next/server"
import sharp from "sharp"

import {
  ArtistlyApiError,
  requireArtistlyToken,
} from "@/lib/artistly-store-api"
import { createAdminClient } from "@/lib/supabase/admin"
import { resolveProductImageUrl } from "@/lib/util/images"

type RouteContext = {
  params: Promise<{ productId: string }>
}

type ProductImageRow = {
  image_url: string | null
  thumbnail: string | null
  images: string[] | null
}

const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const MAX_REDIRECTS = 3

export async function GET(request: Request, context: RouteContext) {
  try {
    requireArtistlyToken(request)

    const { productId } = await context.params
    if (!productId.trim()) {
      throw new ArtistlyApiError("Product ID is required.", 400)
    }

    const { data, error } = await (await createAdminClient())
      .from("products")
      .select("image_url,thumbnail,images")
      .eq("id", productId)
      .maybeSingle()

    if (error || !data) {
      throw new ArtistlyApiError("Product image not found.", 404)
    }

    const product = data as ProductImageRow
    const imageUrl = [product.image_url, product.thumbnail, ...(product.images ?? [])]
      .map((value) => resolveProductImageUrl(value))
      .find((value): value is string => Boolean(value))

    if (!imageUrl) {
      throw new ArtistlyApiError("Product image not found.", 404)
    }

    const image = await downloadImage(imageUrl)
    return new NextResponse(image.bytes, {
      headers: {
        "cache-control": "private, no-store",
        "content-type": image.mimeType,
        "content-length": String(image.bytes.length),
        "x-content-type-options": "nosniff",
      },
    })
  } catch (error) {
    if (error instanceof ArtistlyApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error("Artistly source image download failed:", error)
    return NextResponse.json({ error: "The product image could not be downloaded." }, { status: 502 })
  }
}

async function downloadImage(imageUrl: string): Promise<{
  bytes: Buffer
  mimeType: "image/jpeg" | "image/png" | "image/webp"
}> {
  let currentUrl = new URL(imageUrl)

  for (let redirect = 0; redirect <= MAX_REDIRECTS; redirect += 1) {
    await assertSafeRemoteUrl(currentUrl)
    const response = await fetch(currentUrl, {
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(45_000),
    })

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location")
      if (!location || redirect === MAX_REDIRECTS) {
        throw new ArtistlyApiError("The product image has too many redirects.", 502)
      }
      currentUrl = new URL(location, currentUrl)
      continue
    }

    if (!response.ok) {
      throw new ArtistlyApiError("The product image could not be downloaded.", 502)
    }

    const declaredLength = Number(response.headers.get("content-length") ?? "0")
    if (declaredLength > MAX_IMAGE_BYTES) {
      throw new ArtistlyApiError("The product image is larger than 10 MB.", 413)
    }

    const bytes = Buffer.from(await response.arrayBuffer())
    if (bytes.length === 0 || bytes.length > MAX_IMAGE_BYTES) {
      throw new ArtistlyApiError("The product image is larger than 10 MB.", 413)
    }

    const metadata = await sharp(bytes).metadata()
    if (metadata.format !== "jpeg" && metadata.format !== "png" && metadata.format !== "webp") {
      throw new ArtistlyApiError("The product image is not a supported image.", 422)
    }

    return {
      bytes,
      mimeType: metadata.format === "jpeg" ? "image/jpeg" : `image/${metadata.format}`,
    }
  }

  throw new ArtistlyApiError("The product image could not be downloaded.", 502)
}

async function assertSafeRemoteUrl(url: URL): Promise<void> {
  if (url.protocol !== "https:" || !url.hostname || isIP(url.hostname)) {
    throw new ArtistlyApiError("Product images must use a public HTTPS host.", 400)
  }

  const addresses = await lookup(url.hostname, { all: true })
  if (addresses.some((address) => isPrivateAddress(address.address))) {
    throw new ArtistlyApiError("Private image hosts are not allowed.", 400)
  }
}

function isPrivateAddress(address: string): boolean {
  return /^(10\.|127\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.|::1$|fc|fd|fe80)/i.test(address)
}
