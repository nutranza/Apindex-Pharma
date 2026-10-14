import { NextResponse } from "next/server"
import { revalidatePath, revalidateTag } from "next/cache"
import { ArtistlyApiError, requireArtistlyToken } from "@/lib/artistly-store-api"
import { createAdminClient } from "@/lib/supabase/admin"
import { uploadFileBytes } from "@/lib/r2"
import { revalidateStorefrontProductPaths } from "@/lib/data/product-revalidation"
import { publishProduct, readPublishInput, RebrandError } from "@/lib/rebrand/publication"
import { etag } from "@/lib/rebrand/product"

export const runtime = "nodejs"

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    requireArtistlyToken(request)
    const { id } = await context.params
    const input = await readPublishInput(request, id)
    const client = await createAdminClient()
    const result = await publishProduct(input, {
      async find(key) {
        const { data, error } = await client.from("product_rebrand_publications").select("product_id,payload_hash,result").eq("idempotency_key", key).maybeSingle()
        if (error) throw new RebrandError("Publication storage is unavailable. Check the rebranding migration.", 503)
        return data
      },
      async upload(key, bytes, contentType) {
        if (!process.env.NEXT_PUBLIC_R2_PUBLIC_URL) throw new RebrandError("Product image storage is not configured.", 503)
        return uploadFileBytes({ key, bytes, contentType })
      },
      async commit(value, imageUrl) {
        const { data, error } = await client.rpc("publish_product_rebrand", {
          p_product_id: value.productId, p_expected_version: value.version,
          p_idempotency_key: value.key, p_payload_hash: value.digest,
          p_patch: value.patch, p_image_url: imageUrl,
        })
        if (error) {
          if (error.message.includes("REBRAND_STALE_VERSION")) throw new RebrandError("Product changed. Fetch it again and review a new candidate.", 412)
          if (error.message.includes("REBRAND_KEY_CONFLICT") || error.code === "23505") throw new RebrandError("Idempotency key conflicts with another publication.", 409)
          if (error.message.includes("REBRAND_NOT_FOUND")) throw new RebrandError("Product not found.", 404)
          if (error.message.includes("REBRAND_INVALID")) throw new RebrandError("Invalid product patch or metadata.", 400)
          throw new RebrandError("Product save failed. No database changes were committed.", 503)
        }
        return data
      },
    })
    // Also run on a replay, so a retry recovers a prior cache-invalidation failure.
    revalidateStorefrontProductPaths([result.handle])
    revalidateTag("products", { expire: 0 })
    revalidatePath("/admin/products")
    revalidatePath(`/admin/products/${id}`)
    return NextResponse.json(result, { headers: { ETag: etag(result.version), "Cache-Control": "private, no-store" } })
  } catch (error) {
    const status = error instanceof ArtistlyApiError || error instanceof RebrandError ? error.status : 500
    return NextResponse.json({ error: error instanceof ArtistlyApiError || error instanceof RebrandError ? error.message : "Product publication failed." }, { status })
  }
}
