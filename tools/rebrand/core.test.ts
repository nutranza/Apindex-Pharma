import { test } from "node:test"
import assert from "node:assert/strict"
import { randomUUID } from "node:crypto"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import sharp from "sharp"
import { z } from "zod"
import { candidateHash, instructionSchema, preparePatch, renameWellonaBrand, requireReview, sha256, type Instructions, type RebrandProduct } from "../../src/lib/rebrand/contracts"
import { inspectImage } from "../../src/lib/rebrand/media"
import { publishProduct, readPublishInput, RebrandError, type PublishInput } from "../../src/lib/rebrand/publication"
import { toRebrandProduct } from "../../src/lib/rebrand/product"
import { extractGeneratedImage, isPrivateAddress, generateImage } from "./network"
import { fetchItem, prepareCandidate, verifySavedProduct } from "./runner"

const product: RebrandProduct = { id: "p1", handle: "original-url", name: "Wellovir", description: '<p class="Wellovir">Wellona Pharma supplies Wellovir; well tolerated. Cipla and Lupin.</p>',
  shortDescription: "Wellona Pharma Wellovir", tradeName: "Wellovir", imageUrl: "https://wellonapharma.com/a.png", imageUrls: ["https://wellonapharma.com/a.png"], version: "2026-10-13T00:00:00+00:00" }
const instructions: Instructions = { ownership: "wellona", imageAction: "edit", wellonaBrandingPresent: true, domainPresent: true, domainPlacementsAlreadyCorrect: false,
  preserveBrands: ["Cipla", "Lupin"], notes: "Inspected original; preserve 10 mg and all medicine information.",
  editPlan: { sourceWidth: 600, sourceHeight: 581, names: [{ left: 200, top: 100, width: 50, height: 20, from: "Wellovir", to: "Dexovir" }],
    logos: [{ left: 30, top: 300, width: 50, height: 30, background: "#ffffff" }], protectedRegions: [{ left: 0, top: 0, width: 20, height: 20 }],
    domains: { bottomCenter: { left: 234, top: 555, width: 132, height: 20 } } } }
const review = (digest: string) => ({ status: "passed", candidateHash: digest, inspectedBy: "codex", explanation: "Inspected original and candidate.",
  checks: { wellonaRemoved: true, apindexCorrect: true, bottomCenterDomain: true, bottomRightDomain: true,
    otherBrandsPreserved: true, namesCorrect: true, medicineTextPreserved: true } })
const input: PublishInput = { productId: "p1", version: product.version, key: "test-request-123", patch: { tradeName: "Dexovir" },
  image: null, mimeType: null, extension: null, digest: "a".repeat(64) }
const publication = { productId: "p1", handle: product.handle, imageUrl: product.imageUrl, version: product.version, replayed: false }

test("multiple trade names replace individual references and retain other brands", () => {
  const patch = preparePatch({ ...product, name: "Medicine Syrup", tradeName: "Ascoril, Chestwell",
    description: "<p>Wellona Pharma supplies Ascoril or Chestwell; well tolerated.</p>" }, { ...instructions, preserveBrands: ["Ascoril"] })
  assert.equal(patch.tradeName, "Ascoril, Chestdex")
  assert.equal(patch.description, "<p>Apindex Pharmaceutics supplies Ascoril or Chestdex; well tolerated.</p>")
  assert.equal(patch.name, undefined)
  assert.throws(() => preparePatch({ ...product, tradeName: "Ascoril, Otherwell" }, { ...instructions, preserveBrands: ["Otherwell"] }), /protected brand/)
})

test("name mappings preserve case and descriptions preserve medical text and HTML attributes", () => {
  for (const [from, to] of [["Wellovir", "Dexovir"], ["Prediwell", "Predidex"], ["APPETITE-WELL", "APPETITE-DEX"]]) assert.equal(renameWellonaBrand(from), to)
  const patch = preparePatch(product, instructions)
  assert.equal(patch.name, "Dexovir")
  assert.equal(patch.tradeName, "Dexovir")
  assert.equal(patch.description, '<p class="Wellovir">Apindex Pharmaceutics supplies Dexovir; well tolerated. Cipla and Lupin.</p>')
  assert.equal(patch.shortDescription, "Apindex Pharmaceutics Dexovir")
})
test("other brand names are not renamed and conflicting ownership is rejected", () => {
  assert.equal(preparePatch(product, { ...instructions, ownership: "other" }).name, undefined)
  assert.throws(() => preparePatch(product, { ...instructions, ownership: "uncertain" }))
  assert.throws(() => preparePatch(product, { ...instructions, preserveBrands: ["Wellovir"] }))
})
test("instructions preserve existing domain rules and reject unknown fields", () => {
  assert.throws(() => instructionSchema.parse({ ...instructions, imageAction: "keep" }))
  assert.throws(() => instructionSchema.parse({ ...instructions, removeOtherBrands: true }))
  assert.throws(() => instructionSchema.parse({ ...instructions, wellonaBrandingPresent: false }))
  assert.throws(() => instructionSchema.parse({ ...instructions, domainPresent: false }))
  assert.throws(() => instructionSchema.parse({ ...instructions, wellonaBrandingPresent: false, domainPlacementsAlreadyCorrect: true, imageAction: "keep" }))
  const plan = instructions.editPlan
  assert.ok(plan)
  assert.throws(() => instructionSchema.parse({ ...instructions, domainPlacementsAlreadyCorrect: true,
    editPlan: { ...plan, domains: undefined, domainRemovals: [{ left: 10, top: 500, width: 150, height: 20, background: "#ffffff" }] } }))
})
test("first detail image wins; object gallery images and missing images are supported", () => {
  const row = { id: "p1", handle: "a", name: "a", description: null, short_description: null, metadata: { pharma_details: { trade_name: "Trade" } },
    image_url: "https://images.example/primary.png", thumbnail: "https://images.example/not-first.png", images: [{ url: "https://images.example/gallery.png" }], updated_at: product.version }
  assert.equal(toRebrandProduct(row).imageUrl, row.image_url)
  assert.equal(toRebrandProduct({ ...row, image_url: null }).imageUrl, "https://images.example/gallery.png")
  assert.equal(toRebrandProduct({ ...row, image_url: null, images: [] }).imageUrl, null)
})
test("review gates require exact bytes/text, every check, and explicit user approval", () => {
  const digest = candidateHash(product, { name: "Dexovir" }, "a".repeat(64), instructions)
  const approval = { approved: true, candidateHash: digest, reference: "User approved p1 in this chat." }
  requireReview(review(digest), approval, digest, false)
  assert.throws(() => requireReview(null, approval, digest, false))
  assert.throws(() => requireReview({ ...review(digest), status: "needs_review" }, approval, digest, false))
  assert.throws(() => requireReview({ ...review(digest), checks: { ...review(digest).checks, medicineTextPreserved: false } }, approval, digest, false))
  assert.throws(() => requireReview(review(digest), null, digest, false))
  assert.throws(() => requireReview(review(digest), approval, candidateHash(product, { name: "Changed" }, "a".repeat(64), instructions), false))
  assert.throws(() => requireReview(review(digest), approval, candidateHash(product, { name: "Dexovir" }, "b".repeat(64), instructions), false))
  requireReview(review(digest), null, digest, true)
})
test("Gemini responses must contain exactly one complete valid image", () => {
  assert.throws(() => extractGeneratedImage({ candidates: [{ content: { parts: [{ text: "Cannot generate." }] }, finishReason: "STOP" }] }))
  assert.throws(() => extractGeneratedImage({ candidates: [{ content: { parts: [{ inlineData: { mimeType: "image/png", data: "AAAA" } }] }, finishReason: "SAFETY" }] }))
  assert.throws(() => extractGeneratedImage({ candidates: [] }))
  assert.equal(extractGeneratedImage({ candidates: [{ content: { parts: [{ inlineData: { mimeType: "image/png", data: "AAAA" } }] }, finishReason: "STOP" }] }).length, 3)
})
test("image validation rejects fake files and oversized images", async () => {
  await assert.rejects(inspectImage(Buffer.from("not an image")))
  await assert.rejects(inspectImage(Buffer.alloc(3 * 1024 * 1024 + 1)))
  const bytes = await sharp({ create: { width: 8, height: 8, channels: 3, background: "white" } }).png().toBuffer()
  assert.equal((await inspectImage(bytes)).mimeType, "image/png")
})
test("private addresses including IPv4-mapped IPv6 are blocked", () => {
  for (const ip of ["127.0.0.1", "10.2.3.4", "192.168.1.2", "169.254.169.254", "::1", "fc00::1", "::ffff:127.0.0.1", "::ffff:7f00:1"]) assert.equal(isPrivateAddress(ip), true)
  assert.equal(isPrivateAddress("8.8.8.8"), false)
})
test("publish parsing requires ETag and accepts only narrow patches and valid images", async () => {
  const form = new FormData(); form.set("patch", JSON.stringify({ tradeName: "Dexovir" }))
  const make = (headers: Record<string,string>, body = form) => new Request("https://example.com/publish", { method: "POST", headers, body })
  const headers = { "If-Match": `"${product.version}"`, "X-Idempotency-Key": input.key }
  const parsed = await readPublishInput(make(headers), "p1")
  assert.deepEqual(parsed.patch, { tradeName: "Dexovir" })
  await assert.rejects(readPublishInput(make({}), "p1"), (error: unknown) => error instanceof RebrandError && error.status === 428)
  const wrong = new FormData(); wrong.set("patch", JSON.stringify({ price: 0 }))
  await assert.rejects(readPublishInput(make(headers, wrong), "p1"))
  const duplicate = new FormData(); duplicate.append("patch", "{}"); duplicate.append("patch", "{}")
  await assert.rejects(readPublishInput(make(headers, duplicate), "p1"))
  const fake = new FormData(); fake.set("patch", "{}"); fake.set("image", new Blob(["fake"], { type: "image/png" }), "fake.png")
  await assert.rejects(readPublishInput(make(headers, fake), "p1"))
})
test("idempotent replay performs no second upload/save and rejects changed payloads", async () => {
  let writes = 0
  const deps = { find: async () => ({ product_id: "p1", payload_hash: input.digest, result: publication }),
    upload: async () => { writes++; return "https://example/new.png" }, commit: async () => { writes++; return publication } }
  assert.equal((await publishProduct(input, deps)).replayed, true)
  assert.equal(writes, 0)
  await assert.rejects(publishProduct({ ...input, digest: "b".repeat(64) }, deps))
})
test("text-only save does not upload; failed commit is not reported as success", async () => {
  let uploads = 0
  const deps = { find: async () => null, upload: async () => { uploads++; return "https://example/new.png" }, commit: async () => publication }
  assert.equal((await publishProduct(input, deps)).productId, "p1")
  assert.equal(uploads, 0)
  await assert.rejects(publishProduct(input, { ...deps, commit: async () => { throw new Error("save failed") } }))
})
test("saved product verification catches wrong gallery/text and preserves product handles", () => {
  verifySavedProduct({ ...product, name: "Dexovir", imageUrl: "https://example/new.png", imageUrls: ["https://example/new.png"] }, product, { name: "Dexovir" }, "https://example/new.png")
  assert.throws(() => verifySavedProduct({ ...product, imageUrls: ["https://example/old.png"] }, product, {}, null))
  assert.throws(() => verifySavedProduct({ ...product, handle: "new-url" }, product, {}, null))
})
test("preparation of text-only changes creates pending review, and resume reuses candidate", async () => {
  const root = path.resolve(".cache/rebrand-checks", randomUUID())
  await mkdir(root, { recursive: true })
  const bytes = await sharp({ create: { width: 8, height: 8, channels: 3, background: "white" } }).png().toBuffer()
  await writeFile(path.join(root, "original.png"), bytes)
  await writeFile(path.join(root, "instructions.json"), JSON.stringify({ ...instructions, editPlan: undefined, imageAction: "keep", wellonaBrandingPresent: false, domainPlacementsAlreadyCorrect: true }))
  const item = { id: "p1", product, etag: `"${product.version}"`, original: "original.png", originalHash: sha256(bytes), candidate: null,
    publication: null, verified: false, skipped: false, error: null }
  await prepareCandidate(item, root, "apindexpharma.com")
  const first = JSON.stringify(item.candidate)
  const savedReview: unknown = JSON.parse(await readFile(path.join(root, "review.json"), "utf8"))
  assert.equal(z.object({ status: z.string() }).parse(savedReview).status, "needs_review")
  await prepareCandidate(item, root, "apindexpharma.com")
  assert.equal(JSON.stringify(item.candidate), first)
  await writeFile(path.join(root, "original.png"), "changed")
  await assert.rejects(prepareCandidate(item, root, "apindexpharma.com"))
})
test("fetch performs only a read and checkpoints validated source bytes; missing images fail", async context => {
  const root = path.resolve(".cache/rebrand-checks", randomUUID())
  await mkdir(root, { recursive: true })
  const bytes = await sharp({ create: { width: 8, height: 8, channels: 3, background: "white" } }).png().toBuffer()
  let reads = 0
  context.mock.method(globalThis, "fetch", async (_url: string | URL | Request, init?: RequestInit) => {
    assert.equal(init?.method ?? "GET", "GET")
    reads++
    return Response.json(product, { headers: { ETag: `"${product.version}"` } })
  })
  const item = { id: "p1", product: null, etag: null, original: null, originalHash: null, candidate: null,
    publication: null, verified: false, skipped: false, error: null }
  await fetchItem(item, root, "https://api.example", "test-token", async url => { assert.equal(url, product.imageUrl); return bytes })
  assert.equal(reads, 1)
  assert.equal(item.originalHash, sha256(bytes))
  assert.equal(item.publication, null)
  await fetchItem(item, root, "https://api.example", "test-token", async () => { throw new Error("Should not download twice") })
  assert.equal(reads, 1)
  context.mock.restoreAll()
  context.mock.method(globalThis, "fetch", async () => Response.json({ ...product, imageUrl: null, imageUrls: [] }, { headers: { ETag: `"${product.version}"` } }))
  await assert.rejects(fetchItem({ ...item, product: null, original: null }, root, "https://api.example", "test-token", async () => bytes), /no first image/)
})
test("image generation stays local, uses exact branding instructions, and resume avoids generation", async () => {
  const root = path.resolve(".cache/rebrand-checks", randomUUID())
  await mkdir(root, { recursive: true })
  const bytes = await sharp({ create: { width: 600, height: 581, channels: 3, background: "white" } }).png().toBuffer()
  await writeFile(path.join(root, "original.png"), bytes)
  await writeFile(path.join(root, "instructions.json"), JSON.stringify(instructions))
  const item = { id: "p1", product, etag: `"${product.version}"`, original: "original.png", originalHash: sha256(bytes), candidate: null,
    publication: null, verified: false, skipped: false, error: null }
  let generations = 0
  const generate = async (original: Buffer, _mime: string, logo: Buffer, _logoMime: string, prompt: string) => {
    const crop = await sharp(original).metadata()
    assert.equal(crop.width, 50); assert.equal(crop.height, 50); assert.ok(logo.length)
    assert.match(prompt, /Wellovir/); assert.match(prompt, /Dexovir/)
    assert.doesNotMatch(prompt, /Cipla|Lupin/)
    generations++; return original
  }
  await prepareCandidate(item, root, "apindexpharma.com", generate)
  assert.equal(generations, 1); assert.equal(item.publication, null)
  assert.equal(z.object({ status: z.string() }).parse(await readJsonForTest(path.join(root, "review.json"))).status, "needs_review")
  await prepareCandidate(item, root, "apindexpharma.com", generate)
  assert.equal(generations, 1)
})

async function readJsonForTest(file: string): Promise<unknown> { return JSON.parse(await readFile(file, "utf8")) }

test("Gemini receives the logo first and square target last, with no other model", async context => {
  const oldMode = process.env.REBRAND_VERTEX_AUTH
  const oldKey = process.env.VERTEX_EXPRESS_API_KEY
  const oldModel = process.env.REBRAND_IMAGE_MODEL
  let requests = 0
  try {
    process.env.REBRAND_VERTEX_AUTH = "express"
    process.env.VERTEX_EXPRESS_API_KEY = "test-key"
    process.env.REBRAND_IMAGE_MODEL = "gemini-2.5-flash-image"
    context.mock.method(globalThis, "fetch", async (url: string | URL | Request, init?: RequestInit) => {
      assert.match(String(url), /gemini-2\.5-flash-image:generateContent$/)
      if (typeof init?.body !== "string") throw new Error("Expected JSON body")
      const body = z.object({ contents: z.array(z.object({ parts: z.array(z.object({ inlineData: z.object({ data: z.string() }).optional() })) })) }).parse(JSON.parse(init.body))
      assert.equal(body.contents[0].parts[1].inlineData?.data, Buffer.from("logo").toString("base64"))
      assert.equal(body.contents[0].parts[2].inlineData?.data, Buffer.from("crop").toString("base64"))
      requests++
      return Response.json({ candidates: [{ finishReason: "STOP", content: { parts: [{ inlineData: { mimeType: "image/png", data: Buffer.from("result").toString("base64") } }] } }] })
    })
    assert.equal((await generateImage(Buffer.from("crop"), "image/png", Buffer.from("logo"), "image/png", "Edit the name only.")).toString(), "result")
    assert.equal(requests, 1)
  } finally {
    for (const [key, value] of [["REBRAND_VERTEX_AUTH", oldMode], ["VERTEX_EXPRESS_API_KEY", oldKey], ["REBRAND_IMAGE_MODEL", oldModel]] as const) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  }
})
