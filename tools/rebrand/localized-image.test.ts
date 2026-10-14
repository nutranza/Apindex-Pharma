import { test } from "node:test"
import assert from "node:assert/strict"
import sharp from "sharp"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { randomUUID } from "node:crypto"
import { instructionSchema, sha256, type Instructions, type RebrandProduct } from "../../src/lib/rebrand/contracts"
import { renderLocalizedImage, validateEditPlan, verifyProtectedPixels } from "./localized-image"
import { prepareImagegen, importImagegenOutput, generationMetrics } from "./imagegen"

const product: RebrandProduct = { id: "test", handle: "test", name: "Syrup", tradeName: "Ascoril, Chestwell", description: null,
  shortDescription: null, imageUrl: null, imageUrls: [], version: "2026-10-13T00:00:00Z" }
const instructions: Instructions = { ownership: "wellona", imageAction: "edit", wellonaBrandingPresent: true,
  domainPresent: true, domainPlacementsAlreadyCorrect: false, preserveBrands: ["Ascoril"], notes: "Inspected original.",
  editPlan: { sourceWidth: 600, sourceHeight: 581, names: [{ left: 200, top: 100, width: 100, height: 30, from: "Chestwell", to: "Chestdex" }],
    logos: [{ left: 190, top: 475, width: 80, height: 30, background: "#ffffff" }], protectedRegions: [{ left: 90, top: 200, width: 85, height: 270 }],
    domains: { bottomCenter: { left: 225, top: 555, width: 150, height: 20 } } } }

test("localized composition preserves dimensions and every pixel outside edit areas, and resumes crops", async () => {
  const folder = path.resolve(".cache/rebrand-checks", randomUUID())
  await mkdir(folder, { recursive: true })
  const original = await sharp({ create: { width: 600, height: 581, channels: 3, background: "#607090" } }).jpeg().toBuffer()
  const logo = await sharp({ create: { width: 100, height: 60, channels: 4, background: "#ffbb00" } }).png().toBuffer()
  const key = await prepareImagegen(original, instructions, folder)
  assert.ok(key)
  // Deliberately change the entire generated context. Only the name region may survive.
  const external = path.join(folder, "external.png")
  await writeFile(external, await sharp({ create: { width: 100, height: 100, channels: 3, background: "#112233" } }).png().toBuffer())
  await importImagegenOutput(folder, external, key, 2000)
  const result = await renderLocalizedImage(original, logo, instructions, product, "apindexpharma.com", folder)
  const edits = validateEditPlan(instructions, product)
  await verifyProtectedPixels(original, result, edits)
  assert.equal((await sharp(result).metadata()).width, 600)
  assert.equal((await sharp(result).metadata()).height, 581)
  await renderLocalizedImage(original, logo, instructions, product, "apindexpharma.com", folder)
  assert.deepEqual(await generationMetrics(folder), { calls: 1, elapsedMs: 2000 })
  const plan = instructions.editPlan
  assert.ok(plan)
  const retained = await readFile(path.join(folder, "name-region-0.png"))
  const reuse = { ...instructions, editPlan: { ...plan, names: [{ ...plan.names[0], reuseImageHash: sha256(retained) }] } }
  await renderLocalizedImage(original, logo, reuse, product, "apindexpharma.com", folder)
  await writeFile(path.join(folder, "name-region-0.png"), Buffer.from("tampered"))
  await assert.rejects(renderLocalizedImage(original, logo, reuse, product, "apindexpharma.com", folder))
  const corrupted = await sharp(result).composite([{ input: { create: { width: 1, height: 1, channels: 4, background: "red" } }, left: 100, top: 210 }]).png().toBuffer()
  await assert.rejects(verifyProtectedPixels(original, corrupted, edits), /protected original pixels/)
})

test("edit plans reject missing plans, protected text overlap, unrelated names and invalid placement", () => {
  assert.throws(() => instructionSchema.parse({ ...instructions, editPlan: undefined }))
  const plan = instructions.editPlan
  assert.ok(plan)
  assert.throws(() => validateEditPlan({ ...instructions, editPlan: { ...plan, names: [{ ...plan.names[0], from: "Ascoril", to: "Dexcoril" }] } }, product), /agreed Wellona/)
  const protectedName = { left: plan.names[0].left, top: plan.names[0].top, width: plan.names[0].width, height: plan.names[0].height }
  assert.throws(() => validateEditPlan({ ...instructions, editPlan: { ...plan, protectedRegions: [protectedName] } }, product), /protected medicine/)
  assert.throws(() => validateEditPlan({ ...instructions, editPlan: { ...plan, logos: [{ ...plan.logos[0], left: 599 }] } }, product), /dimensions/)
  const domains = plan.domains
  assert.ok(domains)
  assert.throws(() => validateEditPlan({ ...instructions, editPlan: { ...plan, domains: { bottomRight: { left: 10, top: 555, width: 150, height: 20 } } } }, product), /bottom-center/)
  assert.throws(() => instructionSchema.parse({ ...instructions, editPlan: { ...plan, domains: { ...domains, bottomRight: { left: 440, top: 555, width: 150, height: 20 } } } }))
  assert.throws(() => instructionSchema.parse({ ...instructions, domainPresent: false }))
})

test("pixel checks cover image edges and gaps between edit regions at both export scales", async () => {
  const original = await sharp({ create: { width: 24, height: 16, channels: 4, background: "#607090" } }).png().toBuffer()
  // Deliberately unsorted, adjacent and disjoint regions on the same rows.
  const allowed = [{ left: 20, top: 4, width: 4, height: 4 }, { left: 0, top: 4, width: 4, height: 4 },
    { left: 8, top: 4, width: 4, height: 4 }, { left: 12, top: 4, width: 4, height: 4 }]
  for (const scale of [1, 2]) {
    const base = await sharp(original).resize(24 * scale, 16 * scale, { kernel: "lanczos3" }).png().toBuffer()
    const permitted = await sharp(base).composite(allowed.map(rect => ({ left: rect.left * scale, top: rect.top * scale,
      input: { create: { width: rect.width * scale, height: rect.height * scale, channels: 4 as const, background: "red" } } }))).png().toBuffer()
    await verifyProtectedPixels(original, permitted, allowed, scale)
    await assert.rejects(verifyProtectedPixels(original, permitted, [], scale), /protected original pixels/)
    for (const [x, y] of [[0, 0], [23, 15], [4, 4], [7, 7], [16, 4], [19, 7], [0, 3], [23, 8]]) {
      const corrupted = await sharp(permitted).composite([{ left: x * scale, top: y * scale,
        input: { create: { width: 1, height: 1, channels: 4, background: "red" } } }]).png().toBuffer()
      await assert.rejects(verifyProtectedPixels(original, corrupted, allowed, scale), /protected original pixels/)
    }
  }
})

test("an existing domain can be replaced once without ImageGen", async () => {
  const folder = path.resolve(".cache/rebrand-checks", randomUUID())
  await mkdir(folder, { recursive: true })
  const original = await sharp({ create: { width: 600, height: 581, channels: 3, background: "white" } }).png().toBuffer()
  const plan = instructions.editPlan
  assert.ok(plan)
  const domainOnly: Instructions = { ...instructions, ownership: "other", wellonaBrandingPresent: false,
    editPlan: { ...plan, names: [], logos: [] } }
  const result = await renderLocalizedImage(original, original, domainOnly, product, "apindexpharma.com", folder)
  await verifyProtectedPixels(original, result, validateEditPlan(domainOnly, product))
})

test("no source domain means no added domain; logo uses supplied pixels without added wording", async () => {
  const folder = path.resolve(".cache/rebrand-checks", randomUUID())
  await mkdir(folder, { recursive: true })
  const original = await sharp({ create: { width: 600, height: 581, channels: 3, background: "#607090" } }).png().toBuffer()
  const logo = await sharp({ create: { width: 80, height: 30, channels: 4, background: "#ffaa00" } }).png().toBuffer()
  const plan = instructions.editPlan
  assert.ok(plan)
  const logoOnly = { ...instructions, domainPresent: false, editPlan: { ...plan, names: [], domains: undefined } }
  const result = await renderLocalizedImage(original, logo, logoOnly, product, "apindexpharma.com", folder)
  await verifyProtectedPixels(original, result, plan.logos)
  const rect = plan.logos[0]
  const expected = await sharp(logo).resize(rect.width, rect.height, { fit: "contain", background: rect.background }).flatten({ background: rect.background }).ensureAlpha().raw().toBuffer()
  const actual = await sharp(result).extract({ left: rect.left, top: rect.top, width: rect.width, height: rect.height }).ensureAlpha().raw().toBuffer()
  assert.deepEqual(actual, expected)
  assert.throws(() => instructionSchema.parse({ ...logoOnly, editPlan: { ...logoOnly.editPlan, domains: plan.domains } }))
  const larger = { ...logoOnly, editPlan: { ...logoOnly.editPlan, outputScale: 2 as const } }
  const exported = await renderLocalizedImage(original, logo, larger, product, "apindexpharma.com", folder)
  assert.equal((await sharp(exported).metadata()).width, 1200)
  assert.equal((await sharp(exported).metadata()).height, 1162)
  await verifyProtectedPixels(original, exported, plan.logos, 2)
  await assert.rejects(verifyProtectedPixels(original, exported, plan.logos), /export dimensions/)
  assert.throws(() => instructionSchema.parse({ ...larger, editPlan: { ...larger.editPlan, outputScale: 3 } }))
})
