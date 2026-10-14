import { createHash } from "node:crypto"
import { z } from "zod"

export const MAX_IMAGE_BYTES = 3 * 1024 * 1024
export const MAX_REQUEST_BYTES = 4 * 1024 * 1024
export const hashSchema = z.string().regex(/^[a-f0-9]{64}$/)
export const patchSchema = z.object({
  name: z.string().trim().min(1).max(500).optional(),
  description: z.string().max(200_000).nullable().optional(),
  shortDescription: z.string().max(20_000).nullable().optional(),
  tradeName: z.string().trim().min(1).max(500).nullable().optional(),
}).strict()
export type ProductPatch = z.infer<typeof patchSchema>

export const productSchema = z.object({
  id: z.string().min(1), handle: z.string(), name: z.string(),
  description: z.string().nullable(), shortDescription: z.string().nullable(),
  tradeName: z.string().nullable(), imageUrl: z.string().nullable(),
  imageUrls: z.array(z.string()), version: z.string().datetime({ offset: true }),
}).strict()
export type RebrandProduct = z.infer<typeof productSchema>

export const rectangleSchema = z.object({ left: z.number().int().nonnegative(), top: z.number().int().nonnegative(),
  width: z.number().int().positive(), height: z.number().int().positive() }).strict()
export const editPlanSchema = z.object({
  sourceWidth: z.number().int().positive(), sourceHeight: z.number().int().positive(),
  outputScale: z.union([z.literal(1), z.literal(2)]).optional(),
  names: z.array(rectangleSchema.extend({ from: z.string().min(1), to: z.string().min(1), reuseImageHash: hashSchema.optional() }).strict()).max(20),
  logos: z.array(rectangleSchema.extend({ background: z.string().regex(/^#[0-9a-f]{6}$/i) }).strict()).max(20),
  domains: z.object({ bottomCenter: rectangleSchema.optional(), bottomRight: rectangleSchema.optional() }).strict().optional(),
  domainRemovals: z.array(rectangleSchema.extend({ background: z.string().regex(/^#[0-9a-f]{6}$/i) }).strict()).max(20).optional(),
  protectedRegions: z.array(rectangleSchema).max(100),
}).strict()
export type Rectangle = z.infer<typeof rectangleSchema>
export type EditPlan = z.infer<typeof editPlanSchema>

export const instructionRecordSchema = z.object({
  ownership: z.enum(["wellona", "other", "uncertain"]),
  imageAction: z.enum(["edit", "keep"]),
  wellonaBrandingPresent: z.boolean(),
  domainPresent: z.boolean().optional(),
  domainPlacementsAlreadyCorrect: z.boolean(),
  preserveBrands: z.array(z.string().trim().min(1)).max(100),
  notes: z.string().trim().min(1).max(10_000),
  editPlan: editPlanSchema.optional(),
}).strict()
export const instructionSchema = instructionRecordSchema.superRefine((value, context) => {
  if (value.imageAction === "keep" && value.editPlan) {
    context.addIssue({ code: "custom", message: "Omit editPlan when keeping the original image." })
  }
  if (!value.wellonaBrandingPresent && value.editPlan?.logos.length) {
    context.addIssue({ code: "custom", message: "Replace logos only when Wellona branding was identified." })
  }
  if (value.editPlan?.domains && Number(Boolean(value.editPlan.domains.bottomCenter)) + Number(Boolean(value.editPlan.domains.bottomRight)) !== 1) {
    context.addIssue({ code: "custom", message: "Choose one domain placement, not both." })
  }
  if (value.imageAction === "keep" && (value.wellonaBrandingPresent || (value.domainPresent && !value.domainPlacementsAlreadyCorrect))) {
    context.addIssue({ code: "custom", message: "Keeping an image requires no Wellona branding and a correct existing domain, if present." })
  }
  if (value.imageAction === "edit" && !value.editPlan) {
    context.addIssue({ code: "custom", message: "Codex must record a bounded editPlan before editing." })
  }
  if (value.imageAction === "edit" && value.domainPresent && !value.domainPlacementsAlreadyCorrect && !value.editPlan?.domains) {
    context.addIssue({ code: "custom", message: "Record one replacement domain placement." })
  }
  if (!value.domainPresent && (value.editPlan?.domains || value.editPlan?.domainRemovals?.length)) {
    context.addIssue({ code: "custom", message: "Do not add or remove domains when none exists in the source." })
  }
  if (value.domainPlacementsAlreadyCorrect && (value.editPlan?.domains || value.editPlan?.domainRemovals?.length)) {
    context.addIssue({ code: "custom", message: "Do not change existing correct domain placements." })
  }
})
export type Instructions = z.infer<typeof instructionSchema>

export const reviewSchema = z.object({
  status: z.enum(["passed", "needs_review", "failed"]),
  candidateHash: hashSchema,
  inspectedBy: z.literal("codex"),
  explanation: z.string().trim().min(1).max(10_000),
  checks: z.object({
    wellonaRemoved: z.boolean(), apindexCorrect: z.boolean(),
    bottomCenterDomain: z.boolean(), bottomRightDomain: z.boolean(),
    otherBrandsPreserved: z.boolean(), namesCorrect: z.boolean(),
    medicineTextPreserved: z.boolean(),
  }).strict(),
}).strict()
export const authorizationSchema = z.object({
  scope: z.enum(["active", "selected"]), reference: z.string().trim().min(1).max(2000),
}).strict()

export const publicationSchema = z.object({
  productId: z.string(), handle: z.string(), imageUrl: z.string().nullable(),
  version: z.string(), replayed: z.boolean(),
}).strict()
export type Publication = z.infer<typeof publicationSchema>

export function sha256(bytes: string | Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex")
}

export function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`
  if (value !== null && typeof value === "object") {
    const record = value as Record<string, unknown>
    return `{${Object.keys(record).sort().map(key => `${JSON.stringify(key)}:${stableJson(record[key])}`).join(",")}}`
  }
  const encoded = JSON.stringify(value)
  if (encoded === undefined) throw new Error("Only JSON values can be hashed.")
  return encoded
}

export function candidateHash(product: RebrandProduct, patch: ProductPatch, imageHash: string | null, instructions: Instructions): string {
  return sha256(stableJson({ product, patch, imageHash, instructions }))
}

export function requireReview(review: unknown, digest: string): void {
  const checked = reviewSchema.parse(review)
  if (checked.status !== "passed" || checked.candidateHash !== digest || !Object.values(checked.checks).every(Boolean)) {
    throw new Error("Candidate needs a passing Codex inspection of the exact image and text before publishing.")
  }
}

export function renameWellonaBrand(value: string): string {
  return value.replace(/well/gi, match => match === "WELL" ? "DEX" : match === "Well" ? "Dex" : match === "well" ? "dex" : match)
}

function replaceText(value: string | null, replacements: Array<[string, string]>): string | null {
  if (value === null) return null
  // Operate only on text nodes, never on HTML tags or attributes.
  return value.split(/(<[^>]*>)/g).map(part => {
    if (part.startsWith("<")) return part
    let text = part.replace(/Wellona\s+Pharma\b/gi, "Apindex Pharmaceutics")
    for (const [from, to] of replacements) {
      const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      text = text.replace(new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, "giu"), () => to)
    }
    return text
  }).join("")
}

export function preparePatch(product: RebrandProduct, instructions: Instructions): ProductPatch {
  if (instructions.ownership === "uncertain") throw new Error("Brand ownership needs review before preparing changes.")
  const replacements: Array<[string, string]> = []
  const patch: ProductPatch = {}
  if (instructions.ownership === "wellona") {
    for (const [field, value] of [["name", product.name], ["tradeName", product.tradeName]] as const) {
      if (!value) continue
      if (instructions.preserveBrands.some(brand => brand.toLowerCase() === value.toLowerCase()) && /well/i.test(value)) {
        throw new Error("A protected brand conflicts with the requested name replacement.")
      }
      // Trade names can list multiple brands. Replace references to each changed
      // name separately while preserving commas, spacing and unchanged brands.
      const next = (field === "tradeName" ? value.split(/([,;|])/g) : [value]).map(part => {
        const name = part.trim()
        if (!name || /^[,;|]$/.test(name)) return part
        if (instructions.preserveBrands.some(brand => brand.toLowerCase() === name.toLowerCase()) && /well/i.test(name)) {
          throw new Error("A protected brand conflicts with the requested name replacement.")
        }
        const renamed = renameWellonaBrand(name)
        if (renamed !== name) replacements.push([name, renamed])
        return part.replace(name, renamed)
      }).join("")
      if (next !== value) patch[field] = next
    }
  }
  const description = replaceText(product.description, replacements)
  const shortDescription = replaceText(product.shortDescription, replacements)
  if (description !== product.description) patch.description = description
  if (shortDescription !== product.shortDescription) patch.shortDescription = shortDescription
  return patchSchema.parse(patch)
}
