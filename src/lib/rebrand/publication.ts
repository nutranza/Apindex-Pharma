import { z } from "zod"
import { MAX_REQUEST_BYTES, patchSchema, publicationSchema, sha256, stableJson, type ProductPatch, type Publication } from "./contracts"
import { inspectImage } from "./media"

export class RebrandError extends Error {
  readonly status: number
  constructor(message: string, status: number) { super(message); this.status = status }
}

export type PublishInput = {
  productId: string; version: string; key: string; patch: ProductPatch;
  image: Uint8Array | null; mimeType: string | null; extension: string | null; digest: string;
}

export async function readPublishInput(request: Request, productId: string): Promise<PublishInput> {
  const match = request.headers.get("if-match")
  if (!match) throw new RebrandError("If-Match is required.", 428)
  const version = /^"([^"]+)"$/.exec(match)?.[1]
  if (!version || !z.string().datetime({ offset: true }).safeParse(version).success) throw new RebrandError("Use the quoted ETag returned by the product API.", 400)
  const key = request.headers.get("x-idempotency-key") ?? ""
  if (!/^[A-Za-z0-9_-]{8,160}$/.test(key)) throw new RebrandError("An 8–160 character idempotency key is required.", 400)
  const contentType = request.headers.get("content-type")
  if (!contentType?.startsWith("multipart/form-data;")) throw new RebrandError("Use multipart form data.", 415)
  if (!request.body) throw new RebrandError("Request body is required.", 400)
  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let length = 0
  try {
    for (;;) {
      const chunk = await reader.read()
      if (chunk.done) break
      length += chunk.value.length
      if (length > MAX_REQUEST_BYTES) { await reader.cancel(); throw new RebrandError("Request exceeds 4 MB.", 413) }
      chunks.push(chunk.value)
    }
  } finally { reader.releaseLock() }
  let form: FormData
  try {
    form = await new Response(Buffer.concat(chunks), { headers: { "Content-Type": contentType } }).formData()
  } catch { throw new RebrandError("Invalid multipart request.", 400) }
  const allowed = new Set(["patch", "image"])
  for (const key of Array.from(form.keys())) if (!allowed.has(key) || form.getAll(key).length !== 1) throw new RebrandError("Unknown or repeated form field.", 400)
  const rawPatch = form.get("patch")
  if (typeof rawPatch !== "string") throw new RebrandError("A JSON patch field is required.", 400)
  let patch: ProductPatch
  try { patch = patchSchema.parse(JSON.parse(rawPatch)) } catch { throw new RebrandError("Invalid product patch or unsupported field.", 400) }
  const file = form.get("image")
  if (file !== null && !(file instanceof File)) throw new RebrandError("Image must be a file.", 400)
  const image = file instanceof File ? new Uint8Array(await file.arrayBuffer()) : null
  let format: { mimeType: string; extension: string } | null = null
  if (image) {
    try { format = await inspectImage(image) } catch (error) { throw new RebrandError(error instanceof Error ? error.message : "Invalid image.", 400) }
  }
  if (!image && Object.keys(patch).length === 0) throw new RebrandError("No changes supplied.", 400)
  const digest = sha256(stableJson({ productId, version, patch, imageHash: image ? sha256(image) : null }))
  return { productId, version, key, patch, image, mimeType: format?.mimeType ?? null, extension: format?.extension ?? null, digest }
}

export type PublicationDependencies = {
  find: (_key: string) => Promise<{ product_id: string; payload_hash: string; result: unknown } | null>;
  upload: (_key: string, _bytes: Uint8Array, _mimeType: string) => Promise<string>;
  commit: (_input: PublishInput, _imageUrl: string | null) => Promise<unknown>;
}

export async function publishProduct(input: PublishInput, dependencies: PublicationDependencies): Promise<Publication> {
  const existing = await dependencies.find(input.key)
  if (existing) {
    if (existing.product_id !== input.productId || existing.payload_hash !== input.digest) throw new RebrandError("Idempotency key was used for different changes.", 409)
    return publicationSchema.parse({ ...publicationSchema.parse(existing.result), replayed: true })
  }
  const imageUrl = input.image && input.mimeType
    ? await dependencies.upload(`products/rebrand/${sha256(input.productId)}/${input.digest}.${input.extension}`, input.image, input.mimeType)
    : null
  return publicationSchema.parse(await dependencies.commit(input, imageUrl))
}
