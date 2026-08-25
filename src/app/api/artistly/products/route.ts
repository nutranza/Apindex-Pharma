import { NextResponse } from "next/server"

import { createAdminClient } from "@/lib/supabase/admin"
import {
  ArtistlyApiError,
  requireArtistlyToken,
  type ArtistlyProductRow,
} from "@/lib/artistly-store-api"
import { resolveProductImageUrl } from "@/lib/util/images"

const DEFAULT_LIMIT = 40
const MAX_LIMIT = 100

export async function GET(request: Request) {
  try {
    requireArtistlyToken(request)

    const url = new URL(request.url)
    const limit = readLimit(url.searchParams.get("limit"))
    const offset = readCursor(url.searchParams.get("cursor"))
    const status = url.searchParams.get("status")
    const search = url.searchParams.get("search")?.trim() ?? ""

    let query = (await createAdminClient())
      .from("products")
      .select("id,name,handle,status,image_url,thumbnail,images,updated_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(offset, offset + limit)

    if (status === "active" || status === "draft" || status === "archived") {
      query = query.eq("status", status)
    }

    if (search) {
      query = query.ilike("name", `%${search}%`)
    }

    const { data, error, count } = await query
    if (error) {
      throw new ArtistlyApiError("Products could not be loaded.", 500)
    }

    const rows = (data ?? []) as ArtistlyProductRow[]
    const hasNextPage = rows.length > limit
    const products = rows.slice(0, limit).map(toProductResponse)

    return NextResponse.json({
      products,
      nextCursor: hasNextPage ? encodeCursor(offset + limit) : null,
      total: count ?? products.length,
    })
  } catch (error) {
    return apiErrorResponse(error)
  }
}

function toProductResponse(product: ArtistlyProductRow) {
  const imageUrls = uniqueImageUrls([
    product.image_url,
    product.thumbnail,
    ...(product.images ?? []),
  ])

  return {
    id: product.id,
    name: product.name,
    handle: product.handle,
    status: product.status,
    imageUrl: imageUrls[0] ?? null,
    imageUrls,
    imageVersion: product.updated_at,
  }
}

function uniqueImageUrls(values: Array<string | null | undefined>): string[] {
  return Array.from(
    new Set(
      values
        .map((value) => resolveProductImageUrl(value))
        .filter((value): value is string => Boolean(value))
    )
  )
}

function readLimit(value: string | null): number {
  const parsed = Number.parseInt(value ?? "", 10)
  if (!Number.isFinite(parsed)) return DEFAULT_LIMIT
  return Math.min(Math.max(parsed, 1), MAX_LIMIT)
}

function readCursor(value: string | null): number {
  if (!value) return 0
  const decoded = Number.parseInt(Buffer.from(value, "base64url").toString("utf8"), 10)
  if (!Number.isInteger(decoded) || decoded < 0) {
    throw new ArtistlyApiError("Invalid product cursor.", 400)
  }
  return decoded
}

function encodeCursor(offset: number): string {
  return Buffer.from(String(offset), "utf8").toString("base64url")
}

function apiErrorResponse(error: unknown): NextResponse {
  if (error instanceof ArtistlyApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status })
  }

  console.error("Artistly product API failed:", error)
  return NextResponse.json({ error: "The store product request failed." }, { status: 500 })
}
