import sharp from "sharp"
import { inspectImage } from "../../src/lib/rebrand/media"
import { instructionSchema, renameWellonaBrand, type Instructions, type Rectangle, type RebrandProduct } from "../../src/lib/rebrand/contracts"
import { imagegenPatches } from "./imagegen"

export const RENDERER_VERSION = "imagegen-v1-protected-pixels"
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
  domain: string, directory: string): Promise<Buffer> {
  const edits = validateEditPlan(instructions, product)
  const plan = instructions.editPlan
  if (!plan) throw new Error("Record the edit plan before generation.")
  const scale = plan.outputScale ?? 1
  const source = await sharp(original).metadata()
  if (source.width !== plan.sourceWidth || source.height !== plan.sourceHeight) throw new Error("Edit plan belongs to a different image size.")
  await inspectImage(logo, 7 * 1024 * 1024)
  const overlays: sharp.OverlayOptions[] = []
  const patches = await imagegenPatches(original, instructions, directory)
  for (const [index, region] of Array.from(plan.names.entries())) {
    const edited = patches.get(index)
    if (!edited) throw new Error("Name region has no imported ImageGen patch.")
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
