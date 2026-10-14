import sharp from "sharp"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { z } from "zod"
import { inspectImage } from "../../src/lib/rebrand/media"
import { hashSchema, instructionSchema, renameWellonaBrand, sha256, stableJson, type Instructions, type Rectangle, type RebrandProduct } from "../../src/lib/rebrand/contracts"
import { generateImage } from "./network"
import { atomicWrite, readJson, writeJson } from "./files"

export const RENDERER_VERSION = "localized-v3-sharp-aligned"
const NAME_EDITOR_VERSION = "localized-v1"
function overlaps(a: Rectangle, b: Rectangle): boolean {
  return a.left < b.left + b.width && b.left < a.left + a.width && a.top < b.top + b.height && b.top < a.top + a.height
}
export function validateEditPlan(instructions: Instructions, product: RebrandProduct): Rectangle[] {
  instructions = instructionSchema.parse(instructions)
  const plan = instructions.editPlan
  if (!plan) throw new Error("Record the localized edit plan before generation.")
  if (plan.sourceWidth * plan.sourceHeight * (plan.outputScale ?? 1) ** 2 > 40_000_000) throw new Error("Export exceeds the safe image pixel budget.")
  const allowedNames = [product.name, ...(product.tradeName?.split(/[,;|]/).map(name => name.trim()) ?? [])]
  for (const region of plan.names) {
    if (instructions.ownership !== "wellona" || !allowedNames.includes(region.from) || region.to !== renameWellonaBrand(region.from) || region.from === region.to
      || instructions.preserveBrands.some(brand => brand.toLowerCase() === region.from.toLowerCase())) {
      throw new Error("Image name edit is not an agreed Wellona trade-name replacement.")
    }
  }
  const domains = [plan.domains?.bottomCenter, plan.domains?.bottomRight].filter((rect): rect is Rectangle => Boolean(rect))
  const edits: Rectangle[] = [...plan.names, ...plan.logos, ...(plan.domainRemovals ?? []), ...domains]
  if (!edits.length) throw new Error("The edit plan contains no changes.")
  for (const rect of [...edits, ...plan.protectedRegions]) {
    if (rect.left + rect.width > plan.sourceWidth || rect.top + rect.height > plan.sourceHeight) throw new Error("Image region exceeds original dimensions.")
  }
  edits.forEach((rect, index) => {
    if (plan.protectedRegions.some(protectedRect => overlaps(rect, protectedRect))) throw new Error("An edit overlaps protected medicine text or artwork.")
    if (edits.slice(index + 1).some(other => overlaps(rect, other))) throw new Error("Edit regions overlap. Record separate bounded regions.")
  })
  if (plan.domains) {
    const { bottomCenter: center, bottomRight: right } = plan.domains
    if (domains.some(rect => rect.top < plan.sourceHeight * 0.8) || (center && Math.abs(center.left + center.width / 2 - plan.sourceWidth / 2) > 2)
      || (right && plan.sourceWidth - right.left - right.width > Math.max(12, plan.sourceWidth * 0.02))) {
      throw new Error("Domain must occupy bottom-center or bottom-right space.")
    }
    if (domains.some(rect => rect.width < 130 || rect.height < 16)) throw new Error("Domain space is too small for readable text. Review layout.")
  }
  if (plan.logos.some(rect => rect.width < 40 || rect.height < 22)) throw new Error("Logo space is too small. Review layout.")
  return edits
}

const cacheSchema = z.object({ key: hashSchema, imageHash: hashSchema }).strict()

// Compare decoded pixels, not compressed JPEG/PNG bytes. PNG output is lossless.
async function sourcePixels(original: Buffer, scale: number) {
  const source = await sharp(original).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  if (scale === 1) return source
  return sharp(source.data, { raw: { width: source.info.width, height: source.info.height, channels: 4 } })
    .resize(source.info.width * scale, source.info.height * scale, { kernel: "lanczos3" }).raw().toBuffer({ resolveWithObject: true })
}
function scaleRect(rect: Rectangle, scale: number): Rectangle {
  return { left: rect.left * scale, top: rect.top * scale, width: rect.width * scale, height: rect.height * scale }
}
export async function verifyProtectedPixels(original: Buffer, candidate: Buffer, allowed: Rectangle[], scale = 1): Promise<void> {
  const before = await sourcePixels(original, scale)
  const after = await sharp(candidate).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  if (before.info.width !== after.info.width || before.info.height !== after.info.height) throw new Error("Candidate changed the recorded export dimensions.")
  const permitted = allowed.map(rect => scaleRect(rect, scale))
  const rowBytes = before.info.width * 4
  function verifyRange(start: number, end: number): void {
    if (start < end && before.data.compare(after.data, start, end, start, end) !== 0) throw new Error("Candidate changed protected original pixels.")
  }
  for (let y = 0; y < before.info.height; y++) {
    const rowStart = y * rowBytes
    const intervals = permitted.filter(rect => y >= rect.top && y < rect.top + rect.height).sort((a, b) => a.left - b.left)
    let start = 0
    for (const rect of intervals) {
      const end = rect.left * 4
      verifyRange(rowStart + start, rowStart + end)
      start = Math.max(start, (rect.left + rect.width) * 4)
    }
    verifyRange(rowStart + start, rowStart + rowBytes)
  }
}

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[character] ?? character)
}
function textOverlay(rect: Rectangle, text: string, background: string, fontSize: number): Buffer {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}"><rect width="100%" height="100%" fill="${background}"/><text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-family="Arial, sans-serif" font-size="${fontSize}" fill="#163b4f">${escapeXml(text)}</text></svg>`)
}

export async function renderLocalizedImage(original: Buffer, logo: Buffer, instructions: Instructions, product: RebrandProduct,
  domain: string, directory: string, generate = generateImage): Promise<Buffer> {
  const edits = validateEditPlan(instructions, product)
  const plan = instructions.editPlan
  if (!plan) throw new Error("Record the edit plan before generation.")
  const scale = plan.outputScale ?? 1
  const source = await sharp(original).metadata()
  if (source.width !== plan.sourceWidth || source.height !== plan.sourceHeight) throw new Error("Edit plan belongs to a different image size.")
  const logoFormat = await inspectImage(logo, 7 * 1024 * 1024)
  const overlays: sharp.OverlayOptions[] = []
  for (const [index, region] of Array.from(plan.names.entries())) {
    if (region.reuseImageHash) {
      // Codex can retain a visually checked name patch while changing only logos/domains.
      // The explicit hash is part of the instruction/candidate review digest.
      const retained = await readFile(path.join(directory, `name-region-${index}.png`))
      await inspectImage(retained)
      const dimensions = await sharp(retained).metadata()
      if (sha256(retained) !== region.reuseImageHash || dimensions.width !== region.width || dimensions.height !== region.height) {
        throw new Error("Retained name patch changed or belongs to another region. Inspect it again.")
      }
      const rect = scaleRect(region, scale)
      overlays.push({ input: scale === 1 ? retained : await sharp(retained).resize(rect.width, rect.height, { kernel: "lanczos3" }).png().toBuffer(), left: rect.left, top: rect.top })
      continue
    }
    // Square context avoids unsupported, extremely wide text-only aspect ratios.
    // Only the specified name rectangle is pasted back, never surrounding context.
    const side = Math.max(region.width, region.height)
    if (side > Math.min(plan.sourceWidth, plan.sourceHeight)) throw new Error("Name region is too large for square editing context.")
    const context = { left: Math.min(plan.sourceWidth - side, Math.max(0, Math.round(region.left + region.width / 2 - side / 2))),
      top: Math.min(plan.sourceHeight - side, Math.max(0, Math.round(region.top + region.height / 2 - side / 2))), width: side, height: side }
    const crop = await sharp(original).extract(context).png().toBuffer()
    const prompt = `Edit only the trade-name lettering in image 2, the square target crop. Replace the exact text "${region.from}" with "${region.to}" in the same lettering style, colour, position and perspective. The target rectangle is x=${region.left - context.left}, y=${region.top - context.top}, width=${region.width}, height=${region.height} in the ${side} by ${side} input crop. Preserve background, geometry and all other marks. Keep the square crop and layout unchanged. Output one image of this crop only. Image 1 is reference context; do not insert its logo or any other brand into this crop.`
    const key = sha256(stableJson({ version: NAME_EDITOR_VERSION, crop: sha256(crop), logo: sha256(logo), prompt, model: process.env.REBRAND_IMAGE_MODEL || "gemini-2.5-flash-image" }))
    await atomicWrite(path.join(directory, `name-region-${index}-prompt.txt`), prompt)
    const file = path.join(directory, `name-region-${index}.png`)
    const record = path.join(directory, `name-region-${index}.json`)
    let edited: Buffer | undefined
    try {
      const cached = cacheSchema.parse(await readJson(record))
      const bytes = await readFile(file)
      if (cached.key === key && sha256(bytes) === cached.imageHash) edited = bytes
    } catch (error) {
      if (!(error instanceof z.ZodError) && !(error instanceof SyntaxError) && !(error && typeof error === "object" && "code" in error && error.code === "ENOENT")) throw error
    }
    if (!edited) {
      const generated = await generate(crop, "image/png", logo, logoFormat.mimeType, prompt)
      await inspectImage(generated)
      const dimensions = await sharp(generated).metadata()
      if (!dimensions.width || !dimensions.height || Math.abs(dimensions.width / dimensions.height - 1) > 0.05) throw new Error("Generated crop changed aspect ratio. Review the region.")
      const normalized = await sharp(generated).resize(side, side, { fit: "fill" }).png().toBuffer()
      edited = await sharp(normalized).extract({ left: region.left - context.left, top: region.top - context.top, width: region.width, height: region.height }).png().toBuffer()
      await atomicWrite(file, edited)
      await writeJson(record, { key, imageHash: sha256(edited) })
    }
    const rect = scaleRect(region, scale)
    overlays.push({ input: scale === 1 ? edited : await sharp(edited).resize(rect.width, rect.height, { kernel: "lanczos3" }).png().toBuffer(), left: rect.left, top: rect.top })
  }
  for (const region of plan.logos) {
    // Composite the actual supplied pixels; Gemini cannot redraw or misspell this logo.
    const rect = scaleRect(region, scale)
    const panel = await sharp(logo).resize(rect.width, rect.height, { fit: "contain", position: "centre", kernel: "lanczos3", background: region.background })
      .flatten({ background: region.background }).png().toBuffer()
    overlays.push({ input: panel, left: rect.left, top: rect.top })
  }
  for (const region of plan.domainRemovals ?? []) {
    const rect = scaleRect(region, scale)
    overlays.push({ input: textOverlay(rect, "", region.background, 10 * scale), left: rect.left, top: rect.top })
  }
  for (const region of [plan.domains?.bottomCenter, plan.domains?.bottomRight]) {
    if (!region) continue
    const fontSize = Math.min(14, (region.width - 6) / (domain.length * 0.58))
    if (fontSize < 10) throw new Error("Domain cannot fit readably. Review placement instead of shrinking text.")
    const rect = scaleRect(region, scale)
    overlays.push({ input: textOverlay(rect, domain, "#ffffff", fontSize * scale), left: rect.left, top: rect.top })
  }
  const base = await sourcePixels(original, scale)
  const result = await sharp(base.data, { raw: { width: base.info.width, height: base.info.height, channels: 4 } }).composite(overlays).png().toBuffer()
  await inspectImage(result)
  await verifyProtectedPixels(original, result, edits, scale)
  return result
}
