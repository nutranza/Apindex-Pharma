import { NextResponse } from "next/server"
import { ArtistlyApiError, requireArtistlyToken } from "@/lib/artistly-store-api"
import { createAdminClient } from "@/lib/supabase/admin"
import { etag, PRODUCT_COLUMNS, toRebrandProduct } from "@/lib/rebrand/product"

export const runtime = "nodejs"

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    requireArtistlyToken(request)
    const { id } = await context.params
    const { data, error } = await (await createAdminClient()).from("products").select(PRODUCT_COLUMNS).eq("id", id).maybeSingle()
    if (error) throw new ArtistlyApiError("Could not read the product.", 500)
    if (!data) throw new ArtistlyApiError("Product not found.", 404)
    const product = toRebrandProduct(data)
    return NextResponse.json(product, { headers: { ETag: etag(product.version), "Cache-Control": "private, no-store" } })
  } catch (error) {
    return NextResponse.json({ error: error instanceof ArtistlyApiError ? error.message : "Could not read the product." },
      { status: error instanceof ArtistlyApiError ? error.status : 500 })
  }
}
