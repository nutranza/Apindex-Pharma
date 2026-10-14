import { randomUUID } from "node:crypto"
import { readFile, mkdir } from "node:fs/promises"
import path from "node:path"
import { z } from "zod"
import { config as loadEnv } from "dotenv"
import {
  authorizationSchema, candidateHash, hashSchema, instructionSchema, instructionRecordSchema, MAX_REQUEST_BYTES,
  patchSchema, preparePatch, productSchema, publicationSchema, requireReview, reviewSchema, sha256, stableJson,
  type ProductPatch, type RebrandProduct,
} from "../../src/lib/rebrand/contracts"
import { inspectImage } from "../../src/lib/rebrand/media"
import { downloadImage, readBytes, request } from "./network"
import { renderLocalizedImage, RENDERER_VERSION, validateEditPlan, verifyProtectedPixels } from "./localized-image"
import { atomicWrite, exists, readJson, writeJson } from "./files"
import { generationMetrics, importImagegenOutput, prepareImagegen } from "./imagegen"

const itemSchema = z.object({
  id: z.string(), product: productSchema.nullable(), etag: z.string().nullable(),
  original: z.string().regex(/^original\.(png|jpg|webp)$/).nullable(), originalHash: hashSchema.nullable(),
  candidate: z.object({
    patch: patchSchema, instructions: instructionRecordSchema, digest: hashSchema,
    image: z.string().regex(/^candidate\.(png|jpg|webp)$/).nullable(), imageHash: hashSchema.nullable(),
    requestKey: z.string().uuid(),
    rendererHash: hashSchema.optional(),
  }).nullable(),
  publication: publicationSchema.nullable(), verified: z.boolean(), skipped: z.boolean(), error: z.string().nullable(),
}).strict()
const runSchema = z.object({
  runId: z.string().uuid(), apiBaseUrl: z.string().url(), domain: z.string(), items: z.array(itemSchema),
  authorization: authorizationSchema.optional(), catalogueFrozen: z.boolean().optional(),
  startedAt: z.string().datetime().optional(),
}).strict()
type Run = z.infer<typeof runSchema>
type Item = z.infer<typeof itemSchema>

async function renderingHash(logo: Buffer | null, directory: string, needsImagegen: boolean): Promise<string> {
  const generated = needsImagegen ? await readJson(path.join(directory, "imagegen-result.json")) : null
  return sha256(stableJson({ version: RENDERER_VERSION, logo: logo ? sha256(logo) : null, generated }))
}

function configuration(): { base: string; token: string; domain: string } {
  const base = new URL(process.env.APINDEX_API_BASE_URL || "https://www.apindexpharma.com")
  if (base.username || base.password || (base.protocol !== "https:" && !(base.protocol === "http:" && ["localhost", "127.0.0.1"].includes(base.hostname)))) throw new Error("Use HTTPS for Apindex, or HTTP localhost for development.")
  const token = process.env.ARTISTLY_STORE_API_TOKEN
  if (!token) throw new Error("Configure ARTISTLY_STORE_API_TOKEN.")
  const domain = process.env.REBRAND_DOMAIN || "apindexpharma.com"
  if (!/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i.test(domain)) throw new Error("REBRAND_DOMAIN must be a domain without a scheme or path.")
  return { base: base.origin, token, domain }
}

function itemDirectory(root: string, id: string): string { return path.join(root, sha256(id).slice(0,24)) }

async function apiProduct(base: string, token: string, id: string): Promise<{ product: RebrandProduct; etag: string }> {
  const response = await request(`${base}/api/rebrand/products/${encodeURIComponent(id)}`, { headers: { Authorization: `Bearer ${token}` } })
  const product = productSchema.parse(JSON.parse((await readBytes(response, 1024 * 1024)).toString("utf8")))
  if (product.id !== id) throw new Error("Product API returned the wrong product.")
  const etag = response.headers.get("etag")
  if (etag !== `"${product.version}"`) throw new Error("Product API did not return a matching ETag.")
  return { product, etag }
}

export async function fetchItem(item: Item, directory: string, base: string, token: string, download = downloadImage): Promise<void> {
  if (item.product && item.original) {
    if (sha256(await readFile(path.join(directory, item.original))) !== item.originalHash) throw new Error("Original image changed. Start a fresh run.")
    return
  }
  const { product, etag } = await apiProduct(base, token, item.id)
  if (!product.imageUrl) throw new Error("Product has no first image. Nothing was changed.")
  const bytes = await download(product.imageUrl)
  const format = await inspectImage(bytes, 7 * 1024 * 1024)
  const original = `original.${format.extension}`
  await atomicWrite(path.join(directory, original), bytes)
  Object.assign(item, { product, etag, original, originalHash: sha256(bytes) })
  await writeJson(path.join(directory, "product.json"), product)
  const template = { ownership: "uncertain", imageAction: "edit", wellonaBrandingPresent: false,
    domainPresent: false, domainPlacementsAlreadyCorrect: false, preserveBrands: [], notes: "Codex must inspect the original and complete this file before generation." }
  if (!await exists(path.join(directory, "instructions.json"))) await writeJson(path.join(directory, "instructions.json"), template)
}

export async function prepareItem(item: Item, directory: string, domain: string): Promise<string | null> {
  if (item.publication) return null
  if (!item.product || !item.original) throw new Error("Fetch the product first.")
  const original = await readFile(path.join(directory, item.original))
  if (sha256(original) !== item.originalHash) throw new Error("Original image changed. Start a fresh run.")
  const instructions = instructionSchema.parse(await readJson(path.join(directory, "instructions.json")))
  preparePatch(item.product, instructions)
  if (instructions.imageAction === "edit") validateEditPlan(instructions, item.product)
  const key = await prepareImagegen(original, instructions, directory)
  if (!key) await prepareCandidate(item, directory, domain)
  return key
}

export async function prepareCandidate(item: Item, directory: string, domain: string): Promise<void> {
  if (!item.product || !item.original) throw new Error("Fetch the product first.")
  if (item.publication) return
  const original = await readFile(path.join(directory, item.original))
  if (sha256(original) !== item.originalHash) throw new Error("Original image changed. Start a fresh run.")
  const instructions = instructionSchema.parse(await readJson(path.join(directory, "instructions.json")))
  const patch = preparePatch(item.product, instructions)
  const logo = instructions.imageAction === "edit" ? await readFile(path.resolve(process.env.REBRAND_LOGO_PATH || "public/apindex-logo (1).webp")) : null
  const rendererHash = await renderingHash(logo, directory, Boolean(instructions.editPlan?.names.some(region => !region.reuseImageHash)))
  if (instructions.imageAction === "edit") validateEditPlan(instructions, item.product)
  if (item.candidate && item.candidate.rendererHash === rendererHash && stableJson(instructions) === stableJson(item.candidate.instructions) && stableJson(patch) === stableJson(item.candidate.patch)) {
    const bytes = item.candidate.image ? await readFile(path.join(directory, item.candidate.image)) : null
    if ((bytes ? sha256(bytes) : null) !== item.candidate.imageHash) throw new Error("Candidate image changed; inspect a newly generated candidate.")
    return
  }
  item.skipped = instructions.imageAction === "keep" && Object.keys(patch).length === 0
  if (item.skipped) { item.candidate = null; return }
  let image: string | null = null
  let imageHash: string | null = null
  if (instructions.imageAction === "edit") {
    if (!logo) throw new Error("Missing Apindex logo.")
    const bytes = await renderLocalizedImage(original, logo, instructions, item.product, domain, directory)
    const format = await inspectImage(bytes)
    image = `candidate.${format.extension}`
    await atomicWrite(path.join(directory, image), bytes)
    imageHash = sha256(bytes)
  }
  const digest = candidateHash(item.product, patch, imageHash, instructions)
  item.candidate = { patch, instructions, digest, image, imageHash, requestKey: randomUUID(), rendererHash }
  await writeJson(path.join(directory, "changes.json"), { before: item.product, patch, candidateHash: digest })
  await writeJson(path.join(directory, "review.json"), {
    status: "needs_review", candidateHash: digest, inspectedBy: "codex",
    explanation: "Codex must open the original and final upload image and record the actual checks.",
    checks: { wellonaRemoved: false, apindexCorrect: false, bottomCenterDomain: false, bottomRightDomain: false,
      otherBrandsPreserved: false, namesCorrect: false, medicineTextPreserved: false },
  })
}

export function verifySavedProduct(product: RebrandProduct, original: RebrandProduct, patch: ProductPatch, imageUrl: string | null): void {
  if (product.id !== original.id || product.handle !== original.handle) throw new Error("Saved product identity changed.")
  for (const field of ["name", "description", "shortDescription", "tradeName"] as const) {
    const expected = field in patch ? patch[field] : original[field]
    if (product[field] !== expected) throw new Error(`Saved ${field} did not match the reviewed value.`)
  }
  if (imageUrl && (product.imageUrl !== imageUrl || product.imageUrls.length !== 1 || product.imageUrls[0] !== imageUrl)) throw new Error("Saved product gallery did not contain exactly the approved image.")
  if (!imageUrl && stableJson(product.imageUrls) !== stableJson(original.imageUrls)) throw new Error("Text-only publication changed the image gallery.")
}

export async function publishItem(item: Item, directory: string, base: string, token: string): Promise<void> {
  if (item.skipped) return
  const { product, candidate, etag } = item
  if (!product || !candidate || !etag || !item.original) throw new Error("No prepared candidate.")
  const original = await readFile(path.join(directory, item.original))
  if (sha256(original) !== item.originalHash) throw new Error("Original image changed.")
  const instructions = instructionSchema.parse(await readJson(path.join(directory, "instructions.json")))
  if (stableJson(instructions) !== stableJson(candidate.instructions)) throw new Error("Instructions changed. Regenerate and review.")
  const changes = z.object({ before: productSchema, patch: patchSchema, candidateHash: hashSchema }).strict().parse(await readJson(path.join(directory, "changes.json")))
  if (stableJson(changes.before) !== stableJson(product) || stableJson(changes.patch) !== stableJson(candidate.patch) || changes.candidateHash !== candidate.digest) throw new Error("Proposed text changed. Regenerate and review.")
  const bytes = candidate.image ? await readFile(path.join(directory, candidate.image)) : null
  if (instructions.imageAction === "edit") {
    const logo = await readFile(path.resolve(process.env.REBRAND_LOGO_PATH || "public/apindex-logo (1).webp"))
    if (candidate.rendererHash !== await renderingHash(logo, directory, Boolean(instructions.editPlan?.names.some(region => !region.reuseImageHash))) || !bytes) throw new Error("Rendering inputs changed. Compose and inspect again.")
    await verifyProtectedPixels(original, bytes, validateEditPlan(instructions, product), instructions.editPlan?.outputScale ?? 1)
  }
  const digest = candidateHash(product, candidate.patch, bytes ? sha256(bytes) : null, instructions)
  if (digest !== candidate.digest) throw new Error("Candidate changed. A new review is required.")
  const review = await readJson(path.join(directory, "review.json"))
  requireReview(review, digest)
  // A recorded result can still be read/verified after an interrupted verification.
  if (!item.publication) {
    // If this version differs, the server still needs to identify a lost-response replay.
    // Its transaction returns the existing result only for the exact same request key/hash.
    const form = new FormData()
    form.set("patch", JSON.stringify(candidate.patch))
    if (bytes) {
      const format = await inspectImage(bytes)
      form.set("image", new Blob([new Uint8Array(bytes)], { type: format.mimeType }), `candidate.${format.extension}`)
    }
    const prepared = new Request(`${base}/api/rebrand/products/${encodeURIComponent(item.id)}/publish`, {
      method: "POST", body: form, headers: { Authorization: `Bearer ${token}`, "If-Match": etag, "X-Idempotency-Key": candidate.requestKey },
    })
    const body = await prepared.arrayBuffer()
    if (body.byteLength > MAX_REQUEST_BYTES) throw new Error("Complete publish request exceeds 4 MB.")
    const response = await request(prepared.url, { method: "POST", headers: prepared.headers, body })
    item.publication = publicationSchema.parse(JSON.parse((await readBytes(response, 64 * 1024)).toString("utf8")))
    // This receipt is written before further network work to allow recovery after interruption.
    await writeJson(path.join(directory, "publication.json"), item.publication)
  }
  const saved = await apiProduct(base, token, item.id)
  if (saved.product.version !== item.publication.version) throw new Error("Product changed after publication; inspect the current saved product.")
  verifySavedProduct(saved.product, product, candidate.patch, candidate.image ? item.publication.imageUrl : null)
  await writeJson(path.join(directory, "saved-product.json"), saved.product)
  if (bytes && item.publication.imageUrl) {
    const imageResponse = await request(item.publication.imageUrl, {})
    if (sha256(await readBytes(imageResponse, 3 * 1024 * 1024)) !== candidate.imageHash) throw new Error("Published image bytes do not match the inspected image.")
  }
  const pageResponse = await request(`${base}/products/${encodeURIComponent(saved.product.handle)}`, { headers: { "Cache-Control": "no-cache" } })
  const page = (await readBytes(pageResponse, 8 * 1024 * 1024)).toString("utf8")
  const imageUrl = saved.product.imageUrl
  if (imageUrl && !page.includes(imageUrl) && !page.includes(encodeURIComponent(imageUrl))) throw new Error("Published product is saved, but its public page does not show the expected image yet.")
  item.verified = true
  await writeJson(path.join(directory, "website-verification.json"), { verifiedAt: new Date().toISOString(), handle: saved.product.handle, imageUrl })
}

export async function discoverActiveProducts(base: string, token: string): Promise<string[]> {
  const schema = z.object({ products: z.array(z.object({ id: z.string().min(1), status: z.literal("active") })), nextCursor: z.string().nullable() })
  const ids = new Set<string>()
  const visited = new Set<string>()
  let cursor: string | null = null
  do {
    const url = new URL("/api/artistly/products", base)
    url.searchParams.set("status", "active")
    url.searchParams.set("limit", "100")
    if (cursor) url.searchParams.set("cursor", cursor)
    const response = await request(url, { headers: { Authorization: `Bearer ${token}` } })
    const page = schema.parse(JSON.parse((await readBytes(response, 1024 * 1024)).toString("utf8")))
    for (const product of page.products) ids.add(product.id)
    cursor = page.nextCursor
    if (cursor) {
      if (visited.has(cursor)) throw new Error("Product list returned a repeated pagination cursor.")
      visited.add(cursor)
    }
  } while (cursor)
  return Array.from(ids)
}

async function reportRun(run: Run, root: string) {
  const totals = { published: 0, skipped: 0, failed: 0, remaining: 0, verificationPending: 0, imagegenCalls: 0, generationMs: 0 }
  const products: Array<{ id: string; name: string | null; status: string; reason: string | null }> = []
  for (const item of run.items) {
    let reason = item.error
    const reviewFile = path.join(itemDirectory(root, item.id), "review.json")
    if (!reason && item.candidate && !item.publication && await exists(reviewFile)) {
      const review = reviewSchema.parse(await readJson(reviewFile))
      if (review.status === "failed" && review.candidateHash === item.candidate.digest) reason = review.explanation
    }
    if (item.verified) totals.published++
    else if (item.publication) totals.verificationPending++
    else if (item.skipped) totals.skipped++
    else if (reason) totals.failed++
    else totals.remaining++
    products.push({ id: item.id, name: item.product?.name ?? null,
      status: item.verified ? "published" : item.publication ? "verification_pending" : item.skipped ? "skipped" : reason ? "failed" : "remaining", reason })
    const metrics = await generationMetrics(itemDirectory(root, item.id))
    totals.imagegenCalls += metrics.calls
    totals.generationMs += metrics.elapsedMs
  }
  const report = { runId: run.runId, totals, elapsedMs: run.startedAt ? Date.now() - Date.parse(run.startedAt) : null, products }
  await writeJson(path.join(root, "report.json"), report)
  console.log(JSON.stringify(report.totals))
  return report
}

export async function main(args = process.argv.slice(2)): Promise<void> {
  loadEnv({ path: ".env.local", quiet: true })
  loadEnv({ path: ".env", quiet: true })
  const [command, ...flags] = args
  if (!command || command === "--help") {
    console.log("rebrand fetch --all-active --authorization 'User authorization' [--run UUID]\nrebrand fetch --ids id1,id2 --authorization 'User authorization'\nrebrand prepare --run UUID [--ids id1,id2]\nrebrand compose --run UUID --ids id --image PATH --input-key HASH --elapsed-ms NUMBER\nrebrand publish --run UUID [--ids id1,id2]\nrebrand status --run UUID\nSee tools/rebrand/README.md for Codex inspection and ImageGen import.")
    return
  }
  if (!["fetch", "prepare", "compose", "publish", "status"].includes(command)) throw new Error("Unknown command.")
  const options = new Map<string, string>()
  let allActive = false
  for (let index = 0; index < flags.length; index++) {
    const flag = flags[index]
    if (flag === "--all-active") { if (allActive) throw new Error("Repeated option."); allActive = true; continue }
    if (!["--ids", "--run", "--authorization", "--image", "--input-key", "--elapsed-ms"].includes(flag) || !flags[index + 1] || flags[index + 1].startsWith("--") || options.has(flag)) throw new Error("Invalid or repeated command option.")
    options.set(flag, flags[++index])
  }
  if (allActive && (command !== "fetch" || options.has("--ids"))) throw new Error("Use --all-active only with fetch, without --ids.")
  if (options.has("--authorization") && command !== "fetch") throw new Error("Record run authorization when fetching products.")
  if (["--image", "--input-key", "--elapsed-ms"].some(flag => options.has(flag)) && command !== "compose") throw new Error("ImageGen import options are only allowed with compose.")
  const runId = options.get("--run") || (command === "fetch" ? randomUUID() : "")
  z.string().uuid().parse(runId)
  const root = path.resolve(".cache/rebrand", runId)
  await mkdir(root, { recursive: true })
  const manifest = path.join(root, "run.json")
  if (command === "status") {
    const run = runSchema.parse(await readJson(manifest))
    const report = await reportRun(run, root)
    for (const item of report.products) console.log(`${item.id}: ${item.status}${item.reason ? ` — ${item.reason}` : ""}\n  ${itemDirectory(root, item.id)}`)
    return
  }
  let ids = Array.from(new Set((options.get("--ids") ?? "").split(",").map(id => id.trim()).filter(Boolean)))
  if (ids.some(id => id.length > 200)) throw new Error("Invalid product ID.")
  const { base, token, domain } = configuration()
  const run: Run = await exists(manifest) ? runSchema.parse(await readJson(manifest)) : { runId, apiBaseUrl: base, domain, items: [], startedAt: new Date().toISOString() }
  if (run.runId !== runId || run.apiBaseUrl !== base || run.domain !== domain) throw new Error("Run belongs to another API, domain or run ID. Start a fresh run.")
  if (allActive && !run.catalogueFrozen) {
    ids = await discoverActiveProducts(base, token)
    run.items = ids.map(id => ({ id, product: null, etag: null, original: null, originalHash: null, candidate: null, publication: null, verified: false, skipped: false, error: null }))
    run.catalogueFrozen = true
  }
  if (options.has("--authorization")) run.authorization = authorizationSchema.parse({ scope: allActive || run.catalogueFrozen ? "active" : "selected", reference: options.get("--authorization") })
  if (!ids.length) ids = run.items.map(item => item.id)
  if (!ids.length) {
    if (!allActive && !run.catalogueFrozen) throw new Error("Provide product IDs or --all-active.")
    await writeJson(manifest, run)
    await reportRun(run, root)
    return
  }
  if (options.has("--image") && (ids.length !== 1 || !options.has("--input-key") || !options.has("--elapsed-ms"))) throw new Error("Import one product at a time with its input key and measured elapsed milliseconds.")
  if (!options.has("--image") && (options.has("--input-key") || options.has("--elapsed-ms"))) throw new Error("Provide --image with the ImageGen import metadata.")
  if (command === "publish") authorizationSchema.parse(run.authorization)
  // Persist the complete catalogue before fetching, so interruption cannot alter scope.
  await writeJson(manifest, run)
  console.log(`Run ${runId}\nReview folder: ${root}`)
  let failures = 0
  for (const id of ids) {
    let item = run.items.find(value => value.id === id)
    if (!item) {
      if (command !== "fetch" || run.catalogueFrozen) throw new Error(`Product ${id} is outside this run's saved selection.`)
      item = { id, product: null, etag: null, original: null, originalHash: null, candidate: null, publication: null, verified: false, skipped: false, error: null }
      run.items.push(item)
    }
    const directory = itemDirectory(root, id)
    await mkdir(directory, { recursive: true })
    try {
      item.error = null
      if (command === "fetch") await fetchItem(item, directory, base, token)
      if (command === "prepare") {
        const key = await prepareItem(item, directory, domain)
        if (key) console.log(`ImageGen input key: ${key}\n  ${path.join(directory, "imagegen-input.png")}`)
      }
      if (command === "compose") {
        const image = options.get("--image")
        if (image) await importImagegenOutput(directory, image, options.get("--input-key") ?? "", Number(options.get("--elapsed-ms")))
        await prepareCandidate(item, directory, domain)
      }
      if (command === "publish") {
        if (!item.publication && await exists(path.join(directory, "publication.json"))) item.publication = publicationSchema.parse(await readJson(path.join(directory, "publication.json")))
        await publishItem(item, directory, base, token)
      }
      console.log(`${id}: ${item.skipped ? "skipped" : command === "publish" ? "published and verified" : "ready"}\n  ${directory}`)
    } catch (error) {
      failures++
      // Avoid leaking credentials, URLs or arbitrary provider errors in output.
      item.error = error instanceof z.ZodError ? "Invalid instruction, review, approval or API data. See the documented schemas." : error instanceof Error ? error.message : "Operation failed."
      console.error(`${id}: ${item.error}`)
    } finally { await writeJson(manifest, run) }
  }
  await reportRun(run, root)
  if (failures) process.exitCode = 1
}
